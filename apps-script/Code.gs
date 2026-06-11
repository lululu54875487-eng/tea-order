const SHEET_NAME = "Orders";
const TEMPLATE_SHEET_NAME = "Templates";

function doGet(e) {
  const action = e.parameter.action || "getState";
  const callback = e.parameter.callback || "callback";

  if (action === "getState") {
    return jsonp(callback, getState_());
  }

  return jsonp(callback, { ok: false, error: "Unknown action" });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const action = body.action;
  const payload = body.payload ? decodePayload_(body.payload) : {};

  if (action === "setState") {
    setState_(payload);
    return textJson_({ ok: true });
  }

  if (action === "addOrder") {
    const state = getState_();
    const orders = (state.orders || []).filter((order) => order.id !== payload.id);
    orders.push(payload);
    state.orders = orders;
    setState_(state);
    return textJson_({ ok: true });
  }

  return textJson_({ ok: false, error: "Unknown action" });
}

function getState_() {
  const sheet = getSheet_();
  const value = sheet.getRange("A1").getValue();
  if (value) {
    return JSON.parse(value);
  }

  const state = {
    orderId: Utilities.getUuid(),
    type: "drink",
    shopName: "",
    deadline: "",
    locked: false,
    menu: [],
    orders: [],
    templates: []
  };
  setState_(state);
  return state;
}

function setState_(state) {
  const sheet = getSheet_();
  sheet.getRange("A1").setValue(JSON.stringify(state));
  sheet.getRange("A2").setValue(new Date());
  writeOrders_(sheet, state.orders || []);
  writeTemplates_(state.templates || []);
}

function writeOrders_(sheet, orders) {
  const startRow = 4;
  const header = [["訂購人", "品項", "數量", "單價", "小計", "甜度", "冰塊", "備註", "送出時間"]];
  sheet.getRange(startRow, 1, 1, header[0].length).setValues(header);

  const lastRow = Math.max(sheet.getLastRow(), startRow + 1);
  sheet.getRange(startRow + 1, 1, lastRow - startRow, header[0].length).clearContent();

  if (!orders.length) return;

  const rows = orders.map((order) => [
    order.customerName || "",
    order.itemName || "",
    order.quantity || "",
    order.price || "",
    order.subtotal || "",
    order.sugar || "",
    order.ice || "",
    order.note || "",
    order.createdAt || ""
  ]);
  sheet.getRange(startRow + 1, 1, rows.length, header[0].length).setValues(rows);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function writeTemplates_(templates) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(TEMPLATE_SHEET_NAME) || spreadsheet.insertSheet(TEMPLATE_SHEET_NAME);
  const header = [["類型", "店家", "品項", "價格"]];
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header[0].length).setValues(header);

  const rows = [];
  templates.forEach((template) => {
    (template.items || []).forEach((item) => {
      rows.push([
        template.type === "drink" ? "飲料" : "餐食",
        (template.names || [])[0] || "",
        item[0] || "",
        item[1] || 0
      ]);
    });
  });

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header[0].length).setValues(rows);
  }
}

function decodePayload_(payload) {
  const bytes = Utilities.base64Decode(payload);
  return JSON.parse(Utilities.newBlob(bytes).getDataAsString("UTF-8"));
}

function jsonp(callback, payload) {
  const safeCallback = String(callback).replace(/[^\w.$]/g, "");
  return ContentService
    .createTextOutput(`${safeCallback}(${JSON.stringify(payload)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function textJson_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
