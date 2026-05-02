// utils/admin/product.js

let products = [];

let currentPage = 1;
let itemsPerPage = 8;
let currentFilter = "all";
let currentSearch = "";
let chartInstance = null;

// DOM Elements
const productTableBody = document.getElementById("productTableBody");
const totalProductsEl = document.getElementById("totalProducts");
const totalCategoriesEl = document.getElementById("totalCategories");
const inStockCountEl = document.getElementById("inStockCount");
const avgPriceEl = document.getElementById("avgPrice");
const searchInput = document.getElementById("searchProduct");
const categoryFilter = document.getElementById("categoryFilter");
const paginationDiv = document.getElementById("pagination");
const chartTypeSelect = document.getElementById("chartTypeSelect");

// Modal
const productModal = document.getElementById("productModal");
const deleteModal = document.getElementById("deleteModal");
const modalTitle = document.getElementById("modalTitle");
const productForm = document.getElementById("productForm");

let currentDeleteId = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadProducts(); // 🔥 main change
    setupEventListeners();
    setupNavigation();
});

function getCategoryFromOccasion(id) {
    if (id == 1) return "Birthday";
    if (id == 2) return "Anniversary";
    if (id == 3) return "Celebration";
    if (id == 4) return "Diwali";
    return "General";
}

function getOccasionId(category) {
    if (category === "Birthday") return 1;
    if (category === "Anniversary") return 2;
    if (category === "Celebration") return 3;
    if (category === "Diwali") return 4;
    return null;
}
// ================= LOAD PRODUCTS =================
async function loadProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        console.log("Products:",products)
        // map DB → frontend format
        products = data.map(p => ({
            id: p.id,
            name: p.name,
            category: getCategoryFromOccasion(p.occasion_id), // temporary
            price: p.price,
            stock: p.stock || 0, // temporary
            // product.js मध्ये शोधा आणि हे रिप्लेस करा:
            image: p.image.startsWith('http')
                ? p.image
                : `http://localhost:5000/uploads/${p.image.replace(/^\//, '')}`,
            description: p.description
        }));

        console.log("Products:",products)

        loadCategories();
        updateStats();
        renderTable();
        renderChart("bar");

    } catch (err) {
        console.log("Error:", err);
    }
}

// ================= CATEGORY =================
function loadCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

// ================= STATS =================
function updateStats() {
    totalProductsEl.textContent = products.length;

    const categories = [...new Set(products.map(p => p.category))];
    totalCategoriesEl.textContent = categories.length;

    const inStock = products.filter(p => p.stock > 0).length;
    inStockCountEl.textContent = inStock;

    const avgPrice = products.reduce((sum, p) => sum + Number(p.price), 0) / products.length;
    avgPriceEl.textContent = `₹${Math.round(avgPrice)}`;
}

// ================= FILTER =================
function getFilteredProducts() {
    let filtered = [...products];

    if (currentFilter !== "all") {
        filtered = filtered.filter(p => p.category === currentFilter);
    }

    if (currentSearch) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    return filtered;
}

// ================= TABLE =================
function renderTable() {
    const filtered = getFilteredProducts();

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    if (pageItems.length === 0) {
        productTableBody.innerHTML = `<tr><td colspan="7">No products</td></tr>`;
        return;
    }

    productTableBody.innerHTML = pageItems.map(p => `
        <tr>
            <td><img src="${p.image}" class="product-image"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td>${p.stock}</td>
            <td>${getStatusBadge(p.stock)}</td>
            <td>
                <button onclick="editProduct(${p.id})">Edit</button>
                <button onclick="deleteProductPrompt(${p.id}, '${p.name}')">Delete</button>
            </td>
        </tr>
    `).join("");

    renderPagination(totalPages);
}

// ================= STATUS =================
function getStatusBadge(stock) {
    if (stock > 5) return "In Stock";
    if (stock > 0) return "Low Stock";
    return "Out of Stock";
}
// ================= PAGINATION =================
function renderPagination(totalPages) {
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})">${i}</button>`;
    }
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

