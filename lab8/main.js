const API_BASE = "https://edu.std-900.ist.mospolytech.ru/labs/api";
const API_KEY = "a05d11cf-ccfc-490d-9cb1-a0aea2c58d5d";

const menuEl = document.getElementById("menu");
const navBtns = document.querySelectorAll("#nav button");
const slots = document.querySelectorAll(".slot");
const priceEl = document.getElementById("price");
const orderForm = document.getElementById("order-form");

let activeSlot = null;
let dishes = [];

const categoryMap = {
  "main-course": "main",
  salad: "starter",
  soup: "soup",
  drink: "drink",
  dessert: "dessert",
};

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
  try {
    const res = await fetch(`${API_BASE}/dishes?api_key=${API_KEY}`);
    if (!res.ok) throw new Error("Ошибка загрузки данных с сервера");
    dishes = await res.json();
    dishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    renderMenu();
    restoreCombo();
  } catch (err) {
    console.error(err);
    showNotify("Не удалось загрузить блюда с сервера!");
  }
}

function saveToLocalStorage() {
  const order = {};
  slots.forEach((slot) => {
    if (slot.dataset.item) order[slot.dataset.type] = slot.dataset.item;
  });
  localStorage.setItem("comboOrder", JSON.stringify(order));
}

function restoreCombo() {
  const saved = JSON.parse(localStorage.getItem("comboOrder") || "{}");
  Object.entries(saved).forEach(([type, keyword]) => {
    const dish = dishes.find((d) => d.keyword === keyword);
    const slot = [...slots].find((s) => s.dataset.type === type);
    if (dish && slot) {
      slot.dataset.item = dish.keyword;
      slot.textContent = `${dish.name}`;
      slot.classList.add("filled");
    }
  });
  updatePrice();
}

function createCard(dish) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}">
    <h3>${dish.name}</h3>
    <p>${dish.price} ₽</p>
    <button>Выбрать</button>
  `;

  card.querySelector("button").addEventListener("click", () => {
    if (!activeSlot) {
      showNotify("Сначала выберите слот в комбо!");
      return;
    }

    const catFromAPI = categoryMap[dish.category];
    if (activeSlot.dataset.type !== catFromAPI) {
      showNotify("Это блюдо нельзя поместить в этот раздел!");
      return;
    }

    activeSlot.dataset.item = dish.keyword;
    activeSlot.textContent = dish.name;
    activeSlot.classList.add("filled");

    saveToLocalStorage();
    updatePrice();
  });

  return card;
}

function renderMenu() {
  menuEl.innerHTML = "";
  const cats = ["soup", "main", "starter", "dessert", "drink"];

  cats.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "menu-section";
    section.dataset.cat = cat;
    if (cat !== "soup") section.classList.add("hidden");

    const row = document.createElement("div");
    row.className = "cards-row";

    dishes
      .filter((d) => categoryMap[d.category] === cat)
      .forEach((d) => row.append(createCard(d)));

    section.append(row);
    menuEl.append(section);
  });
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.cat;
    document.querySelectorAll(".menu-section").forEach((sec) => {
      sec.classList.toggle("hidden", sec.dataset.cat !== cat);
    });
  });
});

slots.forEach((slot) => {
  slot.addEventListener("click", () => {
    slots.forEach((s) => s.classList.remove("selected"));
    slot.classList.add("selected");
    activeSlot = slot;
  });
});

function updatePrice() {
  const saved = JSON.parse(localStorage.getItem("comboOrder") || "{}");
  let total = 0;
  for (let key in saved) {
    const dish = dishes.find((d) => d.keyword === saved[key]);
    if (dish) total += dish.price;
  }
  priceEl.textContent = total;

  const checkoutPanel = document.getElementById("checkout-panel");
  if (checkoutPanel) checkoutPanel.style.display = total ? "block" : "none";
}

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const saved = JSON.parse(localStorage.getItem("comboOrder") || "{}");
    const filled = Object.keys(saved).length >= 5;

    if (!filled) {
      showNotify("Выберите все блюда перед оформлением заказа!");
      return;
    }

    const data = {
      full_name: e.target.username.value,
      phone: e.target.phone.value,
      email: e.target.email ? e.target.email.value : "test@example.com",
      delivery_address: "Москва, ул. Тестовая 1",
      delivery_type: "now",
      comment: "Заказ с лендинга",
      ...Object.fromEntries(
        Object.entries(saved).map(([key, val]) => [`${key}_id`, val])
      ),
    };

    try {
      const res = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.error && result.error.includes("10 заказов")) {
        showNotify(
          "Вы достигли лимита в 10 заказов. Удалите старые заказы в разделе 'История заказов'."
        );
        return;
      }

      if (!res.ok) throw new Error(result.error || "Ошибка оформления заказа");

      showNotify("Заказ успешно оформлен!");
      localStorage.removeItem("comboOrder");
    } catch (err) {
      showNotify("Не удалось оформить заказ: " + err.message);
    }
  });
}

loadDishes();
