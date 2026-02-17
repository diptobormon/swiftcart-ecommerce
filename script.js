console.log("script connected");

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const loading = document.getElementById("loading");

async function loadCategories() {
    loading.classList.remove("hidden");

    try {
        const res = await fetch("https://fakestoreapi.com/products/categories");
        const categories = await res.json();

        categoryContainer.innerHTML = categories
            .map(
                (cat) => `
          <button
            class="cat-btn px-3 py-1 rounded-full border text-sm hover:bg-black hover:text-white"
            data-cat="${cat}">
            ${cat}
          </button>
        `
            )
            .join("");

        // Add click events safely (works with men's / women's)
        document.querySelectorAll(".cat-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.cat;
                handleCategoryClick(category);
            });
        });
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600">Failed to load categories</p>`;
        console.log(err);
    } finally {
        loading.classList.add("hidden");
    }
}

async function handleCategoryClick(category) {
    loading.classList.remove("hidden");
    productGrid.innerHTML = "";

    try {
        const url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        const res = await fetch(url);
        const products = await res.json();

        productGrid.innerHTML = products
            .map(
                (p) => `
          <div class="bg-white rounded-xl p-3 shadow">
            <img src="${p.image}" class="h-32 w-full object-contain" />
            <h3 class="mt-2 text-sm font-semibold">
              ${p.title.length > 30 ? p.title.slice(0, 30) + "..." : p.title}
            </h3>
            <p class="text-sm mt-1 font-bold">$${p.price}</p>
            <p class="text-xs text-gray-500 mt-1">${p.category}</p>
            <p class="text-xs mt-1">Rating: ${p.rating?.rate ?? "N/A"}</p>
          </div>
        `
            )
            .join("");
    } catch (err) {
        productGrid.innerHTML = `<p class="text-red-600">Failed to load products</p>`;
        console.log(err);
    } finally {
        loading.classList.add("hidden");
    }
}

loadCategories();
