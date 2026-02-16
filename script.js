const api = "https://crud-app-5v1l.onrender.com";
let editId = null;

/* ================= AUTH CHECK ================= */

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (window.location.pathname.includes("crud.html")) {
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    document.getElementById("usernameDisplay").innerText =
      "Welcome";

    loadBooks();
  }
});

/* ================= REGISTER ================= */

function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      if (msg === "Registration successful") {
        window.location.href = "crud.html";
      }
    })
    .catch(() => alert("Server error"));
}

/* ================= LOGIN ================= */

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("All fields are required");
    return;
  }

  fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "crud.html";
      } else {
        alert("Invalid login credentials");
      }
    })
    .catch(() => alert("Server error"));
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ================= LOAD BOOKS ================= */

function loadBooks() {
  const token = localStorage.getItem("token");

  fetch(`${api}/books`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("bookTable");
      table.innerHTML = "";

      data.forEach(book => {
        table.innerHTML += `
          <tr>
            <td>${book.bookName}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.price}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editBook('${book._id}','${book.bookName}','${book.author}','${book.genre}','${book.price}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteBook('${book._id}')">Delete</button>
            </td>
          </tr>`;
      });
    });
}

/* ================= ADD / UPDATE BOOK ================= */

function addBook() {
  const token = localStorage.getItem("token");

  const bookName = document.getElementById("bookName").value;
  const author = document.getElementById("author").value;
  const genre = document.getElementById("genre").value;
  const price = document.getElementById("price").value;

  if (!bookName || !author || !genre || !price) {
    alert("All fields required");
    return;
  }

  const data = { bookName, author, genre, price };

  if (editId) {
    fetch(`${api}/books/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
    }).then(() => {
      editId = null;
      document.getElementById("bookBtn").innerText = "Add Book";
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
    }).then(() => loadBooks());
  }
}

/* ================= EDIT ================= */

function editBook(id, name, auth, gen, pr) {
  editId = id;

  document.getElementById("bookName").value = name;
  document.getElementById("author").value = auth;
  document.getElementById("genre").value = gen;
  document.getElementById("price").value = pr;

  document.getElementById("bookBtn").innerText = "Update Book";
}

/* ================= DELETE ================= */

function deleteBook(id) {
  const token = localStorage.getItem("token");

  fetch(`${api}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(() => loadBooks());
}
