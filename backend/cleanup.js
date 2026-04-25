const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bookstore.db');

db.serialize(() => {
  db.run("DELETE FROM 'order' WHERE createdAt >= '2026-05-01'", function(err) {
    if(err) {
      console.error('Hata:', err);
    } else {
      console.log('Silinen order sayisi:', this.changes);
    }
  });
});
db.close();
