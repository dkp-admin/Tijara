import { BaseRepository } from "./base-repository";
import { PrintTemplate } from "../schema/print-template";

export class PrintTemplateRepository extends BaseRepository<
  PrintTemplate,
  string
> {
  constructor() {
    super("print-template");
  }

  async create(template: PrintTemplate): Promise<PrintTemplate> {
    const id = template._id;
    const now = new Date().toISOString();

    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "print-template" (
        _id, name, locationRef, location, footer,
        returnPolicy, customText, printBarcode, showToken,
        resetCounterDaily, showOrderType, status,
        createdAt, source, createdAt, updatedAt
      ) VALUES (
        $id, $name, $locationRef, $location, $footer,
        $returnPolicy, $customText, $printBarcode, $showToken,
        $resetCounterDaily, $showOrderType, $status,
        $createdAt, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        locationRef = $locationRef,
        location = $location,
        footer = $footer,
        returnPolicy = $returnPolicy,
        customText = $customText,
        printBarcode = $printBarcode,
        showToken = $showToken,
        resetCounterDaily = $resetCounterDaily,
        showOrderType = $showOrderType,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    try {
      const params: any = {
        $id: id,
        $name: template.name,
        $locationRef: template.locationRef,
        $location: JSON.stringify(template.location),
        $footer: template.footer,
        $returnPolicy: template.returnPolicy || null,
        $customText: template.customText || null,
        $printBarcode: Number(template.printBarcode),
        $showToken: Number(template.showToken),
        $resetCounterDaily: Number(template.resetCounterDaily),
        $showOrderType: Number(template.showOrderType),
        $status: template.status,
        $source: template.source,
      };
      await statement.executeAsync(params);
      template._id = id;
      return template;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(templates: PrintTemplate[]): Promise<PrintTemplate[]> {
    const columns = [
      "_id",
      "name",
      "locationRef",
      "location",
      "footer",
      "returnPolicy",
      "customText",
      "printBarcode",
      "showToken",
      "resetCounterDaily",
      "showOrderType",
      "status",
      "source",
    ];

    const generateParams = (template: PrintTemplate) => {
      const toRow = PrintTemplate.toRow(template);
      return [
        toRow._id,
        toRow.name || "Unnamed Template",
        toRow.locationRef || "Unknown",
        toRow.location || "{}",
        toRow.footer || null,
        toRow.returnPolicy || null,
        toRow.customText || null,
        toRow.printBarcode || 0,
        toRow.showToken || 0,
        toRow.resetCounterDaily || 0,
        toRow.showOrderType || 0,
        toRow.status || "active",
        toRow.source || "server",
      ];
    };

    return this.createManyGeneric(
      "print-template",
      templates,
      columns,
      generateParams
    );
  }

  async update(id: string, template: PrintTemplate): Promise<PrintTemplate> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "print-template" SET
        name = $name,
        locationRef = $locationRef,
        location = $location,
        footer = $footer,
        returnPolicy = $returnPolicy,
        customText = $customText,
        printBarcode = $printBarcode,
        showToken = $showToken,
        resetCounterDaily = $resetCounterDaily,
        showOrderType = $showOrderType,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $name: template.name,
        $locationRef: template.locationRef,
        $location: JSON.stringify(template.location),
        $footer: template.footer,
        $returnPolicy: template.returnPolicy || null,
        $customText: template.customText || null,
        $printBarcode: Number(template.printBarcode),
        $showToken: Number(template.showToken),
        $resetCounterDaily: Number(template.resetCounterDaily),
        $showOrderType: Number(template.showOrderType),
        $status: template.status,
        $source: template.source,
      });
      template._id = id;
      return template;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "print-template" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<PrintTemplate> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "print-template" WHERE _id = $id
    `);

    const result = await statement.executeAsync({
      $id: id,
    });

    const row = await result.getFirstAsync();

    if (!row) {
      throw new Error("Print template not found");
    }

    return PrintTemplate.fromRow(row);
  }

  async findAll(): Promise<PrintTemplate[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "print-template"
    `);

    const result = await statement.executeAsync();
    const rows = await result.getAllAsync();

    return rows.map((row) => PrintTemplate.fromRow(row));
  }

  async findByLocation(locationRef: string): Promise<PrintTemplate[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "print-template"
      WHERE locationRef = $locationRef
      AND status = 'active'
      ORDER BY createdAt DESC
    `);

    const result = await statement.executeAsync({
      $locationRef: locationRef,
    });
    const rows = await result.getAllAsync();

    return rows.map((row) => PrintTemplate.fromRow(row));
  }

  async updateStatus(id: string, status: string): Promise<PrintTemplate> {
    const template = await this.findById(id);
    template.status = status;
    return this.update(id, template);
  }

  async search(query: string): Promise<PrintTemplate[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "print-template"
      WHERE name LIKE $query
      OR json_extract(location, '$.name.en') LIKE $query
      OR json_extract(location, '$.name.ar') LIKE $query
      ORDER BY createdAt DESC
    `);

    const result = await statement.executeAsync({
      $query: `%${query}%`,
    });

    const rows = await result.getAllAsync();
    return rows.map((row) => PrintTemplate.fromRow(row));
  }

  async findActiveTemplates(locationRef: string): Promise<PrintTemplate[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "print-template"
      WHERE locationRef = $locationRef
      AND status = 'active'
      ORDER BY createdAt DESC
    `);

    const result = await statement.executeAsync({
      $locationRef: locationRef,
    });

    const rows = await result.getAllAsync();
    return rows.map((row) => PrintTemplate.fromRow(row));
  }

  async duplicateTemplate(id: string, newName: string): Promise<PrintTemplate> {
    const template = await this.findById(id);
    const newTemplate = new PrintTemplate({
      ...template,
      _id: undefined,
      name: newName,
      createdAt: new Date(),
    });

    return this.create(newTemplate);
  }

  async bulkUpdate(templates: PrintTemplate[]): Promise<void> {
    const transaction = await this.db
      .getConnection()
      .execAsync("BEGIN TRANSACTION");

    try {
      for (const template of templates) {
        if (template._id) {
          await this.update(template._id, template);
        } else {
          await this.create(template);
        }
      }

      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    }
  }
}
