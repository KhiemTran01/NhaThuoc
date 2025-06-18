function GetProfileProduct(jsonFile) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  fetch(jsonFile)
    .then((response) => response.json())
    .then((data) => {
      const product = data.find((p) => p.id === productId);

      if (product) {
        document.title = product.name;
        document.getElementById("name").textContent = product.name;
        document.getElementById("ma-so").textContent = "Mã: " + product.id;
        document.getElementById("packaging").textContent = product.packaging;
        document.getElementById("buy-btn").dataset.id = product.id;

        const img1 = document.getElementById("img1");
        if (img1) {
          img1.src = product.images[0];
          img1.alt = product.images[0];
        }
        const img2 = document.getElementById("img2");
        if (img2) {
          img2.src = product.images[1];
          img2.alt = product.images[1];
        }
        const img3 = document.getElementById("img3");
        if (img3) {
          img3.src = product.images[2];
          img3.alt = product.images[2];
        }

        document.getElementById("description1").textContent =
          product.description[0];
        document.getElementById("description2").textContent =
          product.description[1];
        document.getElementById("description3").textContent =
          product.description[2];
        document.getElementById("description4").textContent =
          product.description[3];
        document.getElementById("description5").textContent =
          product.description[4];
        document.getElementById("description6").textContent =
          product.description[5];

        if (product.quantity > 0) {
          document.getElementById("logo-quantity").className =
            "fa-solid fa-circle-check fa-lg text-success fa-fade";
          document.getElementById("logo-quantity").style =
            "--fa-animation-duration: 2s; --fa-fade-opacity: 0.6;";
          document.getElementById("quantity").textContent = "Còn hàng";
          document.getElementById("quantity").className =
            "fw-normal text-success d-block";
        } else {
          document.getElementById("logo-quantity").className =
            "fa-solid fa-circle-exclamation fa-lg text-danger fa-fade";
          document.getElementById("quantity").textContent = "Hết hàng";
          document.getElementById("quantity").className =
            "fw-normal text-danger d-block";
        }

        document.getElementById("unit").textContent = product.unit;

        function parsePrice(priceStr) {
          return Number(priceStr.replace(/[^\d]/g, ""));
        }

        function parseDiscount(discountStr) {
          return Number(discountStr.replace(/[^0-9.-]/g, ""));
        }

        function formatCurrencyVND(number) {
          return number.toLocaleString("vi-VN") + "₫";
        }

        const originalPriceStr = product.originalPrice;
        const discountStr = product.discount;

        // Kiểm tra có giảm giá không
        if (!discountStr || parseDiscount(discountStr) === 0) {
          // Ẩn giá gốc nếu không có giảm giá
          document.getElementById("originalPrice").classList.add("d-none");
          document.getElementById("discountedPrice").textContent =
            formatCurrencyVND(parsePrice(originalPriceStr));
        } else {
          const originalPrice = parsePrice(originalPriceStr);
          const discount = parseDiscount(discountStr);
          const discountedPrice = originalPrice * (1 + discount / 100);

          document.getElementById("originalPrice").textContent =
            originalPriceStr;
          document.getElementById("originalPrice").classList.remove("d-none");
          document.getElementById("discountedPrice").textContent =
            formatCurrencyVND(discountedPrice);
        }
      } else {
        document.getElementById("product-title").textContent =
          "Không tìm thấy sản phẩm!";
      }
    })
    .catch((error) => {
      console.error("Lỗi khi tải dữ liệu:", error);
      document.getElementById("product-title").textContent =
        "Lỗi khi tải dữ liệu!";
    });
}

function AddCartThanhToan() {
  document.getElementById("paid").addEventListener("click", () => {
    // Xóa hết các card trong giỏ hàng
    const cartItemsContainer = document.getElementById("cart-items");
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = "";
    }

    // Đóng modal giỏ hàng
    const gioHangModalEl = document.getElementById("gioHangModal");
    const gioHangModal = bootstrap.Modal.getInstance(gioHangModalEl);
    if (gioHangModal) {
      gioHangModal.hide();
    }

    // Thay đổi nội dung thông báo
    document.getElementById("thongBaoNoiDung").textContent =
      "Đã thanh toán thành công!";

    // Mở modal thông báo
    const thongBaoModalEl = document.getElementById("thongBaoModal");
    const thongBaoModal = new bootstrap.Modal(thongBaoModalEl);
    thongBaoModal.show();
  });
}

