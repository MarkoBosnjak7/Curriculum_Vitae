import { openDialog, closeDialog, addClosingEventListener } from "./dialog.js";
import { showToast } from "./toast.js";
import { CONTACT_TYPE } from "../../utilities/types.js";

export const viewContact = async (event) => {
  const { target: { dataset: { id } } } = event;
  const response = await fetch(`/getContact/${id}`);
  const { ok } = response;
  if (ok) {
    let fields = await response.json();
    fields["id"] = fields._id;
    delete fields._id;
    openDialog(fields, CONTACT_TYPE);
  } else {
    const { message } = await response.json();
    showToast(message, "error");
  }
};

export const answerContact = async (event) => {
  const id = event?.target?.dataset?.id || document.getElementById("id").value;
  const answer = event?.target?.dataset?.answer || document.getElementById("answer").value;
  const isAnswered = (answer !== "true");
  const tr = document.getElementById(`contact_${id}`);
  const tbody = tr.closest("tbody");
  const name = tr.cells[0].textContent;
  const isConfirmed = window.confirm(isAnswered ? `Do you really want to answer contact ${name}?` : `Do you really want to revoke answer for contact ${name}?`);
  if (isConfirmed) {
    tbody.classList.add("disabled");
    const response = await fetch(`/answerContact/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAnswered }) });
    const { ok } = response;
    const { message } = await response.json();
    if (ok) {
      const answerImg = document.querySelector(`.answer[data-id="${id}"]`);
      answerImg.classList.remove("answered", "unanswered");
      answerImg.classList.add(isAnswered ? "answered" : "unanswered");
      answerImg.title = isAnswered ? "Answered" : "Unanswered";
      answerImg.dataset.answer = isAnswered;
    }
    tbody.classList.remove("disabled");
    closeDialog(CONTACT_TYPE);
    showToast(message, ok ? "success" : "error");
  }
};

export const deleteContact = async (event) => {
  const { target: { dataset: { id } } } = event;
  const tr = document.getElementById(`contact_${id}`);
  const tbody = tr.closest("tbody");
  const name = tr.cells[0].textContent;
  const isConfirmed = window.confirm(`Do you really want to delete contact ${name}?`);
  if (isConfirmed) {
    tbody.classList.add("disabled");
    const response = await fetch(`/deleteContact/${id}`, { method: "DELETE" });
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

document.querySelectorAll(".view").forEach((action) => action.addEventListener("click", viewContact));
document.querySelectorAll(".answer").forEach((action) => action.addEventListener("click", answerContact));
document.querySelectorAll(".delete").forEach((action) => action.addEventListener("click", deleteContact));
document.querySelectorAll("#answerButton").forEach((action) => action.addEventListener("click", answerContact));
addClosingEventListener(CONTACT_TYPE);
