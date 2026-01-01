import { displayFile, getFileObject } from "./preview.js";
import { showBanner, hideBanner } from "./banner.js";
import { validateButton, addValidationEventListener } from "./scripts.js";
import { isTextValid, isEmailValid, isNumberValid, isLinkValid, isArrayValid, isFileObjectValid } from "../../utilities/validations.js";
import { PROFILE_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const telephone = Number(document.getElementById("telephone").value);
  const birthday = new Date(document.getElementById("birthday").value).getTime();
  const address = document.getElementById("address").value;
  const address_de = document.getElementById("address_de").value;
  const languages = document.getElementById("languages").value;
  const languages_de = document.getElementById("languages_de").value;
  const profession = document.getElementById("profession").value;
  const profession_de = document.getElementById("profession_de").value;
  const gitHub = document.getElementById("gitHub").value;
  const avatar = getFileObject();
  const isValid = isTextValid(firstName) && isTextValid(lastName) && isEmailValid(email) && isNumberValid(telephone) && isNumberValid(birthday) && isTextValid(address) && isTextValid(address_de) && isTextValid(languages) && isTextValid(languages_de) && isTextValid(profession) && isTextValid(profession_de) && isLinkValid(gitHub) && isFileObjectValid(avatar);
  validateButton(PROFILE_TYPE, isValid);
};

const saveProfile = async (event) => {
  event.preventDefault();
  validateButton(PROFILE_TYPE, false, "Saving...");
  let errors = [];
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const telephone = Number(document.getElementById("telephone").value);
  const birthday = new Date(document.getElementById("birthday").value).getTime();
  const address = document.getElementById("address").value;
  const address_de = document.getElementById("address_de").value;
  const languages = document.getElementById("languages").value;
  const languages_de = document.getElementById("languages_de").value;
  const profession = document.getElementById("profession").value;
  const profession_de = document.getElementById("profession_de").value;
  const gitHub = document.getElementById("gitHub").value;
  const avatar = getFileObject();
  if (!isTextValid(firstName)) errors = [...errors, "First name"];
  if (!isTextValid(lastName)) errors = [...errors, "Last name"];
  if (!isEmailValid(email)) errors = [...errors, "Email"];
  if (!isNumberValid(telephone)) errors = [...errors, "Telephone"];
  if (!isNumberValid(birthday)) errors = [...errors, "Birthday"];
  if (!isTextValid(address)) errors = [...errors, "Address"];
  if (!isTextValid(address_de)) errors = [...errors, "Address DE"];
  if (!isTextValid(languages)) errors = [...errors, "Languages"];
  if (!isTextValid(languages_de)) errors = [...errors, "Languages DE"];
  if (!isTextValid(profession)) errors = [...errors, "Profession"];
  if (!isTextValid(profession_de)) errors = [...errors, "Profession DE"];
  if (!isLinkValid(gitHub)) errors = [...errors, "GitHub"];
  if (!isFileObjectValid(avatar)) errors = [...errors, "Avatar"];
  if (!isArrayValid(errors)) {
    hideBanner();
    const response = await fetch("/saveProfile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, email, telephone, birthday, address, address_de, languages, languages_de, profession, profession_de, gitHub, avatar }) });
    const { ok } = response;
    const { message } = await response.json();
    if (ok) {
      const { name, src } = avatar;
      const sidebarAvatarImg = document.getElementById("sidebarAvatar");
      sidebarAvatarImg.src = src;
      sidebarAvatarImg.alt = name;
      sidebarAvatarImg.title = name;
      const sidebarGreetingDiv = document.getElementById("sidebarGreeting");
      sidebarGreetingDiv.textContent = sidebarGreetingDiv.textContent.replace(/, (.*?)(!)/, `, ${firstName}$2`);
      showBanner(message, "success");
    } else {
      showBanner(message, "error");
    }
  } else {
    showBanner(errors, "error");
  }
  validateButton(PROFILE_TYPE, false, "Save");
};

addValidationEventListener(PROFILE_TYPE, "input:not(#avatar)", validateForm);
document.getElementById("avatar").addEventListener("change", (event) => displayFile(event, false, validateForm));
document.getElementById(`${PROFILE_TYPE}Form`).addEventListener("submit", saveProfile);
