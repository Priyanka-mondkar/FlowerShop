// ================= BACKEND API BASE =================
const API_URL = "http://localhost:5000/api/customers";

// ================= STATE =================
let customers = [];
let currentPage = 1;
let itemsPerPage = 6;
let currentFilter = "all";
let currentSearch = "";
let chartInstance = null;

// ================= DOM =================
const customerTableBody = document.getElementById("customerTableBody");
const totalCustomersEl = document.getElementById("totalCustomers");
const newCustomersEl = document.getElementById("newCustomers");
const avgSpendEl = document.getElementById("avgSpend");
const activeCustomersEl = document.getElementById("activeCustomers");
const searchInput = document.getElementById("searchCustomer");
const statusFilter = document.getElementById("statusFilter");
const paginationDiv = document.getElementById("pagination");
const chartTypeSelect = document.getElementById("chartTypeSelect");

const customerModal = document.getElementById("customerModal");
const deleteModal = document.getElementById("deleteModal");
const modalTitle = document.getElementById("modalTitle");
const customerForm = document.getElementById("customerForm");

let currentDeleteId = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    fetchCustomers();
    setupEventListeners();
    setupNavigation();
});

// ================= FETCH DATA =================
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        customers = await res.json();

        updateStats();
        renderTable();
        renderChart("bar");

    } catch (err) {
        console.error("Error fetching customers:", err);
    }
}

// ================= STATS =================
function updateStats() {
    totalCustomersEl.textContent = customers.length;

    const newThisMonth = customers.slice(-3).length;
    newCustomersEl.textContent = newThisMonth;

    const totalSpend = customers.reduce((sum, c) => {
        return sum + Number(c.totalSpent || 0);
    }, 0);
    const avgSpend = customers.length ? Math.round(totalSpend / customers.length) : 0;
    avgSpendEl.textContent = `₹${avgSpend}`;

    const activeCount = customers.filter(c => c.status === "active").length;
    activeCustomersEl.textContent = activeCount;
}

// ================= FILTER =================
function getFilteredCustomers() {
    let filtered = [...customers];

    if (currentFilter !== "all") {
        filtered = filtered.filter(c => c.status === currentFilter);
    }

    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        filtered = filtered.filter(c =>
            (c.firstName || "").toLowerCase().includes(s) ||
            (c.lastName || "").toLowerCase().includes(s) ||
            (c.email || "").toLowerCase().includes(s)
        );
    }

    return filtered;
}

// ================= TABLE =================
function renderTable() {
    const filtered = getFilteredCustomers();
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    customerTableBody.innerHTML = pageItems.map(c => `
        <tr>
            <td><img src="${c.avatar}" class="customer-avatar"></td>
            <td>${c.firstName} ${c.lastName}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.city}</td>
            <td>${c.orders || 0}</td>
            <td>₹${c.totalSpent || 0}</td>
            <td>${c.status}</td>
            <td>
                <button onclick="editCustomer(${c.id})">Edit</button>
                <button onclick="deleteCustomerPrompt(${c.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

// ================= ADD / UPDATE =================
async function saveCustomer() {
    const id = document.getElementById("customerId").value;

    // ✅ FILE HANDLE
    const file = document.getElementById("avatar").files[0];

    let avatarUrl = "";

    if (file) {
        avatarUrl = URL.createObjectURL(file); // preview URL
    }

    const data = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phone: phone.value,
        city: city.value,
        status: status.value,
        address: address.value,
        avatar: avatarUrl   // ✅ fixed
    };

    try {
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        closeModal();
        fetchCustomers();

    } catch (err) {
        console.error(err);
    }
}

// ================= EDIT =================
function editCustomer(id) {
    const c = customers.find(x => x.id === id);

    document.getElementById("customerId").value = c.id;
    firstName.value = c.firstName;
    lastName.value = c.lastName;
    email.value = c.email;
    phone.value = c.phone;
    city.value = c.city;

    openModal();
}

// ================= DELETE =================
function deleteCustomerPrompt(id) {
    currentDeleteId = id;
    deleteModal.style.display = "flex";
}

async function confirmDelete() {
    await fetch(`${API_URL}/${currentDeleteId}`, {
        method: "DELETE"
    });

    closeDeleteModal();
    fetchCustomers();
}

// ================= MODAL =================
function openModal() {
    customerModal.style.display = "flex";
}

function closeModal() {
    customerModal.style.display = "none";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
}

// ================= EVENTS =================
function setupEventListeners() {
    searchInput.addEventListener("input", e => {
        currentSearch = e.target.value;
        renderTable();
    });

    statusFilter.addEventListener("change", e => {
        currentFilter = e.target.value;
        renderTable();
    });

    customerForm.addEventListener("submit", e => {
        e.preventDefault();
        saveCustomer();
    });
    chartTypeSelect.addEventListener("change", e => {
        renderChart(e.target.value);
    });

    document.getElementById("confirmDeleteBtn")
        .addEventListener("click", confirmDelete);
}

// ================= NAVIGATION =================
function setupNavigation() {
    document.querySelectorAll("[data-tab]").forEach(item => {
        item.addEventListener("click", () => {
            const tab = item.getAttribute("data-tab");

            if (tab === "dashboard") location.href = "dashboard.html";
            if (tab === "products") location.href = "product.html";
            if (tab === "customers") location.href = "customer.html";
            if (tab === "transactions") location.href = "transaction.html";
            
           if (tab === "feedbacks") location.href = "feedback.html";
        });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../../components/login.html";
    });
}

// ================= GLOBAL =================
window.editCustomer = editCustomer;
window.deleteCustomerPrompt = deleteCustomerPrompt;

function renderChart(type = "bar") {
    const cityCounts = {};

    customers.forEach(c => {
        const city = c.city || "Unknown";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const ctx = document.getElementById("customerChart");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: type, // ✅ dynamic chart type
        data: {
            labels: Object.keys(cityCounts),
            datasets: [{
                label: "Customers",
                data: Object.values(cityCounts)
            }]
        },
        options: {
            responsive: true
        }
    });
}

// OPEN MODAL
document.getElementById("addCustomerBtn")
    .addEventListener("click", openModal);

// CLOSE (X)
document.querySelector(".close-modal")
    .addEventListener("click", closeModal);

document.querySelector(".close-delete-modal")
    .addEventListener("click", closeDeleteModal);

// CANCEL BUTTONS
document.getElementById("cancelModalBtn")
    .addEventListener("click", closeModal);

document.getElementById("cancelDeleteBtn")
    .addEventListener("click", closeDeleteModal);