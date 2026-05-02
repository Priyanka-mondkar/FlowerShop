// 

// ================= LOAD PRODUCT =================
let product = JSON.parse(localStorage.getItem("checkoutProduct"));
let cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];

let qty = product?.quantity || 1;

// ================= CHECK MODE =================
let isCart = cart.length > 0 && !product;

// ================= SAFETY =================
if (!product && cart.length === 0) {
  alert("No product found!");
  window.location.href = "flower.html";
}

// ================= UPDATE UI (BUY NOW) =================
function updateUI() {

  if (!product) return;

  document.getElementById("summaryImage").src = product.image;
  document.getElementById("summaryName").innerText = product.name;
  document.getElementById("summaryPrice").innerText = product.price;
  document.getElementById("summaryQty").innerText = qty;

  document.getElementById("summaryTotal").innerText = product.price * qty;
}

updateUI();

// ================= CART RENDER =================
// function renderCartItems() {

//   if (!isCart) return;

//   document.querySelector(".product-section").style.display = "none";

//   let container = document.getElementById("cartProducts");
//   container.innerHTML = "";

//   let total = 0;

//   cart.forEach((item, index) => {

//     let itemTotal = item.price * item.quantity;
//     total += itemTotal;

//     container.innerHTML += `
//       <div class="cart-item">
//         <img src="${item.image}">
//         <div class="cart-info">
//           <h4>${item.name}</h4>
//           <p>₹${item.price}</p>

//           <div class="qty-box">
//             <button onclick="changeCartQty(${index}, -1)">−</button>
//             <span>${item.quantity}</span>
//             <button onclick="changeCartQty(${index}, 1)">+</button>
//           </div>

//           <p>Total : ₹${itemTotal}</p>
//         </div>
//       </div>
//     `;
//   });

//   container.innerHTML += `
//     <div class="cart-total">
//       Grand Total: ₹${total}
//     </div>
//   `;
// }
function renderCartItems() {

  if (!isCart) return;

  document.querySelector(".product-section").style.display = "none";

  let container = document.getElementById("cartProducts");

  // ✅ Back button always visible
  container.innerHTML = `
  <button class="back-btn cart-back-btn" onclick="goBack()">← Back</button>
`;

  let total = 0;

  cart.forEach((item, index) => {

    let itemTotal = item.price * item.quantity;
    total += itemTotal;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>

          <div class="qty-box">
            <button onclick="changeCartQty(${index}, -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeCartQty(${index}, 1)">+</button>
          </div>

          <p>Total : ₹${itemTotal}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML += `
    <div class="cart-total">
      Grand Total: ₹${total}
    </div>
  `;
}

renderCartItems();

// ================= CART QTY =================
function changeCartQty(index, change) {
  let q = cart[index].quantity + change;
  if (q < 1) return;

  cart[index].quantity = q;
  renderCartItems();
}

// ================= QTY FUNCTIONS (BUY NOW) =================
function increaseQty() {
  qty++;
  updateUI();
}

function decreaseQty() {
  if (qty > 1) {
    qty--;
    updateUI();
  }
}

// ================= BACK =================
function goBack() {
  window.location.href = "product.html";
}

// ================= PAYMENT =================
function selectPayment(type) {

  let buttons = document.querySelectorAll(".pay-option");
  buttons.forEach(btn => btn.classList.remove("active"));

  let card = document.getElementById("cardDetails");
  let upi = document.getElementById("upiDetails");

  card.style.display = "none";
  upi.style.display = "none";

  if (type === "card") {
    buttons[0].classList.add("active");
    card.style.display = "block";
  }
  else if (type === "upi") {
    buttons[1].classList.add("active");
    upi.style.display = "block";

    // 🔥 CALCULATE TOTAL AMOUNT
    let totalAmount = 0;

    if (!isCart) {
      totalAmount = product.price * qty;
    } else {
      cart.forEach(item => {
        totalAmount += item.price * item.quantity;
      });
    }

    // 🔥 GENERATE QR
    generateUPIQR(totalAmount);
  }
  else {
    buttons[2].classList.add("active");
  }
}

// ================= LOAD USER =================
async function loadUserFromBackend() {

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      const user = data.user;

      document.querySelector("input[placeholder='Full Name']").value = user.name || "";
      document.querySelector("input[placeholder='Phone Number']").value = user.phone || "";
      document.querySelector("input[placeholder='Address']").value =
        `${user.flat || ""} ${user.area || ""}`;
      document.querySelector("input[placeholder='City']").value = user.city || "";
      document.querySelector("input[placeholder='State']").value = user.state || "";
      document.querySelector("input[placeholder='Zip Code']").value = user.pincode || "";
    }

  } catch (err) {
    console.log(err);
  }
}

loadUserFromBackend();

// ================= PLACE ORDER =================
async function placeOrder() {

  let user = JSON.parse(localStorage.getItem("moonUser"));
  const token = localStorage.getItem("token");

  let fullName = document.querySelector("input[placeholder='Full Name']").value;
  let phone = document.querySelector("input[placeholder='Phone Number']").value;
  let address = document.querySelector("input[placeholder='Address']").value;
  let city = document.querySelector("input[placeholder='City']").value;
  let state = document.querySelector("input[placeholder='State']").value;
  let zip = document.querySelector("input[placeholder='Zip Code']").value;

  let activeBtn = document.querySelector(".pay-option.active");

  if (!activeBtn) return alert("Select payment method");

  let paymentMethod = activeBtn.innerText.trim();

  if (!fullName || !phone || !address || !city || !state || !zip) {
    return alert("Fill all details");
  }

  let products = [];
  let totalAmount = 0;

  // BUY NOW
  if (!isCart) {

    products.push({
      flower_id: product.id,
      quantity: qty,
      price: product.price,
      name: product.name,
    });

    totalAmount = product.price * qty;
  }

  // CART
  else {

    cart.forEach(item => {
      products.push({
        flower_id: item.id,
        quantity: item.quantity,
        price: item.price
      });

      totalAmount += item.price * item.quantity;
    });
  }

  let orderData = {
    user_id: user?.id,
    full_name: fullName,
    email: user?.email,
    phone,
    address,
    city,
    state,
    zip_code: zip,
    payment_method: paymentMethod,
    total_amount: totalAmount,
    products
  };

  try {

    await fetch("http://localhost:5000/api/orders/place-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    localStorage.removeItem("checkoutProduct");
    localStorage.removeItem("checkoutCart");

    window.location.href = "../components/success.html";

  } catch (err) {
    console.log(err);
  }
}
function generateUPIQR(totalAmount) {

  const upiString = `upi://pay?pa=priyanka@upi&pn=MoonFlowers&am=${totalAmount}&cu=INR`;

  document.getElementById("qrcode").innerHTML = "";

  new QRCode(document.getElementById("qrcode"), {
    text: upiString,
    width: 200,
    height: 200
  });
}