function AddCart() {
  const btns = document.querySelectorAll(".btn-buy");
  const cartItemsContainer = document.getElementById("cart-items");

  btns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      // Lấy nội dung quantity
      const quantityText = document
        .getElementById("quantity")
        .textContent.trim();

      if (quantityText.toLowerCase() === "hết hàng") {
        // Thay đổi nội dung thông báo
        document.getElementById("thongBaoNoiDung").textContent =
          "Sản phẩm này đã hết hàng, không thể thêm vào giỏ!";

        // Mở modal thông báo
        const thongBaoModalEl = document.getElementById("thongBaoModal");
        const thongBaoModal = new bootstrap.Modal(thongBaoModalEl);
        thongBaoModal.show();
        return; // dừng không thêm vào giỏ
      }

      const id = document.getElementById("buy-btn").dataset.id;
      const name = document.getElementById("name").textContent.trim();

      const price = document
        .getElementById("discountedPrice")
        .textContent.trim();

      const img = document.getElementById("img1").src;

      const itemHTML = `
      <div class="row d-flex align-items-center justify-content-start px-3 py-2 border-bottom" data-id="${id}">
        <img src="${img}" class="img-fluid col-3" alt="${name}">
        <h5 class="col-5 fs-6 mb-0">${name}</h5>
        <h6 class="col-3 fs-6 text-danger mb-0">${price}</h6>
        <button type="button" class="btn btn-danger col-1 btn-remove">X</button>
      </div>
    `;

      cartItemsContainer.insertAdjacentHTML("beforeend", itemHTML);

      const modal = new bootstrap.Modal(
        document.getElementById("gioHangModal")
      );
      modal.show();
    });
  });

  document.getElementById("cart-items").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-remove")) {
      e.target.closest(".row").remove();
    }
  });
}

function AddCartPage() {
  const cartItemsContainer = document.getElementById("cart-items");

  // Xóa event listener cũ để tránh gắn nhiều lần
  document.querySelectorAll(".btn-buy").forEach((btn) => {
    btn.removeEventListener("click", handleAddToCart);
    btn.addEventListener("click", handleAddToCart);
  });

  function handleAddToCart(e) {
    e.preventDefault();
    const btn = e.target;
    const card = btn.closest(".card");

    // Lấy dữ liệu sản phẩm từ card
    const id = btn.getAttribute("data-id");
    const name = card.querySelector(".card-title").textContent.trim();
    const price = card.querySelector(".text-danger").textContent.trim();
    const img = card.querySelector("img").src;

    // Tạo HTML phần tử giỏ hàng
    const itemHTML = `
      <div class="row d-flex align-items-center justify-content-start px-3 py-2 border-bottom" data-id="${id}">
        <img src="${img}" class="img-fluid col-3" alt="${name}">
        <h5 class="col-5 fs-6 mb-0">${name}</h5>
        <h6 class="col-3 fs-6 text-danger mb-0">${price}</h6>
        <button type="button" class="btn btn-danger col-1 btn-remove">X</button>
      </div>
    `;

    cartItemsContainer.insertAdjacentHTML("beforeend", itemHTML);

    // Hiển thị modal giỏ hàng
    const modal = new bootstrap.Modal(document.getElementById("gioHangModal"));
    modal.show();
  }

  // Bắt sự kiện xóa sản phẩm trong giỏ hàng
  cartItemsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-remove")) {
      e.target.closest(".row").remove();
    }
  });
}

function KhuyenMai50K() {
  document.getElementById("khuyen-mai-50k").addEventListener("click", () => {
    // Thay đổi nội dung thông báo
    document.getElementById("thongBaoNoiDung").textContent =
      "Chương trình đang trong thời gian delay!! Xin quý khách thông cảm 😅.";

    // Mở modal thông báo
    const thongBaoModalEl = document.getElementById("thongBaoModal");
    const thongBaoModal = new bootstrap.Modal(thongBaoModalEl);
    thongBaoModal.show();
  });
}
