import fs from "fs";
import path from "path";
import { addVariablesToHtml } from "../utilities/scripts.js";

export const getJsFile = (response, fileName) => {
  const js = fs.readFileSync(path.resolve(`./public/js/${fileName}`), "utf-8");
  return response.writeHead(200, { "Content-Type": "text/javascript" }).end(js, "utf-8");
};

export const getUtilityFile = (response, fileName) => {
  const js = fs.readFileSync(path.resolve(`./utilities/${fileName}`), "utf-8");
  return response.writeHead(200, { "Content-Type": "text/javascript" }).end(js, "utf-8");
};

export const getCssFile = (response, fileName) => {
  const css = fs.readFileSync(path.resolve(`./public/css/${fileName}`), "utf-8");
  return response.writeHead(200, { "Content-Type": "text/css" }).end(css, "utf-8");
};

export const getImageFile = (response, fileName) => {
  const image = fs.readFileSync(path.resolve(`./public/images/${fileName}`));
  return response.writeHead(200, { "Content-Type": "image/png" }).end(image);
};

export const getFaviconFile = (response) => {
  const favicon = fs.readFileSync(path.resolve("./public/favicon/cv.ico"));
  return response.writeHead(200, { "Content-Type": "image/x-icon" }).end(favicon);
};

export const getNoAccessFile = (response, isUnauthorized = false) => {
  let html = fs.readFileSync(path.resolve("./public/html/noAccess.html"), "utf-8");
  const variables = { APPLICATION_NAME: process.env.APPLICATION_NAME, isUnauthorized };
  html = addVariablesToHtml(html, variables);
  return response.writeHead(200, { "Content-Type": "text/html" }).end(html);
};
