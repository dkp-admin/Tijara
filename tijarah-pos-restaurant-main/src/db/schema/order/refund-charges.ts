export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class RefundCharges {
  name: Name;
  chargeId: string;
  totalCharge: number;
  totalVatOnCharge: number;

  constructor(data: Partial<RefundCharges> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.chargeId = data.chargeId || "";
    this.totalCharge = data.totalCharge || 0;
    this.totalVatOnCharge = data.totalVatOnCharge || 0;
  }

  static fromRow(row: any): RefundCharges {
    return new RefundCharges({
      name: row.name ? JSON.parse(row.name) : undefined,
      chargeId: row.chargeId,
      totalCharge: Number(row.totalCharge),
      totalVatOnCharge: Number(row.totalVatOnCharge),
    });
  }

  calculateTotalWithVat(): number {
    return this.totalCharge + this.totalVatOnCharge;
  }
}
