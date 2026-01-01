import { isTextValid, isFileValid, isMimeTypeValid, isArrayValid } from "../../utilities/validations.js";

export const displayFile = (event, isLogo, callback) => {
  const { target: { files } } = event;
  if (isArrayValid(files)) {
    const file = files[0];
    if (isFileValid(file)) {
      const { type: mimeType } = file;
      if (isMimeTypeValid(mimeType)) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const { name } = file;
          const { result } = fileReader;
          const previewImg = document.getElementById("preview");
          previewImg.src = result;
          previewImg.alt = name;
          previewImg.title = name;
          if (isLogo) {
            document.getElementById("logoName").textContent = name;
            document.querySelector(".logoLabel").classList.remove("placeholder");
            previewImg.style.display = "block";
          }
          if (typeof callback === "function") callback();
        };
        fileReader.readAsDataURL(file);
      }
    }
  }
};

export const getFileObject = () => {
  const previewImg = document.getElementById("preview");
  const { src, alt: name } = previewImg;
  const mimeType = isTextValid(src) ? src.match(/^data:(.*?);base64,/)[1] : "";
  return { name, mimeType, src };
};

export const deleteFile = () => {
  document.querySelector(".logoLabel").classList.add("placeholder");
  document.getElementById("logoName").textContent = "Select logo...";
  document.getElementById("logo").value = "";
  const previewImg = document.getElementById("preview");
  previewImg.style.display = "none";
  previewImg.removeAttribute("src");
  previewImg.removeAttribute("alt");
  previewImg.removeAttribute("title");
};
