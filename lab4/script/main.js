const soupsEl = document.getElementById('soups');
const mealEl = document.getElementById('meals');
const drinksEl = document.getElementById('drinks');
const orderEl = document.getElementById('order');
const totalEl = document.getElementById('total');
const priceEl = document.getElementById('price');
const submitBtn = document.getElementById('submit');
const soupKey = document.getElementById('soup-keyword');
const mealKey = document.getElementById('meal-keyword');
const drinkKey = document.getElementById('drink-keyword');

let selected = { soup: null, meal:null, drink: null };

dishes.sort((a, b) => a.name.localeCompare(b.name));

function createCard(dish) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.dish = dish.keyword;

  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}"> 
    <h3>${dish.name}</h3>
    <p>${dish.count}</p>
    <p>${dish.price} ₽</p>
    <button>Добавить</button>
  `;

  card.querySelector('button').addEventListener('click', () => selectDish(dish));
  return card;
}

function renderMenu() {
  dishes.forEach(dish => {
    const card = createCard(dish);
    if (dish.category === 'soup') soupsEl.append(card);
    if (dish.category === 'meal') mealEl.append(card);
    if (dish.category === 'drink') drinksEl.append(card);
  });
}

function selectDish(dish) {
  document.querySelectorAll(`[data-dish]`).forEach(el => el.classList.remove('selected'));
  selected[dish.category] = dish;
  document.querySelector(`[data-dish="${dish.keyword}"]`).classList.add('selected');
  updateOrder();
}

function updateOrder() {
  const soup = selected.soup ? `${selected.soup.name} — ${selected.soup.price} ₽` : null;
  const meal =selected.meal ? `${selected.meal.name} — ${selected.meal.price} ₽` : null;
  const drink = selected.drink ? `${selected.drink.name} — ${selected.drink.price} ₽` : null;

  if (!soup && !meal && !drink) {
    orderEl.textContent = 'Ничего не выбрано';
    totalEl.style.display = 'none';
    submitBtn.disabled = true;
    soupKey.value = mealKey.value = drinkKey.value = '';
    return;
  }

  orderEl.innerHTML = `
    <div>Суп: ${soup || 'Блюдо не выбрано'}</div>
    <div>Основное блюдо: ${meal || 'Блюдо не выбрано'}</div>
    <div>Напиток: ${drink || 'Напиток не выбран'}</div>
  `;

  const total = (selected.soup?.price || 0) + (selected.meal?.price || 0) + (selected.drink?.price || 0);
  priceEl.textContent = total;
  totalEl.style.display = 'block';
  submitBtn.disabled = false;

  soupKey.value = selected.soup ? selected.soup.keyword : '';
  mealKey.value = selected.meal ? selected.meal.keyword : '';
  drinkKey.value = selected.drink ? selected.drink.keyword : '';
}

document.getElementById('order-form').addEventListener('submit', e => {
  e.preventDefault();

  const orderData = {
    name: e.target.username.value,
    
    phone: e.target.phone.value,
    soup: selected.soup?.keyword,
    meal: selected.meal?.keyword,
    drink: selected.drink?.keyword,
    total: (selected.soup?.price || 0) + (selected.meal?.price || 0) + (selected.drink?.price || 0),
  };

  console.log("Отправлен заказ:", orderData);
  alert('Заказ успешно оформлен!');
});

renderMenu();