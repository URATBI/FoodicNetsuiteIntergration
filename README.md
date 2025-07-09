# 📦 Foodics to NetSuite Sync API

This Node.js application syncs **orders**, **products**, and **customers** from **Foodics** POS to **NetSuite** ERP using REST APIs.

---

## 🚀 Features

* ✅ Sync Foodics orders to NetSuite as Sales Orders
* ✅ Sync Foodics customers to NetSuite
* ✅ Sync Foodics products to NetSuite inventory items
* ✅ Update or delete existing NetSuite customers
* ✅ View sync status and logs

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/foodics-netsuite-sync.git
cd foodics-netsuite-sync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000

# Foodics API
FOODICS_API_KEY=your_foodics_access_token

# NetSuite OAuth 1.0a credentials
NETSUITE_ACCOUNT_ID=your_netsuite_account_id
NETSUITE_CONSUMER_KEY=your_consumer_key
NETSUITE_CONSUMER_SECRET=your_consumer_secret
NETSUITE_TOKEN_ID=your_token_id
NETSUITE_TOKEN_SECRET=your_token_secret
```

---

## ▶️ Run the Server

```bash
npm start Or node server.js
```

> Default server runs at `http://localhost:5000`

---

## 📡 API Endpoints

| Method | Endpoint                                  | Description                                |
| ------ | ----------------------------------------- | ------------------------------------------ |
| GET    | `/api/sync`                               | Sync Foodics Orders to NetSuite            |
| GET    | `/api/sync/netsuite-products`             | Fetch NetSuite Inventory Items             |
| GET    | `/api/sync/netsuite-customers`            | Sync Foodics Customers to NetSuite         |
| GET    | `/api/sync/netsuite-customers_delete`     | Update or inactivate customers in NetSuite |
| GET    | `/api/sync/syncFoodicsProductsToNetSuite` | Sync Foodics Products as NetSuite Items    |
| GET    | `/api/status`                             | Health Check Endpoint                      |

---

## 📁 Project Structure

```
foodics-netsuite-sync/
├── controllers/
│   ├── syncController.js
│   └── statusController.js
├── services/
│   ├── foodicsService.js
│   └── netsuiteService.js
├── utils/
│   ├── oauth1a.js
│   └── mapper.js
├── routes/
│   └── api.js
├── app.js
├── .env
└── README.md
```

---

## ⚠️ Notes

* Make sure all **NetSuite internal IDs** (like item ID, subsidiary ID, class ID, account ID) are valid.
* Always test with a sandbox or test customer first.
* Ensure NetSuite’s **token-based authentication** is enabled and configured correctly.

---

