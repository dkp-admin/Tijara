export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class WaiterInfo {
  constructor(public name: string = "") {}
}

export class TablesModal {
  id: string;
  label: string;
  capacity: number;
  status: string;
  sectionRef: string;
  waiterRef: string;
  waiter: WaiterInfo;
  childOne?: any;
  childTwo?: any;
  openedAt: string;
  parentTable?: string;
  parentTableRef?: string;
  childTable?: boolean;
  parentTableCapacity?: number;
  noOfGuests?: number;

  constructor(data: Partial<TablesModal> = {}) {
    this.id = data.id || "";
    this.label = data.label || "";
    this.capacity = data.capacity || 0;
    this.status = data.status || "available";
    this.sectionRef = data.sectionRef || "";
    this.waiterRef = data.waiterRef || "";
    this.waiter = new WaiterInfo(data.waiter?.name);
    this.childOne = data.childOne;
    this.childTwo = data.childTwo;
    this.openedAt = data.openedAt || new Date().toISOString();
    this.parentTable = data.parentTable;
    this.parentTableRef = data.parentTableRef;
    this.childTable = data.childTable;
    this.parentTableCapacity = data.parentTableCapacity;
    this.noOfGuests = data.noOfGuests;
  }
}

export class SectionTables {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRef: string;
  name: Name;
  floorType: string;
  tableNaming: string;
  numberOfTable: number;
  tables: TablesModal[];
  status: string;
  source: "local" | "server";
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<SectionTables> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.name = new Name(data.name?.en, data.name?.ar);
    this.floorType = data.floorType || "";
    this.tableNaming = data.tableNaming || "";
    this.numberOfTable = data.numberOfTable || 0;
    this.tables = (data.tables || []).map((t) => new TablesModal(t));
    this.status = data.status || "active";
    this.source = data.source || "server";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): SectionTables {
    return new SectionTables({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      name: JSON.parse(row.name),
      floorType: row.floorType,
      tableNaming: row.tableNaming,
      numberOfTable: Number(row.numberOfTable),
      tables: JSON.parse(row.tables || "[]"),
      status: row.status,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: SectionTables): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRef: row.locationRef,
      name: JSON.stringify(row.name),
      floorType: row.floorType,
      tableNaming: row.tableNaming,
      numberOfTable: Number(row.numberOfTable),
      tables: JSON.stringify(row.tables || "[]"),
      status: row.status,
      source: row.source,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
