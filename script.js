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
        Swal.fire({
          title: "Registered Successfully!",
          icon: "success",
          timer: 1200,
          showConfirmButton: false
        });

        setTimeout(() => {
          window.location.href = "login.html";
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

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${book.bookName}</td>
          <td>${book.author}</td>
          <td>${book.genre}</td>
          <td>${book.price}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2 edit-btn">
              ✏ Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn">
              🗑 Delete
            </button>
          </td>
        `;

        row.querySelector(".edit-btn").addEventListener("click", () => {
          editBook(book);
        });

        row.querySelector(".delete-btn").addEventListener("click", () => {
          deleteBook(book._id);
        });

        table.appendChild(row);
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
      .then(res => res.text())
      .then(() => {
        editId = null;
        clearForm();
        hideLoader();
        Swal.fire("Updated", "Book updated successfully", "success");
        loadBooks();
      })
      .catch(() => {
        hideLoader();
        Swal.fire("Error", "Update failed", "error");
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
      .then(res => res.text())
      .then(() => {
        clearForm();
        hideLoader();
        Swal.fire("Success", "Book added successfully", "success");
        loadBooks();
      })
      .catch(() => {
        hideLoader();
        Swal.fire("Error", "Add failed", "error");
      });
  }
}

/* ================= EDIT ================= */

function editBook(book) {
  editId = book._id;

  document.getElementById("bookName").value = book.bookName;
  document.getElementById("author").value = book.author;
  document.getElementById("genre").value = book.genre;
  document.getElementById("price").value = book.price;

  window.scrollTo({ top: 0, behavior: "smooth" });
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
