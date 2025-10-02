const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_OiyeDjpc7Cr6@ep-nameless-moon-aggbs4vh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Veritabanına başarıyla bağlandı!');
    
    // Tablolar listesi
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tablolar:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Spotify plays tablosu bilgileri
    const countResult = await client.query('SELECT COUNT(*) FROM spotify_plays');
    console.log(`\n🎵 Spotify plays tablosunda ${countResult.rows[0].count} kayıt var`);
    
    // Örnek veri
    const sampleResult = await client.query('SELECT track_name, artist_name, ms_played FROM spotify_plays ORDER BY ms_played DESC LIMIT 5');
    console.log('\n🎧 En çok dinlenen 5 şarkı:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.track_name} - ${row.artist_name} (${Math.round(row.ms_played / 1000)}s)`);
    });
    
  } catch (err) {
    console.error('❌ Veritabanı hatası:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();