// ================= CHART =================
function renderChart(type) {
    const ctx = document.getElementById("productChart").getContext("2d");

    if (chartInstance) chartInstance.destroy();

    const categories = [...new Set(products.map(p => p.category))];
    const counts = categories.map(c => products.filter(p => p.category === c).length);

    chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: categories,
            datasets: [{
                data: counts
            }]
        }
    });
}

// ================= EVENTS =================
function setupEventListeners() {

    searchInput.addEventListener("input", e => {
        currentSearch = e.target.value;
        renderTable();
    });

    categoryFilter.addEventListener("change", e => {
        currentFilter = e.target.value;
        renderTable();
    });

    chartTypeSelect.addEventListener("change", e => {
        renderChart(e.target.value);
    });

    document.getElementById("addProductBtn")
        .addEventListener("click", () => openModal());

    productForm.addEventListener("submit", e => {
        e.preventDefault();
        saveProduct();
    });
}

// ================= SAVE =================
// async function saveProduct() {
//     const id = document.getElementById("productId").value;

//     const data = {
//         name: document.getElementById("productName").value,
//         price: parseFloat(document.getElementById("productPrice").value),
//         stock: parseInt(document.getElementById("productStock").value), // ✅ ADD THIS
//         // या लाईनमध्ये बदल करा:
//         image: document.getElementById("productImage").value.split('\\').pop().split('/').pop(),
//         description: document.getElementById("productDescription").value,
//         occasion_id: getOccasionId(document.getElementById("productCategory").value)
//     };

//     if (id) {
//         await fetch(`http://localhost:5000/api/products/${id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });
//     } else {
//         await fetch("http://localhost:5000/api/products", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });
//     }

//     closeModal();
//     loadProducts();
// }

async function saveProduct() {
    const id = document.getElementById("productId").value;

    const formData = new FormData();

    formData.append("name", document.getElementById("productName").value);
    formData.append("price", parseFloat(document.getElementById("productPrice").value));
    formData.append("stock", parseInt(document.getElementById("productStock").value));
    formData.append("description", document.getElementById("productDescription").value);
    formData.append(
        "occasion_id",
        getOccasionId(document.getElementById("productCategory").value)
    );

    // 🔥 IMPORTANT LINE
    const fileInput = document.getElementById("productImage");
    formData.append("image", fileInput.files[0]); // 👈 actual file

    if (id) {
        await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "PUT",
            body: formData
        });
    } else {
        await fetch("http://localhost:5000/api/products", {
            method: "POST",
            body: formData
        });
    }

    closeModal();
    loadProducts();
}

// ================= DELETE =================
function deleteProductPrompt(id, name) {
    currentDeleteId = id;
    deleteModal.style.display = "flex";
}

async function confirmDelete() {
    await fetch(`http://localhost:5000/api/products/${currentDeleteId}`, {
        method: "DELETE"
    });

    deleteModal.style.display = "none";
    loadProducts();
}
document.getElementById("confirmDeleteBtn")
    .addEventListener("click", confirmDelete);

// ================= MODAL =================
function openModal(product = null) {
    productModal.style.display = "flex";
}

function closeModal() {
    productModal.style.display = "none";
}

// ================= NAV =================
function setupNavigation() {
    document.querySelectorAll("[data-tab]").forEach(item => {
        item.addEventListener("click", () => {
            const tab = item.getAttribute("data-tab");
            window.location.href = tab + ".html";
        });
    });
}

// ================= GLOBAL =================
window.goToPage = goToPage;
window.editProduct = id => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    openModal(p);
};
window.deleteProductPrompt = deleteProductPrompt;
window.confirmDelete = confirmDelete;


// cancel delete icon button 
document.querySelector(".close-modal")
    .addEventListener("click", closeModal);

document.getElementById("cancelModalBtn")
    .addEventListener("click", closeModal);

document.querySelector(".close-delete-modal")
    .addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

document.getElementById("cancelDeleteBtn")
    .addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

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
            }else if (tab=="feedbacks") {
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