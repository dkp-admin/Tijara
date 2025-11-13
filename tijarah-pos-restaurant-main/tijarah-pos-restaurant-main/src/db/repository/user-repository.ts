import { BaseRepository } from "./base-repository";
import { User } from "../schema/user";

export interface FindOptions {
  where: {
    name?: { _ilike?: string } | string;
    userType?: string;
    status?: string;
    companyRef?: string;
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class UserRepository extends BaseRepository<User, string> {
  constructor() {
    super("device-user");
  }

  async create(user: User): Promise<User> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "device-user" (
        _id, name, company, companyRef, location,
        locationRefs, locationRef, profilePicture,
        email, phone, userType, permissions,
        status, onboarded, createdAt, updatedAt,
        version, pin, key, value
      ) VALUES (
        $id, $name, $company, $companyRef, $location,
        $locationRefs, $locationRef, $profilePicture,
        $email, $phone, $userType, $permissions,
        $status, $onboarded, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        $version, $pin, $key, $value
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRefs = $locationRefs,
        locationRef = $locationRef,
        profilePicture = $profilePicture,
        email = $email,
        phone = $phone,
        userType = $userType,
        permissions = $permissions,
        status = $status,
        onboarded = $onboarded,
        updatedAt = CURRENT_TIMESTAMP,
        version = $version,
        pin = $pin,
        key = $key,
        value = $value
    `);

    const params: any = {
      $id: user._id,
      $name: user.name,
      $company: JSON.stringify(user.company),
      $companyRef: user.companyRef,
      $location: JSON.stringify(user.location),
      $locationRefs: JSON.stringify(user.locationRefs),
      $locationRef: user.locationRef,
      $profilePicture: user.profilePicture,
      $email: user.email,
      $phone: user.phone,
      $userType: user.userType,
      $permissions: JSON.stringify(user.permissions),
      $status: user.status,
      $onboarded: Number(user.onboarded),
      $createdAt: now,
      $updatedAt: now,
      $version: user.version,
      $pin: user.pin,
      $key: user.key,
      $value: user.value,
    };

    try {
      await statement.executeAsync(params);
      user.createdAt = now;
      user.updatedAt = now;
      return user;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(users: User[]): Promise<User[]> {
    const columns = [
      "_id",
      "name",
      "company",
      "companyRef",
      "location",
      "locationRefs",
      "locationRef",
      "profilePicture",
      "email",
      "phone",
      "userType",
      "permissions",
      "status",
      "onboarded",
      "version",
      "pin",
      "key",
      "value",
    ];

    const generateParams = (user: User) => {
      const toRow = User.toRow(user);
      return [
        toRow._id,
        toRow.name,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRefs,
        toRow.locationRef,
        toRow.profilePicture,
        toRow.email,
        toRow.phone,
        toRow.userType,
        toRow.permissions,
        toRow.status,
        toRow.onboarded,
        toRow.version,
        toRow.pin,
        toRow.key,
        toRow.value,
      ];
    };

    return this.createManyGeneric(
      "device-user",
      users,
      columns,
      generateParams
    );
  }

  async find(options: FindOptions): Promise<User[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            if (value._ilike && key === "name") {
              const cleanPattern = `%${value._ilike.replace(/%/g, "")}%`;
              conditions.push(`(
                LOWER(name) LIKE $pattern${paramIndex}
                OR LOWER(email) LIKE $pattern${paramIndex}
                OR LOWER(phone) LIKE $pattern${paramIndex}
              )`);
              params[`$pattern${paramIndex}`] = cleanPattern;
            } else if (value._ilike) {
              const paramName = `$param${paramIndex}`;
              conditions.push(`${key} LIKE ${paramName}`);
              params[paramName] = `%${value._ilike}%`;
            }
            paramIndex++;
          } else {
            const paramName = `$param${paramIndex}`;
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
            paramIndex++;
          }
        });
      }

      let baseQuery = "SELECT * FROM user";
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => `${key} ${direction}`
        );
        baseQuery += ` ORDER BY ${orderClauses.join(", ")}`;
      } else {
        baseQuery += ` ORDER BY name ASC`;
      }

      const statement = await this.db.getConnection().prepareAsync(baseQuery);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => User.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in finduser:", error);
      return [];
    }
  }

  async update(id: string, user: User): Promise<User> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "device-user" SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRefs = $locationRefs,
        locationRef = $locationRef,
        profilePicture = $profilePicture,
        email = $email,
        phone = $phone,
        userType = $userType,
        permissions = $permissions,
        status = $status,
        onboarded = $onboarded,
        updatedAt = $updatedAt,
        version = $version,
        pin = $pin,
        key = $key,
        value = $value,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $name: user.name,
      $company: JSON.stringify(user.company),
      $companyRef: user.companyRef,
      $location: JSON.stringify(user.location),
      $locationRefs: JSON.stringify(user.locationRefs),
      $locationRef: user.locationRef,
      $profilePicture: user.profilePicture,
      $email: user.email,
      $phone: user.phone,
      $userType: user.userType,
      $permissions: JSON.stringify(user.permissions),
      $status: user.status,
      $onboarded: Number(user.onboarded),
      $updatedAt: now,
      $version: user.version + 1,
      $pin: user.pin,
      $key: user.key,
      $value: user.value,
    };

    try {
      await statement.executeAsync(params);
      user.updatedAt = now;
      user.version += 1;
      return user;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "device-user" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<User> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("User not found");
      }
      return User.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<User[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => User.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE email = $email
    `);

    try {
      const result = await statement.executeAsync({ $email: email });
      const row = await result.getFirstAsync();
      return row ? User.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE phone = $phone
    `);

    try {
      const result = await statement.executeAsync({ $phone: phone });
      const row = await result.getFirstAsync();
      return row ? User.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<User[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE companyRef = $companyRef
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => User.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<User[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => User.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async validatePin(id: string, pin: string): Promise<boolean> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT pin FROM "device-user" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row: any = await result.getFirstAsync();
      return row?.pin === pin;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updatePermissions(id: string, permissions: string[]): Promise<User> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "device-user" 
      SET permissions = $permissions,
          updatedAt = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $permissions: JSON.stringify(permissions),
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "device-user" 
      SET status = $status,
          updatedAt = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: status,
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }
}
