import { CashDrawerTransaction } from "../schema/cashdrawer-txn";
import { BaseRepository } from "./base-repository";

export class CashDrawerTransactionRepository extends BaseRepository<
  CashDrawerTransaction,
  string
> {
  constructor() {
    super('"cash-drawer-txns"');
  }

  async create(
    transaction: CashDrawerTransaction
  ): Promise<CashDrawerTransaction> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "cash-drawer-txns" (
        _id, userRef, user, location, locationRef, company, companyRef,
        openingActual, openingExpected, closingActual, closingExpected,
        difference, totalSales, transactionType, description, shiftIn,
        dayEnd, started, ended, source, createdAt, updatedAt
      ) VALUES (
        $id, $userRef, $user, $location, $locationRef, $company, $companyRef,
        $openingActual, $openingExpected, $closingActual, $closingExpected,
        $difference, $totalSales, $transactionType, $description, $shiftIn,
        $dayEnd, $started, $ended, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        userRef = $userRef,
        user = $user,
        location = $location,
        locationRef = $locationRef,
        company = $company,
        companyRef = $companyRef,
        openingActual = $openingActual,
        openingExpected = $openingExpected,
        closingActual = $closingActual,
        closingExpected = $closingExpected,
        difference = $difference,
        totalSales = $totalSales,
        transactionType = $transactionType,
        description = $description,
        shiftIn = $shiftIn,
        dayEnd = $dayEnd,
        started = $started,
        ended = $ended,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: transaction._id,
      $userRef: transaction.userRef,
      $user: JSON.stringify(transaction.user),
      $location: JSON.stringify(transaction.location),
      $locationRef: transaction.locationRef,
      $company: JSON.stringify(transaction.company),
      $companyRef: transaction.companyRef,
      $openingActual: transaction.openingActual || null,
      $openingExpected: transaction.openingExpected || null,
      $closingActual: transaction.closingActual || null,
      $closingExpected: transaction.closingExpected || null,
      $difference: transaction.difference || null,
      $totalSales: transaction.totalSales || null,
      $transactionType: transaction.transactionType,
      $description: transaction.description,
      $shiftIn: Number(transaction.shiftIn),
      $dayEnd: Number(transaction.dayEnd),
      $started: transaction.started.toISOString(),
      $ended: transaction.ended.toISOString(),
      $source: transaction.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? CashDrawerTransaction.fromRow(created) : transaction;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(
    transactions: CashDrawerTransaction[]
  ): Promise<CashDrawerTransaction[]> {
    const columns = [
      "_id",
      "userRef",
      "user",
      "location",
      "locationRef",
      "company",
      "companyRef",
      "openingActual",
      "openingExpected",
      "closingActual",
      "closingExpected",
      "difference",
      "totalSales",
      "transactionType",
      "description",
      "shiftIn",
      "dayEnd",
      "started",
      "ended",
      "source",
    ];

    const generateParams = (transaction: CashDrawerTransaction) => {
      const toRowData = CashDrawerTransaction.toRow(transaction);
      return [
        toRowData._id,
        toRowData.userRef,
        toRowData.user,
        toRowData.location,
        toRowData.locationRef,
        toRowData.company,
        toRowData.companyRef,
        toRowData.openingActual || null,
        toRowData.openingExpected || null,
        toRowData.closingActual || null,
        toRowData.closingExpected || null,
        toRowData.difference || null,
        toRowData.totalSales || null,
        toRowData.transactionType,
        toRowData.description,
        toRowData.shiftIn,
        toRowData.dayEnd,
        toRowData.started.toISOString(),
        toRowData.ended.toISOString(),
        toRowData.source || "server",
      ];
    };

    return this.createManyGeneric(
      "cash-drawer-txns",
      transactions,
      columns,
      generateParams
    );
  }

  async update(
    id: string,
    transaction: CashDrawerTransaction
  ): Promise<CashDrawerTransaction> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "cash-drawer-txns" SET
        userRef = $userRef,
        user = $user,
        location = $location,
        locationRef = $locationRef,
        company = $company,
        companyRef = $companyRef,
        openingActual = $openingActual,
        openingExpected = $openingExpected,
        closingActual = $closingActual,
        closingExpected = $closingExpected,
        difference = $difference,
        totalSales = $totalSales,
        transactionType = $transactionType,
        description = $description,
        shiftIn = $shiftIn,
        dayEnd = $dayEnd,
        started = $started,
        ended = $ended,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $userRef: transaction.userRef,
      $user: JSON.stringify(transaction.user),
      $location: JSON.stringify(transaction.location),
      $locationRef: transaction.locationRef,
      $company: JSON.stringify(transaction.company),
      $companyRef: transaction.companyRef,
      $openingActual: transaction.openingActual || null,
      $openingExpected: transaction.openingExpected || null,
      $closingActual: transaction.closingActual || null,
      $closingExpected: transaction.closingExpected || null,
      $difference: transaction.difference || null,
      $totalSales: transaction.totalSales || null,
      $transactionType: transaction.transactionType,
      $description: transaction.description,
      $shiftIn: Number(transaction.shiftIn),
      $dayEnd: Number(transaction.dayEnd),
      $started: transaction.started.toISOString(),
      $ended: transaction.ended.toISOString(),
      $source: transaction.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? CashDrawerTransaction.fromRow(updated) : transaction;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "cash-drawer-txns" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<CashDrawerTransaction> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Cash drawer transaction not found");
      }
      return CashDrawerTransaction.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findLatestByCompanyRef(
    companyRef: string
  ): Promise<CashDrawerTransaction | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns"
      WHERE companyRef = $companyRef
      ORDER BY _id DESC
      LIMIT 1
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const row = await result.getFirstAsync();
      return row ? CashDrawerTransaction.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<CashDrawerTransaction[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => CashDrawerTransaction.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByUserRef(userRef: string): Promise<CashDrawerTransaction[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns" WHERE userRef = $userRef
    `);

    try {
      const result = await statement.executeAsync({ $userRef: userRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => CashDrawerTransaction.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocationRef(
    locationRef: string
  ): Promise<CashDrawerTransaction[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns" WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => CashDrawerTransaction.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findOpenTransactions(): Promise<CashDrawerTransaction[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "cash-drawer-txns" WHERE closingActual IS NULL
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => CashDrawerTransaction.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }
}
