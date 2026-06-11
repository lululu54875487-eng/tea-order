const defaultTemplates = [
  {
    id: "50lan",
    type: "drink",
    names: ["50嵐", "五十嵐", "50 lan"],
    items: [
      ["四季春青茶", 35],
      ["茉莉綠茶", 30],
      ["珍珠奶茶", 50],
      ["波霸奶茶", 50],
      ["冰淇淋紅茶", 50],
      ["檸檬青茶", 55],
      ["8冰綠", 45],
      ["紅茶拿鐵", 55]
    ]
  },
  {
    id: "kebuke",
    type: "drink",
    names: ["可不可", "可不可熟成紅茶", "kebuke"],
    items: [
      ["熟成紅茶", 35],
      ["麗春紅茶", 35],
      ["春芽綠茶", 35],
      ["白玉歐蕾", 65],
      ["胭脂紅茶", 45],
      ["檸果紅茶", 55],
      ["熟成冷露", 35],
      ["雪藏紅茶", 60]
    ]
  },
  {
    id: "milkshop",
    type: "drink",
    names: ["迷客夏", "milkshop"],
    items: [
      ["珍珠紅茶拿鐵", 65],
      ["大正紅茶拿鐵", 60],
      ["伯爵紅茶拿鐵", 60],
      ["青檸香茶", 55],
      ["柳丁綠茶", 65],
      ["牧場鮮奶茶", 65],
      ["芋頭鮮奶", 75],
      ["蜂蜜檸檬晶凍", 70]
    ]
  },
  {
    id: "guiji",
    type: "drink",
    names: ["龜記", "guiji"],
    items: [
      ["紅柚翡翠", 75],
      ["翡翠雷夢", 60],
      ["極品紅茶", 35],
      ["三韻紅萱", 40],
      ["冬瓜鐵觀音", 45],
      ["鮮乳坊紅茶拿鐵", 65],
      ["阿源楊桃紅茶", 55],
      ["蜜香珍珠紅茶", 55]
    ]
  },
  {
    id: "bafang",
    type: "meal",
    names: ["八方", "八方雲集", "bafang"],
    items: [
      ["招牌鍋貼", 65],
      ["韭菜鍋貼", 70],
      ["韓式辣味鍋貼", 75],
      ["招牌水餃", 65],
      ["玉米水餃", 75],
      ["酸辣湯", 35],
      ["乾麵", 45],
      ["珍珠餛飩湯", 55]
    ]
  },
  {
    id: "mwd",
    type: "meal",
    names: ["麥味登", "my warm day", "mwd"],
    items: [
      ["鮪魚蛋餅", 45],
      ["薯餅蛋餅", 50],
      ["卡滋雞腿堡", 80],
      ["培根滿分堡", 65],
      ["蘿蔔糕", 45],
      ["鐵板麵", 75],
      ["嫩煎雞腿飯", 115],
      ["紅茶", 25]
    ]
  },
  {
    id: "mos",
    type: "meal",
    names: ["摩斯", "mos", "摩斯漢堡"],
    items: [
      ["摩斯漢堡", 75],
      ["海洋珍珠堡", 95],
      ["燒肉珍珠堡", 90],
      ["摘鮮綠炸蝦堡", 95],
      ["雞塊", 60],
      ["薯條", 45],
      ["冰紅茶", 35],
      ["玉米濃湯", 45]
    ]
  }
];

function createEmptyState() {
  return {
    orderId: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type: "drink",
    shopName: "",
    deadline: "",
    locked: false,
    menu: [],
    orders: [],
    templates: []
  };
}

let state = loadInitialState();
let lastOrder = null;
let remoteEnabled = false;
let remoteSaveTimer = null;
let remoteKind = "local";
let gasUrl = localStorage.getItem("tea-order-gas-url") || "";

