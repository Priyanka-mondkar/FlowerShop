const section = document.querySelector(".flowers-section");
const grid = document.getElementById("flowersGrid");

const searchInput = document.getElementById("flowerSearch");
const suggestionBox = document.getElementById("suggestions");
const searchBtn = document.getElementById("searchBtn");

let allFlowers = [];


/* ================================
   LOAD FLOWERS BY OCCASION
================================ */

window.filterFlowers = async function (occasionId) {

    section.style.display = "block";

    try {

        const res = await fetch(`http://localhost:5000/api/flowers/occasion/${occasionId}`);
        const flowers = await res.json();

        allFlowers = flowers;

        displayFlowers(flowers);

    } catch (err) {
        console.log("Flower Load Error:", err);
    }

    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* ================================
   DISPLAY FLOWERS
================================ */

function displayFlowers(flowers) {

    if (!grid) return;

    grid.innerHTML = "";

    if (flowers.length === 0) {
        grid.innerHTML = "<p>No flowers found</p>";
        return;
    }

    flowers.forEach(flower => {

        grid.innerHTML += `
        <div class="flower-card">

    <span class="wishlist"
        data-id="${flower.id}"
        data-name="${flower.name}"
        data-image="${flower.image}"
        data-price="${flower.price}"
        onclick="toggleWishlist(this)">♡</span>

    <img src="${flower.image}" alt="${flower.name}">

    <h3>${flower.name}</h3>

    <p class="price">₹${flower.price}</p>

    <button 
        data-id="${flower.id}"
        data-name="${flower.name}"
        data-image="${flower.image}"
        data-price="${flower.price}"
        data-description="${flower.description}"
        onclick="goToProduct(this)">
        Shop Now
    </button>

</div>
        `;

    });

}


/* ================================
   GO TO PRODUCT PAGE
================================ */

function goToProduct(button) {

    const product = {
        name: button.getAttribute("data-name"),
        price: button.getAttribute("data-price"),
        image: button.getAttribute("data-image"),
        description: button.getAttribute("data-description")
    };

    localStorage.setItem("selectedProduct", JSON.stringify(product));

    window.location.href = "product.html";

}


/* ================================
   SEARCH FLOWERS
================================ */

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        let value = searchInput.value.toLowerCase().trim();
        suggestionBox.innerHTML = "";

        if (value === "") {
            suggestionBox.style.display = "none";
            return;
        }

        const filtered = allFlowers.filter(flower =>
            flower.name.toLowerCase().includes(value)
        );

        filtered.forEach(flower => {

            let div = document.createElement("div");
            div.innerText = flower.name;

            div.onclick = function () {

                searchInput.value = flower.name;
                suggestionBox.style.display = "none";

                showFlower(flower.name);

            };

            suggestionBox.appendChild(div);

        });

        if (filtered.length === 0) {
            suggestionBox.style.display = "none";
        } else {
            suggestionBox.style.display = "block";
        }

    });
}


/* ================================
   SHOW SEARCH RESULT
================================ */

function showFlower(name) {

    const filtered = allFlowers.filter(flower =>
        flower.name.toLowerCase().includes(name.toLowerCase())
    );

    displayFlowers(filtered);

    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* ================================
   SEARCH BUTTON
================================ */

if (searchBtn) {

    searchBtn.addEventListener("click", function () {

        let value = searchInput.value.trim();

        if (value !== "") {
            showFlower(value);
            suggestionBox.style.display = "none";
        }

    });
}