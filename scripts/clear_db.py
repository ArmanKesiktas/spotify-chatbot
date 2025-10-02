import psycopg2

# Neon connection string
DATABASE_URL = "postgresql://neondb_owner:npg_OiyeDjpc7Cr6@ep-nameless-moon-aggbs4vh-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def clear_table():
    """Tabloyu temizle ve yeniden başlat"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🗑️ Mevcut veriler temizleniyor...")
        cur.execute("TRUNCATE TABLE spotify_plays RESTART IDENTITY")
        conn.commit()
        
        # Kayıt sayısını kontrol et
        cur.execute("SELECT COUNT(*) FROM spotify_plays")
        count = cur.fetchone()[0]
        print(f"✅ Tablo temizlendi. Kalan kayıt: {count}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Hata: {e}")

if __name__ == "__main__":
    clear_table()