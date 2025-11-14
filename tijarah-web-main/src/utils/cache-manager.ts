import * as cacheManager from "cache-manager";

// Create a cache with memory store
const ordersCache = cacheManager.createCache(cacheManager.memoryStore(), {
  max: 500,
  ttl: 3600000,
});

// Function to store orders in localStorage and cache
export const storeOrdersInCache = async (orders: any[]) => {
  try {
    // Store orders in localStorage
    localStorage.setItem("orders", JSON.stringify(orders));

    // Store orders in cache
    await ordersCache.set("orders", orders);
  } catch (error) {
    console.error("Error storing orders:", error);
  }
};

// Function to fetch orders from localStorage or cache
export const getOrdersFromCache = async () => {
  try {
    // Attempt to fetch orders from cache
    const cachedOrders: any = await ordersCache.get("orders");

    if (cachedOrders && cachedOrders?.length > 0) {
      return cachedOrders;
    }

    // If not found in cache, try fetching from localStorage
    const storedOrders = localStorage.getItem("orders");

    return storedOrders ? JSON.parse(storedOrders) : null;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return null;
  }
};

// Function to remove orders from localStorage and cache
export const removeOrders = async () => {
  try {
    // Remove orders from localStorage
    localStorage.removeItem("orders");

    // Remove orders from cache
    await ordersCache.set("orders", []);
  } catch (error) {
    console.error("Error removing orders:", error);
  }
};
