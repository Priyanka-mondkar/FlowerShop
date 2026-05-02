// Wait until HTML loads
document.addEventListener("DOMContentLoaded", () => {

    const productGrid = document.getElementById("productGrid");

    async function loadFlowers() {

        try {

            const res = await fetch("http://localhost:5000/api/flowers");

            if (!res.ok) {
                throw new Error("Failed to fetch flowers");
            }

            const flowers = await res.json();

            console.log("Flowers:", flowers);

            productGrid.innerHTML = "";

            flowers.forEach(flower => {

                const card = document.createElement("div");
                card.classList.add("card");

                card.innerHTML = `
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
                `;

                productGrid.appendChild(card);

            });

        }
        catch (error) {
            console.error("Error loading flowers:", error);
        }

    }

    loadFlowers();

});



function goToProduct(button) {

    let product = {
        id: button.getAttribute("data-id"),   // ⭐ IMPORTANT
        name: button.getAttribute("data-name"),
        image: button.getAttribute("data-image"),
        price: button.getAttribute("data-price"),
        description: button.getAttribute("data-description")
    };

    localStorage.setItem("selectedProduct", JSON.stringify(product));

    window.location.href = "product.html";
}

// Wait until HTML loads
// document.addEventListener("DOMContentLoaded", () => {

//     const productGrid = document.getElementById("productGrid");

//     async function loadFlowers() {

//         try {

//             const res = await fetch("http://localhost:5000/api/flowers");

//             if (!res.ok) {
//                 throw new Error("Failed to fetch flowers");
//             }

//             const flowers = await res.json();

//             productGrid.innerHTML = "";

//             flowers.forEach(flower => {

//                 const card = document.createElement("div");
//                 card.classList.add("card");

//                 card.innerHTML = `
//                     <span class="wishlist"
//                         data-id="${flower.id}"
//                         data-name="${flower.name}"
//                         data-image="${flower.image}"
//                         data-price="${flower.price}"
//                         onclick="toggleWishlist(this)">♡</span>

//                     <img src="../${flower.image}" alt="${flower.name}">

//                     <h3>${flower.name}</h3>

//                     <p class="price">₹${flower.price}</p>

//                     <button
//                         data-id="${flower.id}"
//                         data-name="${flower.name}"
//                         data-image="${flower.image}"
//                         data-price="${flower.price}"
//                         onclick="goToProduct(this)">
//                         Shop Now
//                     </button>
//                 `;

//                 productGrid.appendChild(card);

//             });

//         }
//         catch (error) {
//             console.error("Error loading flowers:", error);
//         }

//     }

//     loadFlowers();

// });


// // 🔥 FIXED FUNCTION
// function goToProduct(button) {

//     let product = {
//         id: button.getAttribute("data-id"),
//         name: button.getAttribute("data-name"),
//         image: button.getAttribute("data-image"),
//         price: button.getAttribute("data-price"),
//         quantity: 1 // 🔥 IMPORTANT
//     };

//     // 🔥 KEY CHANGE
//     localStorage.setItem("checkoutProduct", JSON.stringify(product));

//     // 🔥 DIRECT CHECKOUT
//     window.location.href = "product.html";
// }