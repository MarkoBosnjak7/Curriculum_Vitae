import { getUserByUsername, getUserTfa, writeLoginTimestamp } from "../utilities/database.js";
import { isAuthorized } from "../utilities/authorization.js";
import { setCookie, deleteCookie } from "../utilities/cookies.js";
import { verifyTotp } from "../utilities/tfa.js";
import { getHtmlFile, verifyPassword, handleApplicationJson } from "../utilities/scripts.js";
import { isUsernameValid, isPasswordValid, isTokenValid, isReCaptchaTokenValid, isArrayValid, isObjectValid } from "../utilities/validations.js";
import { LOGIN_TYPE, AUTHENTICATION_TYPE } from "../utilities/types.js";
import { ERROR_MESSAGE } from "../utilities/constants.js";

let shouldAuthenticate = false;

export const getLogin = async (request, response) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    return response.writeHead(302, { Location: "/overview" }).end();
  } else {
    return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(LOGIN_TYPE, null), "utf-8");
  }
};

export const loginUser = async (request, response) => {
  try {
    let errors = [];
    const { username, password, reCaptchaToken } = await handleApplicationJson(request);
    if (!isUsernameValid(username)) errors = [...errors, "Username"];
    if (!isPasswordValid(password)) errors = [...errors, "Password"];
    if (!(await isReCaptchaTokenValid(reCaptchaToken))) errors = [...errors, "ReCaptcha token"];
    if (!isArrayValid(errors)) {
      const user = await getUserByUsername(username);
      if (isObjectValid(user)) {
        const isVerified = verifyPassword(password, user.password);
        if (isVerified) {
          const { _id: userId } = user;
          const tfa = await getUserTfa(userId);
          if (isObjectValid(tfa)) {
            const { isEnabled } = tfa;
            if (isEnabled) {
              shouldAuthenticate = true;
            } else {
              await writeLoginTimestamp(userId);
              setCookie(response, userId);
            }
            return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ isEnabled }));
          } else {
            return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid authentication." }));
          }
        } else {
          return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Incorrect password." }));
        }
      } else {
        return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid username." }));
      }
    } else {
      return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: errors }));
    }
  } catch (error) {
    console.error(error);
    return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
  }
};

export const logoutUser = (response) => {
  deleteCookie(response);
  return response.writeHead(302, { Location: "/login" }).end();
};

export const getAuthentication = async (request, response) => {
  const { isLoggedIn } = await isAuthorized(request, response);
  if (isLoggedIn) {
    return response.writeHead(302, { Location: "/overview" }).end();
  } else {
    if (shouldAuthenticate) {
      shouldAuthenticate = false;
      return response.writeHead(200, { "Content-Type": "text/html" }).end(await getHtmlFile(AUTHENTICATION_TYPE, null), "utf-8");
    } else {
      return response.writeHead(302, { Location: "/login" }).end();
    }
  }
};

export const authenticateUser = async (request, response) => {
  try {
    let errors = [];
    const { username, token, reCaptchaToken } = await handleApplicationJson(request);
    if (!isUsernameValid(username)) errors = [...errors, "Username"];
    if (!isTokenValid(token)) errors = [...errors, "Token"];
    if (!(await isReCaptchaTokenValid(reCaptchaToken))) errors = [...errors, "ReCaptcha token"];
    if (!isArrayValid(errors)) {
      const user = await getUserByUsername(username);
      if (isObjectValid(user)) {
        const { _id: userId } = user;
        const tfa = await getUserTfa(userId);
        if (isObjectValid(tfa)) {
          const { secret } = tfa;
          const { ok } = verifyTotp(token, secret);
          if (ok) {
            await writeLoginTimestamp(userId);
            setCookie(response, userId);
            return response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "User has been successfully logged in." }));
          } else {
            return response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid token." }));
          }
        } else {
          return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid authentication." }));
        }
      } else {
        return response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Invalid username." }));
      }
    } else {
      return response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ message: errors }));
    }
  } catch (error) {
    console.error(error);
    return response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: ERROR_MESSAGE }));
  }
};
