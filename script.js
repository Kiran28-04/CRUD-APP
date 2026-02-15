const api="http://localhost:3000";

/* REGISTER */
function register(){
fetch(`${api}/register`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name:name.value,
email:email.value,
password:password.value
})
}).then(res=>res.text())
.then(msg=>{
alert(msg);
if(msg==="Registration successful")
window.location.href="index.html";
});
}

/* LOGIN */
function login(){
fetch(`${api}/login`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:loginEmail.value,
password:loginPassword.value
})
}).then(res=>res.json())
.then(data=>{
if(data.token){
localStorage.setItem("token",data.token);
localStorage.setItem("username",data.name);
window.location.href="index.html";
}
});
}

/* LOGOUT */
function logout(){
localStorage.clear();
window.location.href="index.html";
}

/* Header Control */
document.addEventListener("DOMContentLoaded",()=>{
const token=localStorage.getItem("token");

const registerLink=document.getElementById("registerLink");
const loginLink=document.getElementById("loginLink");
const manageLink=document.getElementById("manageLink");
const logoutLink=document.getElementById("logoutLink");

if(token){
if(registerLink) registerLink.style.display="none";
if(loginLink) loginLink.style.display="none";
if(manageLink) manageLink.style.display="inline";
if(logoutLink) logoutLink.style.display="inline";
}
});
