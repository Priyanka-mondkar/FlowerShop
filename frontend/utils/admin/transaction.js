// ================== DATA ==================
let transactions = [];

// API
const API_URL = "http://localhost:5000/api/transactions";

// STATE
let currentPage = 1;
let itemsPerPage = 8;
let currentStatusFilter = "all";
let currentPaymentFilter = "all";
let currentSearch = "";
let chartInstance = null;

// DOM
const transactionTableBody = document.getElementById("transactionTableBody");
const totalRevenueEl = document.getElementById("totalRevenue");
const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const completedOrdersEl = document.getElementById("completedOrders");
const searchInput = document.getElementById("searchTransaction");
const statusFilter = document.getElementById("statusFilter");
const paymentFilter = document.getElementById("paymentFilter");
const paginationDiv = document.getElementById("pagination");
const chartTypeSelect = document.getElementById("chartTypeSelect");

// Modal
const viewModal = document.getElementById("viewModal");
const statusModal = document.getElementById("statusModal");
let currentUpdateId = null;

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    fetchTransactions();
    setupEventListeners();
    setupNavigation();
});

// ================== FETCH ==================
async function fetchTransactions() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        transactions = data.map(t => ({
            id: t.id || t.order_id,
            customer: t.customer || t.full_name,
            product: t.product || "Flower Order",
            amount: Number(t.amount || t.total_amount),
            paymentMethod: t.paymentMethod || t.payment_method,
            date: t.date || t.order_date,
            status: t.status || t.order_status,
            items: t.items || 1,
            address: t.address || t.city
        }));
        console.log(transactions);
        updateStats();
        renderTable();
        renderChart(chartTypeSelect.value || "bar"); // ✅ FIXED CHART

    } catch (err) {
        console.error("❌ Fetch error:", err);
    }
}

// ================== STATS ==================
function updateStats() {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalRevenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
    totalOrdersEl.textContent = transactions.length;

    pendingOrdersEl.textContent =
        transactions.filter(t => t.status === "pending").length;

    completedOrdersEl.textContent =
        transactions.filter(t => t.status === "completed").length;
}

// ================== FILTER ==================
function getFilteredTransactions() {
    let filtered = [...transactions];

    if (currentStatusFilter !== "all") {
        filtered = filtered.filter(t => t.status === currentStatusFilter);
    }

    if (currentPaymentFilter !== "all") {
        filtered = filtered.filter(t => t.paymentMethod === currentPaymentFilter);
    }

    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        filtered = filtered.filter(t =>
            t.id.toString().toLowerCase().includes(s) ||
            t.customer.toLowerCase().includes(s) ||
            t.product.toLowerCase().includes(s)
        );
    }

    return filtered;
}

// ================== TABLE ==================
function renderTable() {
    const filtered = getFilteredTransactions();
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    if (!pageItems.length) {
        transactionTableBody.innerHTML =
            `<tr><td colspan="8">No data</td></tr>`;
        return;
    }

    transactionTableBody.innerHTML = pageItems.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.customer}</td>
            <td>${t.product}</td>
            <td>₹${t.amount}</td>
            <td>${t.paymentMethod}</td>
            <td>${formatDate(t.date)}</td>
            <td>${getStatusBadge(t.status)}</td>
            <td>
                <button onclick="viewTransaction('${t.id}')">View</button>
                <button onclick="updateStatus('${t.id}')">Status</button>
            </td>
        </tr>
    `).join("");
    renderPagination(filtered.length);
}
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationDiv.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === currentPage) btn.style.background = "pink";

        btn.onclick = () => {
            currentPage = i;
            renderTable();
        };

        paginationDiv.appendChild(btn);
    }
}

// ================== CHART ==================
function renderChart(type) {
    const ctx = document.getElementById("transactionChart");

    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();

    const payments = {};

    transactions.forEach(t => {
        let method = (t.paymentMethod || "").toLowerCase();

        // ✅ fix all variations
        if (method === "card" || method === "credit") method = "card";
        else if (method === "upi") method = "upi";
        else if (method === "cod" || method === "cash on delivery") method = "cod";
        else return;

        payments[method] = (payments[method] || 0) + t.amount;
    });

    const labelMap = {
        "card": "Card",
        "upi": "UPI",
        "cod": "COD"
    };

    const labels = Object.keys(payments).map(p => labelMap[p]);
    const values = Object.values(payments);

    if (labels.length === 0) {
        console.warn("Still no chart data 😅");
        return;
    }

    chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: "Revenue",
                data: values,
            }]
        },
        options: {
            responsive: true
        }
    });
}

// ================== MODALS ==================
function viewTransaction(id) {
    const t = transactions.find(x => x.id == id);

    document.getElementById("transactionDetails").innerHTML = `
        <p><b>ID:</b> ${t.id}</p>
        <p><b>Name:</b> ${t.customer}</p>
        <p><b>Amount:</b> ₹${t.amount}</p>
        <p><b>Status:</b> ${t.status}</p>
    `;

    viewModal.style.display = "flex";
}

function updateStatus(id) {
    currentUpdateId = id;
    statusModal.style.display = "flex";
}

function closeViewModal() {
    viewModal.style.display = "none";
}

function closeStatusModal() {
    statusModal.style.display = "none";
}

// ================== UPDATE STATUS ==================
async function confirmStatusUpdate() {
    const newStatus = document.getElementById("updateStatus").value;

    await fetch(`${API_URL}/${currentUpdateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    });

    fetchTransactions();
    closeStatusModal();
}

// ================== EVENTS ==================
function setupEventListeners() {
    searchInput.addEventListener("input", e => {
        currentSearch = e.target.value;
        renderTable();
    });

    statusFilter.addEventListener("change", e => {
        currentStatusFilter = e.target.value;
        renderTable();
    });

    paymentFilter.addEventListener("change", e => {
        currentPaymentFilter = e.target.value;
        renderTable();
    });

    chartTypeSelect.addEventListener("change", e => {
        renderChart(e.target.value);
    });

    document.getElementById("confirmStatusBtn")
        .addEventListener("click", confirmStatusUpdate);

    document.querySelectorAll(".close-view-modal, #closeViewBtn")
        .forEach(btn => btn.addEventListener("click", closeViewModal));

    document.querySelector(".close-status-modal")
        .addEventListener("click", closeStatusModal);

    document.getElementById("cancelStatusBtn")
        .addEventListener("click", closeStatusModal);

    document.getElementById("exportBtn")
        .addEventListener("click", () => alert("Export Working ✅"));

    // logout
    document.getElementById("logoutBtn")
        .addEventListener("click", () => {
            window.location.href = "../../components/login.html";
        });
}

// ================== NAV ==================
function setupNavigation() {
    document.querySelectorAll("[data-tab]").forEach(item => {
        item.addEventListener("click", () => {
            const tab = item.getAttribute("data-tab");

            if (tab === "dashboard") window.location.href = "dashboard.html";
            if (tab === "products") window.location.href = "product.html";
            if (tab === "customers") window.location.href = "customer.html";
            if (tab === "transactions") window.location.href = "transaction.html";
            if (tab === "feedbacks") window.location.href = "feedback.html";
        });
    });
}

// ================== HELPERS ==================
function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN");
}

function getStatusBadge(status) {
    return `<span>${status}</span>`;
}

// GLOBAL
window.viewTransaction = viewTransaction;
window.updateStatus = updateStatus;