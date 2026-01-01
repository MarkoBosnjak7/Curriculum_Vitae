import { saveItem } from "./items.js";
import { addClosingEventListener } from "./dialog.js";
import { displayFile, getFileObject } from "./preview.js";
import { validateButton, addValidationEventListener, addLogo, addActions, addImageLinks } from "./scripts.js";
import { isTextValid, isLinkValid, isFileObjectValid, isPortfolioItemTypeValid } from "../../utilities/validations.js";
import { PORTFOLIO_ITEM_TYPE } from "../../utilities/types.js";

const validateForm = () => {
  const title = document.getElementById("title").value;
  const type = document.getElementById("type").value;
  const logo = getFileObject();
  const isValid = isTextValid(title) && isPortfolioItemTypeValid(type) && isFileObjectValid(logo);
  validateButton(PORTFOLIO_ITEM_TYPE, isValid);
};

const savePortfolioItem = async (event) => {
  const configuration = {
    type: PORTFOLIO_ITEM_TYPE,
    tableId: "portfolio",
    fieldIds: ["title", "link", "type", "logo"],
    validations: {
      title: isTextValid,
      type: isPortfolioItemTypeValid,
      logo: isFileObjectValid
    },
    renderTr: (tr, data) => {
      const { _id, title, link, type, logo } = data;
      [title, link, type, logo, "actions"].forEach((value, index) => {
        const cell = tr.insertCell();
        if (index === 1) {
          cell.innerHTML = isLinkValid(value) ? `<a href="${value}" target="_blank">${value}</a>` : "";
        } else if (index === 3) {
          addLogo(cell, value, `${PORTFOLIO_ITEM_TYPE}_${_id}`);
        } else if (index === 4) {
          addActions(cell, _id, PORTFOLIO_ITEM_TYPE);
        } else {
          cell.textContent = value;
        }
      });
    }
  }
  await saveItem(event, configuration);
};

addValidationEventListener(PORTFOLIO_ITEM_TYPE, "input:not(#logo), select:not(#logo)", validateForm);
document.getElementById("logo").addEventListener("change", (event) => displayFile(event, true, validateForm));
document.getElementById(`${PORTFOLIO_ITEM_TYPE}Form`).addEventListener("submit", savePortfolioItem);
addClosingEventListener(PORTFOLIO_ITEM_TYPE);
addImageLinks();
