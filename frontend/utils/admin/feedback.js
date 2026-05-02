// utils/admin/feedback.js

let feedbacks = [];
let currentPage = 1;
let itemsPerPage = 8;
let currentStatus = "all";
let currentSearch = "";
let deleteId = null;

const tbody = document.getElementById("feedbackTableBody");
const totalEl = document.getElementById("totalFeedbacks");
const pendingEl = document.getElementById("pendingCount");
const resolvedEl = document.getElementById("resolvedCount");
const avgRatingEl = document.getElementById("avgRating");
const searchInput = document.getElementById("searchFeedback");
const statusFilter = document.getElementById("statusFilter");
const paginationDiv = document.getElementById("pagination");

// ✅ UPDATED API (ADMIN)
const API_BASE = "http://localhost:5000/api/admin/feedbacks";

document.addEventListener("DOMContentLoaded", () => {
    loadFeedbacks();
    setupEventListeners();
    setupNavigation();
});

async function loadFeedbacks() {
    try {
        const token = localStorage.getItem("token"); // 🔥 ADD TOKEN

        const res = await fetch(API_BASE, {
            headers: {
                "Authorization": `Bearer ${token}` // 🔥 AUTH
            }
        });

        const data = await res.json();

        feedbacks = data.map(f => ({
            id: f.id,
            customerName: f.customerName || f.name || "Anonymous",
            email: f.email || "No email", // ✅ SAFE
            message: f.message,
            rating: f.rating || 0,
            date: f.date ? new Date(f.date).toLocaleDateString() : new Date().toLocaleDateString(),
            status: f.status || "pending"
        }));

        updateStats();
        renderTable();

    } catch (err) {
        console.error("Error loading feedbacks", err);
        tbody.innerHTML = `<tr><td colspan="6">Failed to load feedbacks</td></tr>`;
    }
}

function updateStats() {
    totalEl.textContent = feedbacks.length;

    const pending = feedbacks.filter(f => f.status === "pending").length;
    const resolved = feedbacks.filter(f => f.status === "resolved").length;

    pendingEl.textContent = pending;
    resolvedEl.textContent = resolved;

    const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length || 0;
    avgRatingEl.textContent = avg.toFixed(1);
}

function getFilteredFeedbacks() {
    let filtered = [...feedbacks];

    if (currentStatus !== "all") {
        filtered = filtered.filter(f => f.status === currentStatus);
    }

    if (currentSearch) {
        filtered = filtered.filter(f =>
            f.customerName.toLowerCase().includes(currentSearch.toLowerCase()) ||
            (f.email && f.email.toLowerCase().includes(currentSearch.toLowerCase()))
        );
    }

    return filtered;
}

function renderTable() {
    const filtered = getFilteredFeedbacks();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No feedback found</td></tr>`;
        paginationDiv.innerHTML = "";
        return;
    }

    tbody.innerHTML = pageItems.map(f => `
        <tr>
            <td>
                <strong>${escapeHtml(f.customerName)}</strong><br>
                <small>${escapeHtml(f.email)}</small>
            </td>
            <td class="rating-stars">${"★".repeat(f.rating)}${"☆".repeat(5-f.rating)}</td>
            <td>${escapeHtml(f.message.substring(0, 60))}${f.message.length > 60 ? "…" : ""}</td>
            <td>${f.date}</td>
            <td><span class="status-badge status-${f.status}">${f.status.toUpperCase()}</span></td>
            <td class="action-buttons">
                <button class="view-btn" onclick="viewFeedback(${f.id})">
                    <i class="fa-regular fa-eye"></i> View
                </button>

                ${f.status === "pending" ? `
                <button class="resolve-btn" onclick="resolveFeedback(${f.id})">
                    <i class="fa-solid fa-check"></i> Resolve
                </button>` : ""}

                <button class="delete-btn" onclick="deletePrompt(${f.id})">
                    <i class="fa-regular fa-trash-can"></i> Delete
                </button>
            </td>
        </tr>
    `).join("");

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

// ✅ UPDATED WITH TOKEN
async function resolveFeedback(id) {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "resolved" })
    });

    loadFeedbacks();
}

// ✅ UPDATED WITH TOKEN
async function deleteFeedback() {
    if (!deleteId) return;

    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/${deleteId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    document.getElementById("deleteModal").style.display = "none";
    loadFeedbacks();
}

function viewFeedback(id) {
    const fb = feedbacks.find(f => f.id === id);
    if (!fb) return;

    const modalBody = document.getElementById("viewModalBody");

    modalBody.innerHTML = `
        <p><strong>Customer:</strong> ${escapeHtml(fb.customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(fb.email)}</p>
        <p><strong>Rating:</strong> 
            <span class="rating-stars">${"★".repeat(fb.rating)}${"☆".repeat(5-fb.rating)}</span>
        </p>
        <p><strong>Date:</strong> ${fb.date}</p>
        <p><strong>Status:</strong> 
            <span class="status-badge status-${fb.status}">${fb.status}</span>
        </p>
        <p><strong>Message:</strong><br>${escapeHtml(fb.message)}</p>
    `;

    document.getElementById("viewModal").style.display = "flex";
}

function deletePrompt(id) {
    deleteId = id;
    document.getElementById("deleteModal").style.display = "flex";
}

function setupEventListeners() {
    searchInput.addEventListener("input", e => {
        currentSearch = e.target.value;
        currentPage = 1;
        renderTable();
    });

    statusFilter.addEventListener("change", e => {
        currentStatus = e.target.value;
        currentPage = 1;
        renderTable();
    });

    document.querySelector(".close-view-modal").addEventListener("click", () => {
        document.getElementById("viewModal").style.display = "none";
    });

    document.querySelector(".close-delete-modal").addEventListener("click", () => {
        document.getElementById("deleteModal").style.display = "none";
    });

    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
        document.getElementById("deleteModal").style.display = "none";
    });

    document.getElementById("confirmDeleteBtn").addEventListener("click", deleteFeedback);

    window.addEventListener("click", e => {
        if (e.target.classList.contains("modal")) {
            e.target.style.display = "none";
        }
    });
}

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

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function (m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

window.goToPage = goToPage;
window.viewFeedback = viewFeedback;
window.resolveFeedback = resolveFeedback;
window.deletePrompt = deletePrompt;