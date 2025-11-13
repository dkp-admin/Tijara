export class User {
  constructor(public name: string = "") {}
}

export class LocationName {
  constructor(public name: string = "") {}
}

export class CompanyName {
  constructor(public name: string = "") {}
}

export class CashDrawerTransaction {
  _id?: string;
  userRef: string;
  user: User;
  location: LocationName;
  locationRef: string;
  company: CompanyName;
  companyRef: string;
  openingActual?: number;
  openingExpected?: number;
  closingActual?: number;
  closingExpected?: number;
  difference?: number;
  totalSales?: number;
  transactionType: string;
  description: string;
  shiftIn: boolean;
  dayEnd: boolean;
  started: Date;
  ended: Date;
  source: "local" | "server";
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<CashDrawerTransaction> = {}) {
    this._id = data._id;
    this.userRef = data.userRef || "";
    this.user = new User(data.user?.name);
    this.location = new LocationName(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.company = new CompanyName(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.openingActual = data.openingActual;
    this.openingExpected = data.openingExpected;
    this.closingActual = data.closingActual;
    this.closingExpected = data.closingExpected;
    this.difference = data.difference;
    this.totalSales = data.totalSales;
    this.transactionType = data.transactionType || "";
    this.description = data.description || "";
    this.shiftIn = data.shiftIn || false;
    this.dayEnd = data.dayEnd || false;
    this.started = data.started ? new Date(data.started) : new Date();
    this.ended = data.ended ? new Date(data.ended) : new Date();
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): CashDrawerTransaction {
    return new CashDrawerTransaction({
      _id: row._id,
      userRef: row.userRef,
      user: JSON.parse(row.user),
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      openingActual: row.openingActual ? Number(row.openingActual) : undefined,
      openingExpected: row.openingExpected
        ? Number(row.openingExpected)
        : undefined,
      closingActual: row.closingActual ? Number(row.closingActual) : undefined,
      closingExpected: row.closingExpected
        ? Number(row.closingExpected)
        : undefined,
      difference: row.difference ? Number(row.difference) : undefined,
      totalSales: row.totalSales ? Number(row.totalSales) : undefined,
      transactionType: row.transactionType,
      description: row.description,
      shiftIn: Boolean(row.shiftIn),
      dayEnd: Boolean(row.dayEnd),
      started: new Date(row.started),
      ended: new Date(row.ended),
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(tx: CashDrawerTransaction): any {
    return {
      _id: tx._id,
      userRef: tx.userRef,
      user: JSON.stringify(tx.user),
      location: JSON.stringify(tx.location),
      locationRef: tx.locationRef,
      company: JSON.stringify(tx.company),
      companyRef: tx.companyRef,
      openingActual: tx.openingActual,
      openingExpected: tx.openingExpected,
      closingActual: tx.closingActual,
      closingExpected: tx.closingExpected,
      difference: tx.difference,
      totalSales: tx.totalSales,
      transactionType: tx.transactionType,
      description: tx.description,
      shiftIn: Number(tx.shiftIn),
      dayEnd: Number(tx.dayEnd),
      started: tx.started.toISOString(),
      ended: tx.ended.toISOString(),
      source: tx.source,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }
}
