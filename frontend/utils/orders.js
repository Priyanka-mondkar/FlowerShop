/* ================= BACK BUTTON ================= */
function goBack() {
    window.location.href = "home.html";
}

/* ================= LOAD ORDERS ================= */
async function loadOrders() {

    const container = document.getElementById("ordersList");
    const user = JSON.parse(localStorage.getItem("moonUser"));

    if (!user) {
        container.innerHTML = "<p>Please login first</p>";
        return;
    }

    try {

        const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
        const orders = await res.json();

        container.innerHTML = "";

        // 🔥 FILTER: Cancelled orders remove
        const activeOrders = orders.filter(order => order.order_status !== "Cancelled");

        if (activeOrders.length === 0) {
            container.innerHTML = "<p>No active orders 😢</p>";
            return;
        }

        activeOrders.forEach(order => {

            container.innerHTML += `
            <div class="order-card">

                <div class="order-header">
                    <span>Order ID: ${order.order_id}</span>
                    <span>₹${order.total_amount}</span>
                </div>

                <div class="product">
                    <img src="${order.image}">
                    
                    <div>
                        <p><b>${order.product_name}</b></p>
                        <p>Qty: ${order.quantity}</p>
                        <p>Price: ₹${order.price}</p>
                    </div>
                </div>

                <div class="status">
                    ${order.order_status === "Paid"
                    ? "✔ Paid"
                    : "📦 Placed"
                }
                </div>

                ${order.order_status !== "Paid"
                    ? `<button class="cancel-btn" onclick="cancelOrder(${order.order_id})">Cancel Order</button>`
                    : ""
                }

            </div>
            `;
        });

    } catch (error) {
        console.log("Order load error:", error);
        container.innerHTML = "<p>Error loading orders</p>";
    }
}

/* ================= CANCEL ORDER ================= */
async function cancelOrder(orderId) {

    const confirmCancel = confirm("Are you sure you want to cancel this order?");

    if (!confirmCancel) return;

    try {

        const res = await fetch(`http://localhost:5000/api/orders/cancel/${orderId}`, {
            method: "PUT"
        });

        const data = await res.json();

        alert(data.message);

        // 🔥 Reload orders → Cancelled order automatically hide
        loadOrders();

    } catch (error) {
        console.log("Cancel Error:", error);
        alert("Cancel failed");
    }
}

/* ================= LOAD ON PAGE ================= */
document.addEventListener("DOMContentLoaded", loadOrders);