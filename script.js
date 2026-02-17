console.log("script connected");

const categoryContainer = document.getElementById("categoryContainer");
const productGrid = document.getElementById("productGrid");
const loading = document.getElementById("loading");

let activeCategory = "";

function setLoading(isLoading) {
    if (!loading) return;
    if (isLoading) loading.classList.remove("hidden");
    else loading.classList.add("hidden");
}

function setActiveButton(category) {
    const buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach((b) => {
        b.classList.remove("bg-black", "text-white");
        b.classList.add("bg-white");
    });

    const activeBtn = document.querySelector(`.cat-btn[data-cat="${CSS.escape(category)}"]`);
    if (activeBtn) {
        activeBtn.classList.remove("bg-white");
        activeBtn.classList.add("bg-black", "text-white");
    }
}

function renderCategories(categories) {
    categoryContainer.innerHTML = categories
        .map(
            (cat) => `
        <button
            type="button"
            class="cat-btn px-3 py-1 rounded-full border text-sm bg-white hover:bg-black hover:text-white transition"
            data-cat="${cat}">
            ${cat}
        </button>
    `
        )
        .join("");

    document.querySelectorAll(".cat-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const category = btn.dataset.cat;
            handleCategoryClick(category);
        });
    });
}

function renderProducts(products) {
    productGrid.innerHTML = products
        .map(
            (p) => `
        <div class="bg-white rounded-xl p-3 shadow border">
            <img src="${p.image}" alt="${p.title}" class="h-32 w-full object-contain" />
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
}

async function loadCategories() {
    setLoading(true);

    try {
        const res = await fetch("https://fakestoreapi.com/products/categories");
        const categories = await res.json();

        renderCategories(categories);

        if (categories.length > 0) {
            activeCategory = categories[0];
            setActiveButton(activeCategory);
            await handleCategoryClick(activeCategory);
        }
    } catch (err) {
        categoryContainer.innerHTML = `<p class="text-red-600">Failed to load categories</p>`;
        console.log(err);
    } finally {
        setLoading(false);
    }
}

async function handleCategoryClick(category) {
    if (!category) return;

    activeCategory = category;
    setActiveButton(activeCategory);

    setLoading(true);
    productGrid.innerHTML = "";

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

loadCategories();
