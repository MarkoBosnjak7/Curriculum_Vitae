import { saveItem } from "./items.js";
import { addClosingEventListener } from "./dialog.js";
import { displayFile, getFileObject } from "./preview.js";
import { validateButton, addValidationEventListener, addLogo, addActions, addImageLinks } from "./scripts.js";
import { isTextValid, isFileObjectValid, isSkillTypeValid } from "../../utilities/validations.js";
import { SKILL_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const title = document.getElementById("title").value;
  const type = document.getElementById("type").value;
  const logo = getFileObject();
  const isValid = isTextValid(title) && isSkillTypeValid(type) && isFileObjectValid(logo);
  validateButton(SKILL_TYPE, isValid);
};

const saveSkill = async (event) => {
  const configuration = {
    type: SKILL_TYPE,
    tableId: "skills",
    fieldIds: ["title", "type", "logo"],
    validations: {
      title: isTextValid,
      type: isSkillTypeValid,
      logo: isFileObjectValid
    },
    renderTr: (tr, data) => {
      const { _id, title, type, logo } = data;
      [title, type, logo, "actions"].forEach((value, index) => {
        const cell = tr.insertCell();
        if (index === 2) {
          addLogo(cell, value, `${SKILL_TYPE}_${_id}`);
        } else if (index === 3) {
          addActions(cell, _id, SKILL_TYPE);
        } else {
          cell.textContent = value;
        }
      });
    }
  }
  await saveItem(event, configuration);
};

addValidationEventListener(SKILL_TYPE, "input:not(#logo), select:not(#logo)", validateForm);
document.getElementById("logo").addEventListener("change", (event) => displayFile(event, true, validateForm));
document.getElementById(`${SKILL_TYPE}Form`).addEventListener("submit", saveSkill);
addClosingEventListener(SKILL_TYPE);
addImageLinks();
