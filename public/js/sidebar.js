const toggleSidebar = () => {
  const sidebarAside = document.getElementById("sidebar");
  sidebarAside.classList.toggle("isActive");
  const toggleSidebarDiv = document.getElementById("toggleSidebar");
  toggleSidebarDiv.classList.toggle("isActive");
};

const displayGreeting = () => {
  const hour = new Date().getHours();
  let greeting;
  if ((hour >= 5) && (hour < 12)) {
    greeting = "Good morning";
  } else if ((hour >= 12) && (hour < 17)) {
    greeting = "Good afternoon";
  } else if ((hour >= 17) && (hour < 21)) {
    greeting = "Good evening";
  } else {
    greeting = "Good night";
  }
  const sidebarGreetingDiv = document.getElementById("sidebarGreeting");
  sidebarGreetingDiv.textContent = `${greeting}, ${sidebarGreetingDiv.textContent}!`;
};

document.getElementById("toggleSidebar").addEventListener("click", toggleSidebar);
displayGreeting();
