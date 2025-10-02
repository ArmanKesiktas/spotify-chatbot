import csv
import os

csv_file = '../db/init/spotify_plays.csv'

print(f"📁 CSV analizi: {csv_file}")

with open(csv_file, 'r', encoding='utf-8-sig') as file:  # BOM'u handle et
    csv_reader = csv.DictReader(file)
    
    # Header'ları yazdır
    print(f"📊 Sütunlar: {list(csv_reader.fieldnames)}")
    
    valid_rows = 0
    invalid_rows = 0
    first_few_shown = 0
    
    for row_num, row in enumerate(csv_reader, 1):
        if not row.get('spotify_track_uri') or row['spotify_track_uri'].strip() == '':
            invalid_rows += 1
            if invalid_rows <= 5:  # İlk 5 hatalı satırı göster
                print(f"❌ Satır {row_num}: spotify_track_uri eksik")
        else:
            valid_rows += 1
            if first_few_shown < 3:  # İlk 3 geçerli satırı göster
                print(f"✅ Satır {row_num}: {row['track_name']} - {row['artist_name']}")
                first_few_shown += 1
        
        # Her 50,000 satırda bir progress göster
        if row_num % 50000 == 0:
            print(f"📊 {row_num:,} satır kontrol edildi...")
    
    print(f"\n📈 Toplam analiz:")
    print(f"   ✅ Geçerli satırlar: {valid_rows:,}")
    print(f"   ❌ Geçersiz satırlar: {invalid_rows:,}")
    print(f"   📊 Toplam: {row_num:,}")
    print(f"   📍 Başarı oranı: %{(valid_rows/row_num)*100:.1f}")