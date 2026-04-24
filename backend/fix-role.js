const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:\\Users\\thinkpad\\Desktop\\yazilim-odev1\\backend\\bookstore.db');

db.serialize(() => {
  db.run(`UPDATE users SET role = 'admin' WHERE email = 'admin@kitabevi.com'`, function(err) {
    if (err) {
      console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
  });
});

db.close();

