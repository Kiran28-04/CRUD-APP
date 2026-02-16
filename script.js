const api = "https://crud-app-5v1l.onrender.com";

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
        window.location.href = "login.html";
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}

/* ================= LOGIN ================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

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
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
  });
}

/* ================= ADD BOOK ================= */

function addBook() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const bookName = document.getElementById("bookName").value.trim();
  const author = document.getElementById("author").value.trim();
  const genre = document.getElementById("genre").value;
  const price = document.getElementById("price").value.trim();

  if (!bookName || !author || !genre || !price) {
    alert("All fields are required");
    return;
  }

  fetch(`${api}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ bookName, author, genre, price })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadBooks();
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}

/* ================= LOAD BOOKS ================= */

function loadBooks() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${api}/books`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("bookList");
      if (!list) return;

      list.innerHTML = "";

      data.forEach(b => {
        list.innerHTML += `
        <tr>
          <td>${b.bookName}</td>
          <td>${b.author}</td>
          <td>${b.genre}</td>
          <td>${b.price}</td>
          <td>
            <button onclick="deleteBook('${b._id}')">Delete</button>
          </td>
        </tr>
        `;
      });
    })
    .catch(err => console.error(err));
}

/* ================= DELETE ================= */

function deleteBook(id) {
  const token = localStorage.getItem("token");

  fetch(`${api}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(() => loadBooks())
    .catch(err => console.error(err));
}

/* ================= AUTO LOAD ================= */

window.onload = function () {
  if (document.getElementById("bookList")) {
    loadBooks();
  }
};

