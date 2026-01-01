import { deleteFile } from "./preview.js";
import { hideBanner } from "./banner.js";
import { CONTACT_TYPE } from "../../utilities/types.js";
import { DATE_TIME_FORMAT } from "../../utilities/constants.js";

export const openDialog = (fields, type = null) => {
  document.querySelector(".dialogTitleText").textContent = (type === CONTACT_TYPE) ? "View" : "Edit";
  if (type === CONTACT_TYPE) {
    const { id, name, email, subject, message, isGerman, isAnswered, timestamp } = fields;
    const date = new Date(timestamp).toLocaleString("de-DE", DATE_TIME_FORMAT);
    document.getElementById("id").value = id;
    document.getElementById("answer").value = isAnswered;
    document.getElementById("name").textContent = name;
    document.getElementById("email").innerHTML = `<a href='mailto:${email}?subject=${isGerman ? "Rückmeldung" : "Feedback"}'>${email}</a>`;
    document.getElementById("subject").textContent = subject;
    document.getElementById("message").textContent = message;
    const languageImg = document.getElementById("language");
    languageImg.src = `../images/${isGerman ? "german" : "usa"}Flag.png`;
    languageImg.alt = `${isGerman ? "German" : "USA"} flag`;
    languageImg.title = isGerman ? "German" : "English";
    document.getElementById("date").textContent = date;
    const answerButton = document.getElementById("answerButton");
    answerButton.textContent = isAnswered ? "Revoke answer" : "Answer";
    answerButton.classList.add(isAnswered ? "error" : "success");
  } else {
    Object.entries(fields).forEach(([key, value]) => {
      if (key === "logo") {
        const { name, src } = value;
        document.getElementById("logoName").textContent = name;
        document.querySelector(".logoLabel").classList.remove("placeholder");
        const previewImg = document.getElementById("preview");
        previewImg.src = src;
        previewImg.alt = name;
        previewImg.title = name;
        previewImg.style.display = "block";
      } else {
        document.getElementById(key).value = value;
      }
    });
  }
  document.getElementById("overlay").style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const closeDialog = (type) => {
  overlay.style.display = "none";
  document.querySelector(".dialogTitleText").textContent = (type === CONTACT_TYPE) ? "View" : "New";
  if (type === CONTACT_TYPE) {
    document.getElementById("id").value = "";
    document.getElementById("answer").value = "";
    document.getElementById("name").textContent = "";
    document.getElementById("email").innerHTML = "";
    document.getElementById("subject").textContent = "";
    document.getElementById("message").textContent = "";
    const languageImg = document.getElementById("language");
    languageImg.src = "";
    languageImg.alt = "";
    languageImg.title = "";
    document.getElementById("date").textContent = "";
    const answerButton = document.getElementById("answerButton");
    answerButton.textContent = "";
    answerButton.classList.remove("error", "success");
  } else {
    const form = document.getElementById(`${type}Form`);
    form.querySelectorAll("input").forEach((input) => {
      const type = input.type.toLowerCase();
      if (["text", "hidden", "url"].includes(type)) input.value = "";
    });
    form.querySelectorAll("textarea").forEach((textarea) => {
      textarea.value = "";
      textarea.style.height = "";
    });
    form.querySelectorAll("select").forEach((select) => select.selectedIndex = 0);
    if ((type === "skill") || (type === "portfolioItem") || (type === "certification")) deleteFile();
    const button = document.getElementById(`${type}Button`);
    button.disabled = true;
    button.classList.remove("action");
    hideBanner();
  }
};

export const addClosingEventListener = (type) => document.querySelectorAll(".closeDialog").forEach((button) => button.addEventListener("click", () => closeDialog(type)));

const overlay = document.getElementById("overlay");
const openDialogButton = document.getElementById("openDialog");
if (openDialogButton) openDialogButton.addEventListener("click", () => overlay.style.display = "flex");
