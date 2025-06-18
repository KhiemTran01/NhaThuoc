function renderCarouselProductCards({
  jsonPath,
  containerId,
  countproduct,
  filterBrand = null,
  priceMin = null,
  priceMax = null,
  sortOrder = "asc",
}) {
  const batchSize = 5;
  let products = [];

  async function fetchProducts() {
    try {
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error("Lỗi HTTP " + res.status);
      products = await res.json();

      if (filterBrand && filterBrand !== "all-product") {
        products = products.filter((product) => product.brand === filterBrand);
      }

      function getDiscountedPrice(product) {
        const originalPrice = parsePrice(product.originalPrice);
        const discountPercent = parseDiscount(product.discount);
        return discountPercent > 0
          ? originalPrice * (1 - discountPercent / 100)
          : originalPrice;
      }

      if (priceMin != null) {
        products = products.filter(
          (product) => getDiscountedPrice(product) >= priceMin
        );
      }

      if (priceMax != null) {
        products = products.filter(
          (product) => getDiscountedPrice(product) <= priceMax
        );
      }

      products.sort((a, b) => {
        const priceA = getDiscountedPrice(a);
        const priceB = getDiscountedPrice(b);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });

      const countElement = document.getElementById(countproduct);
      if (countElement) {
        countElement.textContent = `${products.length} Sản phẩm`;
      }

      renderCarousel();
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  }

  function parsePrice(priceStr) {
    return priceStr ? Number(priceStr.replace(/[^\d]/g, "")) : NaN;
  }

  function parseDiscount(discountStr) {
    return discountStr ? Number(discountStr.replace(/[^\d]/g, "")) : 0;
  }

  function formatCurrency(value) {
    return value.toLocaleString("vi-VN") + "₫";
  }

  function renderCarousel() {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const totalPages = Math.ceil(products.length / batchSize);

    for (let page = 0; page < totalPages; page++) {
      const carouselItem = document.createElement("div");
      carouselItem.className = "carousel-item" + (page === 0 ? " active" : "");

      const row = document.createElement("div");
      row.className =
        "d-flex justify-content-md-around justify-content-around gap-2  flex-wrap px-4 py-3";

      const batch = products.slice(page * batchSize, (page + 1) * batchSize);

      batch.forEach((product) => {
        const {
          id,
          name,
          images,
          discount,
          packaging,
          originalPrice: originalPriceStr,
          unit,
          promotion,
        } = product;

        const discountPercent = parseDiscount(discount);
        const originalPrice = parsePrice(originalPriceStr);
        const discountedPrice =
          discountPercent > 0
            ? originalPrice * (1 - discountPercent / 100)
            : originalPrice;

        const promotionCheck = promotion
          ? `<span class="badge bg-primary position-absolute promotion d-block"><i class="fa-solid fa-gift fa-sm text-white"></i> ${promotion}</span>`
          : "";

        const card = document.createElement("div");
        card.className = "card position-relative";
        card.style.width = "13rem";
        card.style.height = "25rem";

        card.innerHTML = `
          <a href="product-detail.html?id=${id}" style="text-decoration: none; color: black" class="p-0 m-0">
            <img src="${
              images?.[0] || ""
            }" class="card-img-top" alt="${name}" />
            <div class="card-body">
              <span class="badge bg-primary position-absolute giam-gia ${
                discountPercent === 0 ? "d-none" : ""
              }">-${discountPercent}%</span>
              ${promotionCheck}
              <span class="badge bg-primary position-absolute packaging">${packaging}</span>
              <h5 class="card-title text-truncate">${name}</h5>
              <p class="card-text h-25 fs-5 mt-3">
                <span class="text-danger fw-bold fs-5">${formatCurrency(
                  discountedPrice
                )}</span>
                /<span class="text-dark fs-5"> ${unit}</span><br />
                <span class="fs-5 text-decoration-line-through text-secondary ${
                  discountPercent === 0 ? "d-none" : ""
                }">${formatCurrency(originalPrice)}</span>
              </p>
              <a href="#" data-id="${id}" class="btn btn-buy w-100 mt-4">Thêm vào giỏ</a>
            </div>
          </a>
        `;

        row.appendChild(card);
      });

      carouselItem.appendChild(row);
      container.appendChild(carouselItem);
    }

    // Optional: gọi AddCartPage() nếu cần tương tác thêm
    if (typeof AddCartPage === "function") AddCartPage();
  }

  fetchProducts();
}
