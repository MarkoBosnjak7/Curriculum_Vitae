import { showBanner, hideBanner } from "./banner.js";
import { validateButton, addValidationEventListener } from "./scripts.js";
import { isPasswordValid } from "../../utilities/validations.js";
import { PASSWORD_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const password = document.getElementById("password").value;
  validateButton(PASSWORD_TYPE, isPasswordValid(password));
};

const savePassword = async (event) => {
  event.preventDefault();
  validateButton(PASSWORD_TYPE, false, "Saving...");
  const password = document.getElementById("password").value;
  if (isPasswordValid(password)) {
    hideBanner();
    const response = await fetch("/savePassword", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const { ok } = response;
    const { message } = await response.json();
    if (ok) document.getElementById("password").value = "";
    showBanner(message, ok ? "success" : "error");
  } else {
    showBanner("Invalid password.", "error");
  }
  validateButton(PASSWORD_TYPE, false, "Save");
};

addValidationEventListener(PASSWORD_TYPE, "input", validateForm);
document.getElementById(`${PASSWORD_TYPE}Form`).addEventListener("submit", savePassword);
