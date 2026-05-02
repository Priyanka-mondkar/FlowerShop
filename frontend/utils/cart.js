// ================= UPDATE CART COUNT =================
async function updateCartCount() {

    let count = document.getElementById("cartCount");
    if (!count) return;

    const user = JSON.parse(localStorage.getItem("moonUser"));

    if (!user) {
        count.innerText = 0;
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/cart/${user.id}`);
        const cart = await res.json();

        count.innerText = cart.length;

    } catch (error) {
        console.log("Cart count error:", error);
        count.innerText = 0;
    }
}


// ================= ADD TO CART (BACKEND) =================
async function addToCart(product) {

    const user = JSON.parse(localStorage.getItem("moonUser"));

    if (!user) {
        alert("Please login first");
        return;
    }

    let qtyInput = document.getElementById("qty");
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;

    try {

        await fetch("http://localhost:5000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: qty,
                flower_id: product.id,
            })
        });

        updateCartCount();
        alert("Product added to cart 🛒");

    } catch (error) {
        console.log("Add to cart error:", error);
    }
}


// ================= DISPLAY CART =================
async function displayCart() {

    let container = document.getElementById("cart-container");
    let grandTotalEl = document.getElementById("grand-total");

    if (!container) return;

    const user = JSON.parse(localStorage.getItem("moonUser"));

    if (!user) {
        container.innerHTML = `
        <tr>
            <td colspan="5">Please login first</td>
        </tr>`;
        return;
    }

    try {

        const res = await fetch(`http://localhost:5000/api/cart/${user.id}`);
        const cart = await res.json();

        container.innerHTML = "";
        let grandTotal = 0;

        if (cart.length === 0) {
            container.innerHTML = `
            <tr>
                <td colspan="5">Your cart is empty 🛒</td>
            </tr>`;

            if (grandTotalEl) grandTotalEl.innerText = 0;
            return;
        }

        cart.forEach((item) => {

            let itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;

            container.innerHTML += `
            <tr>
                <td class="product-cell">
                    <img src="${item.image}">
                    <span class="product-name">${item.name}</span>
                </td>

                <td>₹${item.price}</td>

                <td>
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                    ${item.quantity}
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                </td>

                <td>₹${itemTotal}</td>

                <td>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </td>
            </tr>
            `;
        });

        if (grandTotalEl) {
            grandTotalEl.innerText = grandTotal;
        }

    } catch (error) {

        console.log("Cart load error:", error);

        container.innerHTML = `
        <tr>
            <td colspan="5">Error loading cart</td>
        </tr>`;
    }
}


// ================= CHANGE QUANTITY =================
async function changeQty(cartId, change) {

    try {

        await fetch(`http://localhost:5000/api/cart/update/${cartId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ change: change })
        });

        displayCart();
        updateCartCount();

    } catch (error) {
        console.log("Quantity update error:", error);
    }
}


// ================= REMOVE FROM CART =================
async function removeFromCart(cartId) {

    try {

        await fetch(`http://localhost:5000/api/cart/${cartId}`, {
            method: "DELETE"
        });

        displayCart();
        updateCartCount();

    } catch (error) {
        console.log("Remove error:", error);
    }
}


// ================= GO TO CART PAGE =================
function toggleCart() {
    window.location.href = "cart.html";
}


// ================= PROCEED TO CHECKOUT =================
// async function goToCheckout() {

//     const user = JSON.parse(localStorage.getItem("moonUser"));

//     if (!user) {
//         alert("Please login first");
//         return;
//     }

//     try {

//         const res = await fetch(`http://localhost:5000/api/cart/${user.id}`);
//         const cart = await res.json();

//         if (cart.length === 0) {
//             alert("Cart is empty 🛒");
//             return;
//         }

//         localStorage.setItem("checkoutCart", JSON.stringify(cart));

//         window.location.href = "checkout.html";

//     } catch (error) {
//         console.log("Checkout error:", error);
//         alert("Something went wrong");
//     }
// }
async function goToCheckout() {

    const user = JSON.parse(localStorage.getItem("moonUser"));

    if (!user) {
        alert("Please login first");
        return;
    }

    try {

        const res = await fetch(`http://localhost:5000/api/cart/${user.id}`);
        const cart = await res.json();

        if (cart.length === 0) {
            alert("Cart is empty 🛒");
            return;
        }

        // ✅ IMPORTANT: format data clean for checkout
        const formattedCart = cart.map(item => ({
            id: item.flower_id || item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity
        }));

        localStorage.setItem("checkoutCart", JSON.stringify(formattedCart));

        // 👉 remove single product (avoid conflict)
        localStorage.removeItem("checkoutProduct");

        window.location.href = "checkout.html";

    } catch (error) {
        console.log("Checkout error:", error);
        alert("Something went wrong");
    }
}


// ================= LOAD =================
document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    displayCart();
});