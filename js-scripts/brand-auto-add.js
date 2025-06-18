function loadBrandButtons(jsonPath, containerId) {
  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error("Lỗi khi fetch JSON");
      return res.json();
    })
    .then((brands) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      brands.forEach((brand) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-primary m-2 btn-filter";
        btn.id = brand.id;

        const img = document.createElement("img");
        img.src = brand.img;
        img.alt = brand.alt;
        img.className = "img-fluid";

        btn.appendChild(img);
        container.appendChild(btn);
      });
    })
    .catch((err) => console.error("Lỗi:", err));
}
