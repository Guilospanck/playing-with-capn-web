import { Database } from "bun:sqlite";

import { MIGRATIONS } from "./migrations";

export const db = new Database("mydb.sqlite", {
  // Create if not exists
  create: true,
  strict: true,
});

// enable WAL
db.run("PRAGMA journal_mode = WAL;");

const runMigrations = () => {
  db.transaction(() => {
    for (const migration of MIGRATIONS) {
      db.run(migration);
    }
  })();
};
runMigrations();
