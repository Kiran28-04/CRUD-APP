const api = "https://crud-app-5v1l.onrender.com";
let editId = null;

/* ================= LOADER ================= */

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

/* ================= PAGE INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      register();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      login();
    });
  }

  if (window.location.pathname.includes("crud.html")) {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
    } else {
      const username = localStorage.getItem("username");
      if (username) {
        document.getElementById("usernameDisplay").innerText = username;
      }
      loadBooks();
    }
  }
});

/* ================= REGISTER ================= */

async function register() {
  const name = getValue("name");
  const email = getValue("email");
  const password = getValue("password");

  if (!name || !email || !password) {
    return Swal.fire("Error", "All fields required", "error");
  }

  showLoader();

  try {
    const res = await fetch(`${api}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const text = await res.text();
    hideLoader();

    if (res.ok) {
      Swal.fire("Success", text, "success")
        .then(() => window.location.href = "login.html");
    } else {
      Swal.fire("Error", text, "error");
    }

  } catch {
    hideLoader();
    Swal.fire("Error", "Server error", "error");
  }
}

/* ================= LOGIN ================= */

async function login() {
  const email = getValue("loginEmail");
  const password = getValue("loginPassword");

  if (!email || !password) {
    return Swal.fire("Error", "All fields required", "error");
  }

  showLoader();

  try {
    const res = await fetch(`${api}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    hideLoader();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.name);

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        timer: 1200,
        showConfirmButton: false
      });

      setTimeout(() => {
        window.location.href = "crud.html";
      }, 1200);

    } else {
      Swal.fire("Error", data.message || "Invalid credentials", "error");
    }

  } catch {
    hideLoader();
    Swal.fire("Error", "Server error", "error");
  }
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= LOAD BOOKS ================= */

async function loadBooks() {
  showLoader();
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${api}/books`, {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    hideLoader();

    const table = document.getElementById("bookTable");
    table.innerHTML = "";

    data.forEach(book => {
      table.innerHTML += `
        <tr>
          <td>${book.bookName}</td>
          <td>${book.author}</td>
          <td>${book.genre}</td>
          <td>${book.price}</td>
          <td class="text-center">
            <button class="btn btn-warning btn-sm me-2"
              onclick="editBook('${book._id}','${book.bookName}','${book.author}','${book.genre}','${book.price}')">
              Edit
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="deleteBook('${book._id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

  } catch {
    hideLoader();
    Swal.fire("Error", "Unable to load books", "error");
  }
}

/* ================= ADD BOOK ================= */

async function addBook() {
  const token = localStorage.getItem("token");

  const bookName = getValue("bookName");
  const author = getValue("author");
  const genre = document.getElementById("genre").value;
  const price = getValue("price");

  if (!bookName || !author || !genre || !price) {
    return Swal.fire("Error", "All fields required", "error");
  }

  const data = { bookName, author, genre, price };

  showLoader();

  try {
    const res = await fetch(`${api}/books`, {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
    });

    hideLoader();
    clearForm();
    editId = null;

    Swal.fire("Success", "Saved successfully", "success");
    loadBooks();

  } catch {
    hideLoader();
    Swal.fire("Error", "Server error", "error");
  }
}

/* ================= DELETE ================= */

function deleteBook(id) {
  const token = localStorage.getItem("token");

  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true
  }).then(async result => {
    if (result.isConfirmed) {
      await fetch(`${api}/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      });

      Swal.fire("Deleted!", "", "success");
      loadBooks();
    }
  });
}

/* ===== FORGOT PASSWORD ===== */

function sendResetLink() {
  const email = getValue("resetEmail");

  if (!email) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please enter your email"
    });
    return;
  }

  fetch(`${api}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
  .then(async res => {
    const message = await res.text();

    if (!res.ok) {
      throw new Error(message);
    }

    return message;
  })
  .then(message => {
    Swal.fire({
      icon: "success",
      title: "Email Sent",
      text: message
    }).then(() => {
      window.location.href = "login.html";
    });
  })
  .catch(err => {
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: err.message || "Email sending failed"
    });
  });
}


/* ===== RESET PASSWORD ===== */

function updatePassword() {
  const newPassword = getValue("newPassword");

  if (!newPassword) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Enter new password"
    });
    return;
  }

  const token = new URLSearchParams(window.location.search).get("token");

  fetch(`${api}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  })
  .then(async res => {
    const message = await res.text();

    if (!res.ok) {
      throw new Error(message);
    }

    return message;
  })
  .then(message => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message
    }).then(() => {
      window.location.href = "login.html";
    });
  })
  .catch(err => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Invalid or expired link"
    });
  });
}

/* ================= HELPER ================= */

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function clearForm() {
  document.getElementById("bookName").value = "";
  document.getElementById("author").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("price").value = "";
}

