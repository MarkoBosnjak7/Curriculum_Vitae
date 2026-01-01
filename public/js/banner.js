import { isArrayValid } from "../../utilities/validations.js";

export const showBanner = (message, status) => {
  document.getElementById("bannerText").textContent = isArrayValid(message) ? `Please check following fields: ${message.join(", ")}.` : message;
  const bannerDiv = document.getElementById("banner");
  bannerDiv.classList.add(status);
  bannerDiv.style.display = "flex";
};

export const hideBanner = () => {
  const bannerDiv = document.getElementById("banner");
  bannerDiv.style.display = "none";
  bannerDiv.classList.remove("success", "error");
  document.getElementById("bannerText").textContent = "";
};

const bannerHideButton = document.getElementById("bannerHide");
if (bannerHideButton) bannerHideButton.addEventListener("click", hideBanner);
