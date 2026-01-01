import { isUserValid } from "./database.js";
import { getCookie, deleteCookie } from "./cookies.js";
import { decodeBase64 } from "./scripts.js";
import { isTextValid } from "./validations.js";

export const isAuthorized = async (request, response) => {
  try {
    const cookie = getCookie(request);
    if (isTextValid(cookie)) {
      const sessionToken = decodeBase64(cookie);
      const { userId, expiration } = sessionToken;
      const now = Math.floor(Date.now() / 1000);
      if (expiration >= now) {
        const isValid = await isUserValid(userId);
        if (isValid) return { isLoggedIn: true, userId };
      } else {
        deleteCookie(response);
      }
    }
    return { isLoggedIn: false };
  } catch {
    return { isLoggedIn: false };
  }
};
