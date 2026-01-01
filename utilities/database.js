import fs from "fs";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import { userValidator, tfaValidator, skillValidator, resumeItemValidator, portfolioItemValidator, certificationValidator, customerValidator, contactValidator } from "./validators.js";
import { getAdministratorDefaultEmail, hashPassword } from "./scripts.js";
import { isObjectIdValid, isObjectValid } from "./validations.js";
import { SKILL_TYPE, RESUME_ITEM_TYPE, PORTFOLIO_ITEM_TYPE, CERTIFICATION_TYPE, CUSTOMER_TYPE, CONTACT_TYPE } from "./types.js";

const client = new MongoClient(process.env.DATABASE_URI);

let database;
let users;
let tfas;
let skills;
let resume;
let portfolio;
let certifications;
let customers;
let contacts;

export const connect = async () => {
  try {
    let connection = await client.connect();
    database = connection.db(process.env.DATABASE_NAME);
    users = database.collection("users");
    tfas = database.collection("tfas");
    skills = database.collection("skills");
    resume = database.collection("resume");
    portfolio = database.collection("portfolio");
    certifications = database.collection("certifications");
    customers = database.collection("customers");
    contacts = database.collection("contacts");
    console.log(`Connected to database: ${database.databaseName}.`);
    await database.createCollection("users", { validator: userValidator });
    await users.createIndexes([{ key: { username: 1 }, unique: true }, { key: { email: 1 }, unique: true }]);
    await database.createCollection("tfas", { validator: tfaValidator });
    await database.createCollection("skills", { validator: skillValidator });
    await database.createCollection("resume", { validator: resumeItemValidator });
    await database.createCollection("portfolio", { validator: portfolioItemValidator });
    await database.createCollection("certifications", { validator: certificationValidator });
    await database.createCollection("customers", { validator: customerValidator });
    await database.createCollection("contacts", { validator: contactValidator });
    await createAdministrator();
  } catch (error) {
    console.error(error);
  }
};

export const createAdministrator = async () => {
  const username = process.env.ADMINISTRATOR_USERNAME;
  const defaultPassword = process.env.ADMINISTRATOR_DEFAULT_PASSWORD;
  const password = hashPassword(defaultPassword);
  const filePath = path.resolve("./public/images/avatar.png");
  const image = fs.readFileSync(filePath, "base64");
  const extension = path.extname(filePath).replace(".", "");
  const mimeType = `image/${extension}`;
  const avatar = { name: `avatar.${extension}`, mimeType, src: `data:${mimeType};base64,${image}` };
  const userQuery = { username };
  const userUpdate = { $setOnInsert: { username, password, firstName: "", lastName: "", email: getAdministratorDefaultEmail(), telephone: 0, birthday: 0, address: "", address_de: "", languages: "", languages_de: "", profession: "", profession_de: "", gitHub: "", avatar, lastLoginTimestamp: 0 } };
  const userOptions = { upsert: true, includeResultMetadata: true };
  const result = await users.findOneAndUpdate(userQuery, userUpdate, userOptions);
  const userId = result?.lastErrorObject?.upserted?.toString() || result?.value?._id?.toString() || "";
  if (isObjectIdValid(userId)) {
    const tfaQuery = { userId };
    const tfaUpdate = { $setOnInsert: { isEnabled: false, secret: "" } };
    const tfaOptions = { upsert: true };
    await tfas.findOneAndUpdate(tfaQuery, tfaUpdate, tfaOptions);
  }
};

export const getAdministrator = async () => await users.findOne();

export const getUserByUsername = async (username) => await users.findOne({ username });

export const getUserById = async (userId) => await users.findOne({ _id: ObjectId.createFromHexString(userId) });

export const isUserValid = async (userId) => {
  const user = await users.findOne({ _id: ObjectId.createFromHexString(userId) });
  return isObjectValid(user);
};

export const saveUser = async (userId, firstName, lastName, email, telephone, birthday, address, address_de, languages, languages_de, profession, profession_de, gitHub, avatar) => await users.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { firstName, lastName, email, telephone, birthday, address, address_de, languages, languages_de, profession, profession_de, gitHub, avatar } });

