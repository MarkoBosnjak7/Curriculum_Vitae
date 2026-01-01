import fs from "fs";
import path from "path";
import { getAdministrator, getItemsDB } from "../utilities/database.js";
import { addVariablesToHtml, getLanguage, getFilteredItems } from "../utilities/scripts.js";
import { isLinkValid, isArrayValid, isObjectValid, isProfileValid } from "../utilities/validations.js";
import { ABOUT_TYPE, SKILL_TYPE, RESUME_ITEM_TYPE, PORTFOLIO_ITEM_TYPE, CERTIFICATION_TYPE } from "../utilities/types.js";
import { DATE_FORMAT } from "../utilities/constants.js";

export const getAbout = async (type, request, response) => {
  const isAbout = (type === ABOUT_TYPE);
  const isGerman = getLanguage(request);
  const promises = isAbout ? [getAdministrator(), getItemsDB(SKILL_TYPE), getItemsDB(RESUME_ITEM_TYPE), getItemsDB(CERTIFICATION_TYPE), getItemsDB(PORTFOLIO_ITEM_TYPE)] : [getAdministrator(), getItemsDB(SKILL_TYPE), getItemsDB(RESUME_ITEM_TYPE), getItemsDB(CERTIFICATION_TYPE)];
  let [user, skills, resume, certifications, portfolio] = await Promise.all(promises);
  if (isAbout) {
    skills = { languages: getFilteredItems(skills, "Language"), frameworks: getFilteredItems(skills, "Framework"), technologies: getFilteredItems(skills, "Technology") };
    resume = resume.map((item) => ({ ...item, type: item.type.toLowerCase() }));
    portfolio = portfolio.map((item) => ({ ...item, class: !isLinkValid(item.link) ? "noLink" : "" }));
  } else {
    resume = { experiences: getFilteredItems(resume, "Experience"), educations: getFilteredItems(resume, "Education") };
  }
  const isValid = isObjectValid(user) && isProfileValid(user) && (isAbout ? (isArrayValid(skills.languages) && isArrayValid(skills.frameworks) && isArrayValid(skills.technologies) && isArrayValid(resume) && isArrayValid(portfolio)) : (isArrayValid(skills) && isArrayValid(resume.experiences) && isArrayValid(resume.educations))) && isArrayValid(certifications);
  if (isValid) {
    user.password = null;
    user.telephone = `+${user.telephone}`;
    user.birthday = new Date(user.birthday).toLocaleDateString(isGerman ? "de-DE" : "en-US", DATE_FORMAT);
    let html = fs.readFileSync(path.resolve(`./public/html/${isAbout ? "about" : "download"}.html`), "utf-8");
    const applicationName = process.env.APPLICATION_NAME;
    const variables = { TITLE: `${user.firstName} ${user.lastName} - ${applicationName}`, APPLICATION_NAME: applicationName, isGerman, user, skills, resume, certifications, ...(isAbout && { RECAPTCHA_ID: process.env.RECAPTCHA_ID, portfolio, year: new Date().getFullYear() }), ...(!isAbout && { website: process.env.BASE_URL }) };
    html = addVariablesToHtml(html, variables);
    return response.writeHead(200, { "Content-Type": "text/html" }).end(html, "utf-8");
  } else {
    return response.writeHead(302, { Location: "/pageNotFound" }).end();
  }
};
