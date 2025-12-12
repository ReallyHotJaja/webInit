const menuEl = document.getElementById("menu");
const navBtns = document.querySelectorAll("#nav button");
const orderEl = document.getElementById("order");
const priceEl = document.getElementById("price");
const totalEl = document.getElementById("total");
const submitBtn = document.getElementById("submit");

let cart = [];

dishes.sort((a, b) => a.name.localeCompare(b.name));

function createCard(dish) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}">
    <h3>${dish.name}</h3>
    <div class="sizes">
      <label><input type="radio" name="size-${dish.keyword}" value="small" checked> Мал. </label>
      <label><input type="radio" name="size-${dish.keyword}" value="medium"> Ср. </label>
      <label><input type="radio" name="size-${dish.keyword}" value="large"> Бол. </label>
    </div>
    <input type="number" min="1" value="1" class="count">
    <button type="button">Добавить</button>`;
  card.querySelector("button").addEventListener("click", () => {
    const size = card.querySelector("input[type=radio]:checked").value;
    const count = parseInt(card.querySelector(".count").value) || 1;
    addToCart(dish, size, count);
    card.classList.add("selected");
  });
  return card;
}

function renderMenu() {
  menuEl.innerHTML = "";
  const cats = ["main", "soup", "starter", "drink"];
  cats.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "menu-section";
    section.dataset.cat = cat;
    if (cat !== "main") section.classList.add("hidden");
    const container = document.createElement("div");
    container.className = "cards-row";
    dishes
      .filter((d) => d.category === cat)
      .forEach((d) => container.append(createCard(d)));
    section.append(container);
    menuEl.append(section);
  });
}

function addToCart(dish, size, count) {
  const unit = dish.sizes ? dish.sizes[size] : dish.price || 0;
  const price = unit * count;
  cart.push({ name: dish.name, keyword: dish.keyword, size, count, price });
  updateOrder();
}

function updateOrder() {
  if (cart.length === 0) {
    orderEl.textContent = "Ничего не выбрано";
    totalEl.style.display = "none";
    submitBtn.disabled = true;
    return;
  }
  orderEl.innerHTML = cart
    .map(
      (it) => `<div>${it.name} (${it.size}) × ${it.count} = ${it.price} ₽</div>`
    )
    .join("");
  const total = cart.reduce((s, i) => s + i.price, 0);
  priceEl.textContent = total;
  totalEl.style.display = "block";
  submitBtn.disabled = false;
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    document.querySelectorAll(".menu-section").forEach((sec) => {
      if (sec.dataset.cat === cat) sec.classList.remove("hidden");
      else sec.classList.add("hidden");
    });
  });
});

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    name: e.target.username.value,
    phone: e.target.phone.value,
    items: cart,
  };
  console.log("Отправлен заказ:", data);
  alert("Заказ оформлен!");
});

renderMenu();
