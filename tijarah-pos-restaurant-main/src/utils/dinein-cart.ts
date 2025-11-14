import { EventRegister } from "react-native-event-listeners";
import MMKVDB from "./DB-MMKV";

class DineinCart {
  public cartItems: any;
  public discounts: any;
  public promotions: any;
  public charges: any;
  public comps: any;
  private static instance: DineinCart | null = null; // Private static instance variable

  private constructor() {
    this.cartItems = [];
    this.discounts = [];
    this.promotions = [];
    this.charges = [];
    this.comps = [];
  }

  static getInstance(): DineinCart {
    if (!DineinCart.instance) {
      DineinCart.instance = new DineinCart(); // Create the instance if it doesn't exist
    }
    return DineinCart.instance;
  }

  changedCart() {
    // playTouchSound();

    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    MMKVDB.set(cartId, this.cartItems || []);
  }

  addToCart(item: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    this.cartItems = [...(cartData || []), item];

    MMKVDB.set(cartId, [...(cartData || []), item]);

    cb(this.cartItems);

    this.changedCart();
  }

  addItemsToCart(items: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    this.cartItems = [...(cartData || []), ...items];
    cb(this.cartItems);
    this.changedCart();
  }

  applyDiscount(data: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const discountsData = MMKVDB.get(discountCartId) || [];

    discountsData.push(data);

    this.discounts = [...discountsData];

    MMKVDB.set(discountCartId, this.discounts);

    cb(this.discounts);

    EventRegister.emit("discountApplied-dinein", this.discounts);
  }

  applyComp(data: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const compCartId = `compsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const compData = MMKVDB.get(compCartId) || [];

    compData.push(data);

    this.comps = [...compData];

    MMKVDB.set(compCartId, this.comps);

    cb(this.comps);
  }

  applyPromotion(data: any, cb: any = () => {}) {
    this.promotions = [...this.promotions, data];
    cb(this.promotions);
  }

  removeDiscount(index: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const discountsData = MMKVDB.get(discountCartId);

    discountsData.splice(index, 1);

    this.discounts = [...discountsData];

    MMKVDB.set(discountCartId, this.discounts);

    cb(this.discounts);
  }

  removeComp(index: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const compCartId = `compsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const compData = MMKVDB.get(compCartId);

    compData.splice(index, 1);

    this.discounts = [...compData];

    MMKVDB.set(compCartId, this.comps);

    cb(this.comps);
  }

  removePromotion(index: any, cb: any = () => {}) {
    this.promotions.splice(index, 1);
    cb(this.promotions);
  }

  applyCharges(data: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const chargesData = MMKVDB.get(chargeCartId) || [];

    chargesData.push(data);

    this.charges = [...chargesData];

    MMKVDB.set(chargeCartId, this.charges);

    console.log(MMKVDB.get(chargeCartId));

    cb(this.charges);
  }

  removeCharges(index: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const chargesData = MMKVDB.get(chargeCartId) || [];

    chargesData.splice(index, 1);

    this.charges = [...chargesData];

    MMKVDB.set(chargeCartId, this.charges);

    cb(this.charges);
  }

  updateAllCharges(items: any, cb: any = () => {}) {
    this.charges = [...items];
    MMKVDB.set("chargesApplied-dinein", this.charges);
    cb(this.charges);
  }

  updateAllPromotions(items: any, cb: any = () => {}) {
    this.promotions = [...items];
    cb(this.promotions);
  }

  clearCharges(cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    this.charges = [];

    MMKVDB.set(chargeCartId, []);

    this.changedCart();

    cb(this.charges);
  }

  clearPromotions() {
    this.promotions = [];
  }

  clearDiscounts(cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    this.discounts = [];

    MMKVDB.set(discountCartId, []);

    this.changedCart();

    cb(this.discounts);
  }

