export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class Collection {
  _id?: string;
  name: Name;
  company: CompanyInfo;
  companyRef: string;
  localImage?: string;
  image?: string;
  status: string;
  source: "local" | "server";
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Collection> = {}) {
    this._id = data._id;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.localImage = data.localImage;
    this.image = data.image;
    this.status = data.status || "active";
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Collection {
    return new Collection({
      _id: row._id,
      name: JSON.parse(row.name),
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      localImage: row.localImage,
      image: row.image,
      status: row.status,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(collection: Collection): any {
    return {
      _id: collection._id,
      name: JSON.stringify(collection.name),
      company: JSON.stringify(collection.company),
      companyRef: collection.companyRef,
      localImage: collection.localImage,
      image: collection.image,
      status: collection.status,
      source: collection.source,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  isActive(): boolean {
    return this.status === "active";
  }
}
