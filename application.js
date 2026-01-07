import http from "http";
import path from "path";
import { connect } from "./utilities/database.js";
import { getAbout } from "./routes/about.js";
import { getLogin, loginUser, logoutUser, getAuthentication, authenticateUser } from "./routes/login.js";
import { getProfile, saveProfile, getPassword, savePassword } from "./routes/profile.js";
import { getTfa, generateQrCode, toggleTfa } from "./routes/tfa.js";
import { getItems, saveItem, getItem, pinItem, deleteItem } from "./routes/items.js";
import { saveContact, answerContact } from "./routes/contacts.js";
import { getJsFile, getUtilityFile, getCssFile, getImageFile, getFaviconFile, getNoAccessFile } from "./routes/static.js";
import { isStaticFileAllowed, getId } from "./utilities/scripts.js";
import { isContentTypeValid, areQueryParametersValid } from "./utilities/validations.js";
import { ABOUT_TYPE, DOWNLOAD_TYPE, OVERVIEW_TYPE, PROFILE_TYPE, SKILL_TYPE, RESUME_ITEM_TYPE, PORTFOLIO_ITEM_TYPE, CERTIFICATION_TYPE, CUSTOMER_TYPE, CONTACT_TYPE } from "./utilities/types.js";

const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || BASE_URL.split(":")[2];

const server = http.createServer();
await connect();

const routes = {
  GET: [
    { path: "/", queryParameters: ["language"], handler: (request, response) => getAbout(ABOUT_TYPE, request, response) },
    { path: "/download", queryParameters: ["language"], handler: (request, response) => getAbout(DOWNLOAD_TYPE, request, response) },
    { path: "/login", handler: getLogin },
    { path: "/logoutUser", handler: logoutUser },
    { path: "/authentication", handler: getAuthentication },
    { path: "/overview", handler: (request, response) => getProfile(OVERVIEW_TYPE, request, response) },
    { path: "/profile", handler: (request, response) => getProfile(PROFILE_TYPE, request, response) },
    { path: "/password", handler: getPassword },
    { path: "/tfa", handler: getTfa },
    { path: "/generateQrCode", handler: generateQrCode },
    { path: "/skills", handler: (request, response) => getItems(SKILL_TYPE, request, response) },
    { base: "/getSkill", handler: (request, response, id) => getItem(SKILL_TYPE, request, response, id) },
    { path: "/resume", handler: (request, response) => getItems(RESUME_ITEM_TYPE, request, response) },
    { base: "/getResumeItem", handler: (request, response, id) => getItem(RESUME_ITEM_TYPE, request, response, id) },
    { path: "/portfolio", handler: (request, response) => getItems(PORTFOLIO_ITEM_TYPE, request, response) },
    { base: "/getPortfolioItem", handler: (request, response, id) => getItem(PORTFOLIO_ITEM_TYPE, request, response, id) },
    { path: "/certifications", handler: (request, response) => getItems(CERTIFICATION_TYPE, request, response) },
    { base: "/getCertification", handler: (request, response, id) => getItem(CERTIFICATION_TYPE, request, response, id) },
    { path: "/customers", handler: (request, response) => getItems(CUSTOMER_TYPE, request, response) },
    { base: "/getCustomer", handler: (request, response, id) => getItem(CUSTOMER_TYPE, request, response, id) },
    { path: "/contacts", handler: (request, response) => getItems(CONTACT_TYPE, request, response) },
    { base: "/getContact", handler: (request, response, id) => getItem(CONTACT_TYPE, request, response, id) }
  ],
  POST: [
    { path: "/loginUser", applicationJson: true, handler: loginUser },
    { path: "/authenticateUser", applicationJson: true, handler: authenticateUser },
    { path: "/saveSkill", applicationJson: true, handler: (request, response) => saveItem(SKILL_TYPE, request, response) },
    { path: "/saveResumeItem", applicationJson: true, handler: (request, response) => saveItem(RESUME_ITEM_TYPE, request, response) },
    { path: "/savePortfolioItem", applicationJson: true, handler: (request, response) => saveItem(PORTFOLIO_ITEM_TYPE, request, response) },
    { path: "/saveCertification", applicationJson: true, handler: (request, response) => saveItem(CERTIFICATION_TYPE, request, response) },
    { path: "/saveCustomer", applicationJson: true, handler: (request, response) => saveItem(CUSTOMER_TYPE, request, response) },
    { path: "/saveContact", applicationJson: true, handler: saveContact },
    { path: "/toggleTfa", applicationJson: true, handler: toggleTfa }
  ],
  PUT: [
    { path: "/saveProfile", applicationJson: true, handler: saveProfile },
    { path: "/savePassword", applicationJson: true, handler: savePassword },
    { base: "/pinSkill", handler: (request, response, id) => pinItem(SKILL_TYPE, request, response, id) },
    { base: "/pinResumeItem", handler: (request, response, id) => pinItem(RESUME_ITEM_TYPE, request, response, id) },
    { base: "/pinPortfolioItem", handler: (request, response, id) => pinItem(PORTFOLIO_ITEM_TYPE, request, response, id) },
    { base: "/pinCertification", handler: (request, response, id) => pinItem(CERTIFICATION_TYPE, request, response, id) },
    { base: "/pinCustomer", handler: (request, response, id) => pinItem(CUSTOMER_TYPE, request, response, id) },
    { base: "/answerContact", applicationJson: true, handler: (request, response, id) => answerContact(request, response, id) }
  ],
  DELETE: [
    { base: "/deleteSkill", handler: (request, response, id) => deleteItem(SKILL_TYPE, request, response, id) },
    { base: "/deleteResumeItem", handler: (request, response, id) => deleteItem(RESUME_ITEM_TYPE, request, response, id) },
    { base: "/deletePortfolioItem", handler: (request, response, id) => deleteItem(PORTFOLIO_ITEM_TYPE, request, response, id) },
    { base: "/deleteCertification", handler: (request, response, id) => deleteItem(CERTIFICATION_TYPE, request, response, id) },
    { base: "/deleteCustomer", handler: (request, response, id) => deleteItem(CUSTOMER_TYPE, request, response, id) },
    { base: "/deleteContact", handler: (request, response, id) => deleteItem(CONTACT_TYPE, request, response, id) }
  ]
};

