import { encodeBase64, sign } from "./scripts.js";
import { isTextValid } from "./validations.js";
import { COOKIE_SESSION_TOKEN, SESSION_TOKEN_EXPIRATION_TIME } from "./constants.js";

const isProduction = (process.env.NODE_ENV === "production");

export const setCookie = (response, userId) => {
  const header = { alg: "HS512", typ: "JWT" };
  const expirationTime = SESSION_TOKEN_EXPIRATION_TIME * 3600;
  const payload = { userId, expiration: Math.floor(Date.now() / 1000) + expirationTime };
  const encodedHeader = encodeBase64(header);
  const encodedPayload = encodeBase64(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`);
  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  response.setHeader("Set-Cookie", `${COOKIE_SESSION_TOKEN}=${token}; ${getOptions(expirationTime)}`);
};

export const getCookie = (request) => {
  const { headers: { cookie: cookies } } = request;
  if (isTextValid(cookies)) {
    for (const cookie of cookies.split(";")) {
      const [key, value] = cookie.split("=");
      if (key.trim() === COOKIE_SESSION_TOKEN) return decodeURIComponent(value);
    }
  }
  return null;
};

export const deleteCookie = (response) => response.setHeader("Set-Cookie", `${COOKIE_SESSION_TOKEN}=; ${getOptions(0)}`);

const getOptions = (expirationTime) => ["HttpOnly", "Path=/", `Max-Age=${expirationTime}`, isProduction ? "Secure" : "", `SameSite=Lax`].filter(Boolean).join("; ");
