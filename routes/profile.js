import { getUserById, saveUser, saveUserPassword } from "../utilities/database.js";
import { isAuthorized } from "../utilities/authorization.js";
import { getAdministratorDefaultEmail, getHtmlFile, hashPassword, handleApplicationJson } from "../utilities/scripts.js";
import { isTextValid, isPasswordValid, isEmailValid, isNumberValid, isLinkValid, isArrayValid, isFileObjectValid } from "../utilities/validations.js";
import { OVERVIEW_TYPE, PASSWORD_TYPE } from "../utilities/types.js";
import { DATE_FORMAT, UNAUTHORIZED_MESSAGE, ERROR_MESSAGE } from "../utilities/constants.js";

export const getProfile = async (type, request, response) => {
  const isOverview = (type === OVERVIEW_TYPE);
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    const user = await getUserById(userId);
    user.password = null;
    user.email = ((type === OVERVIEW_TYPE) && (user.email === getAdministratorDefaultEmail())) ? "" : user.email;
    user.telephone = isNumberValid(user.telephone) ? (isOverview ? `+${user.telephone}` : user.telephone) : "";
    user.birthday = isNumberValid(user.birthday) ? (isOverview ? new Date(user.birthday).toLocaleDateString("de-DE", DATE_FORMAT) : new Date(user.birthday).toISOString().split("T")[0]) : (isOverview ? "" : new Date().toISOString().split("T")[0]);
    return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(type, user, true), "utf-8");
  } else {
    return response.writeHead(302, { Location: "/unauthorized" }).end();
  }
};

export const saveProfile = async (request, response) => {
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    try {
      let errors = [];
      let { firstName, lastName, email, telephone, birthday, address, address_de, languages, languages_de, profession, profession_de, gitHub, avatar } = await handleApplicationJson(request);
      telephone = Number(telephone);
      birthday = Number(birthday);
      if (!isTextValid(firstName)) errors = [...errors, "First name"];
      if (!isTextValid(lastName)) errors = [...errors, "Last name"];
      if (!isEmailValid(email)) errors = [...errors, "Email"];
      if (!isNumberValid(telephone)) errors = [...errors, "Telephone"];
      if (!isNumberValid(birthday)) errors = [...errors, "Birthday"];
      if (!isTextValid(address)) errors = [...errors, "Address"];
      if (!isTextValid(address_de)) errors = [...errors, "Address DE"];
      if (!isTextValid(languages)) errors = [...errors, "Languages"];
      if (!isTextValid(languages_de)) errors = [...errors, "Languages DE"];
      if (!isTextValid(profession)) errors = [...errors, "Profession"];
      if (!isTextValid(profession_de)) errors = [...errors, "Profession DE"];
      if (!isLinkValid(gitHub)) errors = [...errors, "GitHub"];
      if (!isFileObjectValid(avatar)) errors = [...errors, "Avatar"];
      if (!isArrayValid(errors)) {
        await saveUser(userId, firstName, lastName, email, telephone, birthday, address, address_de, languages, languages_de, profession, profession_de, gitHub, avatar);
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Profile has been successfully saved." }));
      } else {
        return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: errors }));
      }
    } catch (error) {
      console.error(error);
      return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
    }
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};

export const getPassword = async (request, response) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(PASSWORD_TYPE, null, true), "utf-8");
  } else {
    return response.writeHead(302, { Location: "/unauthorized" }).end();
  }
};

export const savePassword = async (request, response) => {
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    try {
      const { password } = await handleApplicationJson(request);
      if (isPasswordValid(password)) {
        const hashedPassword = hashPassword(password);
        await saveUserPassword(userId, hashedPassword);
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Password has been successfully saved." }));
      } else {
        return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid password." }));
      }
    } catch (error) {
      console.error(error);
      return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
    }
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};
