console.log("script connected");

const API_BASE = "https://fakestoreapi.com";

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const loading = document.getElementById("loading");

const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");

const cartCountEl = document.getElementById("cartCount");

let currentProducts = [];
let activeCategory = null;

let cart = loadCartFromStorage();
updateCartCount();

/* ----------------------------
   Loading UI
---------------------------- */
function showLoading() {
    if (!loading) return;
    loading.classList.remove("hidden");
    loading.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="h-5 w-5 rounded-full border-2 border-gray-300 border-t-black animate-spin"></div>
      <p class="text-sm text-gray-600">Loading...</p>
    </div>
  `;
}

function hideLoading() {
    if (!loading) return;
    loading.classList.add("hidden");
    loading.innerHTML = "";
}

/* ----------------------------
   Categories (Active State)
---------------------------- */
function setActiveCategory(category) {
    activeCategory = category;

    document.querySelectorAll(".cat-btn").forEach((btn) => {
        const isActive = btn.dataset.cat === category;

        btn.classList.remove("bg-black", "text-white", "border-black");
        btn.classList.add("bg-white", "text-black", "border-gray-300");

        if (isActive) {
            btn.classList.remove("bg-white", "text-black", "border-gray-300");
            btn.classList.add("bg-black", "text-white", "border-black");
        }
    });
}

/* ----------------------------
   Render
---------------------------- */
function productCard(p) {
    const shortTitle = p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title;
    const rate = p.rating?.rate ?? "N/A";

    return `
    <div class="bg-white rounded-xl p-3 shadow flex flex-col">
      <div class="bg-gray-50 rounded-lg p-2">
        <img src="${p.image}" alt="${escapeHtml(p.title)}" class="h-40 w-full object-contain" />
      </div>

      <h3 class="mt-3 text-sm font-semibold leading-5 min-h-[40px]">
        ${escapeHtml(shortTitle)}
      </h3>

      <div class="mt-2 flex items-center justify-between">
        <p class="text-sm font-bold">$${p.price}</p>
        <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          ${escapeHtml(p.category)}
        </span>
      </div>

      <p class="text-xs text-gray-600 mt-2">Rating: ${rate}</p>

      <div class="mt-3 flex gap-2">
        <button
          class="details-btn flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          data-id="${p.id}">
          Details
        </button>

        <button
          class="add-btn flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm hover:opacity-90"
          data-id="${p.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function renderProducts(products) {
    currentProducts = products.slice();
    productGrid.innerHTML = products.map(productCard).join("");
}

/* ----------------------------
   Fetch
---------------------------- */
async function loadCategories() {
    showLoading();

    try {
        const res = await fetch(`${API_BASE}/products/categories`);
        const categories = await res.json();

        categoryContainer.innerHTML = categories
            .map(
                (cat) => `
          <button
            class="cat-btn px-3 py-1 rounded-full border text-sm bg-white text-black border-gray-300 hover:bg-black hover:text-white"
            data-cat="${cat}">
            ${escapeHtml(cat)}
          </button>
        `
            )
            .join("");

        // Optional: auto-load first category
        if (categories.length > 0) {
            setActiveCategory(categories[0]);
            await handleCategoryClick(categories[0]);
        }
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600">Failed to load categories</p>`;
        console.log(err);
    } finally {
        hideLoading();
    }
}

async function handleCategoryClick(category) {
    showLoading();
    productGrid.innerHTML = "";

    try {
        const url = `${API_BASE}/products/category/${encodeURIComponent(category)}`;
        const res = await fetch(url);
        const products = await res.json();

        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.log(err);
    } finally {
        hideLoading();
    }
}

async function fetchProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
}

/* ----------------------------
   Modal
---------------------------- */
function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modalContent.innerHTML = "";
}

async function openDetailsModal(productId) {
    showLoading();

    try {
        const p = await fetchProductById(productId);

        modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-3">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-64 object-contain" />
        </div>

        <div>
          <h2 class="text-lg font-bold">${escapeHtml(p.title)}</h2>
          <p class="text-sm text-gray-600 mt-2">${escapeHtml(p.description)}</p>

          <div class="mt-4 flex items-center justify-between">
            <p class="text-base font-bold">$${p.price}</p>
            <p class="text-sm text-gray-700">Rating: ${p.rating?.rate ?? "N/A"}</p>
          </div>

          <button
            class="modal-add-btn mt-4 w-full bg-black text-white rounded-lg px-4 py-2 text-sm hover:opacity-90"
            data-id="${p.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;

        openModal();
    } catch (err) {
        console.log(err);
        modalContent.innerHTML = `<p class="text-red-600">Failed to load details</p>`;
        openModal();
    } finally {
        hideLoading();
    }
}

/* ----------------------------
   Cart (LocalStorage)
---------------------------- */
function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem("swiftcart_cart");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage() {
    localStorage.setItem("swiftcart_cart", JSON.stringify(cart));
}

function updateCartCount() {
    if (!cartCountEl) return;
    cartCountEl.textContent = String(cart.length);
}

function addToCart(product) {
    cart.push(product);
    saveCartToStorage();
    updateCartCount();
}

/* ----------------------------
   Event Delegation (Fixes 2,4,6 bug)
---------------------------- */
function setupEventDelegation() {
    // Category clicks
    categoryContainer.addEventListener("click", async (e) => {
        const btn = e.target.closest(".cat-btn");
        if (!btn) return;

        const category = btn.dataset.cat;
        if (!category) return;

        setActiveCategory(category);
        await handleCategoryClick(category);
    });

    // Product grid clicks (details / add)
    productGrid.addEventListener("click", (e) => {
        const detailsBtn = e.target.closest(".details-btn");
        const addBtn = e.target.closest(".add-btn");

        if (detailsBtn) {
            const id = Number(detailsBtn.dataset.id);
            if (!Number.isNaN(id)) openDetailsModal(id);
        }

        if (addBtn) {
            const id = Number(addBtn.dataset.id);
            const product = currentProducts.find((x) => x.id === id);
            if (product) addToCart(product);
        }
    });

    // Modal add to cart
    modal.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".modal-add-btn");
        if (!addBtn) return;

        const id = Number(addBtn.dataset.id);
        if (Number.isNaN(id)) return;

        fetchProductById(id)
            .then((p) => addToCart(p))
            .catch((err) => console.log(err));
    });

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    // Click outside modal content to close
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Esc to close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });
}

/* ----------------------------
   Helpers
---------------------------- */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ----------------------------
   Init
---------------------------- */
setupEventDelegation();
loadCategories();
