#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");

program
  .requiredOption("-d, --migration-folder <path>", "Migration folder path")
  .requiredOption("-n, --name <name>", "Migration name")
  .parse(process.argv);

const options = program.opts();

const timestamp = new Date().getTime();
const className = `${options.name}${timestamp}`;
const fileName = `${timestamp}-${options.name}.ts`;

const template = `
export class ${className} {
  name = '${className}${timestamp}'

  up(): string {
    // Return sql query to be executed
    return "";
  }

  down(): string {
    // Return sql query to be executed to revert the migration
    return "";
  }
}
`;

const folderPath = path.resolve(options.migrationFolder);

// Create migrations folder if it doesn't exist
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const filePath = path.join(folderPath, fileName);
fs.writeFileSync(filePath, template);

console.log(`Migration ${className} has been generated in ${filePath}`);
