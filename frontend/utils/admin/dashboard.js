// ================= ADMIN CHECK =================
const user = JSON.parse(localStorage.getItem("moonUser"));

if (!user || user.role !== "admin") {
    alert("Access denied! Admin only");
    window.location.href = "../../components/login.html";
}

// ================= ADMIN NAME =================
const adminName = document.getElementById("adminName");
if (adminName && user) {
    adminName.textContent = user.name;
}

// ================= FETCH DASHBOARD DATA =================
async function loadDashboardData() {
    try {

        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {

            dashboardData = data; // 🔥 replace static data

            updateStats();
            renderChart(currentChartType);
            renderTabContent("orders");

        } else {
            console.log("Error:", data.message);
        }

    } catch (err) {
        console.log("Dashboard fetch error:", err);
    }
}


// ================= ORIGINAL DATA (fallback) =================
let dashboardData = {
    totalRevenue: 128430,
    totalOrders: 342,
    totalCustomers: 1280,
    totalProducts: 56,
    revenueTrend: 12.5,
    ordersTrend: 8,
    customersTrend: 23,
    recentOrders: [
        { id: "ORD-1001", customer: "Priya Sharma", amount: 699, status: "completed", date: "2024-03-15" }
    ],
    topProducts: [
        { name: "Pink Rose Bouquet", sales: 45, revenue: 31455 }
    ],
    monthlySales: [28500, 32400, 36800, 41200, 45800, 49500]
};

let chartInstance = null;
let currentChartType = "bar";

// DOM Elements
const totalRevenueEl = document.getElementById("totalRevenue");
const totalOrdersEl = document.getElementById("totalOrders");
const totalCustomersEl = document.getElementById("totalCustomers");
const totalProductsEl = document.getElementById("totalProducts");
const revenueTrendEl = document.getElementById("revenueTrend");
const ordersTrendEl = document.getElementById("ordersTrend");
const customersTrendEl = document.getElementById("customersTrend");
const productsStatusEl = document.getElementById("productsStatus");
const dynamicTabContent = document.getElementById("dynamicTabContent");
const chartTypeSelect = document.getElementById("chartTypeSelect");


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData(); // 🔥 backend call
    setupEventListeners();
    setupNavigation();
});


// ================= UPDATE STATS =================
function updateStats() {
    totalRevenueEl.textContent = `₹${dashboardData.totalRevenue.toLocaleString()}`;
    totalOrdersEl.textContent = dashboardData.totalOrders;
    totalCustomersEl.textContent = dashboardData.totalCustomers;
    totalProductsEl.textContent = dashboardData.totalProducts;
    
    revenueTrendEl.innerHTML = `+${dashboardData.revenueTrend || 0}% <i class="fa-solid fa-arrow-up"></i>`;
    ordersTrendEl.innerHTML = `+${dashboardData.ordersTrend || 0}%`;
    customersTrendEl.innerHTML = `+${dashboardData.customersTrend || 0}%`;
    productsStatusEl.innerHTML = `${dashboardData.totalProducts} varieties`;
}


// ================= CHART =================
function renderChart(type) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const salesData = dashboardData.monthlySales;
    const ctx = document.getElementById("mainChart").getContext("2d");
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    if (type === "bar") {
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: months,
                datasets: [{
                    label: "Revenue (₹)",
                    data: salesData,
                    backgroundColor: "#ffb7c5",
                    borderColor: "#ff88aa",
                    borderWidth: 1
                }]
            }
        });
    } 
    else if (type === "pie") {

        const categories = ["Roses", "Lilies", "Orchids", "Sunflowers", "Others"];
        const categoryData = [145, 98, 76, 82, 65];
        
        chartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: categories,
                datasets: [{
                    data: categoryData,
                    backgroundColor: ["#ffb7c5", "#ff9bb0", "#ff88aa", "#ffa5b8", "#ffc0cc"]
                }]
            }
        });
    } 
    else if (type === "line") {
        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: months,
                datasets: [{
                    label: "Revenue Trend (₹)",
                    data: salesData,
                    borderColor: "#ff88aa",
                    fill: true
                }]
            }
        });
    }

    currentChartType = type;
}


// ================= TABLE =================
function renderTabContent(tab) {

    if (tab === "orders") {

        dynamicTabContent.innerHTML = `
            <div class="table-wrapper">
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dashboardData.recentOrders.map(order => `
                            <tr>
                                <td><strong>${order.id}</strong></td>
                                <td>${order.customer}</td>
                                <td>₹${order.amount}</td>
                                <td>${getStatusBadge(order.status)}</td>
                                <td>${formatDate(order.date)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    else if (tab === "products") {

        dynamicTabContent.innerHTML = `
            <div class="table-wrapper">
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dashboardData.topProducts.map(product => `
                            <tr>
                                <td><strong>${product.name}</strong></td>
                                <td>${product.sales}</td>
                                <td>₹${product.revenue}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }
}


// ================= HELPERS =================
function getStatusBadge(status) {
    if (status === "completed") {
        return '<span class="status-badge status-completed">Completed</span>';
    }
    return '<span class="status-badge status-pending">Pending</span>';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN');
}


// ================= EVENTS =================
function setupEventListeners() {

    chartTypeSelect.addEventListener("change", (e) => {
        renderChart(e.target.value);
    });

    if (!document.querySelector(".tab-buttons")) {

        const tabButtonsHtml = `
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="orders">📋 Orders</button>
                <button class="tab-btn" data-tab="products">🏆 Products</button>
            </div>
        `;

        dynamicTabContent.insertAdjacentHTML("beforebegin", tabButtonsHtml);

        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderTabContent(btn.getAttribute("data-tab"));
            });
        });
    }
}


// ================= NAVIGATION =================
function setupNavigation() {

    document.querySelectorAll("[data-tab]").forEach(item => {

        item.addEventListener("click", () => {

            const tab = item.getAttribute("data-tab");

            if (tab === "dashboard") {
                window.location.href = "dashboard.html";
            } else if (tab === "products") {
                window.location.href = "product.html";
            } else if (tab === "customers") {
                window.location.href = "customer.html";
            } else if (tab === "transactions") {
                window.location.href = "transaction.html";
            } else if (tab=="feedbacks") {
                window.location.href="feedback.html";
            }
        });
    });

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../../components/login.html";
        });
    }
}
const sidebarAvatar = document.getElementById("sidebarAvatar");

if (user && sidebarAvatar) {
    sidebarAvatar.src = user.avatar || "../../assets/admin profile.jpg";
}