import { openDialog, closeDialog } from "./dialog.js";
import { getFileObject } from "./preview.js";
import { showBanner, hideBanner } from "./banner.js";
import { showToast } from "./toast.js";
import { validateButton } from "./scripts.js";
import { isObjectIdValid, isArrayValid } from "../../utilities/validations.js";
import { RESUME_ITEM_TYPE } from "../../utilities/types.js";

export const saveItem = async (event, configuration) => {
  event.preventDefault();
  const { type, tableId, fieldIds, validations, renderTr } = configuration;
  validateButton(type, false, "Saving...");
  const fields = {};
  const id = document.getElementById("id").value;
  const tbody = document.getElementById(`${tableId}Table`).getElementsByTagName("tbody")[0];
  if (isObjectIdValid(id)) {
    fields["id"] = id;
    tbody.classList.add("disabled");
  }
  for (const fieldId of fieldIds) {
    const element = document.getElementById(fieldId);
    fields[fieldId] = (fieldId === "logo") ? getFileObject() : element.value;
  }
  let errors = [];
  Object.entries(validations).forEach(([fieldId, validate]) => {
    if (!validate(fields[fieldId])) errors.push(capitalize(fieldId));
  });
  if (!isArrayValid(errors)) {
    hideBanner();
    const response = await fetch(`save${capitalize(type)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
    const { ok } = response;
    if (ok) {
      const data = await response.json();
      const { _id, isUpdated } = data;
      const trId = `${type}_${_id}`;
      let tr;
      if (isUpdated) {
        tr = document.getElementById(trId);
        tr.innerHTML = "";
      } else {
        tr = tbody.insertRow(0);
        tr.id = trId;
        const total = document.getElementById("total");
        total.textContent = Number(total.textContent) + 1;
      }
      renderTr(tr, data);
      closeDialog(type);
    } else {
      const { message } = await response.json();
      showBanner(message, "error");
    }
  } else {
    showBanner(errors, "error");
  }
  if (isObjectIdValid(id)) tbody.classList.remove("disabled");
  validateButton(type, false, "Save");
};

export const getItem = async (event) => {
  const { target: { dataset: { id, type } } } = event;
  const tbody = document.getElementById(`${type}_${id}`).closest("tbody");
  tbody.classList.add("disabled");
  const response = await fetch(`/get${capitalize(type)}/${id}`);
  const { ok } = response;
  if (ok) {
    let fields = await response.json();
    fields["id"] = fields._id;
    delete fields._id;
    delete fields.timestamp;
    openDialog(fields);
  } else {
    const { message } = await response.json();
    showToast(message, "error");
  }
  tbody.classList.remove("disabled");
};

export const pinItem = async (event) => {
  const { target: { dataset: { id, type } } } = event;
  const tr = document.getElementById(`${type}_${id}`);
  const tbody = tr.closest("tbody");
  const title = (type === RESUME_ITEM_TYPE) ? tr.cells[0].querySelector("div").textContent.trim() : tr.cells[0].textContent;
  const isConfirmed = window.confirm(`Do you really want to pin ${title}?`);
  if (isConfirmed) {
    tbody.classList.add("disabled");
    const response = await fetch(`/pin${capitalize(type)}/${id}`, { method: "PUT" });
    const { ok } = response;
    const { message } = await response.json();
    if (ok) {
      tr.remove();
      tbody.insertBefore(tr, tbody.firstChild);
    }
    tbody.classList.remove("disabled");
    showToast(message, ok ? "success" : "error");
  }
};

export const deleteItem = async (event) => {
  const { target: { dataset: { id, type } } } = event;
  const tr = document.getElementById(`${type}_${id}`);
  const tbody = tr.closest("tbody");
  const title = (type === RESUME_ITEM_TYPE) ? tr.cells[0].querySelector("div").textContent.trim() : tr.cells[0].textContent;
  const isConfirmed = window.confirm(`Do you really want to delete ${title}?`);
  if (isConfirmed) {
    tbody.classList.add("disabled");
    const response = await fetch(`/delete${capitalize(type)}/${id}`, { method: "DELETE" });
    const { ok } = response;
    const { message } = await response.json();
    if (ok) {
      tr.remove();
      const totalSpan = document.getElementById("total");
      totalSpan.textContent = Number(totalSpan.textContent) - 1;
    }
    tbody.classList.remove("disabled");
    showToast(message, ok ? "success" : "error");
  }
};

const capitalize = (type) => `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

document.querySelectorAll(".edit").forEach((action) => action.addEventListener("click", getItem));
document.querySelectorAll(".pin").forEach((action) => action.addEventListener("click", pinItem));
document.querySelectorAll(".delete").forEach((action) => action.addEventListener("click", deleteItem));
