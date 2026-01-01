import { saveItem } from "./items.js";
import { addClosingEventListener } from "./dialog.js";
import { displayFile, getFileObject } from "./preview.js";
import { validateButton, addValidationEventListener, addLogo, addActions, addImageLinks } from "./scripts.js";
import { isTextValid, isFileObjectValid } from "../../utilities/validations.js";
import { CERTIFICATION_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const title = document.getElementById("title").value;
  const logo = getFileObject();
  const isValid = isTextValid(title) && isFileObjectValid(logo);
  validateButton(CERTIFICATION_TYPE, isValid);
};

const saveCertification = async (event) => {
  const configuration = {
    type: CERTIFICATION_TYPE,
    tableId: "certifications",
    fieldIds: ["title", "logo"],
    validations: {
      title: isTextValid,
      logo: isFileObjectValid
    },
    renderTr: (tr, data) => {
      const { _id, title, logo } = data;
      [title, logo, "actions"].forEach((value, index) => {
        const cell = tr.insertCell();
        if (index === 1) {
          addLogo(cell, value, `${CERTIFICATION_TYPE}_${_id}`);
        } else if (index === 2) {
          addActions(cell, _id, CERTIFICATION_TYPE);
        } else {
          cell.textContent = value;
        }
      });
    }
  }
  await saveItem(event, configuration);
};

addValidationEventListener(CERTIFICATION_TYPE, "input:not(#logo)", validateForm);
document.getElementById("logo").addEventListener("change", (event) => displayFile(event, true, validateForm));
document.getElementById(`${CERTIFICATION_TYPE}Form`).addEventListener("submit", saveCertification);
addClosingEventListener(CERTIFICATION_TYPE);
addImageLinks();
