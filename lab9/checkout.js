const API_BASE = "https://edu.std-900.ist.mospolytech.ru/labs/api";
const API_KEY = "a05d11cf-ccfc-490d-9cb1-a0aea2c58d5d";
let dishes = [];

function showNotify(message) {
  const notify = document.getElementById("notify");
  const text = document.getElementById("notify-text");
  const ok = document.getElementById("notify-ok");

  text.textContent = message;
  notify.classList.remove("hidden");

  const close = () => {
    notify.classList.add("hidden");
    ok.removeEventListener("click", close);
  };
  ok.addEventListener("click", close);
}

async function loadDishes() {
  const res = await fetch(`${API_BASE}/dishes?api_key=${API_KEY}`);
  dishes = await res.json();
  renderOrder();
}

function renderOrder() {
  const orderList = document.getElementById("order-list");
  const saved = JSON.parse(localStorage.getItem("comboOrder") || "{}");
  orderList.innerHTML = "";

  if (Object.keys(saved).length === 0) {
    orderList.innerHTML = `Ничего не выбрано. <a href="index.html">Собрать ланч</a>`;
    return;
  }

  let total = 0;

  for (let [type, keyword] of Object.entries(saved)) {
    const dish = dishes.find((d) => d.keyword === keyword);
    if (!dish) continue;
    total += dish.price;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p>${dish.price} ₽</p>
      <button>Удалить</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      delete saved[type];
      localStorage.setItem("comboOrder", JSON.stringify(saved));
      renderOrder();
    });

    orderList.append(card);
  }

  orderList.style.display = "flex";
  orderList.style.flexWrap = "wrap";
  orderList.style.justifyContent = "center";
  orderList.style.gap = "20px";
  orderList.style.textAlign = "center";

  document.getElementById("price").textContent = total;
}

document.getElementById("order-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const saved = JSON.parse(localStorage.getItem("comboOrder") || "{}");
  if (!Object.keys(saved).length) {
    showNotify("Выберите блюда перед оформлением заказа!");
    return;
  }

  const getDishId = (cat) => {
    const keyword = saved[cat];
    const dish = dishes.find((d) => d.keyword === keyword);
    return dish ? dish.id : null;
  };

  const data = {
    full_name: e.target.username.value,
    phone: e.target.phone.value,
    email: e.target.email?.value || "noemail@example.com",
    delivery_address: e.target.address?.value || "г. Москва",
    delivery_type: "now",
    soup_id: getDishId("soup"),
    main_course_id: getDishId("main"),
    salad_id: getDishId("starter"),
    dessert_id: getDishId("dessert"),
    drink_id: getDishId("drink"),
  };

  try {
    const res = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Ошибка отправки");

    showNotify("✅ Заказ успешно оформлен!");
    localStorage.removeItem("comboOrder");
    setTimeout(() => (window.location = "index.html"), 2000);
  } catch (err) {
    showNotify("❌ Не удалось оформить заказ: " + err.message);
  }
});

loadDishes();