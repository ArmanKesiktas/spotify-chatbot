# Spotify Data Warehouse Chatbot

Spotify verilerinizi Türkçe sorularla sorgulayabileceğiniz bir AI chatbot uygulaması. Google Gemini AI kullanarak doğal dil sorularını PostgreSQL sorgularına çevirir.

## Özellikler

- 🎵 Spotify dinleme verilerinizi analiz edin
- 🇹🇷 Türkçe sorular sorun 
- 🤖 AI ile doğal dil → SQL çevirisi
- 📊 Sonuçları tablo halinde görüntüleyin
- 🔒 Güvenli SQL sorguları (sadece SELECT)

## Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasını düzenleyerek gerekli değerleri ekleyin:
   - `GEMINI_API_KEY`: Google Gemini API anahtarınız
   - `DATABASE_URL`: PostgreSQL veritabanı bağlantı URL'niz

3. **Veritabanını kurun:**
   ```bash
   # PostgreSQL veritabanınızda db/init/ klasöründeki SQL dosyalarını çalıştırın
   psql -f db/init/001_schema.sql
   psql -f db/init/002_seed.sql
   ```

## Geliştirme

```bash
# Geliştirme sunucusunu başlatın
npm run dev

# Kodu derleyin
npm run build

# Linting kontrolü
npm run lint
```

## Kullanım

1. Uygulamayı açın: http://localhost:3000
2. Spotify verileriniz hakkında Türkçe sorular sorun:
   - "En çok dinlenen müzik hangisi?"
   - "Son 30 günde en çok dinlediğim 5 sanatçı"
   - "Lana Del Rey için toplam dinleme dakikası"

## Veritabanı Şeması

**spotify_plays** tablosu:
- `spotify_track_uri`: Spotify track URI
- `ts`: Dinleme zamanı
- `platform`: Platform (mobil, web, vs.)
- `ms_played`: Dinleme süresi (milisaniye)
- `track_name`: Şarkı adı
- `artist_name`: Sanatçı adı
- `album_name`: Albüm adı
- `reason_start`: Dinlemeye başlama sebebi
- `reason_end`: Dinlemeyi bitirme sebebi
- `shuffle`: Karışık mod aktif mi
- `skipped`: Şarkı atlandı mı

## Güvenlik

- Sadece SELECT sorguları çalıştırılabilir
- Otomatik LIMIT 200 eklenir
- Tehlikeli SQL komutları engellenir
- SQL injection koruması mevcuttur

## Teknolojiler

- Next.js 15 (App Router)
- TypeScript
- Google Gemini AI
- PostgreSQL
- Tailwind CSS
- React 19
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
