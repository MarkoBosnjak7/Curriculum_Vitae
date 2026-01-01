import { showBanner, hideBanner } from "./banner.js";
import { validateButton, addValidationEventListener, removeNonDigits, getReCaptchaId } from "./scripts.js";
import { isTextValid, isUsernameValid, isTokenValid, isArrayValid } from "../../utilities/validations.js";
import { AUTHENTICATION_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const token = document.getElementById("token").value;
  validateButton(AUTHENTICATION_TYPE, isTokenValid(token));
};

const authenticateUser = async (event) => {
  event.preventDefault();
  validateButton(AUTHENTICATION_TYPE, false, "Logging in...");
  let errors = [];
  const { username } = JSON.parse(sessionStorage.getItem(AUTHENTICATION_TYPE));
  const token = document.getElementById("token").value;
  const reCaptchaId = getReCaptchaId();
  if (!isUsernameValid(username)) errors = [...errors, "Username"];
  if (!isTokenValid(token)) errors = [...errors, "Token"];
  if (!isTextValid(reCaptchaId)) errors = [...errors, "ReCaptcha ID"];
  if (!isArrayValid(errors)) {
    hideBanner();
    const reCaptchaToken = await window.grecaptcha.execute(reCaptchaId, { action: AUTHENTICATION_TYPE });
    if (isTextValid(reCaptchaToken)) {
      const response = await fetch("/authenticateUser", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, token, reCaptchaToken }) });
      const { ok } = response;
      if (ok) {
        sessionStorage.removeItem(AUTHENTICATION_TYPE);
        window.location.href = "/overview";
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
  validateButton(AUTHENTICATION_TYPE, false, "Login");
};

addValidationEventListener(AUTHENTICATION_TYPE, "input", validateForm);
document.getElementById(`${AUTHENTICATION_TYPE}Form`).addEventListener("submit", authenticateUser);
document.getElementById("token").addEventListener("input", (event) => event.target.value = removeNonDigits(event.target.value));
window.addEventListener("beforeunload", () => sessionStorage.removeItem(AUTHENTICATION_TYPE));
