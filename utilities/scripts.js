import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getAdministrator } from "./database.js";
import { isTextValid, isArrayValid, isObjectValid } from "./validations.js";
import { LOGIN_TYPE, OVERVIEW_TYPE, PROFILE_TYPE, TFA_TYPE, AUTHENTICATION_TYPE, SKILL_TYPE, RESUME_ITEM_TYPE, PORTFOLIO_ITEM_TYPE, CERTIFICATION_TYPE, CUSTOMER_TYPE, CONTACT_TYPE } from "./types.js";

export const getAdministratorDefaultEmail = () => {
  const username = process.env.ADMINISTRATOR_USERNAME;
  return `${username}@${username}.com`;
};

export const addVariablesToHtml = (html, variables, sidebar = null) => {
  const getValue = (object, path) => {
    if (!isObjectValid(object)) return undefined;
    return path.split(".").reduce((accumulator, key) => {
      if ((accumulator === undefined) || (accumulator === null)) return undefined;
      return (accumulator[key] !== undefined) ? accumulator[key] : undefined;
    }, object);
  };
  html = html.replace(/{{\s*#for\s+([\w.]+)\s*}}([\s\S]*?){{\s*#\/for\s*}}/g, (_, arrayPath, content) => {
    const array = getValue(variables, arrayPath);
    if (!isArrayValid(array)) return "";
    return array.map((item) => {
      const scope = { ...variables, ...item };
      return addVariablesToHtml(content, scope);
    }).join("");
  });
  html = html.replace(/{{\s*#if\s+([\s\S]*?)\s*}}([\s\S]*?){{\s*#\/if\s*}}/g, (_, startCondition, content) => {
    try {
      const condition = startCondition.trim();
      const parts = content.split(/{{\s*#else\s*}}/);
      const ifContent = parts[0];
      const elseContent = (parts.length > 1) ? parts[1] : "";
      let result = false;
      if (/^[\w.]+$/.test(condition)) {
        const value = getValue(variables, condition);
        result = !!value;
      } else {
        const newFuntion = new Function("data", `with(data){ return (${condition}); }`);
        result = !!newFuntion(variables);
      }
      return result ? ifContent : elseContent;
    } catch {
      return "";
    }
  });
  html = html.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    if (key === "sidebar") return `{{ ${key} }}`;
    const value = getValue(variables, key);
    return ((value === undefined) || (value === null)) ? "" : value;
  });
  if (isTextValid(sidebar)) html = html.replace(/{{\s*sidebar\s*}}/, sidebar);
  return html;
};

export const getHtmlFile = async (type, variables, includeSidebar = false) => {
  let fileName;
  switch (type) {
    case SKILL_TYPE:
      fileName = "skills";
      break;
    case RESUME_ITEM_TYPE:
      fileName = "resume";
      break;
    case PORTFOLIO_ITEM_TYPE:
      fileName = "portfolio";
      break;
    case CERTIFICATION_TYPE:
      fileName = "certifications";
      break;
    case CUSTOMER_TYPE:
      fileName = "customers";
      break;
    case CONTACT_TYPE:
      fileName = "contacts";
      break;
    default:
      fileName = type;
  }
  let html = fs.readFileSync(path.resolve(`./public/html/${fileName}.html`), "utf-8");
  let htmlVariables = { APPLICATION_NAME: process.env.APPLICATION_NAME };
  if ((type === LOGIN_TYPE) || (type === AUTHENTICATION_TYPE)) htmlVariables["RECAPTCHA_ID"] = process.env.RECAPTCHA_ID;
  if ((type === OVERVIEW_TYPE) || (type === PROFILE_TYPE)) htmlVariables["user"] = variables;
  if (type === TFA_TYPE) htmlVariables["tfa"] = variables;
  if ((type === SKILL_TYPE) || (type === RESUME_ITEM_TYPE) || (type === PORTFOLIO_ITEM_TYPE) || (type === CERTIFICATION_TYPE) || (type === CUSTOMER_TYPE) || (type === CONTACT_TYPE)) {
    htmlVariables["items"] = variables;
    htmlVariables["total"] = variables.length;
  }
  let sidebar;
  if (includeSidebar) {
    sidebar = fs.readFileSync(path.resolve("./public/html/sidebar.html"), "utf-8");
    const user = ((type === OVERVIEW_TYPE) || (type === PROFILE_TYPE)) ? variables : await getAdministrator();
    const sidebarVariables = { firstName: user.firstName || user.username, avatar: user.avatar };
    sidebar = addVariablesToHtml(sidebar, sidebarVariables);
  }
  return addVariablesToHtml(html, htmlVariables, sidebar);
};

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hashedPassword}`;
};

export const verifyPassword = (password, savedPassword) => {
  const [salt, hashedPassword] = savedPassword.split(":");
  if (!isTextValid(salt) || !isTextValid(hashedPassword)) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashedPassword, "hex"));
};

export const encodeBase64 = (data) => Buffer.from(JSON.stringify(data)).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export const sign = (data) => crypto.createHmac("sha512", process.env.COOKIE_SECRET_KEY).update(data).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export const decodeBase64 = (cookie) => {
  try {
    const [encodedHeader, encodedPayload, signature] = cookie.split(".");
    const expectedSignature = crypto.createHmac("sha512", process.env.COOKIE_SECRET_KEY).update(`${encodedHeader}.${encodedPayload}`).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    if (signature === expectedSignature) {
      return JSON.parse(Buffer.from(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"));
    } else {
      return null;
    }
  } catch {
    return null;
  } 
};

export const handleApplicationJson = (request) => {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => body += chunk.toString());
    request.on("end", () => resolve(JSON.parse(body)));
    request.on("error", reject);
  });
};

export const getLanguage = (request) => {
  const { url, headers } = request;
  const protocol = headers["x-forwarded-proto"] || "http";
  const { host } = headers;
  const newUrl = new URL(url, `${protocol}://${host}`);
  return newUrl.searchParams.get("language") === "de";
};

export const getFilteredItems = (items, type) => items.filter((item) => item.type === type);
