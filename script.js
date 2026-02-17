console.log("script connected");

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const loading = document.getElementById("loading");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const cartCountEl = document.getElementById("cartCount");

let activeCategory = "all";
let cart = [];

function showLoading(isLoading) {
    if (isLoading) loading.classList.remove("hidden");
    else loading.classList.add("hidden");
}

function setActiveCategory(cat) {
    activeCategory = cat;

    document.querySelectorAll(".cat-btn").forEach((btn) => {
        const isActive = btn.dataset.cat === cat;
        btn.classList.toggle("bg-indigo-600", isActive);
        btn.classList.toggle("text-white", isActive);
        btn.classList.toggle("border-indigo-600", isActive);

        btn.classList.toggle("bg-white", !isActive);
        btn.classList.toggle("text-slate-700", !isActive);
        btn.classList.toggle("border-slate-300", !isActive);
    });
}

function updateCartCount() {
    cartCountEl.textContent = String(cart.length);
}

function openModal(html) {
    modalContent.innerHTML = html;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function hideModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
});

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}

function renderCategories(categories) {
    const allCats = ["all", ...categories];

    categoryContainer.innerHTML = allCats
        .map((cat) => {
            const label = cat === "all" ? "All" : cat;
            return `
        <button
          class="cat-btn px-5 py-2 rounded-full border text-sm transition"
          data-cat="${cat}"
          type="button"
        >
          ${label}
        </button>
      `;
        })
        .join("");

    setActiveCategory("all");
}

function renderProducts(products) {
    productGrid.innerHTML = products
        .map((p) => {
            const title = p.title.length > 24 ? p.title.slice(0, 24) + "..." : p.title;
            const rating = p.rating?.rate ?? "N/A";
            const count = p.rating?.count ?? 0;

            return `
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
          <div class="bg-slate-100 p-6 flex items-center justify-center h-56">
            <img src="${p.image}" alt="${p.title}" class="max-h-40 w-auto object-contain" />
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                ${p.category}
              </span>

              <span class="text-sm text-slate-600">
                <span class="text-amber-500">★</span> ${rating} <span class="text-xs">(${count})</span>
              </span>
            </div>

            <h3 class="mt-3 font-semibold text-slate-900 leading-snug">${title}</h3>
            <p class="mt-2 font-bold text-slate-900">$${p.price}</p>

            <div class="mt-4 flex gap-2">
              <button
                class="details-btn flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100"
                data-id="${p.id}"
                type="button"
              >
                Details
              </button>

              <button
                class="add-btn flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                data-id="${p.id}"
                type="button"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
        })
        .join("");
}

async function loadCategories() {
    showLoading(true);
    try {
        const categories = await fetchJSON("https://fakestoreapi.com/products/categories");
        renderCategories(categories);
        await loadProducts("all");
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600 text-center w-full">Failed to load categories</p>`;
        console.log(err);
    } finally {
        showLoading(false);
    }
}

async function loadProducts(category) {
    showLoading(true);
    productGrid.innerHTML = "";

    try {
        const url =
            category === "all"
                ? "https://fakestoreapi.com/products"
                : `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;

        const products = await fetchJSON(url);
        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.log(err);
    } finally {
        showLoading(false);
    }
}

async function showProductDetails(id) {
    showLoading(true);
    try {
        const p = await fetchJSON(`https://fakestoreapi.com/products/${id}`);

        openModal(`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-100 rounded-xl p-6 flex items-center justify-center">
          <img src="${p.image}" alt="${p.title}" class="max-h-64 object-contain" />
        </div>

        <div>
          <h3 class="text-xl font-bold">${p.title}</h3>
          <p class="mt-2 text-slate-600 text-sm">${p.description}</p>

          <div class="mt-4 flex items-center justify-between">
            <p class="text-lg font-bold">$${p.price}</p>
            <p class="text-slate-600 text-sm">
              <span class="text-amber-500">★</span> ${p.rating?.rate ?? "N/A"} (${p.rating?.count ?? 0})
            </p>
          </div>

          <button
            class="modal-add mt-5 w-full px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            data-id="${p.id}"
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </div>
    `);
    } catch (err) {
        openModal(`<p class="text-red-600">Failed to load product details</p>`);
        console.log(err);
    } finally {
        showLoading(false);
    }
}

/*
  One click handler for everything:
  - category buttons
  - details button
  - add to cart button
  - modal add button
  This prevents duplicate listeners (the "2 then 4" bug).
*/
document.addEventListener("click", async (e) => {
    const catBtn = e.target.closest(".cat-btn");
    if (catBtn) {
        const cat = catBtn.dataset.cat;
        setActiveCategory(cat);
        await loadProducts(cat);
        return;
    }

    const detailsBtn = e.target.closest(".details-btn");
    if (detailsBtn) {
        const id = detailsBtn.dataset.id;
        await showProductDetails(id);
        return;
    }

    const addBtn = e.target.closest(".add-btn");
    if (addBtn) {
        const id = Number(addBtn.dataset.id);
        cart.push(id);
        updateCartCount();
        return;
    }

    const modalAdd = e.target.closest(".modal-add");
    if (modalAdd) {
        const id = Number(modalAdd.dataset.id);
        cart.push(id);
        updateCartCount();
        hideModal();
        return;
    }
});

loadCategories();