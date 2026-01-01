import { getItemsDB, getItemDB, saveItemDB, deleteItemDB, pinItemDB } from "../utilities/database.js";
import { isAuthorized } from "../utilities/authorization.js";
import { getHtmlFile, handleApplicationJson } from "../utilities/scripts.js";
import { isTextValid, isObjectIdValid, isArrayValid, isObjectValid, isFileObjectValid, isSkillTypeValid, isResumeItemTypeValid, isPortfolioItemTypeValid } from "../utilities/validations.js";
import { SKILL_TYPE, RESUME_ITEM_TYPE, PORTFOLIO_ITEM_TYPE, CERTIFICATION_TYPE, CUSTOMER_TYPE, CONTACT_TYPE } from "../utilities/types.js";
import { DATE_TIME_FORMAT, INVALID_ITEM_ID_MESSAGE, UNAUTHORIZED_MESSAGE, ERROR_MESSAGE } from "../utilities/constants.js";

export const getItems = async (type, request, response) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    let items = await getItemsDB(type);
    if (type === CONTACT_TYPE) items = items.map((item) => ({ ...item, timestamp: new Date(item.timestamp).toLocaleString("de-DE", DATE_TIME_FORMAT) }));
    return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(type, items, true), "utf-8");
  } else {
    return response.writeHead(302, { Location: "/unauthorized" }).end();
  }
};

export const saveItem = async (type, request, response) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    try {
      let errors = [];
      let data = await handleApplicationJson(request);
      if (type === SKILL_TYPE) {
        const { title, type, logo } = data;
        if (!isTextValid(title)) errors = [...errors, "Title"];
        if (!isSkillTypeValid(type)) errors = [...errors, "Type"];
        if (!isFileObjectValid(logo)) errors = [...errors, "Logo"];
      } else if (type === RESUME_ITEM_TYPE) {
        const { title, title_de, workplace, duration, duration_de, description, description_de, type } = data;
        if (!isTextValid(title)) errors = [...errors, "Title"];
        if (!isTextValid(title_de)) errors = [...errors, "Title DE"];
        if (!isTextValid(workplace)) errors = [...errors, "Workplace"];
        if (!isTextValid(duration)) errors = [...errors, "Duration"];
        if (!isTextValid(duration_de)) errors = [...errors, "Duration DE"];
        if (!isTextValid(description)) errors = [...errors, "Description"];
        if (!isTextValid(description_de)) errors = [...errors, "Description DE"];
        if (!isResumeItemTypeValid(type)) errors = [...errors, "Type"];
      } else if (type === PORTFOLIO_ITEM_TYPE) {
        const { title, type, logo } = data;
        if (!isTextValid(title)) errors = [...errors, "Title"];
        if (!isPortfolioItemTypeValid(type)) errors = [...errors, "Type"];
        if (!isFileObjectValid(logo)) errors = [...errors, "Logo"];
      } else if (type === CERTIFICATION_TYPE) {
        const { title, logo } = data;
        if (!isTextValid(title)) errors = [...errors, "Title"];
        if (!isFileObjectValid(logo)) errors = [...errors, "Logo"];
      } else if (type === CUSTOMER_TYPE) {
        const { title } = data;
        if (!isTextValid(title)) errors = [...errors, "Title"];
      } else {
        errors = ERROR_MESSAGE;
      }
      if (!isTextValid(errors) && !isArrayValid(errors)) {
        const item = await saveItemDB(type, data);
        if (isObjectValid(item)) {
          return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(item));
        } else {
          errors = [...errors, "Item ID"];
        }
      }
      return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: errors }));
    } catch (error) {
      console.error(error);
      return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
    }
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};

export const getItem = async (type, request, response, id) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    if (isObjectIdValid(id)) {
      const item = await getItemDB(type, id);
      if (isObjectValid(item)) {
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(item));
      }
    }
    return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: INVALID_ITEM_ID_MESSAGE }));
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};

export const deleteItem = async (type, request, response, id) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    if (isObjectIdValid(id)) {
      await deleteItemDB(type, id);
      return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Item has been successfully deleted." }));
    } else {
      return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: INVALID_ITEM_ID_MESSAGE }));
    }
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};

export const pinItem = async (type, request, response, id) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    if (isObjectIdValid(id)) {
      const item = await pinItemDB(type, id);
      if (isObjectValid(item)) {
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Item has been successfully pinned." }));
      }
    }
    return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: INVALID_ITEM_ID_MESSAGE }));
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};
