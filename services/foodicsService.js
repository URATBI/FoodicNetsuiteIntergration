const axios = require('axios');

const FOODICS_API_BASE = 'https://api.foodics.com/v5';
const FOODICS_TOKEN = process.env.FOODICS_API_KEY;

const fetchOrders = async () => {
  try {
    const url = `${FOODICS_API_BASE}/orders?with=customer`;
    console.log("Hitting URL:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MGQ1YTcxOC1lMzBkLTQ5ODYtODY0Ni0wNjdlZDBkMzdkMGUiLCJqdGkiOiI5ODJkMWNmNjkxZTFjZDZjMDQwMjM2NWI0ODMzNTVjOTM4YTg1MzhkYjk5N2I2OWJiOGVmYWI4NjA2ODY4MmE1MGQyODk0YzcwMzNiMmMzYiIsImlhdCI6MTc1MTM3OTM5My41MDY2NjEsIm5iZiI6MTc1MTM3OTM5My41MDY2NjEsImV4cCI6MTkwOTE0NTc5My40Nzg1MDksInN1YiI6IjllODIzMzI1LWI1YjYtNDQ3Mi1iZDQwLTNmNWY4ODIyNjMyZiIsInNjb3BlcyI6WyJnZW5lcmFsLnJlYWQiLCJpbnZlbnRvcnkudHJhbnNhY3Rpb25zLnJlYWQiLCJjdXN0b21lcnMubGlzdCIsIm1lbnUuaW5ncmVkaWVudHMucmVhZCIsImludmVudG9yeS5zZXR0aW5ncy5yZWFkIiwib3JkZXJzLmxpc3QiXSwiYnVzaW5lc3MiOiI5ZTgyMzMyNS1jNzAzLTQzNDctYTg4My01NjE1MThkYzRlYjciLCJyZWZlcmVuY2UiOiIzMzQ5ODIifQ.s0Go6UrbTpWf_N4FCMk-KoGSeqIDpip6BttD3PofA8fWjvHX6t8Z5y1nuBkHhfLcB0Bmgqwz-JsSy7yNJ4HIyURy0cGQA3yUmZO74ui1DGNTgLdkPoEQOGRXJxz65adVjiNTPM0jibwhbK0b6GvFgBrwS41tWZNIUNKPKcXn3DBzc1j-QKd6Xnf7u0MnzwpkUddlwajSJ6VrjatULXFGVZlnIBTlajYTsD-OH-d-IbMK8O7UcQlRGbGbhOf9fLb7VFoUeuPjU_uZHbeIcJhuSFZU5P8AJSU4NQziCXbOK5DniM-fyf9xk5_Ki2wDfeHd8EK9DqGh41-5ymByJHxLhBd6ZikPGJdG6PJimmYZY8wSddCn1jZO3e4zDyS_-vNdafqYt-FZQOWD3R7xsFx1jvFWMn_IgRjXyPSOROZQQXcVPnexO4fNL7quFQXhOFCw-fPdn85m0EnZtprUbB2x4qKVTn7Q0_hM0Ogm_PUoc5WwOMYqxGHxEwoDqtdD9-C4tTixWxWa_5UlKIiv8qhcF8ld3kI4MBA_xBf1ay3nPz2ZZSwyfDk10qLnriVGALIHBv6URLPbAC_Bs5NAt39x230NRFGphsiOuoM6jF9Fq3tQM--buxUVIusXI13s2T2OL_O-TqC6iA6inRgNz4SaWnJVb9LSLXaxdD4Qv1H93O8`,
        Accept: 'application/json'
      }
    });

    console.log("✅ Foodics Orders Fetched:", response.data.data.length);
    return response.data.data;

  } catch (error) {
    console.error("❌ Foodics API error:", error.response?.data || error.message);
    return [];
  }
};

module.exports = { fetchOrders };