  clearCart() {
    const tableData = MMKVDB.get("activeTableDineIn");

    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const compCartId = `compsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    this.cartItems = [];
    this.discounts = [];
    this.charges = [];
    this.promotions = [];
    MMKVDB.set(discountCartId, []);
    MMKVDB.set(cartId, []);
    MMKVDB.set(chargeCartId, []);
    MMKVDB.set(compCartId, []);
    MMKVDB.set("promotionsApplied-dinein", []);
    MMKVDB.set("totalDiscount-dinein", 0);
    EventRegister.emit("cart-clear-dinein");
    this.changedCart();
  }

  emptyCart() {
    this.cartItems = [];
    this.changedCart();
    return true;
  }

  getCartItems() {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    this.cartItems = [...(cartData || [])];

    return cartData;
  }

  getDiscountApplied() {
    const tableData = MMKVDB.get("activeTableDineIn");

    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const discountsData = MMKVDB.get(discountCartId) || [];

    this.discounts = [...discountsData];

    return this.discounts;
  }

  getCompsApplied() {
    const tableData = MMKVDB.get("activeTableDineIn");

    const compCartId = `compsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const compData = MMKVDB.get(compCartId) || [];

    this.comps = [...compData];

    return this.comps;
  }

  getPromotionApplied() {
    return this.promotions;
  }

  getChargesApplied() {
    const tableData = MMKVDB.get("activeTableDineIn");

    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const chargesData = MMKVDB.get(chargeCartId) || [];

    this.charges = [...chargesData];

    return this.charges;
  }

  removeFromCart(index: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    cartData.splice(index, 1); // Use splice to remove an item

    this.cartItems = [...cartData];

    cb(cartData);

    this.changedCart();
  }

  removeMultipleItems(skus: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    const indexes: number[] = [];

    for (const sku of skus) {
      const index = cartData.findIndex((item: any) => item?.sku === sku);
      cartData.splice(index, 1);
      indexes.push(index);
    }

    for (const index of indexes) {
      cartData.splice(index, 1);
    }

    cb(cartData);

    this.cartItems = [...cartData];

    this.changedCart();
  }

  updateCartItem(index: any, item: any, cb: any = () => {}) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    cartData[index] = item;

    this.cartItems = [...cartData];

    cb(cartData);

    this.changedCart();
  }

  bulkRemoveFromCart(indexes: any, cb: any = () => {}) {
    indexes.sort((a: any, b: any) => b - a);

    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;

    const cartData = MMKVDB.get(cartId);

    for (let index of indexes) {
      cartData.splice(index, 1);
    }

    cb(cartData);

    this.cartItems = [...cartData];

    this.changedCart();
  }

  shiftTable(shiftTable: any) {
    const tableData = MMKVDB.get("activeTableDineIn");

    const cartId = `cartItems-${tableData?.sectionRef}-${tableData?.label}`;
    const discountCartId = `discountsApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;
    const chargeCartId = `chargesApplied-dinein-${tableData?.sectionRef}-${tableData?.label}`;

    const cartIdShiftTable = `cartItems-${shiftTable?.sectionRef}-${shiftTable?.label}`;
    const discountCartIdShiftTable = `discountsApplied-dinein-${shiftTable?.sectionRef}-${shiftTable?.label}`;
    const chargeCartIdShiftTable = `chargesApplied-dinein-${shiftTable?.sectionRef}-${shiftTable?.label}`;

    const cartData = MMKVDB.get(cartId);
    const discountsData = MMKVDB.get(discountCartId);
    const chargesData = MMKVDB.get(chargeCartId);

    MMKVDB.set(cartIdShiftTable, cartData);
    MMKVDB.set(discountCartIdShiftTable, discountsData);
    MMKVDB.set(chargeCartIdShiftTable, chargesData);

    MMKVDB.set(cartId, []);
    MMKVDB.set(discountCartId, []);
    MMKVDB.set(chargeCartId, []);
  }
}

export default DineinCart.getInstance(); // Export the singleton instance
