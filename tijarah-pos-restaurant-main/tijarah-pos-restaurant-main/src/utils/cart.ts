import { EventRegister } from "react-native-event-listeners";
import MMKVDB from "./DB-MMKV";

class Cart {
  public cartItems: any;
  public discounts: any;
  public promotions: any;
  public charges: any;
  private static instance: Cart | null = null; // Private static instance variable

  private constructor() {
    this.cartItems = [];
    this.discounts = [];
    this.promotions = [];
    this.charges = [];
  }

  static getInstance(): Cart {
    if (!Cart.instance) {
      Cart.instance = new Cart(); // Create the instance if it doesn't exist
    }
    return Cart.instance;
  }

  changedCart() {
    // playTouchSound();

    MMKVDB.set("cartItems", this.cartItems || []);
  }

  addToCart(item: any, cb: any = () => {}) {
    this.cartItems = [...this.cartItems, item];
    cb(this.cartItems);
    this.changedCart();
  }

  addItemsToCart(items: any, cb: any = () => {}) {
    this.cartItems = [...this.cartItems, ...items];
    cb(this.cartItems);
    this.changedCart();
  }

  applyDiscount(data: any, cb: any = () => {}) {
    this.discounts = [...this.discounts, data];
    cb(this.discounts);
  }

  applyPromotion(data: any, cb: any = () => {}) {
    this.promotions = [...this.promotions, data];
    cb(this.promotions);
  }

  removeDiscount(index: any, cb: any = () => {}) {
    this.discounts.splice(index, 1);
    cb(this.discounts);
  }

  removePromotion(index: any, cb: any = () => {}) {
    this.promotions.splice(index, 1);
    cb(this.promotions);
  }

  applyCharges(data: any, cb: any = () => {}) {
    MMKVDB.set("chargesApplied", [...this.charges, data]);
    this.charges = [...this.charges, data];
    cb(this.charges);
  }

  removeCharges(index: any, cb: any = () => {}) {
    this.charges.splice(index, 1);
    MMKVDB.set("chargesApplied", this.charges);
    cb(this.charges);
  }

  updateAllCharges(items: any, cb: any = () => {}) {
    this.charges = [...items];
    MMKVDB.set("chargesApplied", this.charges);
    cb(this.charges);
  }

  updateAllPromotions(items: any, cb: any = () => {}) {
    this.promotions = [...items];
    cb(this.promotions);
  }

  clearCharges() {
    MMKVDB.set("chargesApplied", []);
    this.charges = [];
  }

  clearPromotions() {
    this.promotions = [];
  }

  clearDiscounts() {
    this.discounts = [];
  }

  clearCart() {
    this.cartItems = [];
    this.discounts = [];
    this.charges = [];
    this.promotions = [];
    MMKVDB.set("discountsApplied", []);
    MMKVDB.set("chargesApplied", []);
    MMKVDB.set("promotionsApplied", []);
    MMKVDB.set("totalDiscount", 0);
    EventRegister.emit("cart-clear");
    this.changedCart();
  }

  emptyCart() {
    this.cartItems = [];
    this.changedCart();
    return true;
  }

  getCartItems() {
    return this.cartItems;
  }

  getDiscountApplied() {
    return this.discounts;
  }

  getPromotionApplied() {
    return this.promotions;
  }

  getChargesApplied() {
    return this.charges;
  }

  removeFromCart(index: any, cb: any = () => {}) {
    this.cartItems.splice(index, 1); // Use splice to remove an item
    cb(this.cartItems);
    this.changedCart();
  }

  bulkRemoveFromCart(indexes: any, cb: any = () => {}) {
    indexes.sort((a: any, b: any) => b - a);

    // Remove items from cartItems based on indexes
    for (let index of indexes) {
      if (index >= 0) {
        this.cartItems.splice(index, 1);
      }
    }

    cb(this.cartItems);
    this.changedCart();
  }

  updateCartItem(index: any, item: any, cb: any = () => {}) {
    this.cartItems[index] = item;
    cb(this.cartItems);
    this.changedCart();
  }
}

export default Cart.getInstance(); // Export the singleton instance
