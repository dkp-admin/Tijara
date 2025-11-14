export class DineinData {
  noOfGuests: number;
  tableRef: string;
  table: string;
  sectionRef: string;

  constructor(data: Partial<DineinData> = {}) {
    this.noOfGuests = data.noOfGuests || 0;
    this.tableRef = data.tableRef || "";
    this.table = data.table || "";
    this.sectionRef = data.sectionRef || "";
  }

  static fromRow(row: any): DineinData {
    return new DineinData({
      noOfGuests: Number(row.noOfGuests),
      tableRef: row.tableRef,
      table: row.table,
      sectionRef: row.sectionRef,
    });
  }

  isValid(): boolean {
    return !!this.tableRef && !!this.sectionRef;
  }

  getTableDisplay(): string {
    return `${this.table} (${this.noOfGuests} guests)`;
  }
}
