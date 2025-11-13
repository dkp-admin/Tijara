const { spawn } = require("child_process");

// Get the migration name from command-line arguments
const migrationName = process.argv[2];

// Execute the typeorm migration:create command
const migrationCreateProcess = spawn("yarn", [
  "typeorm",
  "migration:create",
  `./src/database/migrations/${migrationName}`,
]);

// Forward the command output to the console
migrationCreateProcess.stdout.on("data", (data) => {
  console.log(data.toString());
});

// Forward any errors to the console
migrationCreateProcess.stderr.on("data", (data) => {
  console.error(data.toString());
});

// Handle the completion of the command
migrationCreateProcess.on("close", (code) => {
  if (code === 0) {
    console.log("Migration creation completed successfully.");
  } else {
    console.error("Migration creation failed.");
  }
});
