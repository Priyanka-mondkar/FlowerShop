document.addEventListener("DOMContentLoaded", function(){

const popup = document.getElementById("popup");
const openBtn = document.getElementById("openPopup");
const closeBtn = document.getElementById("closePopup");
const submitBtn = document.getElementById("submitReview");
const reviewsList = document.getElementById("reviewsList");

let selectedRating = 0;

const starInputs = document.querySelectorAll(".stars-input i");


/* ================= LOAD REVIEWS FROM BACKEND ================= */

async function loadReviews(){

try{

const res = await fetch("http://localhost:5000/api/reviews");

const data = await res.json();

reviewsList.innerHTML = "";

data.forEach(review => {

let starsHTML = "";

for(let i=0;i<review.rating;i++){
starsHTML += `<i class="fa-solid fa-star"></i>`;
}

const card = document.createElement("div");

card.classList.add("review-card");

card.innerHTML = `

<div class="review-header">

<img src="${review.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}">

<h3>${review.name}</h3>

<i class="fa-solid fa-trash delete-review" data-id="${review.id}"></i>

</div>

<p>${review.message}</p>

<div class="stars">

${starsHTML}

</div>

`;

reviewsList.appendChild(card);

});

}catch(err){

console.error("Error loading reviews",err);

}

}


/* ================= STAR SELECTION ================= */

starInputs.forEach(star => {

star.addEventListener("click", function(){

selectedRating = this.getAttribute("data-value");

starInputs.forEach(s => {

s.classList.remove("fa-solid");

s.classList.add("fa-regular");

});

for(let i=0;i<selectedRating;i++){

starInputs[i].classList.remove("fa-regular");

starInputs[i].classList.add("fa-solid");

}

});

});


/* ================= OPEN POPUP ================= */

openBtn.addEventListener("click", function(){

popup.style.display = "flex";

});


/* ================= CLOSE POPUP ================= */

closeBtn.addEventListener("click", function(){

popup.style.display = "none";

});


/* ================= SUBMIT REVIEW ================= */

/* ================= SUBMIT REVIEW ================= */

submitBtn.addEventListener("click", async function(){

const message = document.getElementById("reviewText").value.trim();

const user = JSON.parse(localStorage.getItem("moonUser"));

if(!user){
alert("Please login first");
return;
}

if(message === "" || selectedRating == 0){
alert("Please write review and select rating!");
return;
}

try{

await fetch("http://localhost:5000/api/reviews",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({
    user_id: user.id,
    name: user.name,
    avatar: user.avatar,   // 🔥 ADD THIS
    message: message,
    rating: selectedRating
})

});

popup.style.display = "none";

document.getElementById("reviewText").value="";

selectedRating = 0;

starInputs.forEach(s=>{
s.classList.remove("fa-solid");
s.classList.add("fa-regular");
});

loadReviews();

}catch(err){

console.error("Error submitting review",err);

}

});


/* ================= DELETE REVIEW ================= */

reviewsList.addEventListener("click", async function(e){

if(e.target.classList.contains("delete-review")){

const id = e.target.getAttribute("data-id");

try{

await fetch(`http://localhost:5000/api/reviews/${id}`,{

method:"DELETE"

});

loadReviews();

}catch(err){

console.error("Delete error",err);

}

}

});


/* ================= LOAD REVIEWS WHEN PAGE LOADS ================= */

loadReviews();

});


/* ================= BACK BUTTON ================= */

function goBack(){

window.location.href="home.html";

}