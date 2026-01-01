export const showToast = (message, status) => {
  document.querySelector(".toast").classList.add(status);
  document.getElementById("toastText").textContent = message;
  document.getElementById("toast").style.display = "block";
  setTimeout(hideToast, 5000);
};

export const hideToast = () => {
  const toastDiv = document.getElementById("toast");
  if (getComputedStyle(toastDiv).display === "block") {
    toastDiv.style.display = "none";
    document.querySelector(".toast").classList.remove("success", "error");
    document.getElementById("toastText").textContent = "";
  }
};

const toastHideSpan = document.getElementById("toastHide");
if (toastHideSpan) toastHideSpan.addEventListener("click", hideToast);
