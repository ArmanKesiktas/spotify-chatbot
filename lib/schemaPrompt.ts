const dbSchema = `
TABLO: spotify_plays
KOLONLAR:
- spotify_track_uri TEXT
- ts TIMESTAMP  
- platform TEXT
- ms_played INT (dinleme süresi milisaniye)
- track_name TEXT (şarkı adı)
- artist_name TEXT (sanatçı adı) 
- album_name TEXT (albüm adı)
- reason_start TEXT
- reason_end TEXT
- shuffle BOOLEAN
- skipped BOOLEAN

ÖNEMLI KURALLAR:
1. SADECE PostgreSQL SELECT sorgusu yaz
2. Kod bloğu kullanma, sadece düz SQL
3. Açıklama yazma, sadece SQL kodu döndür
4. LIMIT 200 otomatik eklenir, sen ekleme
5. AGGREGATE fonksiyonlar kullanırken GROUP BY zorunlu

YAYGIN SORGULAR:
- En çok dinlenen sanatçı: SELECT artist_name, SUM(ms_played) as total_ms FROM spotify_plays GROUP BY artist_name ORDER BY total_ms DESC
- En popüler şarkı: SELECT track_name, artist_name, SUM(ms_played) as total_ms FROM spotify_plays GROUP BY track_name, artist_name ORDER BY total_ms DESC  
- Son 30 günde: WHERE ts >= NOW() - INTERVAL '30 days'
- Dinleme saati: SUM(ms_played)/3600000.0 as hours
- Kaç kez dinlendi: COUNT(*) as play_count

ÖRN: En fazla dinlenen ilk 3 sanatçı
YANIT: SELECT artist_name, SUM(ms_played) as total_ms FROM spotify_plays GROUP BY artist_name ORDER BY total_ms DESC LIMIT 3
`;

export { dbSchema };