const el = {
  lockStatus: document.querySelector("#lockStatus"),
  todayLabel: document.querySelector("#todayLabel"),
  shopType: document.querySelector("#shopType"),
  shopName: document.querySelector("#shopName"),
  deadline: document.querySelector("#deadline"),
  templateButtons: document.querySelector("#templateButtons"),
  saveTemplateBtn: document.querySelector("#saveTemplateBtn"),
  deleteTemplateBtn: document.querySelector("#deleteTemplateBtn"),
  templateStatus: document.querySelector("#templateStatus"),
  lockBtn: document.querySelector("#lockBtn"),
  unlockBtn: document.querySelector("#unlockBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  shareUrl: document.querySelector("#shareUrl"),
  copyShareBtn: document.querySelector("#copyShareBtn"),
  gasUrl: document.querySelector("#gasUrl"),
  saveGasBtn: document.querySelector("#saveGasBtn"),
  clearGasBtn: document.querySelector("#clearGasBtn"),
  remoteStatus: document.querySelector("#remoteStatus"),
  menuHint: document.querySelector("#menuHint"),
  menuGrid: document.querySelector("#menuGrid"),
  addItemBtn: document.querySelector("#addItemBtn"),
  orderShopLabel: document.querySelector("#orderShopLabel"),
  orderForm: document.querySelector("#orderForm"),
  customerName: document.querySelector("#customerName"),
  itemSelect: document.querySelector("#itemSelect"),
  quantity: document.querySelector("#quantity"),
  sugar: document.querySelector("#sugar"),
  ice: document.querySelector("#ice"),
  note: document.querySelector("#note"),
  copyReturnBtn: document.querySelector("#copyReturnBtn"),
  orderCount: document.querySelector("#orderCount"),
  orders: document.querySelector("#orders"),
  totals: document.querySelector("#totals"),
  exportBtn: document.querySelector("#exportBtn"),
  returnUrl: document.querySelector("#returnUrl"),
  importBtn: document.querySelector("#importBtn"),
  itemDialog: document.querySelector("#itemDialog"),
  newItemName: document.querySelector("#newItemName"),
  newItemPrice: document.querySelector("#newItemPrice"),
  saveItemBtn: document.querySelector("#saveItemBtn"),
  toast: document.querySelector("#toast")
};

function loadInitialState() {
  const incoming = parseHash();
  const saved = localStorage.getItem("tea-order-state");
  const base = saved ? JSON.parse(saved) : createEmptyState();

  if (incoming.state) {
    return { ...createEmptyState(), ...incoming.state, orders: base.orders || [] };
  }

  if (incoming.returnOrder) {
    const next = { ...base };
    next.orders = upsertOrder(next.orders || [], incoming.returnOrder);
    localStorage.setItem("tea-order-state", JSON.stringify(next));
    history.replaceState(null, "", location.pathname);
    return next;
  }

  return base;
}

function parseHash() {
  const hash = location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    state: decodePayload(params.get("order")),
    returnOrder: decodePayload(params.get("return"))
  };
}

function encodePayload(data) {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodePayload(payload) {
  if (!payload) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}

function persist() {
  localStorage.setItem("tea-order-state", JSON.stringify(state));
  scheduleRemoteSave();
}

function scheduleRemoteSave() {
  if (!remoteEnabled) return;
  window.clearTimeout(remoteSaveTimer);
  remoteSaveTimer = window.setTimeout(saveRemoteState, 250);
}

async function saveRemoteState() {
  if (!remoteEnabled) return;
  try {
    if (remoteKind === "gas") {
      await postGas("setState", state);
    } else {
      await postPayload("/api/state", state);
    }
  } catch {
    remoteEnabled = false;
    renderRemoteStatus();
  }
}

async function saveRemoteOrder(order) {
  if (!remoteEnabled) return false;
  try {
    if (remoteKind === "gas") {
      await postGas("addOrder", order);
    } else {
      const response = await postPayload("/api/order", order);
      if (!response.ok) return false;
    }
    await syncRemoteState();
    return true;
  } catch {
    remoteEnabled = false;
    renderRemoteStatus();
    return false;
  }
}

function postPayload(url, data) {
  return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: encodePayload(data) })
  });
}

