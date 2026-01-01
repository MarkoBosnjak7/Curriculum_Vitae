import { getUserById, getUserTfa, saveUserTfa } from "../utilities/database.js";
import { isAuthorized } from "../utilities/authorization.js";
import { generateQrCodeSecret, verifyTotp } from "../utilities/tfa.js";
import { getHtmlFile, handleApplicationJson } from "../utilities/scripts.js";
import { isTokenValid } from "../utilities/validations.js";
import { TFA_TYPE } from "../utilities/types.js";
import { UNAUTHORIZED_MESSAGE, ERROR_MESSAGE } from "../utilities/constants.js";

export const getTfa = async (request, response) => {
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(TFA_TYPE, await getUserTfa(userId), true), "utf-8");
  } else {
    return response.writeHead(302, { Location: "/unauthorized" }).end();
  }
};

export const generateQrCode = async (request, response) => {
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    const { email } = await getUserById(userId);
    const qrCode = await generateQrCodeSecret(userId, email || process.env.EMAIL_USERNAME);
    return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: qrCode }));
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};

export const toggleTfa = async (request, response) => {
  const { isLoggedIn, userId } = await isAuthorized(request, response);
  if (isLoggedIn) {
    try {
      const { isEnabled, token } = await handleApplicationJson(request);
      if (isEnabled) {
        if (isTokenValid(token)) {
          const { secret } = await getUserTfa(userId);
          const { ok } = verifyTotp(token, secret);
          if (ok) {
            await saveUserTfa(userId, { isEnabled });
            return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "2FA has been successfully enabled." }));
          }
        }
        return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid token." }));
      } else {
        await saveUserTfa(userId, { isEnabled, secret: "" });
        return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "2FA has been successfully disabled." }));
      }
    } catch (error) {
      console.error(error);
      return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
    }
  } else {
    return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: UNAUTHORIZED_MESSAGE }));
  }
};
