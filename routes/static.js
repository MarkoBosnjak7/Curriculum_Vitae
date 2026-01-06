import fs from "fs";
import path from "path";
import { addVariablesToHtml } from "../utilities/scripts.js";

export const getJsFile = (response, fileName) => {
  try {
    const basename = path.basename(fileName);
    const js = fs.readFileSync(path.resolve(`./public/js/${basename}`), "utf-8");
    return response.writeHead(200, { "Content-Type": "text/javascript" }).end(js, "utf-8");
  } catch {
    return response.writeHead(404, { "Content-Type": "text/plain" }).end("File not found.");
  }
};

export const getUtilityFile = (response, fileName) => {
  try {
    const basename = path.basename(fileName);
    const js = fs.readFileSync(path.resolve(`./utilities/${basename}`), "utf-8");
    return response.writeHead(200, { "Content-Type": "text/javascript" }).end(js, "utf-8");
  } catch {
    return response.writeHead(404, { "Content-Type": "text/plain" }).end("File not found.");
  }
};

export const getCssFile = (response, fileName) => {
  try {
    const basename = path.basename(fileName);
    const css = fs.readFileSync(path.resolve(`./public/css/${basename}`), "utf-8");
    return response.writeHead(200, { "Content-Type": "text/css" }).end(css, "utf-8");
  } catch {
    return response.writeHead(404, { "Content-Type": "text/plain" }).end("File not found.");
  }
};

export const getImageFile = (response, fileName) => {
  try {
    const basename = path.basename(fileName);
    const image = fs.readFileSync(path.resolve(`./public/images/${basename}`));
    return response.writeHead(200, { "Content-Type": "image/png" }).end(image);
  } catch {
    return response.writeHead(404, { "Content-Type": "text/plain" }).end("File not found.");
  }
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
