import { LOGIN_TYPE, AUTHENTICATION_TYPE, CONTACT_TYPE } from "./types.js";

export const isTextValid = (text) => (typeof text === "string") && (text.trim().length > 0);

export const isUsernameValid = (username) => {
  const length = username.length;
  const minimumLength = 3;
  const maximumLength = 15;
  return isTextValid(username) && /^[a-z0-9]+([_.-]?[a-z0-9]+)*$/.test(username) && (length >= minimumLength) && (length <= maximumLength);
};

export const isPasswordValid = (password) => {
  if (!isTextValid(password)) return false;
  const length = password.length;
  const minimumLength = 8;
  const maximumLength = 64;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*]/.test(password);
  return (length >= minimumLength) && (length <= maximumLength) && hasLowerCase && hasUpperCase && hasDigit && hasSpecialCharacter;
};

export const isEmailValid = (email) => isTextValid(email) && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const isNumberValid = (number) => (typeof number === "number") && Number.isFinite(number) && (number > 0);

export const isLinkValid = (link) => {
  if (!isTextValid(link)) return false;
  try {
    const url = new URL(link);
    const { protocol } = url;
    return protocol === "https:";
  } catch {
    return false;
  }
};

export const isTokenValid = (token) => isTextValid(token) && /^\d{6}$/.test(token);

export const isFileValid = (file) => file instanceof File;

export const isMimeTypeValid = (mimeType) => isTextValid(mimeType) && ["image/png", "image/jpg", "image/jpeg"].includes(mimeType);

export const isReCaptchaTokenValid = async (reCaptchaToken) => {
  if (isTextValid(reCaptchaToken)) {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reCaptchaToken}`);
    const { ok } = response;
    if (ok) {
      const { success, action, score } = await response.json();
      return success && (((action === LOGIN_TYPE) && (score >= 0.7)) || ((action === AUTHENTICATION_TYPE) && (score >= 0.9)) || ((action === CONTACT_TYPE) && (score >= 0.5)));
    }
  }
  return false;
};

export const isObjectIdValid = (objectId) => isTextValid(objectId) && /^[a-fA-F0-9]{24}$/.test(objectId);

export const isArrayValid = (array) => (Array.isArray(array) || (array instanceof FileList)) && (array.length > 0);

export const isObjectValid = (object) => (object !== null) && (typeof object === "object") && !Array.isArray(object) && (Object.keys(object).length > 0);

export const isFileObjectValid = (fileObject) => {
  if (isObjectValid(fileObject)) {
    const { name, mimeType, src } = fileObject;
    return isTextValid(name) && isMimeTypeValid(mimeType) && isTextValid(src);
  } else {
    return false;
  }
};

export const isProfileValid = (user) => isUsernameValid(user.username) && isTextValid(user.firstName) && isTextValid(user.lastName) && isEmailValid(user.email) && isNumberValid(user.telephone) && isNumberValid(user.birthday) && isTextValid(user.address) && isTextValid(user.address_de) && isTextValid(user.languages) && isTextValid(user.languages_de) && isTextValid(user.profession) && isTextValid(user.profession_de) && isLinkValid(user.gitHub) && isFileObjectValid(user.avatar);

export const isSkillTypeValid = (skillType) => isTextValid(skillType) && ["Language", "Framework", "Technology"].includes(skillType);

export const isResumeItemTypeValid = (resumeItemType) => isTextValid(resumeItemType) && ["Education", "Experience"].includes(resumeItemType);

export const isPortfolioItemTypeValid = (portfolioItemType) => isTextValid(portfolioItemType) && ["Work", "Personal", "Academic"].includes(portfolioItemType);
