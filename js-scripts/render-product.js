function renderProductCards({
  jsonPath,
  containerId,
  loadMoreBtnId,
  countproduct,
  filterBrand = null,
  priceMin = null,
  priceMax = null,
  sortOrder = "asc",
  productDetail,
}) {
  let products = [];
  let currentIndex = 0;
  const batchSize = 14;

  async function fetchProducts() {
    try {
      console.log("Bắt đầu tải dữ liệu từ", jsonPath);
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error("HTTP error " + res.status);
      products = await res.json();
      console.log("Dữ liệu tải xong, có", products.length, "sản phẩm");

      if (filterBrand && filterBrand !== "all-product") {
        products = products.filter(
          (product) => product.brand.toLowerCase() === filterBrand.toLowerCase()
        );
      }

      function getDiscountedPrice(product) {
        const originalPrice = parsePrice(product.originalPrice);
        const discountPercent = parseDiscount(product.discount);
        return discountPercent > 0
          ? originalPrice * (1 - discountPercent / 100)
          : originalPrice;
      }

      if (priceMin != null) {
        products = products.filter((product) => {
          const discountedPrice = getDiscountedPrice(product);
          return !isNaN(discountedPrice) && discountedPrice >= priceMin;
        });
      }
      if (priceMax != null) {
        products = products.filter((product) => {
          const discountedPrice = getDiscountedPrice(product);
          return !isNaN(discountedPrice) && discountedPrice <= priceMax;
        });
      }

      products.sort((a, b) => {
        const priceA = getDiscountedPrice(a);
        const priceB = getDiscountedPrice(b);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });

      currentIndex = 0;

      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";

      renderNextBatch();

      const countElement = document.getElementById(countproduct);
      if (countElement) {
        countElement.textContent = `${products.length} Sản phẩm`;
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }

  function parsePrice(priceStr) {
    if (!priceStr) return NaN;
    return Number(priceStr.replace(/[^\d]/g, ""));
  }

  function parseDiscount(discountStr) {
    if (!discountStr) return 0;
    return Number(discountStr.replace(/[^\d]/g, ""));
  }

  function formatCurrency(value) {
    return value.toLocaleString("vi-VN") + "₫";
  }

  function renderNextBatch() {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Không tìm thấy container với id:", containerId);
      return;
    }

    const batch = products.slice(currentIndex, currentIndex + batchSize);

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

      const promotionCheck =
        promotion !== ""
          ? `<span class="badge bg-primary position-absolute promotion d-block"><span class="fa-solid fa-gift text-white fa-sm"></span> ${promotion}</span>`
          : `<span class="badge bg-primary position-absolute promotion d-none"><span class="fa-solid fa-gift text-white fa-sm"></span> ${promotion}</span>`;

      const card = document.createElement("div");
      card.className = "card position-relative";
      card.style.width = "13rem";
      card.style.height = "25rem";

      card.innerHTML = `
  <div class="d-flex flex-column h-100">
    <a href="${productDetail}?id=${id}" style="text-decoration: none; color: black" class="p-0 m-0">
      <img style="width: 148px; height: 148px;" src="${
        images && images.length > 0 ? images[0] : ""
      }" class="card-img-top" alt="${name}"/>
    </a>
    <div class="card-body d-flex flex-column flex-grow-1">
      <span class="badge bg-primary position-absolute giam-gia ${
        discountPercent === 0 ? "d-none" : ""
      }">-${discountPercent}%</span>
      ${promotionCheck}
      <span class="badge bg-primary position-absolute packaging">${packaging}</span>
      <h5 class="card-title text-truncate">${name}</h5>
      <p class="card-text h-25 fs-5">
        <span class="text-danger fw-bold fs-5">${formatCurrency(
          discountedPrice
        )}</span>
        /<span class="text-dark fs-5"> ${unit}</span><br />
        <span class="fs-5 text-decoration-line-through text-secondary ${
          discountPercent === 0 ? "d-none" : ""
        }">${formatCurrency(originalPrice)}</span>
      </p>
      <div class="mt-auto">
        <button href="${productDetail}?id=${id}" data-id="${id}" class="btn btn-buy w-100">Thêm vào giỏ</button>
      </div>
    </div>
  </div>
`;

      container.appendChild(card);
    });

    currentIndex += batchSize;

    const loadMoreBtn = document.getElementById(loadMoreBtnId);
    if (currentIndex >= products.length && loadMoreBtn) {
      loadMoreBtn.style.display = "none";
    } else if (loadMoreBtn) {
      loadMoreBtn.style.display = "block";
    }
    AddCartPage();
  }

  const loadMoreBtn = document.getElementById(loadMoreBtnId);
  if (loadMoreBtn) {
    loadMoreBtn.removeEventListener("click", renderNextBatch);
    loadMoreBtn.addEventListener("click", renderNextBatch);
  } else {
    console.warn("Không tìm thấy nút xem thêm với id:", loadMoreBtnId);
  }

  fetchProducts();
}
