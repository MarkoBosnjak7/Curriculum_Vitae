import { showBanner } from "./banner.js";
import { validateButton, addValidationEventListener, getReCaptchaId } from "./scripts.js";
import { isTextValid, isEmailValid, isArrayValid } from "../../utilities/validations.js";
import { CONTACT_TYPE } from "../../utilities/types.js";

const toggleNavigationBar = () => {
  const burgerDiv = document.getElementById("burger");
  const linksUl = document.getElementById("links");
  burgerDiv.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      linksUl.classList.toggle("active");
      burgerDiv.textContent = linksUl.classList.contains("active") ? "✕" : "☰";
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      linksUl.classList.remove("active");
      burgerDiv.textContent = "☰";
    }
  });
};

const addLinkEventListener = () => {
  const navigationHeight = document.querySelector(".navigation").offsetHeight;
  const linksSpan = document.querySelectorAll(".link");
  linksSpan.forEach((linkSpan) => {
    linkSpan.addEventListener("click", (event) => {
      event.preventDefault();
      const sectionId = linkSpan.getAttribute("data-section");
      const section = document.getElementById(sectionId);
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
      const top = sectionTop - navigationHeight;
      window.scrollTo({ top, behavior: "smooth" });
      if (window.innerWidth <= 768) {
        const burgerDiv = document.getElementById("burger");
        const linksUl = document.getElementById("links");
        linksUl.classList.remove("active");
        burgerDiv.textContent = "☰";
      }
    });
  });
};

const download = (event) => {
  const { target: { dataset: { language } } } = event;
  window.open(`/download?language=${language}`, "_blank");
};

const validateForm = () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const isValid = isTextValid(name) && isEmailValid(email) && isTextValid(subject) && isTextValid(message);
  validateButton(CONTACT_TYPE, isValid);
};

const saveContact = async (event) => {
  event.preventDefault();
  const isGerman = (document.getElementById("isGerman").value === "true");
  validateButton(CONTACT_TYPE, false, isGerman ? "Sendet..." : "Submitting...");
  let errors = [];
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const reCaptchaId = getReCaptchaId();
  if (!isTextValid(name)) errors = [...errors, "Name"];
  if (!isEmailValid(email)) errors = [...errors, "Email"];
  if (!isTextValid(subject)) errors = [...errors, "Subject"];
  if (!isTextValid(message)) errors = [...errors, "Message"];
  if (!isTextValid(reCaptchaId)) errors = [...errors, "ReCaptcha ID"];
  if (!isArrayValid(errors)) {
    const reCaptchaToken = await window.grecaptcha.execute(reCaptchaId, { action: CONTACT_TYPE });
    if (isTextValid(reCaptchaToken)) {
      const response = await fetch("/saveContact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isGerman, name, email, subject, message, reCaptchaToken }) });
      const { ok } = response;
      const { message: responseMessage } = await response.json();
      if (ok) {
        document.getElementById(`${CONTACT_TYPE}Form`).reset();
        showBanner(responseMessage, "success");
      } else {
        if (isArrayValid(responseMessage)) {
          responseMessage.forEach((fieldId) => document.getElementById(fieldId).classList.add("error"));
          showBanner(isGerman ? "Bitte alle Felder ausfüllen." : "Please fill in all fields.", "error");
        } else {
          showBanner(responseMessage, "error");
        }
      }
    } else {
      showBanner(isGerman ? "Sind Sie ein Roboter?" : "Are you a robot?", "error");
    }
  } else {
    showBanner(isGerman ? "Bitte alle Felder ausfüllen." : "Please fill in all fields.", "error");
  }
  validateButton(CONTACT_TYPE, false, isGerman ? "Senden" : "Submit");
};

const hideErrorMessages = () => {
  const contactInputs = document.querySelectorAll(".contactInput");
  contactInputs.forEach((contactInput) => contactInput.addEventListener("focus", () => contactInput.classList.remove("error")));
};

toggleNavigationBar();
addLinkEventListener();
document.getElementById("downloadButton").addEventListener("click", download);
addValidationEventListener(CONTACT_TYPE, "input, textarea", validateForm);
document.getElementById(`${CONTACT_TYPE}Form`).addEventListener("submit", saveContact);
hideErrorMessages();
