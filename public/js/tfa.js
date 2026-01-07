import { showBanner, hideBanner } from "./banner.js";
import { validateButton, addValidationEventListener, removeNonDigits } from "./scripts.js";
import { isTokenValid } from "../../utilities/validations.js";
import { QR_CODE_TYPE, TFA_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const token = document.getElementById("token").value;
  validateButton(TFA_TYPE, isTokenValid(token));
};

const generateQrCode = async () => {
  validateButton(QR_CODE_TYPE, false, "Loading...");
  hideBanner();
  const response = await fetch("/generateQrCode");
  const { ok } = response;
  const { message } = await response.json();
  if (ok) {
    document.getElementById("qrCode").src = message;
    document.getElementById("token").value = "";
    document.getElementById("tfaForm").classList.remove("none");
  } else {
    showBanner(message, "error");
  }
  validateButton(QR_CODE_TYPE, true, "Generate QR Code");
};

const toggleTfa = async (event, isEnabled) => {
  event.preventDefault();
  hideBanner();
  const tokenInput = document.getElementById("token");
  const token = tokenInput?.value;
  const statusDiv = document.getElementById("status");
  const buttonId = isEnabled ? TFA_TYPE : `${TFA_TYPE}Disable`;
  const text = isEnabled ? "Enable" : "Disable";
  if (!isEnabled) {
    const isConfirmed = window.confirm("Do you really want to disable 2FA?");
    if (!isConfirmed) return;
  }
  if (isEnabled && !isTokenValid(token)) {
    showBanner("Invalid token.", "error");
    validateButton(buttonId, false, "Enable");
    return;
  }
  validateButton(buttonId, false, isEnabled ? "Enabling..." : "Disabling...");
  const response = await fetch("/toggleTfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isEnabled, token }) });
  const { ok } = response;
  const { message } = await response.json();
  showBanner(message, ok ? "success" : "error");
  if (ok) {
    statusDiv.classList.toggle("enabled", isEnabled);
    statusDiv.classList.toggle("disabled", !isEnabled);
    statusDiv.querySelector("b").textContent = isEnabled ? "Enabled" : "Disabled";
    document.getElementById("tfaEnabled").classList.toggle("none", !isEnabled);
    document.getElementById("tfaDisabled").classList.toggle("none", isEnabled);
    if (isEnabled) {
      document.getElementById(`${TFA_TYPE}Form`).classList.add("none");
      document.getElementById("qrCode").removeAttribute("src");
      tokenInput.value = "";
    }
    validateButton(buttonId, isEnabled ? false : true, text);
  } else {
    validateButton(buttonId, false, text);
  }
};

addValidationEventListener(TFA_TYPE, "input", validateForm);
document.getElementById("qrCodeButton").addEventListener("click", generateQrCode);
document.getElementById(`${TFA_TYPE}Form`).addEventListener("submit", (event) => toggleTfa(event, true));
document.getElementById(`${TFA_TYPE}DisableButton`).addEventListener("click", (event) => toggleTfa(event, false));
document.getElementById("token").addEventListener("input", (event) => event.target.value = removeNonDigits(event.target.value));
