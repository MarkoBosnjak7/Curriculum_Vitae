import { saveItem } from "./items.js";
import { addClosingEventListener } from "./dialog.js";
import { validateButton, addValidationEventListener, addActions } from "./scripts.js";
import { isTextValid, isObjectValid, isResumeItemTypeValid } from "../../utilities/validations.js";
import { RESUME_ITEM_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const title = document.getElementById("title").value;
  const title_de = document.getElementById("title_de").value;
  const workplace = document.getElementById("workplace").value;
  const duration = document.getElementById("duration").value;
  const duration_de = document.getElementById("duration_de").value;
  const description = document.getElementById("description").value;
  const description_de = document.getElementById("description_de").value;
  const type = document.getElementById("type").value;
  const isValid = isTextValid(title) && isTextValid(title_de) && isTextValid(workplace) && isTextValid(duration) && isTextValid(duration_de) && isTextValid(description) && isTextValid(description_de) && isResumeItemTypeValid(type);
  validateButton(RESUME_ITEM_TYPE, isValid);
};

const saveResumeItem = async (event) => {
  const configuration = {
    type: RESUME_ITEM_TYPE,
    tableId: "resume",
    fieldIds: ["title", "title_de", "workplace", "duration", "duration_de", "description", "description_de", "type"],
    validations: {
      title: isTextValid,
      title_de: isTextValid,
      workplace: isTextValid,
      duration: isTextValid,
      duration_de: isTextValid,
      description: isTextValid,
      description_de: isTextValid,
      type: isResumeItemTypeValid
    },
    renderTr: (tr, data) => {
      const { _id, title, title_de, workplace, duration, duration_de, description, description_de, type } = data;
      [{ en: title, de: title_de }, workplace, { en: duration, de: duration_de }, { en: description, de: description_de }, type, "actions"].forEach((value, index) => {
        const cell = tr.insertCell();
        if (index === 5) {
          addActions(cell, _id, RESUME_ITEM_TYPE);
        } else {
          if (isObjectValid(value)) {
            cell.innerHTML = `
              <div><img src="../images/usaFlag.png" alt="USA flag"> ${value.en}</div>
              <div><img src="../images/germanFlag.png" alt="German flag"> ${value.de}</div>
            `;
          } else {
            cell.textContent = value;
          }
        }
      });
    }
  }
  await saveItem(event, configuration);
};

addValidationEventListener(RESUME_ITEM_TYPE, "input, textarea, select", validateForm);
document.getElementById(`${RESUME_ITEM_TYPE}Form`).addEventListener("submit", saveResumeItem);
addClosingEventListener(RESUME_ITEM_TYPE);