export const saveUserPassword = async (userId, password) => await users.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { password } });

export const writeLoginTimestamp = async (userId) => await users.updateOne({ _id: userId }, { $set: { lastLoginTimestamp: Date.now() } });

export const getUserTfa = async (userId) => await tfas.findOne({ userId: userId.toString() });

export const saveUserSecret = async (userId, secret) => await tfas.updateOne({ userId }, { $set: { secret } });

export const saveUserTfa = async (userId, values) => await tfas.updateOne({ userId }, { $set: values });

export const getItemsDB = async (type) => {
  const items = (type === SKILL_TYPE) ? skills : (type === RESUME_ITEM_TYPE) ? resume : (type === PORTFOLIO_ITEM_TYPE) ? portfolio : (type === CERTIFICATION_TYPE) ? certifications : (type === CUSTOMER_TYPE) ? customers : (type === CONTACT_TYPE) ? contacts : null;
  if (items) return await items.find().sort({ timestamp: -1 }).toArray();
  else return [];
};

export const getItemDB = async (type, id) => {
  const items = (type === SKILL_TYPE) ? skills : (type === RESUME_ITEM_TYPE) ? resume : (type === PORTFOLIO_ITEM_TYPE) ? portfolio : (type === CERTIFICATION_TYPE) ? certifications : (type === CUSTOMER_TYPE) ? customers : (type === CONTACT_TYPE) ? contacts : null;
  if (items) return await items.findOne({ _id: ObjectId.createFromHexString(id) });
  else return null;
};

export const saveItemDB = async (type, data) => {
  const { id } = data;
  delete data.id;
  const items = (type === SKILL_TYPE) ? skills : (type === RESUME_ITEM_TYPE) ? resume : (type === PORTFOLIO_ITEM_TYPE) ? portfolio : (type === CERTIFICATION_TYPE) ? certifications : (type === CUSTOMER_TYPE) ? customers : null;
  if (items) {
    if (isObjectIdValid(id)) {
      const _id = ObjectId.createFromHexString(id);
      const query = { _id };
      const item = await items.findOne(query);
      if (isObjectValid(item)) {
        await items.updateOne(query, { $set: data });
        data["_id"] = _id;
        data["isUpdated"] = true;
        return data;
      } else {
        return null;
      }
    } else {
      data["timestamp"] = Date.now();
      const response = await items.insertOne(data);
      data["_id"] = response.insertedId;
      data["isUpdated"] = false;
      return data;
    }
  } else {
    return null;
  }
};

export const deleteItemDB = async (type, id) => {
  const item = await getItemDB(type, id);
  if (isObjectValid(item)) {
    const items = (type === SKILL_TYPE) ? skills : (type === RESUME_ITEM_TYPE) ? resume : (type === PORTFOLIO_ITEM_TYPE) ? portfolio : (type === CERTIFICATION_TYPE) ? certifications : (type === CUSTOMER_TYPE) ? customers : (type === CONTACT_TYPE) ? contacts : null;
    if (items) await items.deleteOne({ _id: ObjectId.createFromHexString(id) });
  }
};

export const pinItemDB = async (type, id) => {
  const items = (type === SKILL_TYPE) ? skills : (type === RESUME_ITEM_TYPE) ? resume : (type === PORTFOLIO_ITEM_TYPE) ? portfolio : (type === CERTIFICATION_TYPE) ? certifications : (type === CUSTOMER_TYPE) ? customers : null;
  if (items) return await items.findOneAndUpdate({ _id: ObjectId.createFromHexString(id) }, { $set: { timestamp: Date.now() } });
  else return null;
};

export const saveContactDB = async (name, email, subject, message, isGerman, timestamp) => await contacts.insertOne({ name, email, subject, message, isGerman, isAnswered: false, timestamp });

export const answerContactDB = async (contactId, isAnswered) => await contacts.findOneAndUpdate({ _id: ObjectId.createFromHexString(contactId) }, { $set: { isAnswered } });
