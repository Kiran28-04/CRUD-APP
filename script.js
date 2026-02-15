const api = "http://localhost:3000";

/* REGISTER */
function register() {
  fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    if (msg === "Registration successful") {
      window.location.href = "index.html";
    }
  });
}

/* LOGIN */
function login() {
  fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.name);
      window.location.href = "index.html";
    } else {
      alert("Login failed");
    }
  });
}

/* FORGOT PASSWORD */
function sendResetLink() {
  fetch(`${api}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: resetEmail.value
    })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    window.location.href = "index.html";   // ✅ Redirect after sending link
  });
}

/* RESET PASSWORD */
function updatePassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  fetch(`${api}/update-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token,
      password: newPassword.value
    })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    window.location.href = "index.html";  // ✅ Redirect after reset
  });
}

/* LOGOUT */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
