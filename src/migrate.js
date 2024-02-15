import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { readdirSync } from "fs";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database("tickets.db");

const migrationFiles = readdirSync(resolve(__dirname, "migrations"));

async function runMigrations() {
  for (const migrationFile of migrationFiles) {
    const migrationName = migrationFile.replace(/\.js$/, '');
    const [existingMigration] = await getMigrationByName(migrationName);

    if (!existingMigration) {
      // Use dynamic import
      const migrationModule = await import(`./migrations/${migrationFile}`);

      // Check if the 'up' function is available and call it
      if (typeof migrationModule.up === 'function') {
        await migrationModule.up(db);
        await insertMigration(migrationName);
        console.log(`Migration ${migrationName} executed.`);
      } else {
        console.error(`Error: 'up' function not found in migration ${migrationName}.`);
      }
    }
  }
}

function getMigrationByName(name) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM migrations WHERE name = ?", [name], (err, row) => {
      if (err) reject(err);
      else resolve(row ? [row] : []);
    });
  });
}

function insertMigration(name) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO migrations (name) VALUES (?)", [name], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Create migrations table if not exists
db.run(
  `
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`,
  () => {
    runMigrations().then(() => {
      console.log("Migrations completed. Starting the application.");
    });
  }
);
