const API = "http://localhost:5000/api";

// ================= GET USER =================
function getUser() {
    return JSON.parse(localStorage.getItem("moonUser"));
}


// ================= LOAD WISHLIST COUNT =================
async function loadWishlistCount() {

    const user = getUser();
    if (!user) return;

    try {

        const res = await fetch(`${API}/wishlist/${user.id}`);
        const data = await res.json();

        const count = document.getElementById("wishlist-count");

        if (count) {
            count.innerText = data.length;
        }

    }
    catch (err) {
        console.log("Wishlist count error:", err);
    }

}


// ================= TOGGLE WISHLIST =================
async function toggleWishlist(button) {

    const user = getUser();

    if (!user) {
        alert("Please login first");
        return;
    }

    const flowerId = button.dataset.id;

    try {

        const res = await fetch(`${API}/wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                flower_id: flowerId
            })
        });

        const data = await res.json();

        button.innerText = "♥";
        button.classList.add("active");

        loadWishlistCount();

        console.log(data);

    }
    catch (err) {
        console.log(err);
        alert("Error adding to wishlist");
    }

}


// ================= LOAD WISHLIST PAGE =================
async function loadWishlist() {

    const container = document.getElementById("wishlist-container");

    if (!container) return;

    const user = getUser();
    if (!user) return;

    try {

        const res = await fetch(`${API}/wishlist/${user.id}`);
        const items = await res.json();

        container.innerHTML = "";

        if (items.length === 0) {

            container.innerHTML =
                "<p style='grid-column:1/-1;text-align:center;font-size:18px;'>No items in wishlist ❤️</p>";

            return;
        }

        items.forEach(item => {

            container.innerHTML += `
            
            <div class="card">

                <span class="wishlist active"
                onclick="removeWishlist(${item.id})">♥</span>

                <img src="${item.image}">

                <h3>${item.name}</h3>

                <p class="price">₹${item.price}</p>

                <button onclick="goToProduct(this)"
                data-id="${item.id}"
                data-name="${item.name}"
                data-image="${item.image}"
                data-price="${item.price}"
                data-description="Beautiful fresh flowers bouquet">
                Shop Now
                </button>

            </div>

            `;
        });

    }
    catch (err) {

        console.log("Wishlist load error:", err);

    }

}


// ================= REMOVE ITEM =================
async function removeWishlist(id) {

    try {

        await fetch(`${API}/wishlist/${id}`, {
            method: "DELETE"
        });

        loadWishlist();
        loadWishlistCount();

    }
    catch (err) {
        console.log("Remove wishlist error:", err);
    }

}


// ================= PRODUCT PAGE =================
function goToProduct(button) {

    let product = {

        id: button.getAttribute("data-id"),
        name: button.getAttribute("data-name"),
        image: button.getAttribute("data-image"),
        price: button.getAttribute("data-price"),
        description: button.getAttribute("data-description")

    };

    localStorage.setItem("selectedProduct", JSON.stringify(product));

    window.location.href = "product.html";

}


// ================= MAIN =================
document.addEventListener("DOMContentLoaded", function () {

    loadWishlistCount();
    loadWishlist();

});












let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}

// Export functions
window.wishlist = wishlist;
window.updateWishlistCount = updateWishlistCount;