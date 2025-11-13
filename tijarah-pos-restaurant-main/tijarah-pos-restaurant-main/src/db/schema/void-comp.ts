export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class VoidComp {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  reason: Name;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  source: "local" | "server";

  constructor(data: Partial<VoidComp> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.reason = new Name(data.reason?.en, data.reason?.ar);
    this.type = data.type || "";
    this.status = data.status || "active";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.source = data.source || "server";
  }

  static fromRow(row: any): VoidComp {
    return new VoidComp({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      reason: JSON.parse(row.reason),
      type: row.type,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    });
  }

  static toRow(row: VoidComp): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      reason: JSON.stringify(row.reason),
      type: row.type,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    };
  }
}
