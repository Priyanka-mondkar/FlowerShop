
// occasion
 function filterFlowers(category){

    let flowers = document.querySelectorAll(".flower-card");

    flowers.forEach(flower => {
        flower.style.display = "none";
    });

    let selected = document.querySelectorAll("." + category);

    selected.forEach(item => {
        item.style.display = "block";
    });

}
function filterFlowers(category) {

    const allFlowers = document.querySelectorAll(".flower-card");
    const heading = document.querySelector(".flowers-section h2");

    // Hide all flowers
    allFlowers.forEach(function(card) {
        card.style.display = "none";
    });

    // Show selected category flowers
    const selectedFlowers = document.querySelectorAll("." + category);

    selectedFlowers.forEach(function(card) {
        card.style.display = "block";
    });

    // Change heading
    const formattedName =
        category.charAt(0).toUpperCase() + category.slice(1);

    heading.innerText = formattedName + " Flowers";

    // Scroll to flower section
    document.querySelector(".flowers-section")
        .scrollIntoView({ behavior: "smooth" });
}


// product detail
function goToProduct(){
    window.location.href="product.html";
}
document.querySelectorAll(".wishlist").forEach(icon => {
icon.addEventListener("click", function() {
this.classList.toggle("active");
this.innerHTML = this.classList.contains("active") ? "❤" : "♡";
});
});

// add to cart product
// function addToCart(){
//     alert("Product Added To Cart 🌸");
//     window.location.href="cart.html";
// }

// function buyNow(){
//     window.location.href="checkout.html";
// }
// function addToCart(){
//     let qty = document.getElementById("qty").value;
//     alert(qty + " item(s) added to cart 🌸");
//     window.location.href="cart.html";
// }

// function buyNow(){
//     window.location.href="checkout.html";
// }

// function goProduct(){
//     window.location.href="product.html";
// }



// cart.js

let cart = [];

/* ADD TO CART */
function addToCart(){

    const name = document.querySelector(".details-section h1").innerText;
    const priceText = document.querySelector(".price").innerText;
    const qty = parseInt(document.getElementById("qty").value);

    const price = parseInt(priceText.replace("₹",""));

    const existingProduct = cart.find(item => item.name === name);

    if(existingProduct){
        existingProduct.qty += qty;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: qty
        });
    }

    updateCartUI();
}


/* UPDATE CART UI */
function updateCartUI(){

    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item,index) => {

        total += item.price * item.qty;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    ₹${item.price} x ${item.qty}
                </div>
                <div>
                    ₹${item.price * item.qty}
                    <br>
                    <button onclick="removeItem(${index})" class="remove-btn">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });

    cartCount.innerText = cart.length;
    cartTotal.innerText = total;
}


/* REMOVE ITEM */
function removeItem(index){
    cart.splice(index,1);
    updateCartUI();
}


/* TOGGLE SIDEBAR */
function toggleCart(){
    document.getElementById("cartSidebar").classList.toggle("active");
}


/* BUY NOW */
function buyNow(){
    addToCart();
    toggleCart();
}


/* CHECKOUT */
function checkout(){
    alert("Proceeding to Checkout 💖");
}
