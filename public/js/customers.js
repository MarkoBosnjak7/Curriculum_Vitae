import { saveItem } from "./items.js";
import { addClosingEventListener } from "./dialog.js";
import { validateButton, addValidationEventListener, addActions } from "./scripts.js";
import { isTextValid } from "../../utilities/validations.js";
import { CUSTOMER_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const title = document.getElementById("title").value;
  validateButton(CUSTOMER_TYPE, isTextValid(title));
};

const saveCustomer = async (event) => {
  const configuration = {
    type: CUSTOMER_TYPE,
    tableId: "customers",
    fieldIds: ["title"],
    validations: {
      title: isTextValid
    },
    renderTr: (tr, data) => {
      const { _id, title } = data;
      [title, "actions"].forEach((value, index) => {
        const cell = tr.insertCell();
        if (index === 1) {
          addActions(cell, _id, CUSTOMER_TYPE);
        } else {
          cell.textContent = value;
        }
      });
    }
  }
  await saveItem(event, configuration);
};

addValidationEventListener(CUSTOMER_TYPE, "input", validateForm);
document.getElementById(`${CUSTOMER_TYPE}Form`).addEventListener("submit", saveCustomer);
addClosingEventListener(CUSTOMER_TYPE);
