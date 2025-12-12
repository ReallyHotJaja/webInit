const menuEl = document.getElementById("menu");
const navBtns = document.querySelectorAll("#nav button");
const slots = document.querySelectorAll(".slot");
const priceEl = document.getElementById("price");

let dishes = [];
let activeSlot = null;

const categoryMap = {
  "main-course": "main",
  main: "main",
  mains: "main",
  hot: "main",

  soup: "soup",
  soups: "soup",

  salad: "starter",
  starter: "starter",
  salads: "starter",

  dessert: "dessert",
  sweets: "dessert",
  desserts: "dessert",

  drink: "drink",
  drinks: "drink",
  beverages: "drink",
};

const categoryNames = {
  main: "Главные блюда",
  soup: "Супы",
  starter: "Салаты",
  dessert: "Десерты",
  drink: "Напитки",
};

const slotNames = {
  main: "Главное",
  soup: "Суп",
  starter: "Салат",
  dessert: "Десерт",
  drink: "Напиток",
};

async function loadDishes() {
  try {
    const response = await fetch(
      "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes"
    );
    dishes = await response.json();

    dishes.sort((a, b) => a.name.localeCompare(b.name));

    renderNavButtons();
    renderMenu();
    initNavEvents();
  } catch (err) {
    alert("Ошибка загрузки данных!");
  }
}

function renderNavButtons() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";

  const categories = ["main", "soup", "starter", "dessert", "drink"];

  categories.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.dataset.cat = cat;
    btn.textContent = categoryNames[cat];
    if (i === 0) btn.classList.add("active");
    nav.append(btn);
  });
}

function renderMenu() {
  menuEl.innerHTML = "";

  const categories = ["main", "soup", "starter", "dessert", "drink"];

  categories.forEach((cat, index) => {
    const section = document.createElement("section");
    section.className = "menu-section";
    section.dataset.cat = cat;
    if (index !== 0) section.classList.add("hidden");

    const row = document.createElement("div");
    row.className = "cards-row";

    dishes
      .filter((d) => categoryMap[d.category] === cat)
      .forEach((d) => row.append(createCard(d)));

    section.append(row);
    menuEl.append(section);
  });
}

function createCard(dish) {
  const cat = categoryMap[dish.category];

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}">
    <h3>${dish.name}</h3>
    <p>${dish.price} ₽</p>
    <button type="button">Выбрать</button>
  `;

  card.querySelector("button").addEventListener("click", () => {
    if (!activeSlot) {
      alert("Сначала выберите слот в комбо!");
      return;
    }

    if (activeSlot.dataset.type !== cat) {
      alert("Это блюдо нельзя поместить в этот раздел!");
      return;
    }

    activeSlot.dataset.item = dish.keyword;
    activeSlot.textContent = `${slotNames[cat]}: ${dish.name}`;
    activeSlot.classList.add("filled");

    updatePrice();
  });

  return card;
}

function initNavEvents() {
  const btns = document.querySelectorAll("#nav button");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.dataset.cat;

      document.querySelectorAll(".menu-section").forEach((sec) => {
        sec.dataset.cat === cat
          ? sec.classList.remove("hidden")
          : sec.classList.add("hidden");
      });
    });
  });
}

slots.forEach((slot) => {
  slot.addEventListener("click", () => {
    slots.forEach((s) => s.classList.remove("selected"));
    slot.classList.add("selected");
    activeSlot = slot;
  });
});

function updatePrice() {
  let total = 0;

  slots.forEach((slot) => {
    if (slot.dataset.item) {
      const dish = dishes.find((d) => d.keyword === slot.dataset.item);
      if (dish) total += dish.price;
    }
  });

  priceEl.textContent = total;
}

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const filled = [...slots].every((s) => s.dataset.item);

  if (!filled) {
    alert("Выберите все позиции комбо!");
    return;
  }

  const order = {
    name: e.target.username.value,
    phone: e.target.phone.value,
    adress: e.target.address.value,
    email: e.target.email.value,
    combo: [...slots].map((s) => s.textContent),
    total: priceEl.textContent,
  };

  console.log("ИТОГОВЫЙ ЗАКАЗ:", order);
  alert("Комбо оформлено! Свой заказ вы можете просмотреть в консоли.");
});

loadDishes();
