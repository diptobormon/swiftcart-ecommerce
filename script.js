console.log("script connected");

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const trendingGrid = document.getElementById("trendingGrid");
const loading = document.getElementById("loading");

const cartCountEl = document.getElementById("cartCount");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModal");

let activeCategory = "all";
let currentProducts = [];
let cart = loadCartFromStorage();

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
    cartCountEl.textContent = String(cart.length);
}

function setLoading(isLoading) {
    if (isLoading) loading.classList.remove("hidden");
    else loading.classList.add("hidden");
}

function normalizeCategoryLabel(cat) {
    // match reference labels in UI
    if (cat === "men's clothing") return "Men's Clothing";
    if (cat === "women's clothing") return "Women's Clothing";
    if (cat === "electronics") return "Electronics";
    if (cat === "jewelery") return "Jewelery";
    return cat;
}

function renderStars(rate) {
    const r = typeof rate === "number" ? rate : 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    const fullStar = "★".repeat(full);
    const halfStar = half ? "★" : "";
    const emptyStar = "☆".repeat(empty);

    return `<span class="text-yellow-500 text-sm">${fullStar}${halfStar}${emptyStar}</span>`;
}

function truncate(text, maxLen) {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

function setActiveCategoryButton() {
    document.querySelectorAll("[data-category]").forEach((btn) => {
        const cat = btn.getAttribute("data-category");
        const isActive = cat === activeCategory;

        btn.className =
            "px-5 py-2 rounded-full text-sm border transition " +
            (isActive
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100");
    });
}

function renderCategoryButtons(categories) {
    // include "All" like reference design
    const allBtn = `<button data-category="all" class="px-5 py-2 rounded-full text-sm border">All</button>`;

    const btns = categories
        .map((cat) => {
            return `<button data-category="${cat}" class="px-5 py-2 rounded-full text-sm border">
        ${normalizeCategoryLabel(cat)}
      </button>`;
        })
        .join("");

    categoryContainer.innerHTML = allBtn + btns;
    setActiveCategoryButton();
}

function renderProductCard(p) {
    return `
    <div class="bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
      <div class="card-img-bg rounded-xl p-4 flex items-center justify-center">
        <img src="${p.image}" alt="${p.title}" class="h-36 w-full object-contain" />
      </div>

      <div class="mt-3 flex items-center justify-between">
        <span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
          ${normalizeCategoryLabel(p.category)}
        </span>
        <span class="text-xs text-gray-500 flex items-center gap-1">
          <span class="text-yellow-500">★</span>
          ${p.rating?.rate ?? "N/A"} (${p.rating?.count ?? 0})
        </span>
      </div>

      <h3 class="mt-2 font-semibold text-sm">${truncate(p.title, 26)}</h3>
      <p class="mt-1 font-bold">$${p.price}</p>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          class="detail-btn w-full px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-100"
          data-id="${p.id}"
          type="button"
        >
          Details
        </button>

        <button
          class="add-btn w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          data-id="${p.id}"
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  `;
}

function renderProducts(products) {
    currentProducts = products;
    productGrid.innerHTML = products.map(renderProductCard).join("");
}

async function loadCategories() {
    try {
        const res = await fetch("https://fakestoreapi.com/products/categories");
        const categories = await res.json();
        renderCategoryButtons(categories);
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600">Failed to load categories</p>`;
        console.log(err);
    }
}

async function loadAllProducts() {
    setLoading(true);
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        const products = await res.json();
        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.log(err);
    } finally {
        setLoading(false);
    }
}

async function loadProductsByCategory(category) {
    setLoading(true);
    try {
        const url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        const res = await fetch(url);
        const products = await res.json();
        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.log(err);
    } finally {
        setLoading(false);
    }
}

async function loadTrending() {
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        const products = await res.json();

        // sort by rating desc, take top 3
        const top3 = [...products]
            .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
            .slice(0, 3);

        trendingGrid.innerHTML = top3.map(renderProductCard).join("");
    } catch (err) {
        trendingGrid.innerHTML = `<p class="text-red-600">Failed to load trending products</p>`;
        console.log(err);
    }
}

async function openProductModal(productId) {
    try {
        setLoading(true);
        const res = await fetch(`https://fakestoreapi.com/products/${productId}`);
        const p = await res.json();

        modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-indigo-50 rounded-xl p-5 flex items-center justify-center">
          <img src="${p.image}" alt="${p.title}" class="h-64 w-full object-contain" />
        </div>

        <div>
          <span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
            ${normalizeCategoryLabel(p.category)}
          </span>

          <h3 class="mt-3 text-xl font-bold">${p.title}</h3>

          <div class="mt-2 flex items-center justify-between">
            <p class="text-lg font-bold">$${p.price}</p>
            <div class="text-sm">
              ${renderStars(p.rating?.rate)}
              <span class="text-gray-500 ml-2">${p.rating?.rate ?? "N/A"} (${p.rating?.count ?? 0})</span>
            </div>
          </div>

          <p class="mt-3 text-sm text-gray-600 leading-relaxed">${p.description}</p>

          <div class="mt-5 flex gap-2">
            <button
              class="add-btn px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
              data-id="${p.id}"
              type="button"
            >
              Add to Cart
            </button>

            <button
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-100"
              type="button"
              id="buyNowBtn"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
}

function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function addToCart(productId) {
    // add once per click (no duplicate listeners now)
    cart.push({ id: Number(productId), addedAt: Date.now() });
    saveCartToStorage();
    updateCartCount();
}

/* -------------------------
   Single event listeners
   (prevents double add bug)
-------------------------- */

// Category click (event delegation)
categoryContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;

    activeCategory = btn.getAttribute("data-category");
    setActiveCategoryButton();

    if (activeCategory === "all") loadAllProducts();
    else loadProductsByCategory(activeCategory);
});

// Product grid click (details/add) - event delegation
document.addEventListener("click", (e) => {
    const detailBtn = e.target.closest(".detail-btn");
    const addBtn = e.target.closest(".add-btn");

    if (detailBtn) {
        const id = detailBtn.getAttribute("data-id");
        openProductModal(id);
        return;
    }

    if (addBtn) {
        const id = addBtn.getAttribute("data-id");
        addToCart(id);
    }
});

// Modal close
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

/* -------------------------
   Init
-------------------------- */
updateCartCount();
loadCategories();
loadTrending();
loadAllProducts();