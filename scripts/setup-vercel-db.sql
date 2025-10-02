-- Vercel Postgres için schema setup
-- Kullanıcı oluşturmaya gerek yok, Vercel otomatik hallediyor

-- Spotify plays tablosu
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

-- Performans için indeksler
CREATE INDEX IF NOT EXISTS ix_sp_ts ON spotify_plays(ts);
CREATE INDEX IF NOT EXISTS ix_sp_track ON spotify_plays(track_name);
CREATE INDEX IF NOT EXISTS ix_sp_artist ON spotify_plays(artist_name);
CREATE INDEX IF NOT EXISTS ix_sp_album ON spotify_plays(album_name);
CREATE INDEX IF NOT EXISTS ix_sp_ms_played ON spotify_plays(ms_played);

-- Test verisi (birkaç örnek)
INSERT INTO spotify_plays (spotify_track_uri, ts, platform, ms_played, track_name, artist_name, album_name, reason_start, reason_end, shuffle, skipped)
VALUES 
('spotify:track:4iV5W9uYEdYUVa79Axb7Rh', '2013-10-01 08:00:00', 'android', 240000, 'Bad Blood', 'Taylor Swift', '1989', 'trackdone', 'trackdone', false, false),
('spotify:track:1BxfuPKGuaTgP7aM0Bbdwr', '2013-10-01 09:15:00', 'android', 180000, 'Shake It Off', 'Taylor Swift', '1989', 'trackdone', 'trackdone', false, false),
('spotify:track:0VjIjW4GlUZAMYd2vXMi3b', '2013-10-01 10:30:00', 'desktop', 210000, 'Blank Space', 'Taylor Swift', '1989', 'clickrow', 'trackdone', true, false),
('spotify:track:5ghIJDpPoe3CfHMGu71E6T', '2013-10-02 14:00:00', 'android', 195000, 'All Too Well', 'Taylor Swift', 'Red', 'trackdone', 'trackdone', false, false),
('spotify:track:6Im9k8u9iIVKUMRpFy5Ig7', '2013-10-02 15:20:00', 'android', 150000, 'We Are Never Ever Getting Back Together', 'Taylor Swift', 'Red', 'fwdbtn', 'trackdone', false, false),
('spotify:track:4D7BCuvgdJlYvlX5WlN54t', '2013-10-03 11:10:00', 'desktop', 205000, 'Love Song', 'Sara Bareilles', 'Little Voice', 'clickrow', 'trackdone', false, false),
('spotify:track:7qiZfU4dY1lWllzX7mPBI3', 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh', '2013-10-03 16:45:00', 'android', 175000, 'Shape of You', 'Ed Sheeran', '÷ (Divide)', 'trackdone', 'fwdbtn', true, true),
('spotify:track:6habFhsOp2NvshLv26DqMb', '2013-10-04 12:30:00', 'android', 230000, 'Someone Like You', 'Adele', '21', 'trackdone', 'trackdone', false, false),
('spotify:track:4LRPiXqCikLlN15c3yImP7', '2013-10-04 18:00:00', 'desktop', 200000, 'Anti-Hero', 'Taylor Swift', 'Midnights', 'clickrow', 'trackdone', false, false),
('spotify:track:1BxfuPKGuaTgP7aM0Bbdwr', '2013-10-05 20:15:00', 'android', 240000, 'Shake It Off', 'Taylor Swift', '1989', 'trackdone', 'trackdone', true, false)
ON CONFLICT DO NOTHING;