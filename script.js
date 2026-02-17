console.log("script connected");

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const trendingGrid = document.getElementById("trendingGrid");

const loadingOverlay = document.getElementById("loadingOverlay");

const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");

const cartCountEl = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const yearEl = document.getElementById("year");

let activeCategory = null;
let allProductsCache = [];
let currentProducts = [];

let cart = loadCartFromStorage();

function setLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.remove("hidden");
        loadingOverlay.classList.add("flex");
    } else {
        loadingOverlay.classList.add("hidden");
        loadingOverlay.classList.remove("flex");
    }
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function saveCartToStorage() {
    localStorage.setItem("swiftcart_cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem("swiftcart_cart");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function updateCartCount() {
    cartCountEl.textContent = String(cart.length);
}

function addToCart(product) {
    cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category
    });
    saveCartToStorage();
    updateCartCount();
}

function stars(rating) {
    const r = Math.round(Number(rating || 0));
    const full = Math.max(0, Math.min(5, r));
    const empty = 5 - full;
    return "★".repeat(full) + "☆".repeat(empty);
}

function truncate(text, max) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
}

function setActiveButton(category) {
    activeCategory = category;

    document.querySelectorAll(".cat-btn").forEach((btn) => {
        const isActive = btn.dataset.cat === category;

        btn.classList.remove("bg-black", "text-white", "border-black");
        btn.classList.add("bg-white", "text-gray-900", "border-gray-200");

        if (isActive) {
            btn.classList.remove("bg-white", "text-gray-900", "border-gray-200");
            btn.classList.add("bg-black", "text-white", "border-black");
        }
    });
}

function renderCategories(categories) {
    categoryContainer.innerHTML = `
    <button
      class="cat-btn px-3 py-1 rounded-full border text-sm hover:bg-black hover:text-white bg-black text-white border-black"
      data-cat="__all__"
      type="button"
    >All</button>
    ${categories
            .map(
                (cat) => `
      <button
        class="cat-btn px-3 py-1 rounded-full border text-sm hover:bg-black hover:text-white bg-white text-gray-900 border-gray-200"
        data-cat="${cat}"
        type="button"
      >${cat}</button>
    `
            )
            .join("")}
  `;

    document.querySelectorAll(".cat-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.cat;
            setActiveButton(cat);
            if (cat === "__all__") {
                loadAllProducts();
            } else {
                handleCategoryClick(cat);
            }
        });
    });

    activeCategory = "__all__";
}

function productCard(p) {
    return `
    <div class="bg-white rounded-xl p-3 shadow flex flex-col">
      <div class="bg-gray-50 rounded-lg p-3">
        <img src="${p.image}" alt="${p.title}" class="h-32 w-full object-contain" />
      </div>

      <h3 class="mt-3 text-sm font-semibold">${truncate(p.title, 32)}</h3>

      <div class="mt-1 flex items-center justify-between">
        <p class="text-sm font-bold">$${p.price}</p>
        <span class="text-xs text-gray-500">${p.category}</span>
      </div>

      <div class="mt-1 text-xs text-gray-700">
        <span class="mr-2">${stars(p.rating?.rate)}</span>
        <span class="text-gray-500">(${p.rating?.rate ?? "N/A"})</span>
      </div>

      <div class="mt-3 flex gap-2">
        <button
          class="details-btn flex-1 border rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          data-id="${p.id}"
          type="button"
        >Details</button>

        <button
          class="add-btn flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm hover:bg-black/90"
          data-id="${p.id}"
          type="button"
        >Add</button>
      </div>
    </div>
  `;
}

function bindProductButtons(products) {
    document.querySelectorAll(".details-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            openDetailsModal(id);
        });
    });

    document.querySelectorAll(".add-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const product = products.find((x) => x.id === id);
            if (product) addToCart(product);
        });
    });
}

function renderProducts(products) {
    currentProducts = products.slice();
    productGrid.innerHTML = products.map(productCard).join("");
    bindProductButtons(products);
}

function renderTrending(products) {
    const top3 = products
        .slice()
        .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
        .slice(0, 3);

    trendingGrid.innerHTML = top3.map(productCard).join("");
    bindProductButtons(top3);
}

function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modalContent.innerHTML = "";
}

async function openDetailsModal(id) {
    setLoading(true);

    try {
        const p = await fetchJSON(`https://fakestoreapi.com/products/${id}`);

        modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-gray-50 rounded-xl p-4">
          <img src="${p.image}" alt="${p.title}" class="w-full h-64 object-contain" />
        </div>

        <div>
          <div class="text-sm text-gray-500">${p.category}</div>
          <h2 class="text-xl font-semibold mt-1">${p.title}</h2>

          <div class="mt-2 text-sm text-gray-700">
            <span class="mr-2">${stars(p.rating?.rate)}</span>
            <span class="text-gray-500">(${p.rating?.rate ?? "N/A"})</span>
          </div>

          <div class="mt-3 text-lg font-bold">$${p.price}</div>

          <p class="mt-3 text-sm text-gray-700 leading-relaxed">${p.description}</p>

          <div class="mt-5 flex gap-2">
            <button
              id="modalAddBtn"
              class="bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-black/90"
              type="button"
            >Add to Cart</button>

            <button
              id="modalBuyBtn"
              class="border rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              type="button"
            >Buy Now</button>
          </div>
        </div>
      </div>
    `;

        openModal();

        const modalAddBtn = document.getElementById("modalAddBtn");
        modalAddBtn.addEventListener("click", () => {
            addToCart(p);
        });

        const modalBuyBtn = document.getElementById("modalBuyBtn");
        modalBuyBtn.addEventListener("click", () => {
            addToCart(p);
            closeModal();
            alert("Added to cart. You can build checkout later.");
        });
    } catch (err) {
        modalContent.innerHTML = `<p class="text-red-600">Failed to load product details</p>`;
        openModal();
        console.error(err);
    } finally {
        setLoading(false);
    }
}

async function loadCategories() {
    setLoading(true);

    try {
        const categories = await fetchJSON("https://fakestoreapi.com/products/categories");
        renderCategories(categories);
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600">Failed to load categories</p>`;
        console.error(err);
    } finally {
        setLoading(false);
    }
}

async function loadAllProducts() {
    setLoading(true);

    try {
        if (allProductsCache.length === 0) {
            allProductsCache = await fetchJSON("https://fakestoreapi.com/products");
            renderTrending(allProductsCache);
        }
        renderProducts(allProductsCache);
        applySearchFilter();
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.error(err);
    } finally {
        setLoading(false);
    }
}

async function handleCategoryClick(category) {
    setLoading(true);

    try {
        const url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        const products = await fetchJSON(url);
        renderProducts(products);
        applySearchFilter();
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.error(err);
    } finally {
        setLoading(false);
    }
}

function applySearchFilter() {
    const q = (searchInput.value || "").trim().toLowerCase();
    if (!q) return;

    const filtered = currentProducts.filter((p) =>
        String(p.title || "").toLowerCase().includes(q)
    );

    productGrid.innerHTML = filtered.map(productCard).join("");
    bindProductButtons(filtered);
}

function setupUIHandlers() {
    closeModalBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    searchInput.addEventListener("input", () => applySearchFilter());
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        renderProducts(currentProducts);
    });

    cartBtn.addEventListener("click", () => {
        alert(`Cart items: ${cart.length}`);
    });

    yearEl.textContent = String(new Date().getFullYear());
}

async function init() {
    updateCartCount();
    setupUIHandlers();
    await loadCategories();
    await loadAllProducts();
}

init();