function postGas(action, data) {
  return fetch(gasUrl, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({ action, payload: encodePayload(data) })
  });
}

function getGasState() {
  return new Promise((resolve, reject) => {
    const callbackName = `teaOrderCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const separator = gasUrl.includes("?") ? "&" : "?";
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Apps Script 讀取逾時"));
    }, 10000);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Google Apps Script 無法讀取"));
    };

    script.src = `${gasUrl}${separator}action=getState&callback=${callbackName}&t=${Date.now()}`;
    document.body.append(script);
  });
}

async function syncRemoteState() {
  if (!remoteEnabled) return;
  try {
    let remoteState;
    if (remoteKind === "gas") {
      remoteState = await getGasState();
    } else {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      remoteState = await response.json();
    }
    if (!remoteState || !remoteState.orderId) return;
    state = { ...createEmptyState(), ...remoteState };
    localStorage.setItem("tea-order-state", JSON.stringify(state));
    render();
  } catch {
    remoteEnabled = false;
    renderRemoteStatus();
  }
}

async function initRemote() {
  if (!["http:", "https:"].includes(location.protocol)) return;
  if (gasUrl) {
    await initGasRemote();
    return;
  }
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return;
    remoteEnabled = true;
    remoteKind = "local";
    const remoteState = await response.json();
    const hasIncomingOrder = location.hash.includes("order=");
    if (remoteState?.orderId && !hasIncomingOrder) {
      state = { ...createEmptyState(), ...remoteState };
      localStorage.setItem("tea-order-state", JSON.stringify(state));
      render();
    } else if (!hasIncomingOrder) {
      saveRemoteState();
    }
    window.setInterval(syncRemoteState, 2500);
    renderRemoteStatus();
  } catch {
    remoteEnabled = false;
    renderRemoteStatus();
  }
}

async function initGasRemote() {
  try {
    remoteEnabled = true;
    remoteKind = "gas";
    renderRemoteStatus();
    const remoteState = await getGasState();
    const hasIncomingOrder = location.hash.includes("order=");
    if (remoteState?.orderId && !hasIncomingOrder) {
      state = { ...createEmptyState(), ...remoteState };
      localStorage.setItem("tea-order-state", JSON.stringify(state));
      render();
    } else if (!hasIncomingOrder) {
      await postGas("setState", state);
    }
    window.setInterval(syncRemoteState, 3500);
    renderRemoteStatus();
  } catch {
    remoteEnabled = false;
    renderRemoteStatus();
  }
}

function renderRemoteStatus() {
  if (!el.remoteStatus) return;
  if (remoteEnabled && remoteKind === "gas") {
    el.remoteStatus.textContent = "已串接 Google Sheets，自動同步中";
  } else if (remoteEnabled) {
    el.remoteStatus.textContent = "已串接本機伺服器，自動同步中";
  } else {
    el.remoteStatus.textContent = gasUrl ? "Google Apps Script 尚未連線" : "目前使用瀏覽器暫存";
  }
}

function shareState() {
  return {
    orderId: state.orderId,
    type: state.type,
    shopName: state.shopName,
    deadline: state.deadline,
    locked: state.locked,
    menu: state.menu,
    templates: state.templates || []
  };
}

function getShareUrl() {
  const url = new URL(location.href);
  url.hash = `order=${encodePayload(shareState())}`;
  return url.href;
}

function getReturnUrl(order) {
  const url = new URL(location.href);
  url.hash = `return=${encodePayload(order)}`;
  return url.href;
}

function allTemplates() {
  return [...(state.templates || []), ...defaultTemplates];
}

function findTemplate(name, type = state.type) {
  const normalized = name.trim().toLowerCase();
  return allTemplates().find((template) => {
    return template.type === type && template.names.some((entry) => normalized.includes(entry.toLowerCase()));
  });
}

function menuFromTemplate(template) {
  return template.items.map(([name, price]) => ({
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${name}-${price}`,
    name,
    price
  }));
}

