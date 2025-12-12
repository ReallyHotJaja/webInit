const API_BASE = "https://edu.std-900.ist.mospolytech.ru/labs/api";
const API_KEY = "a05d11cf-ccfc-490d-9cb1-a0aea2c58d5d";

const tbody = document.getElementById("orders-body");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const closeModalBtn = document.getElementById("modal-close");

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

async function getDishById(id) {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE}/dishes/${id}?api_key=${API_KEY}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`);
    const orders = await res.json();

    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderOrders(orders);
  } catch (err) {
    showNotify("Ошибка загрузки заказов: " + err.message);
  }
}

async function renderOrders(orders) {
  tbody.innerHTML = "";
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6">Пока нет заказов</td></tr>`;
    return;
  }

  for (let [i, order] of orders.entries()) {
    const dishIds = [
      order.soup_id,
      order.main_course_id,
      order.salad_id,
      order.dessert_id,
      order.drink_id,
    ].filter(Boolean);

    const dishes = [];
    let total = 0;

    for (let id of dishIds) {
      const dish = await getDishById(id);
      if (dish) {
        dishes.push(dish.name);
        total += dish.price;
      }
    }

    const deliveryTime =
      order.delivery_type === "now"
        ? "Как можно скорее (07:00–23:00)"
        : order.delivery_time || "-";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${new Date(order.created_at).toLocaleString("ru-RU")}</td>
      <td>${dishes.join(", ") || "—"}</td>
      <td>${total ? total + " ₽" : "—"}</td>
      <td>${deliveryTime}</td>
      <td>
        <i class="bi bi-eye" title="Подробнее" data-id="${
          order.id
        }" data-action="view"></i>
        <i class="bi bi-pencil" title="Редактировать" data-id="${
          order.id
        }" data-action="edit"></i>
        <i class="bi bi-trash" title="Удалить" data-id="${
          order.id
        }" data-action="delete"></i>
      </td>
    `;
    tbody.append(row);
  }
}

function openModal(title, html) {
  modalTitle.textContent = title;
  modalContent.innerHTML = html;
  modal.classList.remove("hidden");
}
closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

tbody.addEventListener("click", async (e) => {
  const icon = e.target.closest("i");
  if (!icon) return;

  const id = icon.dataset.id;
  const action = icon.dataset.action;

  if (action === "view") viewOrder(id);
  if (action === "edit") editOrder(id);
  if (action === "delete") deleteOrder(id);
});

async function viewOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}?api_key=${API_KEY}`);
  const order = await res.json();

  const dishIds = [
    order.soup_id,
    order.main_course_id,
    order.salad_id,
    order.dessert_id,
    order.drink_id,
  ].filter(Boolean);

  const dishNames = [];
  for (let id of dishIds) {
    const dish = await getDishById(id);
    if (dish) dishNames.push(`${dish.name} — ${dish.price} ₽`);
  }

  const html = `
    <p><b>Имя:</b> ${order.full_name}</p>
    <p><b>Email:</b> ${order.email}</p>
    <p><b>Телефон:</b> ${order.phone}</p>
    <p><b>Адрес:</b> ${order.delivery_address}</p>
    <p><b>Тип доставки:</b> ${order.delivery_type}</p>
    <p><b>Комментарий:</b> ${order.comment || "-"}</p>
    <hr>
    <b>Состав заказа:</b>
    <ul>${dishNames.map((d) => `<li>${d}</li>`).join("")}</ul>
    <button onclick="modal.classList.add('hidden')">ОК</button>
  `;
  openModal("Просмотр заказа", html);
}

async function editOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}?api_key=${API_KEY}`);
  const order = await res.json();

  const html = `
    <form id="edit-form">
      <label>Имя: <input name="full_name" value="${
        order.full_name
      }" required></label>
      <label>Email: <input name="email" value="${order.email}" required></label>
      <label>Телефон: <input name="phone" value="${
        order.phone
      }" required></label>
      <label>Адрес: <input name="delivery_address" value="${
        order.delivery_address
      }" required></label>
      <label>Тип доставки:
        <select name="delivery_type">
          <option value="now" ${
            order.delivery_type === "now" ? "selected" : ""
          }>Как можно скорее</option>
          <option value="by_time" ${
            order.delivery_type === "by_time" ? "selected" : ""
          }>Ко времени</option>
        </select>
      </label>
      <label>Время доставки: <input type="time" name="delivery_time" value="${
        order.delivery_time || ""
      }"></label>
      <label>Комментарий: <textarea name="comment">${
        order.comment || ""
      }</textarea></label>
      <div class="actions">
        <button type="button" id="cancel-edit">Отмена</button>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  `;
  openModal("Редактирование заказа", html);

  document.getElementById("cancel-edit").onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("edit-form").onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/orders/${id}?api_key=${API_KEY}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Ошибка обновления");

      showNotify("Заказ успешно обновлён!");
      modal.classList.add("hidden");
      loadOrders();
    } catch (err) {
      showNotify("Ошибка при обновлении: " + err.message);
    }
  };
}

function deleteOrder(id) {
  const html = `
    <p>Вы уверены, что хотите удалить заказ?</p>
    <div class="actions">
      <button id="cancel-delete">Отмена</button>
      <button id="confirm-delete" class="danger">Да</button>
    </div>
  `;
  openModal("Удаление заказа", html);

  document.getElementById("cancel-delete").onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("confirm-delete").onclick = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}?api_key=${API_KEY}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка удаления");

      showNotify("Заказ успешно удалён!");
      modal.classList.add("hidden");
      loadOrders();
    } catch (err) {
      showNotify("Ошибка удаления: " + err.message);
    }
  };
}

loadOrders();
