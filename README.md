# 部門下午茶訂單

這是一個單頁網頁，可用來建立今日飲料或餐食訂單、鎖定店家、分享訂購網址、收集訂購人與品項，並匯出 CSV。

## 使用方式

1. 在 PowerShell 執行：

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server.ps1
   ```

2. 開啟畫面顯示的網址，例如 `http://localhost:8787/`。
3. 若 PowerShell 顯示區網網址，例如 `http://192.168.1.20:8787/`，可把該網址分享給同事。
4. 選擇飲料或餐食，輸入店家名稱，或點選常用店家。
5. 確認菜單後按「鎖定」。
6. 同事送出後，訂單會寫入同一份 `data/orders.json`，統籌頁會定時同步。

## 靜態模式

也可以直接開啟 `index.html`：

1. 開啟 `index.html`。
2. 選擇飲料或餐食，輸入店家名稱，或點選常用店家。
3. 確認菜單後按「鎖定」。
4. 複製分享網址給同事。
5. 同事送出後可複製「回傳連結」，統籌者貼到「貼上同事回傳連結」匯入。

## GitHub Pages 部署

此專案已包含 `.github/workflows/pages.yml`，可用 GitHub Actions 部署成 GitHub Pages。

1. 在 GitHub 建立一個空 repository，例如 `tea-order`。
2. 將本資料夾的檔案上傳到該 repository 的 `main` branch。
3. 到 repository 的 `Settings` -> `Pages`。
4. 將 `Build and deployment` 的 `Source` 設為 `GitHub Actions`。
5. 等待 Actions 跑完後，GitHub 會產生 Pages 網址。

GitHub Pages 是靜態網站，不會執行 `server.ps1`。部署後仍可使用「分享網址」與「回傳連結」收單；若要同事送出後自動同步到統籌頁，需要接 Firebase、Supabase、Google Apps Script 或其他後端服務。

## Google Apps Script 同步

此專案已提供 `apps-script/Code.gs`。它會把整份訂單狀態存在 Google Sheets 的 `Orders` 工作表，並把訂單清單展開在第 4 列之後，方便人工查看。

設定步驟：

1. 開啟 Google Sheets，建立一份新的試算表，例如「下午茶訂單」。
2. 在試算表選單點 `擴充功能` -> `Apps Script`。
3. 將 `apps-script/Code.gs` 的內容貼到 Apps Script 編輯器。
4. 按 `儲存`。
5. 點 `部署` -> `新增部署作業`。
6. 類型選 `網頁應用程式`。
7. `執行身分` 選 `我`。
8. `誰可以存取` 選 `任何人` 或公司允許的對象。
9. 完成授權後，複製 `/exec` 結尾的 Web App URL。
10. 回到下午茶訂單網頁，把 URL 貼到 `Google Apps Script URL`，按「儲存串接」。

完成後，同事送出的訂單會自動寫入同一份 Google Sheets，也會同步回統籌頁。

## 目前限制

若公司防火牆阻擋同事連到你的電腦，請改用靜態模式的回傳連結，或部署到部門內部主機。
