-- Gerçek Spotify verileri için schema setup
-- 149,862 satır gerçek dinleme verisi

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

-- Gerçek verilerden örnek kayıtlar (ilk 20 satır)
INSERT INTO spotify_plays (spotify_track_uri, ts, platform, ms_played, track_name, artist_name, album_name, reason_start, reason_end, shuffle, skipped)
VALUES 
('2J3n32GeLmMjwuAzyhcSNe', '2013-07-08 02:44:34', 'web player', 3185, 'Say It, Just Say It', 'The Mowgli''s', 'Waiting For The Dawn', 'autoplay', 'clickrow', false, false),
('1oHxIPqJyvAYHy0PVrDU98', '2013-07-08 02:45:37', 'web player', 61865, 'Drinking from the Bottle (feat. Tinie Tempah)', 'Calvin Harris', '18 Months', 'clickrow', 'clickrow', false, false),
('487OPlneJNni3NWC8SYqhW', '2013-07-08 02:50:24', 'web player', 285386, 'Born To Die', 'Lana Del Rey', 'Born To Die - The Paradise Edition', 'clickrow', 'unknown', false, false),
('5IyblF777jLZj1vGHG2UD3', '2013-07-08 02:52:40', 'web player', 134022, 'Off To The Races', 'Lana Del Rey', 'Born To Die - The Paradise Edition', 'trackdone', 'clickrow', false, false),
('50VNvhzyaSplJCKWchN7a8', '2013-07-08 03:17:52', 'web player', 63485, 'Impossible', 'James Arthur', 'Impossible', 'clickrow', 'clickrow', false, false),
('4kO7mrAPfqIrsKwUOK5BFx', '2013-07-08 03:20:36', 'web player', 12846, 'Midnight City', 'M83', 'Hurry Up, We''re Dreaming', 'clickrow', 'clickrow', false, false),
('4oTIuUmpE2xdXrpon9lgfJ', '2013-07-08 03:21:13', 'web player', 36132, 'Heaven', 'Emeli Sandé', 'Our Version Of Events', 'clickrow', 'clickrow', false, false),
('49h0RYK3yzWkfbVyNJjJ01', '2013-07-08 03:22:51', 'web player', 95817, 'Do I Wanna Know?', 'Arctic Monkeys', 'Do I Wanna Know?', 'clickrow', 'clickrow', false, false),
('4iG2gAwKXsOcijVaVXzRPW', '2013-07-08 03:22:54', 'web player', 1763, 'Time to Pretend', 'MGMT', 'Oracular Spectacular', 'clickrow', 'nextbtn', false, false),
('3FtYbEfBqAlGO46NUDQSAt', '2013-07-08 03:41:21', 'web player', 229589, 'Electric Feel', 'MGMT', 'Oracular Spectacular', 'trackdone', 'trackdone', false, false),

-- 2014 verileri örnekleri
('4IIOKVxxQv7wTwM9lNw1Qj', '2014-01-07 22:35:08', 'windows', 76491, 'Awake Now', 'Parachute Youth', 'Can''t Get Better Than This', 'unknown', 'fwdbtn', false, true),
('36RlHKPmB8uiS422NQWsTi', '2014-01-07 22:44:32', 'windows', 409333, 'Little Wing', 'Stevie Ray Vaughan', 'The Best Of', 'unknown', 'trackdone', false, false),
('70LanHtkhQMMOEnQEKWpRz', '2014-01-09 18:55:59', 'windows', 202133, 'When The Sun Goes Down', 'Arctic Monkeys', 'When The Sun Goes Down', 'unknown', 'trackdone', false, false),
('28WP0jPuEdz4HTFLIhCzrd', '2014-01-09 19:03:05', 'windows', 238026, 'Sleeping Lessons', 'The Shins', 'Wincing The Night Away', 'trackdone', 'trackdone', false, false),

-- 2015 verileri örnekleri  
('5v2kpxJJPVsxfY95tdq5rI', '2015-01-12 21:31:09', 'android', 268973, 'Why Georgia', 'John Mayer', 'Room For Squares', 'appload', 'trackdone', false, false),
('2Nl1gIG2pJ1rSgdvFLlKNA', '2015-01-12 21:36:01', 'android', 292013, 'I Don''t Trust Myself (With Loving You)', 'John Mayer', 'Continuum', 'trackdone', 'trackdone', false, false),
('5DiXcVovI0FcY2s0icWWUu', '2015-01-12 22:25:38', 'android', 272506, 'Mr. Jones', 'Counting Crows', 'August And Everything After', 'trackdone', 'trackdone', false, false),
('0B7uZOwTqMBLhvbD3RIFLa', '2015-01-12 22:29:35', 'android', 229826, 'Love Somebody', 'Maroon 5', 'Overexposed', 'trackdone', 'trackdone', false, false)
ON CONFLICT DO NOTHING;