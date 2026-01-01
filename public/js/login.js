import { showBanner, hideBanner } from "./banner.js";
import { validateButton, addValidationEventListener, getReCaptchaId } from "./scripts.js";
import { isTextValid, isUsernameValid, isPasswordValid, isArrayValid } from "../../utilities/validations.js";
import { LOGIN_TYPE, AUTHENTICATION_TYPE, REMEMBER_ME_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const isValid = isUsernameValid(username) && isPasswordValid(password);
  validateButton(LOGIN_TYPE, isValid);
};

const loginUser = async (event) => {
  event.preventDefault();
  validateButton(LOGIN_TYPE, false, "Logging in...");
  let errors = [];
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const reCaptchaId = getReCaptchaId();
  if (!isUsernameValid(username)) errors = [...errors, "Username"];
  if (!isPasswordValid(password)) errors = [...errors, "Password"];
  if (!isTextValid(reCaptchaId)) errors = [...errors, "ReCaptcha ID"];
  if (!isArrayValid(errors)) {
    hideBanner();
    const reCaptchaToken = await window.grecaptcha.execute(reCaptchaId, { action: LOGIN_TYPE });
    if (isTextValid(reCaptchaToken)) {
      const response = await fetch("/loginUser", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, reCaptchaToken }) });
      const { ok } = response;
      if (ok) {
        const { isEnabled } = await response.json();
        if (isEnabled) sessionStorage.setItem(AUTHENTICATION_TYPE, JSON.stringify({ username }));
        const rememberMeInput = document.getElementById("rememberMe");
        if (rememberMeInput.checked) localStorage.setItem(REMEMBER_ME_TYPE, JSON.stringify({ username }));
        else localStorage.removeItem(REMEMBER_ME_TYPE);
        window.location.href = isEnabled ? "/authentication" : "/overview";
        return;
      } else {
        const { message } = await response.json();
        showBanner(message, "error");
      }
    } else {
      showBanner("Invalid ReCaptcha token.", "error");
    }
  } else {
    showBanner(errors, "error");
  }
  validateButton(LOGIN_TYPE, false, "Login");
};

const getRememberMe = () => {
  const rememberMeInput = document.getElementById("rememberMe");
  try {
    const rememberMe = localStorage.getItem(REMEMBER_ME_TYPE);
    const { username } = JSON.parse(rememberMe);
    document.getElementById("username").value = username;
    rememberMeInput.checked = true;
  } catch {
    rememberMeInput.checked = false;
  }
};

getRememberMe();
addValidationEventListener(LOGIN_TYPE, "input", validateForm);
document.getElementById(`${LOGIN_TYPE}Form`).addEventListener("submit", loginUser);
document.getElementById("aboutButton").addEventListener("click", () => window.location.href = "/");
