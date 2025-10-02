import csv
import psycopg2
from psycopg2.extras import execute_values
import os
from datetime import datetime

def import_csv_to_postgres():
    # Neon database connection
    # Buraya Neon connection string'inizi ekleyin
    DATABASE_URL = "postgresql://[your-username]:[your-password]@[your-endpoint]/[your-database]?sslmode=require"
    
    try:
        # Database bağlantısı
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # CSV dosyasını oku
        csv_file = 'db/init/spotify_plays.csv'
        data = []
        
        print("CSV dosyası okunuyor...")
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row_num, row in enumerate(csv_reader, 1):
                # Boolean değerleri dönüştür
                shuffle = row['shuffle'].upper() == 'TRUE'
                skipped = row['skipped'].upper() == 'TRUE'
                
                # Timestamp'i parse et
                ts = datetime.strptime(row['ts'], '%Y-%m-%d %H:%M:%S')
                
                # Veriyi hazırla
                data.append((
                    row['spotify_track_uri'],
                    ts,
                    row['platform'],
                    int(row['ms_played']),
                    row['track_name'].replace("'", "''"),  # SQL escape
                    row['artist_name'].replace("'", "''"),
                    row['album_name'].replace("'", "''"),
                    row['reason_start'],
                    row['reason_end'],
                    shuffle,
                    skipped
                ))
                
                if row_num % 10000 == 0:
                    print(f"{row_num} satır işlendi...")
        
        print(f"Toplam {len(data)} satır hazırlandı.")
        
        # Batch insert
        print("Database'e veri aktarılıyor...")
        execute_values(
            cur,
            """
            INSERT INTO spotify_plays 
            (spotify_track_uri, ts, platform, ms_played, track_name, artist_name, album_name, reason_start, reason_end, shuffle, skipped)
            VALUES %s
            ON CONFLICT DO NOTHING
            """,
            data,
            template=None,
            page_size=1000
        )
        
        conn.commit()
        print("✅ Veri aktarımı tamamlandı!")
        
        # İstatistikler
        cur.execute("SELECT COUNT(*) FROM spotify_plays")
        total_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(DISTINCT artist_name) FROM spotify_plays")
        artist_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(DISTINCT track_name) FROM spotify_plays")
        track_count = cur.fetchone()[0]
        
        print(f"📊 Database İstatistikleri:")
        print(f"   - Toplam dinleme: {total_count:,}")
        print(f"   - Toplam sanatçı: {artist_count:,}")
        print(f"   - Toplam şarkı: {track_count:,}")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    import_csv_to_postgres()