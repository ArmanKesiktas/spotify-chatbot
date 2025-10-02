-- read-only kullanıcı (uygulama bununla bağlanacak)
CREATE USER reader WITH PASSWORD 'reader_pw';
GRANT CONNECT ON DATABASE dwh_chatbot TO reader;

-- tablo şeması (CSV başlıklarına göre ayarla; tipler makuldür)
CREATE TABLE IF NOT EXISTS spotify_plays (
  spotify_track_uri TEXT,
  ts TIMESTAMP,
  platform TEXT,
  ms_played INTEGER,
  track_name TEXT,
  artist_name TEXT,
  album_name TEXT,
  reason_start TEXT,
  reason_end TEXT,
  shuffle BOOLEAN,
  skipped BOOLEAN
);

-- indeksler (sorguları hızlandırır)
CREATE INDEX IF NOT EXISTS ix_sp_ts ON spotify_plays(ts);
CREATE INDEX IF NOT EXISTS ix_sp_track ON spotify_plays(track_name);
CREATE INDEX IF NOT EXISTS ix_sp_artist ON spotify_plays(artist_name);

-- reader'a yalnızca SELECT yetkisi
GRANT USAGE ON SCHEMA public TO reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reader;
