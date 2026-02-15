const api = "http://localhost:3000";

/* Loader */
window.addEventListener("load", function() {
  const loader = document.getElementById("loader");
  if(loader) loader.style.display = "none";
});

/* Route Protection */
document.addEventListener("DOMContentLoaded", function() {
  const protectedPages = ["crud.html"];
  const currentPage = window.location.pathname.split("/").pop();
  const token = localStorage.getItem("token");

  if (protectedPages.includes(currentPage) && !token) {
    alert("Please login first");
    window.location.href = "login.html";
  }

  const registerLink = document.getElementById("registerLink");
  const loginLink = document.getElementById("loginLink");
  const profileSection = document.getElementById("profileSection");
  const usernameDisplay = document.getElementById("usernameDisplay");

  if(token){
    if(registerLink) registerLink.style.display = "none";
    if(loginLink) loginLink.style.display = "none";
    if(profileSection){
      profileSection.style.display = "block";
      usernameDisplay.innerText = localStorage.getItem("username");
    }
  }
});

/* Logout */
function logout(){
localStorage.clear();
window.location.href="index.html";
}
