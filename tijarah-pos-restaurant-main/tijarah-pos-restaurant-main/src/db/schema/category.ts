export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class Category {
  _id?: string;
  parent?: string;
  name: Name;
  company: CompanyInfo;
  companyRef: string;
  localImage?: string;
  image?: string;
  description: string;
  status: string;
  source: "local" | "server";
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Category> = {}) {
    this._id = data._id;
    this.parent = data.parent;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.localImage = data.localImage;
    this.image = data.image;
    this.description = data.description || "";
    this.status = data.status || "active";
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Category {
    return new Category({
      _id: row._id,
      parent: row.parent,
      name: JSON.parse(row.name),
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      localImage: row.localImage,
      image: row.image,
      description: row.description,
      status: row.status,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(category: Category): any {
    return {
      _id: category._id,
      parent: category.parent,
      name: JSON.stringify(category.name),
      company: JSON.stringify(category.company),
      companyRef: category.companyRef,
      localImage: category.localImage,
      image: category.image,
      description: category.description,
      status: category.status,
      source: category.source,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
