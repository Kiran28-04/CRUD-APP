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

  // Protect crud page
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

function register() {
  const name = getValue("name");
  const email = getValue("email");
  const password = getValue("password");

  if (!name || !email || !password) {
    Swal.fire("Error", "All fields are required", "error");
    return;
  }

  showLoader();

  fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.text())
    .then(msg => {
      hideLoader();

      if (msg === "Registration successful") {

        // Auto login after register
        localStorage.setItem("username", name);

        Swal.fire({
          title: "Registered Successfully!",
          icon: "success",
          timer: 1200,
          showConfirmButton: false
        });

        setTimeout(() => {
          window.location.href = "crud.html";
        }, 1200);

      } else {
        Swal.fire("Error", msg, "error");
      }
    })
    .catch(() => {
      hideLoader();
      Swal.fire("Error", "Server error", "error");
    });
}

/* ================= LOGIN ================= */

function login() {
  const email = getValue("loginEmail");
  const password = getValue("loginPassword");

  if (!email || !password) {
    Swal.fire("Error", "All fields required", "error");
    return;
  }

  showLoader();

  fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      hideLoader();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);

        Swal.fire({
          title: "Welcome!",
          icon: "success",
          timer: 1200,
          showConfirmButton: false
        });

        setTimeout(() => {
          window.location.href = "crud.html";
        }, 1200);

      } else {
        Swal.fire("Error", "Invalid login credentials", "error");
      }
    })
    .catch(() => {
      hideLoader();
      Swal.fire("Error", "Server error", "error");
    });
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= LOAD BOOKS ================= */

function loadBooks() {
  showLoader();
  const token = localStorage.getItem("token");

  fetch(`${api}/books`, {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      hideLoader();

      const table = document.getElementById("bookTable");
      if (!table) return;

      table.innerHTML = "";

      data.forEach(book => {
        table.innerHTML += `
          <tr>
            <td>${book.bookName}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.price}</td>
            <td class="text-center">
              <button class="btn btn-sm edit-btn me-2"
                onclick="editBook('${book._id}','${book.bookName}','${book.author}','${book.genre}','${book.price}')">
                ✏ Edit
              </button>
              <button class="btn btn-sm delete-btn"
                onclick="deleteBook('${book._id}')">
                🗑 Delete
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      hideLoader();
      Swal.fire("Error", "Unable to load books", "error");
    });
}

/* ================= ADD / UPDATE ================= */

function addBook() {
  const token = localStorage.getItem("token");

  const bookName = getValue("bookName");
  const author = getValue("author");
  const genre = document.getElementById("genre").value;
  const price = getValue("price");

  if (!bookName || !author || !genre || !price) {
    Swal.fire("Error", "All fields required", "error");
    return;
  }

  const data = { bookName, author, genre, price };

  showLoader();

  if (editId) {
    fetch(`${api}/books/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
    })
      .then(() => {
        editId = null;
        clearForm();
        hideLoader();
        Swal.fire("Updated", "Book updated successfully", "success");
        loadBooks();
      });

  } else {

    fetch(`${api}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
    })
      .then(() => {
        clearForm();
        hideLoader();
        Swal.fire("Success", "Book added successfully", "success");
        loadBooks();
      });
  }
}

/* ================= EDIT ================= */

function editBook(id, name, auth, gen, pr) {
  editId = id;

  document.getElementById("bookName").value = name;
  document.getElementById("author").value = auth;
  document.getElementById("genre").value = gen;
  document.getElementById("price").value = pr;
}

/* ================= DELETE ================= */

function deleteBook(id) {
  const token = localStorage.getItem("token");

  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`${api}/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      })
        .then(() => {
          Swal.fire("Deleted!", "Book removed", "success");
          loadBooks();
        });
    }
  });
}

/* ================= CLEAR FORM ================= */

function clearForm() {
  document.getElementById("bookName").value = "";
  document.getElementById("author").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("price").value = "";
}

/* ================= HELPER ================= */

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}


function forgotPassword() {
  const email = getValue("forgotEmail");

  if (!email) {
    Swal.fire("Error", "Enter your email", "error");
    return;
  }

  showLoader();

  fetch(`${api}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.text())
    .then(msg => {
      hideLoader();

      Swal.fire({
        title: "Success",
        text: msg,
        icon: "success"
      }).then(() => {
        window.location.href = "login.html";   // 🔥 Redirect after message
      });
    })
    .catch(() => {
      hideLoader();
      Swal.fire("Error", "Server error", "error");
    });
}



function resetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const password = getValue("newPassword");

  if (!password) {
    Swal.fire("Error", "Enter new password", "error");
    return;
  }

  showLoader();

  fetch(`${api}/reset-password/${token}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ password })
  })
  .then(res => res.text())
  .then(msg => {
    hideLoader();
    Swal.fire("Success", msg, "success").then(() => {
      window.location.href = "login.html";
    });
  })
  .catch(() => {
    hideLoader();
    Swal.fire("Error", "Server error", "error");
  });
}

