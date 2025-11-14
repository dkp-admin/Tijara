import { BaseRepository } from "./base-repository";
import { DeviceUser } from "../schema/device-user";

export class DeviceUserRepository extends BaseRepository<DeviceUser, string> {
  constructor() {
    super('"device-user"');
  }

  async create(user: DeviceUser): Promise<DeviceUser> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "device-user" (
        _id, name, company, companyRef, location, locationRef,
        profilePicture, email, phone, userType, permissions,
        status, onboarded, createdAt, updatedAt, version,
        pin, deviceId, key, value
      ) VALUES (
        $id, $name, $company, $companyRef, $location, $locationRef,
        $profilePicture, $email, $phone, $userType, $permissions,
        $status, $onboarded, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $version,
        $pin, $deviceId, $key, $value
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        location = $location,
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
        deviceId = $deviceId,
        key = $key,
        value = $value
    `);

    const params: any = {
      $id: user._id,
      $name: user.name,
      $company: JSON.stringify(user.company),
      $companyRef: user.companyRef,
      $location: JSON.stringify(user.location),
      $locationRef: user.locationRef,
      $profilePicture: user.profilePicture,
      $email: user.email,
      $phone: user.phone,
      $userType: user.userType,
      $permissions: JSON.stringify(user.permissions),
      $status: user.status,
      $onboarded: Number(user.onboarded),
      $createdAt: user.createdAt,
      $updatedAt: user.updatedAt,
      $version: user.version,
      $pin: user.pin,
      $deviceId: user.deviceId,
      $key: user.key,
      $value: user.value,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? DeviceUser.fromRow(created) : user;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(users: DeviceUser[]): Promise<DeviceUser[]> {
    const columns = [
      "_id",
      "name",
      "company",
      "companyRef",
      "location",
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
      "deviceId",
      "key",
      "value",
    ];

    const generateParams = (user: DeviceUser) => {
      const toRow = DeviceUser.toRow(user);
      return [
        toRow._id,
        toRow.name,
        toRow.company,
        toRow.companyRef,
        toRow.location,
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
        toRow.deviceId,
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

  async update(id: string, user: DeviceUser): Promise<DeviceUser> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "device-user" SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        location = $location,
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
        deviceId = $deviceId,
        updatedAt = CURRENT_TIMESTAMP,
        key = $key,
        value = $value
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $name: user.name,
      $company: JSON.stringify(user.company),
      $companyRef: user.companyRef,
      $location: JSON.stringify(user.location),
      $locationRef: user.locationRef,
      $profilePicture: user.profilePicture,
      $email: user.email,
      $phone: user.phone,
      $userType: user.userType,
      $permissions: JSON.stringify(user.permissions),
      $status: user.status,
      $onboarded: Number(user.onboarded),
      $updatedAt: new Date().toISOString(),
      $version: user.version + 1,
      $pin: user.pin,
      $deviceId: user.deviceId,
      $key: user.key,
      $value: user.value,
    };

    try {
      const result = await statement.executeAsync(params);
      user._id = id;
      user.updatedAt = new Date().toISOString();
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

  async findById(id: string): Promise<DeviceUser> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Device user not found");
      }
      return DeviceUser.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<DeviceUser[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => DeviceUser.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByEmail(email: string): Promise<DeviceUser | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE email = $email
    `);

    try {
      const result = await statement.executeAsync({ $email: email });
      const row = await result.getFirstAsync();
      return row ? DeviceUser.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompanyRef(companyRef: string): Promise<DeviceUser[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE companyRef = $companyRef
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => DeviceUser.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocationRef(locationRef: string): Promise<DeviceUser[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "device-user" WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => DeviceUser.fromRow(row));
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

  async updatePermissions(
    id: string,
    permissions: string[]
  ): Promise<DeviceUser> {
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

  async updateStatus(id: string, status: string): Promise<DeviceUser> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "device-user" 
      SET status = $status,
          updatedAt = CURRENT_TIMESTAMP,,
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
