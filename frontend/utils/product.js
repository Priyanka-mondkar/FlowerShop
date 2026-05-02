document.addEventListener("DOMContentLoaded", function () {

    let product = JSON.parse(localStorage.getItem("selectedProduct"));

    if (!product) {
        console.log("No product found");
        return;
    }

    // ================= SHOW PRODUCT DETAILS =================
    // document.getElementById("productImage").src = "../" + product.image;
    document.getElementById("productImage").src = product.image;
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = "₹" + product.price;
    document.getElementById("productDesc").innerText = product.description;


    // ================= LOGIN CHECK =================
    function checkLogin() {

        const user = JSON.parse(localStorage.getItem("moonUser"));

        if (!user) {
            alert("Please login first ❤️");
            window.location.href = "home.html";
            return null;
        }

        return user.id;
    }


    // ================= ADD TO CART =================
    document.getElementById("addCartBtn").addEventListener("click", async function () {

        const userId = checkLogin();
        if (!userId) return;

        let qty = parseInt(document.getElementById("qty").value);

        try {

            const res = await fetch("http://localhost:5000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    flower_id: product.id,
                    quantity: qty
                })
            });

            const data = await res.json();

            console.log(data);

            alert("Item Added To Cart 🛒");

            window.location.href = "cart.html";

        } catch (error) {

            console.log(error);
            alert("Error adding to cart");

        }

    });


    // ================= BUY NOW =================
    document.getElementById("buyNowBtn").addEventListener("click", function () {

        const productData = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: parseInt(document.getElementById("qty").value)
        };

        localStorage.setItem("checkoutProduct", JSON.stringify(productData));

        window.location.href = "checkout.html";

    });

});


// ================= GO TO PRODUCT =================
function goToProduct(button){

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



// ================= LOAD SUGGESTED FLOWERS =================
async function loadSuggestions(){

    try{

        const res = await fetch("http://localhost:5000/api/flowers");
        const flowers = await res.json();

        const grid = document.getElementById("suggestionGrid");

        grid.innerHTML = "";

        flowers.slice(0,6).forEach(flower => {

            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `

                <span class="wishlist"
                    data-id="${flower.id}"
                    onclick="toggleWishlist(this)">♡</span>

                <img src="${flower.image}" alt="${flower.name}">

                <h4>${flower.name}</h4>

                <p>₹${flower.price}</p>

                <button
                    data-id="${flower.id}"
                    data-name="${flower.name}"
                    data-image="${flower.image}"
                    data-price="${flower.price}"
                    data-description="${flower.description}"
                    onclick="goToProduct(this)">
                    Shop Now
                </button>

            `;

            grid.appendChild(card);

        });

    }
    catch(error){
        console.log("Suggestion error:", error);
    }

}

loadSuggestions();
/* ================= BACK BUTTON ================= */

function goBack(){

window.location.href="flower.html";

}