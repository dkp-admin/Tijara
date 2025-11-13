export class CreateUserTable1732209451447 {
  name = "CreateUserTable1732209451447";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS user (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          userType TEXT NOT NULL,
          permissions TEXT NOT NULL,
          status TEXT NOT NULL,
          profilePicture TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_user_company ON user(companyRef);
        CREATE INDEX IF NOT EXISTS idx_user_location ON user(locationRef);
        CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
        CREATE INDEX IF NOT EXISTS idx_user_phone ON user(phone);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS user;`;
  }
}
