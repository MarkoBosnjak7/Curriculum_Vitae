import { isAuthorized } from "../utilities/authorization.js";
import { saveContactDB, answerContactDB } from "../utilities/database.js";
import { handleApplicationJson } from "../utilities/scripts.js";
import { isTextValid, isEmailValid, isReCaptchaTokenValid, isObjectIdValid, isArrayValid, isObjectValid } from "../utilities/validations.js";
import { INVALID_ITEM_ID_MESSAGE, UNAUTHORIZED_MESSAGE, ERROR_MESSAGE, ERROR_MESSAGE_DE } from "../utilities/constants.js";

export const saveContact = async (request, response) => {
  let isGerman = false;
  try {
    let errors = [];
    const { isGerman: isGermanValue, name, email, subject, message, reCaptchaToken } = await handleApplicationJson(request);
    isGerman = isGermanValue;
    if (!isTextValid(name)) errors = [...errors, "Name"];
    if (!isEmailValid(email)) errors = [...errors, "Email"];
    if (!isTextValid(subject)) errors = [...errors, "Subject"];
    if (!isTextValid(message)) errors = [...errors, "Message"];
    if (!(await isReCaptchaTokenValid(reCaptchaToken))) errors = [...errors, "ReCaptcha token"];
    if (!isArrayValid(errors)) {
      const timestamp = Date.now();
      await saveContactDB(name, email, subject, message, isGerman, timestamp);
      return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: isGerman ? "Vielen Dank für Ihre Nachricht. Ich werde mich schnellstmöglich bei Ihnen zurückmelden." : "Thank you for your message. I will get back to you as soon as possible." }));
    } else {
      return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: errors }));
    }
  } catch (error) {
    console.error(error);
    return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: isGerman ? ERROR_MESSAGE_DE : ERROR_MESSAGE }));
  }
};

export const answerContact = async (request, response, contactId) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    if (isObjectIdValid(contactId)) {
      const { isAnswered } = await handleApplicationJson(request);
      const contact = await answerContactDB(contactId, isAnswered);
      if (isObjectValid(contact)) {
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: isAnswered ? "Contact has been successfully answered." : "Contact's answer has been successfully revoked." }));
      }
    }
    return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: INVALID_ITEM_ID_MESSAGE }));
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};
