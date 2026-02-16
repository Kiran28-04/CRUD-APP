const api = "https://crud-app-5v1l.onrender.com";

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
})
.then(res=>res.text())
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
})
.then(res=>res.json())
.then(data=>{
if(data.token){
localStorage.setItem("token",data.token);
window.location.href="crud.html";
}
});
}

/* ADD BOOK */
function addBook(){
fetch(`${api}/books`,{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+localStorage.getItem("token")
},
body:JSON.stringify({
bookName:bookName.value,
author:author.value,
genre:genre.value,
price:price.value
})
})
.then(res=>res.text())
.then(alert)
.then(loadBooks);
}

/* LOAD BOOKS */
function loadBooks(){
fetch(`${api}/books`,{
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})
.then(res=>res.json())
.then(data=>{
const list=document.getElementById("bookList");
list.innerHTML="";
data.forEach(b=>{
list.innerHTML+=`
<tr>
<td>${b.bookName}</td>
<td>${b.author}</td>
<td>${b.genre}</td>
<td>${b.price}</td>
<td><button onclick="deleteBook('${b._id}')">Delete</button></td>
</tr>
`;
});
});
}

/* DELETE */
function deleteBook(id){
fetch(`${api}/books/${id}`,{
method:"DELETE",
headers:{
"Authorization":"Bearer "+localStorage.getItem("token")
}
})
.then(loadBooks);
}