server.on("request", async (request, response) => {
  const { url: requestUrl, method, headers: { "content-type": contentType } } = request;
  const url = new URL(requestUrl, "http://localhost");
  const { pathname, searchParams } = url;
  if (pathname.endsWith(".php")) return response.writeHead(404, { "Content-Type": "text/plain" }).end("File not found.");
  const methodRoutes = routes[method];
  if (!methodRoutes) return response.writeHead(405, { "Content-Type": "text/plain" }).end("Method not allowed.");
  for (const route of methodRoutes) {
    const { path, queryParameters, applicationJson } = route;
    if (path !== pathname) continue;
    if (queryParameters) {
      if (!areQueryParametersValid(searchParams, queryParameters)) continue;
    } else if (searchParams.size > 0) {
      continue;
    }
    if (applicationJson && !isContentTypeValid(contentType)) continue;
    return await route.handler(request, response);
  }
  for (const route of methodRoutes) {
    const { base, applicationJson } = route;
    if (!base) continue;
    const id = getId(url, base);
    if (!id) continue;
    if (applicationJson && !isContentTypeValid(contentType)) continue;
    return await route.handler(request, response, id);
  }
  if (searchParams.size === 0) {
    if (pathname.startsWith("/js/") && (method === "GET") && isStaticFileAllowed(url, "js", [".js"])) return getJsFile(response, path.basename(pathname));
    if (pathname.startsWith("/utilities/") && (method === "GET") && isStaticFileAllowed(url, "utilities", [".js"])) return getUtilityFile(response, path.basename(pathname));
    if (pathname.startsWith("/css/") && (method === "GET") && isStaticFileAllowed(url, "css", [".css"])) return getCssFile(response, path.basename(pathname));
    if (pathname.startsWith("/images/") && (method === "GET") && isStaticFileAllowed(url, "images", [".png", ".jpg", ".jpeg"])) return getImageFile(response, path.basename(pathname));
  }
  if (pathname === "/favicon.ico") return getFaviconFile(response);
  if (pathname === "/unauthorized") return getNoAccessFile(response, true);
  return getNoAccessFile(response);
});

server.listen(PORT, () => console.log(`Curriculum Vitae running on: ${BASE_URL}.`));
