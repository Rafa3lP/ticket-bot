export async function up(db) {
  await new Promise((resolve, reject) => {
    db.run(
      `
    CREATE TABLE IF NOT EXISTS unresolvedTickets (
      id INTEGER PRIMARY KEY,
      status INTEGER,
      dataCriacao TEXT
    )
  `,
      (res, err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function down(db) {
  await new Promise((resolve, reject) => {
    db.run(`DROP TABLE unresolvedTickets`, (res, err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