function setTemplate(template) {
  state.type = template.type;
  state.shopName = template.names[0];
  state.menu = menuFromTemplate(template);
  render();
  persist();
}

function autoFillMenu() {
  const template = findTemplate(el.shopName.value, el.shopType.value);
  state.shopName = el.shopName.value.trim();
  state.type = el.shopType.value;
  if (template) {
    state.menu = menuFromTemplate(template);
  }
  render();
  persist();
}

function addCustomItem(name, price) {
  const itemName = name.trim();
  if (!itemName) return;
  state.menu.push({
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${itemName}-${Date.now()}`,
    name: itemName,
    price: Number(price) || 0
  });
  render();
  persist();
}

function normalizeMenuForTemplate(menu) {
  return menu.map((item) => [item.name, Number(item.price) || 0]);
}

function saveCurrentTemplate() {
  const shopName = state.shopName.trim();
  if (!shopName || !state.menu.length) {
    toast("請先輸入店家並新增菜單");
    return;
  }

  const nextTemplate = {
    id: `custom-${shopName.toLowerCase()}-${Date.now()}`,
    custom: true,
    type: state.type,
    names: [shopName],
    items: normalizeMenuForTemplate(state.menu)
  };

  const normalizedName = shopName.toLowerCase();
  const existingBuiltIn = defaultTemplates.some((template) => {
    return template.type === state.type && template.names.some((name) => name.toLowerCase() === normalizedName);
  });

  state.templates = (state.templates || []).filter((template) => {
    return !(template.type === state.type && template.names.some((name) => name.toLowerCase() === normalizedName));
  });

  if (!existingBuiltIn) {
    state.templates.push(nextTemplate);
  } else {
    nextTemplate.id = `custom-${shopName.toLowerCase()}-override`;
    state.templates.push(nextTemplate);
  }

  render();
  persist();
  toast("已存成常用店家");
}

function deleteCurrentTemplate() {
  const normalizedName = state.shopName.trim().toLowerCase();
  const before = (state.templates || []).length;
  state.templates = (state.templates || []).filter((template) => {
    return !(template.type === state.type && template.names.some((name) => name.toLowerCase() === normalizedName));
  });
  if (state.templates.length === before) {
    toast("這不是自訂店家");
    return;
  }
  render();
  persist();
  toast("已刪除自訂店家");
}

function upsertOrder(orders, order) {
  const exists = orders.some((item) => item.id === order.id);
  if (exists) {
    return orders.map((item) => (item.id === order.id ? order : item));
  }
  return [...orders, order];
}

function renderTemplates() {
  el.templateButtons.innerHTML = "";
  const seen = new Set();
  allTemplates()
    .filter((template) => template.type === state.type)
    .filter((template) => {
      const key = `${template.type}:${template.names[0].toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .forEach((template) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `template-button${state.shopName === template.names[0] ? " active" : ""}`;
      button.textContent = template.names[0];
      button.addEventListener("click", () => setTemplate(template));
      el.templateButtons.append(button);
    });
}

function renderTemplateStatus() {
  const count = (state.templates || []).filter((template) => template.type === state.type).length;
  el.templateStatus.textContent = count ? `自訂常用店家 ${count} 間，已跟訂單一起同步` : "可把目前店家與 Menu 存成常用店家";
  const normalizedName = state.shopName.trim().toLowerCase();
  const canDelete = (state.templates || []).some((template) => {
    return template.type === state.type && template.names.some((name) => name.toLowerCase() === normalizedName);
  });
  el.deleteTemplateBtn.disabled = !canDelete || state.locked;
}

function renderMenu() {
  el.menuGrid.innerHTML = "";
  if (!state.menu.length) {
    const empty = document.createElement("div");
    empty.className = "menu-item";
    empty.innerHTML = "<strong>尚無菜單</strong><span>可選店家模板或新增品項</span>";
    el.menuGrid.append(empty);
    return;
  }

  state.menu.forEach((item) => {
    const node = document.createElement("div");
    node.className = "menu-item";
    node.innerHTML = `<strong>${escapeHtml(item.name)}</strong><span>$${Number(item.price || 0)}</span>`;
    el.menuGrid.append(node);
  });
}

function renderOrderOptions() {
  el.itemSelect.innerHTML = "";
  state.menu.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} $${Number(item.price || 0)}`;
    el.itemSelect.append(option);
  });

  const disabled = !state.locked || !state.menu.length;
  [...el.orderForm.elements].forEach((field) => {
    field.disabled = disabled && field.id !== "copyReturnBtn";
  });
  el.copyReturnBtn.disabled = !lastOrder;

  document.querySelectorAll(".drink-option").forEach((node) => {
    node.classList.toggle("hidden", state.type !== "drink");
  });
}

function renderOrders() {
  el.orderCount.textContent = `${state.orders.length} 筆訂單`;
  el.orders.innerHTML = "";

  state.orders.forEach((order) => {
    const node = document.createElement("div");
    node.className = "order-row";
    const drinkMeta = state.type === "drink" ? `｜${order.sugar}｜${order.ice}` : "";
    node.innerHTML = `
      <div>
        <strong>${escapeHtml(order.customerName)}：${escapeHtml(order.itemName)} × ${order.quantity}</strong>
        <small>$${order.subtotal}${drinkMeta}${order.note ? `｜${escapeHtml(order.note)}` : ""}</small>
      </div>
      <button class="delete-order" type="button" title="刪除" aria-label="刪除">×</button>
    `;
    node.querySelector("button").addEventListener("click", () => {
      state.orders = state.orders.filter((item) => item.id !== order.id);
      render();
      persist();
    });
    el.orders.append(node);
  });

  renderTotals();
}

function renderTotals() {
  const totals = new Map();
  let amount = 0;
  state.orders.forEach((order) => {
    totals.set(order.itemName, (totals.get(order.itemName) || 0) + Number(order.quantity));
    amount += Number(order.subtotal);
  });

  el.totals.innerHTML = "";
  [...totals.entries()].forEach(([name, count]) => {
    const row = document.createElement("div");
    row.className = "total-row";
    row.innerHTML = `<span>${escapeHtml(name)}</span><strong>${count}</strong>`;
    el.totals.append(row);
  });

  const amountRow = document.createElement("div");
  amountRow.className = "total-row";
  amountRow.innerHTML = `<span>預估總額</span><strong>$${amount}</strong>`;
  el.totals.append(amountRow);
}

function render() {
  el.shopType.value = state.type;
  el.shopName.value = state.shopName;
  el.deadline.value = state.deadline;
  el.todayLabel.textContent = new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  });
  el.lockStatus.textContent = state.locked ? "已鎖定" : "尚未鎖定";
  el.lockStatus.classList.toggle("locked", state.locked);
  el.menuHint.textContent = state.shopName ? `${state.shopName}｜${state.type === "drink" ? "飲料" : "餐食"}` : "輸入店家後會自動帶入菜單";
  el.orderShopLabel.textContent = state.locked ? `${state.shopName || "今日店家"}${state.deadline ? `｜${state.deadline} 截止` : ""}` : "請先鎖定今日店家";
  el.shareUrl.value = getShareUrl();
  el.gasUrl.value = gasUrl;
  renderRemoteStatus();
  el.shopType.disabled = state.locked;
  el.shopName.disabled = state.locked;
  el.deadline.disabled = state.locked;
  el.lockBtn.disabled = state.locked || !state.shopName || !state.menu.length;
  el.unlockBtn.disabled = !state.locked;
  el.addItemBtn.disabled = state.locked;
  el.saveTemplateBtn.disabled = state.locked || !state.shopName || !state.menu.length;
  renderTemplates();
  renderTemplateStatus();
  renderMenu();
  renderOrderOptions();
  renderOrders();
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("已複製");
  } catch {
    el.shareUrl.select();
    document.execCommand("copy");
    toast("已複製");
  }
}

function exportCsv() {
  const header = ["訂購人", "品項", "數量", "單價", "小計", "甜度", "冰塊", "備註"];
  const rows = state.orders.map((order) => [
    order.customerName,
    order.itemName,
    order.quantity,
    order.price,
    order.subtotal,
    order.sugar || "",
    order.ice || "",
    order.note || ""
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.shopName || "下午茶"}訂單.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

el.shopType.addEventListener("change", () => {
  state.type = el.shopType.value;
  state.menu = [];
  render();
  persist();
});

el.shopName.addEventListener("input", autoFillMenu);
el.deadline.addEventListener("input", () => {
  state.deadline = el.deadline.value;
  render();
  persist();
});

el.lockBtn.addEventListener("click", () => {
  state.locked = true;
  render();
  persist();
  toast("今日店家已鎖定");
});

el.unlockBtn.addEventListener("click", () => {
  state.locked = false;
  render();
  persist();
});

el.resetBtn.addEventListener("click", () => {
  if (!confirm("清空今日店家與訂單？")) return;
  const savedTemplates = state.templates || [];
  state = createEmptyState();
  state.templates = savedTemplates;
  lastOrder = null;
  render();
  persist();
});

el.copyShareBtn.addEventListener("click", () => copyText(getShareUrl()));

el.saveGasBtn.addEventListener("click", () => {
  gasUrl = el.gasUrl.value.trim();
  localStorage.setItem("tea-order-gas-url", gasUrl);
  remoteEnabled = false;
  initRemote();
  toast("已儲存 Google Apps Script URL");
});

el.clearGasBtn.addEventListener("click", () => {
  gasUrl = "";
  localStorage.removeItem("tea-order-gas-url");
  remoteEnabled = false;
  remoteKind = "local";
  renderRemoteStatus();
  render();
});

el.saveTemplateBtn.addEventListener("click", saveCurrentTemplate);
el.deleteTemplateBtn.addEventListener("click", deleteCurrentTemplate);

el.addItemBtn.addEventListener("click", () => {
  el.newItemName.value = "";
  el.newItemPrice.value = "";
  el.itemDialog.showModal();
});

el.saveItemBtn.addEventListener("click", (event) => {
  event.preventDefault();
  addCustomItem(el.newItemName.value, el.newItemPrice.value);
  el.itemDialog.close();
});

el.orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const menuItem = state.menu.find((item) => item.id === el.itemSelect.value);
  if (!menuItem) return;

  const quantity = Number(el.quantity.value) || 1;
  const order = {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    orderId: state.orderId,
    customerName: el.customerName.value.trim(),
    itemId: menuItem.id,
    itemName: menuItem.name,
    price: Number(menuItem.price || 0),
    quantity,
    subtotal: Number(menuItem.price || 0) * quantity,
    sugar: state.type === "drink" ? el.sugar.value : "",
    ice: state.type === "drink" ? el.ice.value : "",
    note: el.note.value.trim(),
    createdAt: new Date().toISOString()
  };

  state.orders = upsertOrder(state.orders, order);
  lastOrder = order;
  el.orderForm.reset();
  el.quantity.value = 1;
  render();
  localStorage.setItem("tea-order-state", JSON.stringify(state));
  if (remoteEnabled) {
    saveRemoteOrder(order);
  } else {
    persist();
  }
  toast("訂單已送出");
});

el.copyReturnBtn.addEventListener("click", () => {
  if (!lastOrder) return;
  copyText(getReturnUrl(lastOrder));
});

el.importBtn.addEventListener("click", () => {
  const hash = el.returnUrl.value.split("#")[1] || "";
  const params = new URLSearchParams(hash);
  const order = decodePayload(params.get("return"));
  if (!order) {
    toast("無法匯入此連結");
    return;
  }
  state.orders = upsertOrder(state.orders, order);
  el.returnUrl.value = "";
  render();
  localStorage.setItem("tea-order-state", JSON.stringify(state));
  if (remoteEnabled) {
    saveRemoteOrder(order);
  } else {
    persist();
  }
  toast("已匯入訂單");
});

el.exportBtn.addEventListener("click", exportCsv);

render();
initRemote();
