import { trigger } from "./custom-event";

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
      Cart.instance = new Cart();
    }
    return Cart.instance;
  }
  private getOrderingType(): string {
    const qrOrdering = localStorage.getItem("qrOrdering");
    return qrOrdering === "true" ? "qr" : "online";
  }

  changedCart() {
    const params = new URLSearchParams(window.location.search);

    const locationRef = params.has("locationRef")
      ? params.get("locationRef")
      : "";

    const orderingType = this.getOrderingType();

    localStorage.setItem(
      `cartItems-${locationRef}-${orderingType}`,
      JSON.stringify(this.cartItems || [])
    );
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
    this.charges = [...this.charges, data];
    cb(this.charges);
  }

  removeCharges(index: any, cb: any = () => {}) {
    this.charges.splice(index, 1);
    cb(this.charges);
  }

  updateAllCharges(items: any, cb: any = () => {}) {
    this.charges = [...items];
    cb(this.charges);
  }

  updateAllPromotions(items: any, cb: any = () => {}) {
    this.promotions = [...items];
    cb(this.promotions);
  }

  updateAllDiscounts(items: any, cb: any = () => {}) {
    this.discounts = [...items];
    cb(this.discounts);
  }

  clearCharges() {
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
    localStorage.setItem("discountsApplied", JSON.stringify([]));
    localStorage.setItem("promotionsApplied", JSON.stringify([]));
    localStorage.setItem("chargesApplied", JSON.stringify([]));
    localStorage.setItem("totalDiscount", "0");
    trigger("cart-clear", null, null, null, null);
    this.changedCart();
  }

  emptyCart() {
    this.cartItems = [];
    this.changedCart();
    return true;
  }

  getCartItems() {
    const params = new URLSearchParams(window.location.search);

    const locationRef = params.has("locationRef")
      ? params.get("locationRef")
      : "";

    const orderingType = this.getOrderingType();
    return JSON.parse(
      localStorage.getItem(`cartItems-${locationRef}-${orderingType}`)
    );
  }

  getDiscountApplied() {
    return this.discounts;
  }

  getPromotionApplied() {
    return JSON.parse(localStorage.getItem(`promotionsApplied`));
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
