import csv
import psycopg2
from psycopg2.extras import execute_values
import os
from datetime import datetime

def import_csv_to_postgres():
    # Neon database connection string'inizi buraya ekleyin
    # Format: postgresql://username:password@endpoint/database?sslmode=require
    DATABASE_URL = input("Neon connection string'inizi girin: ")
    
    if not DATABASE_URL or "postgresql://" not in DATABASE_URL:
        print("❌ Geçerli bir connection string girin!")
        return
    
    try:
        print("🔌 Database'e bağlanılıyor...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Önce tabloyu oluştur
        print("📋 Tablo oluşturuluyor...")
        cur.execute("""
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
            )
        """)
        
        # CSV dosyasını oku
        csv_file = '../db/init/spotify_plays.csv'
        data = []
        
        print(f"📁 CSV dosyası okunuyor: {csv_file}")
        if not os.path.exists(csv_file):
            print(f"❌ Dosya bulunamadı: {csv_file}")
            print("📍 Mevcut dizin:", os.getcwd())
            print("📂 Dosyalar:", os.listdir('../db/init/'))
            return
        with open(csv_file, 'r', encoding='utf-8-sig') as file:  # BOM'u handle et
            csv_reader = csv.DictReader(file)
            for row_num, row in enumerate(csv_reader, 1):
                try:
                    # Boş veya eksik spotify_track_uri'yi skip et
                    if not row.get('spotify_track_uri') or row['spotify_track_uri'].strip() == '':
                        if row_num <= 10:  # İlk 10 hatayı göster
                            print(f"⚠️ Satır {row_num} spotify_track_uri eksik, atlanıyor...")
                        continue
                    
                    # Boolean değerleri dönüştür
                    shuffle = row['shuffle'].upper() == 'TRUE'
                    skipped = row['skipped'].upper() == 'TRUE'
                    
                    # Timestamp'i parse et
                    ts = datetime.strptime(row['ts'], '%Y-%m-%d %H:%M:%S')
                    
                    # String'lerdeki apostrofu escape et
                    track_name = row['track_name'].replace("'", "''")
                    artist_name = row['artist_name'].replace("'", "''")
                    album_name = row['album_name'].replace("'", "''")
                    
                    # Veriyi hazırla
                    data.append((
                        row['spotify_track_uri'],
                        ts,
                        row['platform'],
                        int(row['ms_played']),
                        track_name,
                        artist_name,
                        album_name,
                        row['reason_start'],
                        row['reason_end'],
                        shuffle,
                        skipped
                    ))
                    
                    # Progress göster
                    if row_num % 5000 == 0:
                        print(f"📊 {row_num:,} satır işlendi...")
                        
                    # Batch olarak insert et (memory'yi korumak için)
                    if len(data) >= 1000:
                        print(f"💾 {row_num:,} satır database'e yazılıyor...")
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
                            page_size=500
                        )
                        conn.commit()
                        data = []  # Reset batch
                        
                except Exception as e:
                    print(f"⚠️ Satır {row_num} hatası: {e}")
                    continue
        
        # Kalan veriyi insert et
        if data:
            print(f"💾 Son {len(data)} satır yazılıyor...")
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
                page_size=500
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
        
        cur.execute("SELECT MIN(ts), MAX(ts) FROM spotify_plays")
        date_range = cur.fetchone()
        
        print(f"\n📊 Import Tamamlandı!")
        print(f"   - Toplam dinleme: {total_count:,}")
        print(f"   - Toplam sanatçı: {artist_count:,}")
        print(f"   - Toplam şarkı: {track_count:,}")
        print(f"   - Tarih aralığı: {date_range[0]} - {date_range[1]}")
        
        # İndeks oluştur
        print("\n🔧 İndeksler oluşturuluyor...")
        indexes = [
            "CREATE INDEX IF NOT EXISTS ix_sp_ts ON spotify_plays(ts)",
            "CREATE INDEX IF NOT EXISTS ix_sp_track ON spotify_plays(track_name)",
            "CREATE INDEX IF NOT EXISTS ix_sp_artist ON spotify_plays(artist_name)",
            "CREATE INDEX IF NOT EXISTS ix_sp_album ON spotify_plays(album_name)",
            "CREATE INDEX IF NOT EXISTS ix_sp_ms_played ON spotify_plays(ms_played)"
        ]
        
        for idx in indexes:
            cur.execute(idx)
        
        conn.commit()
        print("✅ İndeksler oluşturuldu!")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🎵 Spotify CSV → Neon PostgreSQL Import")
    print("=" * 40)
    import_csv_to_postgres()