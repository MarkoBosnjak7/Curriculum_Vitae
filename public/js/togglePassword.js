const togglePassword = () => {
  const passwordInput = document.getElementById("password");
  const togglePasswordImageImg = document.getElementById("togglePasswordImage");
  const type = passwordInput.getAttribute("type");
  const isPassword = (type === "password");
  passwordInput.setAttribute("type", isPassword ? "text" : "password");
  togglePasswordImageImg.src = `../images/${isPassword ? "hide" : "show"}.png`;
};

document.getElementById("togglePassword").addEventListener("click", togglePassword);
