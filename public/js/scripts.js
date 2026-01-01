import { getItem, deleteItem, pinItem } from "./items.js";
import { isTextValid } from "../../utilities/validations.js";

export const validateButton = (type, isValid, text = null) => {
  const button = document.getElementById(`${type}Button`);
  if (isValid) {
    button.disabled = false;
    button.classList.add("action");
  } else {
    button.disabled = true;
    button.classList.remove("action");
  }
  if (isTextValid(text)) button.textContent = text;
};

export const addValidationEventListener = (type, querySelector, validationFunction) => {
  const inputs = document.getElementById(`${type}Form`).querySelectorAll(querySelector);
  inputs.forEach((input) => input.addEventListener("input", validationFunction));
};

export const addLogo = (cell, logo, trId) => {
  cell.classList.add("logo");
  cell.innerHTML = `<img src="${logo.src}" alt="${logo.name}" title="${logo.name}" width="50" height="50">`;
  addImageLinks(`#${trId} td img`);
};

export const addActions = (cell, id, type) => {
  cell.innerHTML = `
    <img src="../images/edit.png" alt="Edit" title="Edit" class="action edit" data-id="${id}" data-type="${type}">
    <img src="../images/delete.png" alt="Delete" title="Delete" class="action delete" data-id="${id}" data-type="${type}">
    <img src="../images/pin.png" alt="Pin" title="Pin" class="action pin" data-id="${id}" data-type="${type}">
  `;
  cell.querySelector(".edit").addEventListener("click", getItem);
  cell.querySelector(".delete").addEventListener("click", deleteItem);
  cell.querySelector(".pin").addEventListener("click", pinItem);
};

export const addImageLinks = (selector = null) => {
  let images = [];
  if (isTextValid(selector)) {
    const image = document.querySelector(selector);
    images = [...images, image];
  } else {
    images = document.querySelectorAll("td.logo img");
  }
  images.forEach((image) => {
    image.addEventListener("click", async () => {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank");
      if (newTab) newTab.onload = () => URL.revokeObjectURL(url);
    });
  });
};

export const removeNonDigits = (value) => value.replace(/\D/g, "");

export const getReCaptchaId = () => {
  const script = document.querySelector("script[src*='recaptcha/api.js'][src*='render=']");
  const { src } = script;
  return new URL(src).searchParams.get("render");
};
