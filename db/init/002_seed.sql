COPY spotify_plays
(spotify_track_uri, ts, platform, ms_played, track_name, artist_name, album_name, reason_start, reason_end, shuffle, skipped)
FROM '/docker-entrypoint-initdb.d/spotify_plays.csv'   -- DOĞRU: initdb.d
WITH (FORMAT csv, HEADER true);