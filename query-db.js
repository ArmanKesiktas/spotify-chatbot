const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runQuery(sql) {
  try {
    await client.connect();
    console.log(`🔍 Çalıştırılan sorgu: ${sql}\n`);
    
    const result = await client.query(sql);
    
    if (result.rows.length === 0) {
      console.log('📭 Sonuç bulunamadı');
      return;
    }
    
    console.log(`📊 ${result.rows.length} sonuç bulundu:\n`);
    console.table(result.rows);
    
  } catch (err) {
    console.error('❌ Sorgu hatası:', err.message);
  } finally {
    await client.end();
  }
}

// Komut satırından SQL sorgusu al
const query = process.argv[2] || 'SELECT COUNT(*) FROM spotify_plays';
runQuery(query);