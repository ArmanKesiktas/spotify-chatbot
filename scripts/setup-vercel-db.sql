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

-- Test verisi (2013-2015 yılları arası daha fazla veri)
INSERT INTO spotify_plays (spotify_track_uri, ts, platform, ms_played, track_name, artist_name, album_name, reason_start, reason_end, shuffle, skipped)
VALUES 
-- 2013 verileri
('spotify:track:4iV5W9uYEdYUVa79Axb7Rh', '2013-10-01 08:00:00', 'android', 240000, 'Bad Blood', 'Taylor Swift', '1989', 'trackdone', 'trackdone', false, false),
('spotify:track:1BxfuPKGuaTgP7aM0Bbdwr', '2013-10-01 09:15:00', 'android', 180000, 'Shake It Off', 'Taylor Swift', '1989', 'trackdone', 'trackdone', false, false),
('spotify:track:0VjIjW4GlUZAMYd2vXMi3b', '2013-10-01 10:30:00', 'desktop', 210000, 'Blank Space', 'Taylor Swift', '1989', 'clickrow', 'trackdone', true, false),
('spotify:track:5ghIJDpPoe3CfHMGu71E6T', '2013-10-02 14:00:00', 'android', 195000, 'All Too Well', 'Taylor Swift', 'Red', 'trackdone', 'trackdone', false, false),
('spotify:track:6Im9k8u9iIVKUMRpFy5Ig7', '2013-10-02 15:20:00', 'android', 150000, 'We Are Never Ever Getting Back Together', 'Taylor Swift', 'Red', 'fwdbtn', 'trackdone', false, false),

-- 2014 verileri
('spotify:track:7qiZfU4dY1lWllzX7mPBI3', '2014-03-15 16:45:00', 'android', 250000, 'Shape of You', 'Ed Sheeran', '÷ (Divide)', 'trackdone', 'trackdone', false, false),
('spotify:track:6habFhsOp2NvshLv26DqMb', '2014-05-20 12:30:00', 'android', 280000, 'Someone Like You', 'Adele', '21', 'trackdone', 'trackdone', false, false),
('spotify:track:4LRPiXqCikLlN15c3yImP7', '2014-07-10 18:00:00', 'desktop', 300000, 'Happy', 'Pharrell Williams', 'G I R L', 'clickrow', 'trackdone', false, false),
('spotify:track:8UXaY2z7z9z7z9z7z9z7z9', '2014-09-05 20:15:00', 'android', 275000, 'All of Me', 'John Legend', 'Love in the Future', 'trackdone', 'trackdone', false, false),
('spotify:track:9ABC123456789DEF123456', '2014-11-12 14:30:00', 'desktop', 260000, 'Counting Stars', 'OneRepublic', 'Native', 'clickrow', 'trackdone', true, false),

-- 2015 verileri  
('spotify:track:4D7BCuvgdJlYvlX5WlN54t', '2015-02-03 11:10:00', 'desktop', 290000, 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'Uptown Special', 'clickrow', 'trackdone', false, false),
('spotify:track:5EFG789012345HIJ789012', '2015-04-18 16:20:00', 'android', 285000, 'See You Again', 'Wiz Khalifa ft. Charlie Puth', 'Furious 7 Soundtrack', 'trackdone', 'trackdone', false, false),
('spotify:track:6IJK345678901LMN345678', '2015-06-25 19:45:00', 'desktop', 270000, 'Can''t Feel My Face', 'The Weeknd', 'Beauty Behind the Madness', 'trackdone', 'trackdone', true, false),
('spotify:track:7NOP901234567QRS901234', '2015-08-14 13:15:00', 'android', 295000, 'What Do You Mean?', 'Justin Bieber', 'Purpose', 'clickrow', 'trackdone', false, false),
('spotify:track:8TUV567890123WXY567890', '2015-10-30 21:00:00', 'desktop', 310000, 'Hello', 'Adele', '25', 'trackdone', 'trackdone', false, false)
ON CONFLICT DO NOTHING;