import { NextResponse } from "next/server";
import { getModel } from "@/lib/chatinit";
import { query } from "@/lib/db";

function formatAnswer(userQuery: string, data: Record<string, unknown>[]): string {
  const queryLower = userQuery.toLowerCase();
  
  // Günlük sohbet soruları - veride hiçbir şey olmasa bile cevap ver
  const casualQuestions = ['naber', 'nasılsın', 'nasıl gidiyor', 'ne var ne yok', 'ne yapıyorsun'];
  if (casualQuestions.some(q => queryLower.includes(q))) {
    const responses = [
      "🎵 İyiyim, müzik verilerinizi analiz etmeye devam ediyorum! Sen ne dinlemek istersin? 🎧",
      "😊 Her şey yolunda! Hangi müzik dönemini merak ediyorsun? 🎶",
      "🤖 Harika! Spotify verilerinle oynuyorum. 2013-2015 arası hangi yılı keşfedelim? 🎼",
      "🎸 İyi gidiyoruz! En sevdiğin sanatçıyı sormaya ne dersin? 🎤"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (!data || data.length === 0) {
    return "Üzgünüm, bu kriterlere uygun bir sonuç bulamadım. Başka bir soru sormak ister misin? 🤔";
  }

  // En çok dinlenen şarkı soruları
  if (queryLower.includes('en çok dinle') && (queryLower.includes('şarkı') || queryLower.includes('parça'))) {
    const song = data[0];
    const year = extractYear(queryLower);
    const yearText = year ? ` ${year}'de` : '';
    
    return `🎵 ${yearText} en çok dinlediğin şarkı: **${song.track_name}** - ${song.artist_name}
    
${song.total_listens && typeof song.total_listens === 'number' ? `**${song.total_listens}** kez dinlemişsin!` : ''}
${song.play_count && typeof song.play_count === 'number' ? `**${song.play_count}** kez dinlemişsin!` : ''}

Başka hangi dönemde ne dinlediğini öğrenmek ister misin? 🎧`;
  }

  // En çok dinlenen sanatçı soruları
  if (queryLower.includes('en çok dinle') && queryLower.includes('sanatçı')) {
    const artist = data[0];
    const year = extractYear(queryLower);
    const yearText = year ? ` ${year}'de` : '';
    
    return `🎤 ${yearText} en çok dinlediğin sanatçı: **${artist.artist_name}**
    
${artist.total_listens && typeof artist.total_listens === 'number' ? `**${artist.total_listens}** kez dinlemişsin!` : ''}
${artist.play_count && typeof artist.play_count === 'number' ? `**${artist.play_count}** kez dinlemişsin!` : ''}

Bu sanatçının hangi şarkılarını merak ediyorsun? 🎶`;
  }

  // Toplam dinleme soruları
  if (queryLower.includes('toplam') || queryLower.includes('kaç')) {
    const result = data[0];
    if (result.total_hours && typeof result.total_hours === 'number') {
      return `⏰ Toplam **${Math.round(result.total_hours)}** saat müzik dinlemişsin!
      
Bu gerçekten etkileyici! Başka istatistikler öğrenmek ister misin? 📊`;
    }
    if (result.count && typeof result.count === 'number') {
      return `📈 Toplam **${result.count}** şarkı dinlemişsin!
      
Başka ne merak ediyorsun? 🤔`;
    }
  }

  // Genel sonuçlar için
  if (data.length === 1) {
    const result = data[0];
    const keys = Object.keys(result);
    
    if (keys.includes('track_name')) {
      return `🎵 Bulduğum şarkı: **${result.track_name}** - ${result.artist_name}
      
Başka hangi şarkıları merak ediyorsun? 🎧`;
    }
    
    if (keys.includes('artist_name')) {
      return `🎤 Bulduğum sanatçı: **${result.artist_name}**
      
Bu sanatçı hakkında başka ne öğrenmek istersin? 🎶`;
    }
  }

  // Çoklu sonuçlar
  if (data.length > 1) {
    if (data[0].track_name) {
      const songList = data.slice(0, 5).map((song, i) => 
        `${i + 1}. **${song.track_name}** - ${song.artist_name}`
      ).join('\n');
      
      return `🎵 İşte bulduğum şarkılar:

${songList}

${data.length > 5 ? `\n...ve ${data.length - 5} tane daha!` : ''}

Başka ne merak ediyorsun? 🎧`;
    }
    
    if (data[0].artist_name) {
      const artistList = data.slice(0, 5).map((artist, i) => 
        `${i + 1}. **${artist.artist_name}**`
      ).join('\n');
      
      return `🎤 İşte bulduğum sanatçılar:

${artistList}

${data.length > 5 ? `\n...ve ${data.length - 5} tane daha!` : ''}

Hangisi hakkında daha fazla öğrenmek istersin? 🎶`;
    }
  }

  // Varsayılan cevap
  return `📊 Sonuçları buldum! ${data.length} sonuç var.

Başka ne sormak istersin? 🤔`;
}

function extractYear(query: string): number | null {
  const yearMatch = query.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

function secure(sqlRaw: string): string {
  // AI response'dan SQL'i extract et
  let sql = sqlRaw.trim();
  
  // Code block'ları temizle
  sql = sql.replace(/```sql\s*/gi, "").replace(/```\s*/g, "").trim();
  
  // Çoklu satırları birleştir ama keyword'lerin arasında space koru
  sql = sql.replace(/\n\s*/g, " ").replace(/\s+/g, " ").trim();
  
  console.log("Cleaned SQL:", sql);
  
  const lowered = sql.toLowerCase();

  // SELECT ile başlamazsa hata
  if (!lowered.startsWith("select")) {
    throw new Error("Sadece SELECT sorgularına izin verilir.");
  }

  // Tehlikeli kelimeler kontrolü
  const banned = ["insert","update","delete","drop","alter","create","grant","revoke","truncate","exec"];
  if (banned.some(w => lowered.includes(w))) {
    throw new Error("Yalnızca okuma sorguları çalıştırılabilir.");
  }

  // Noktalı virgül temizle
  sql = sql.replace(/;+$/, "");

  // LIMIT kontrolü - AI'ın belirlediği LIMIT'i koru, yoksa varsayılan ekle
  if (!/limit\s+\d+/i.test(sql)) {
    sql += " LIMIT 10"; // Varsayılan limit daha makul
  } else {
    // AI tarafından belirlenen LIMIT'i kontrol et (maksimum 200)
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limitValue = parseInt(limitMatch[1]);
      if (limitValue > 200) {
        sql = sql.replace(/limit\s+\d+/i, "LIMIT 200");
      }
    }
  }

  return sql;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { message } = body;

  console.log("📝 User message:", message);

  // Environment check
  const hasGoogleAPI = !!process.env.GOOGLE_AI_API_KEY;
  const hasDatabase = !!process.env.DATABASE_URL;
  
  console.log("Environment check - GOOGLE_AI_API_KEY exists:", hasGoogleAPI);
  console.log("Environment check - DATABASE_URL exists:", hasDatabase);
  
  if (!hasGoogleAPI) {
    return NextResponse.json({ 
      ok: false, 
      error: "AI servisi yapılandırılmamış. Lütfen daha sonra tekrar deneyin." 
    }, { status: 503 });
  }
  
  if (!hasDatabase) {
    return NextResponse.json({ 
      ok: false, 
      error: "Veritabanı yapılandırılmamış. Lütfen daha sonra tekrar deneyin." 
    }, { status: 503 });
  }

  // Rate limiting kontrolü
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Mesaj boş olamaz" }, { status: 400 });
  }

  if (message.length > 500) {
    return NextResponse.json({ ok: false, error: "Mesaj çok uzun (max 500 karakter)" }, { status: 400 });
  }

  // Selamlaşma kontrolü
  const greetings = ['selam', 'merhaba', 'hello', 'hi', 'hey', 'hoş geldin', 'merhabalar', 'selamün aleyküm'];
  const userMessage = message.toLowerCase().trim();
  
  if (greetings.some(greeting => userMessage.includes(greeting))) {
    return NextResponse.json({ 
      ok: true, 
      greeting: true,
      message: `🎵 Merhaba! Ben **Spotibot**'um! 

Spotify dinleme verilerinizi analiz edebilirim. İşte yapabileceklerim:

🎧 **2013 Temmuz - 2015 arası 149,860 dinleme kaydınız** var!
📊 **4,113 farklı sanatçı** ve **13,839 şarkı**

💡 **Örnek sorular:**
• "2014'te en çok dinlediğim şarkı neydi?"
• "En sevdiğim sanatçı kim?"
• "Toplam kaç saat müzik dinlemişim?"
• "2015 yazında ne dinliyordum?"

Hadi, müzik zevkinizi keşfedelim! 🎶`
    });
  }

  // Günlük sohbet sorularına direkt cevap ver (SQL olmadan)
  const casualQuestions = ['naber', 'nasılsın', 'nasıl gidiyor', 'ne var ne yok', 'ne yapıyorsun'];
  if (casualQuestions.some(q => userMessage.includes(q))) {
    const formattedAnswer = formatAnswer(message, []);
    return NextResponse.json({ 
      ok: true, 
      message: formattedAnswer,
      data: [] 
    });
  }

  // İyileştirilmiş prompt
  const prompt = `Database table: spotify_plays
Columns: id, ts (timestamp), username, platform, ms_played, conn_country, ip_addr_decrypted, user_agent_decrypted, track_name, artist_name, album_name, spotify_track_uri

User question: ${message}

Generate a PostgreSQL SELECT query. Rules:
- Only SELECT statements allowed
- Use EXTRACT(YEAR FROM ts) for year filtering
- For "most played" queries, use COUNT(*) and ORDER BY COUNT(*) DESC
- For "top songs", SELECT track_name, artist_name, COUNT(*) as play_count
- For "top artists", SELECT artist_name, COUNT(*) as play_count  
- Add appropriate LIMIT (max 10 for lists)
- Use proper column aliases for counts (play_count, total_listens, etc.)

SQL Query:`;

  console.log("🤖 AI Prompt:", prompt);

  let lastError: unknown;
  
  // 3 deneme yap
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`AI çağrısı deneme ${attempt}/3`);
      const model = await getModel();
      
      // Timeout ile AI çağrısı
      const aiCallPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI çağrısı timeout")), 8000)
      );
      
      const result = await Promise.race([aiCallPromise, timeoutPromise]) as Awaited<ReturnType<typeof model.generateContent>>;
      
      console.log("AI Result object:", !!result);
      console.log("AI Response object:", !!result?.response);
      
      // Response detaylarını kontrol et
      if (result?.response) {
        console.log("Response candidates:", result.response.candidates?.length);
        console.log("Finish reason:", result.response.candidates?.[0]?.finishReason);
        console.log("Safety ratings:", result.response.candidates?.[0]?.safetyRatings);
      }
      
      // AI yanıtını daha detaylı kontrol et
      if (!result || !result.response) {
        throw new Error("AI'dan geçersiz yanıt alındı");
      }
      
      const text = result.response.text();
      console.log("AI Raw Response (full):", text);
      console.log("AI Raw Response (length):", text?.length);
      
      if (!text || text.trim() === "") {
        throw new Error("AI'dan boş yanıt alındı");
      }
      
      const sql = secure(text);
      console.log("🔍 Generated SQL:", sql);
      console.log("🎯 User question:", message);
      
      const rows = await query(sql);
      console.log("✅ Query successful, rows:", rows?.length);

      // Sonuçları formatla
      const formattedAnswer = formatAnswer(message, rows);

      return NextResponse.json({ 
        ok: true, 
        message: formattedAnswer,
        data: rows 
      });
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
      
      // Quota hatası ise daha uzun bekle
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        if (attempt < 3) {
          console.log(`Quota exceeded, waiting before retry ${attempt}/3...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        return NextResponse.json({ 
          ok: false, 
          error: "API quota aşıldı. Lütfen birkaç dakika sonra tekrar deneyin." 
        }, { status: 429 });
      }
      
      // Diğer hatalar için tekrar dene
      if (attempt < 3) {
        console.log(`Attempt ${attempt} failed, retrying...`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  // Tüm denemeler başarısız
  const finalError = lastError instanceof Error ? lastError.message : "AI servisi geçici olarak kullanılamıyor";
  console.error("All AI attempts failed:", finalError);
  
  return NextResponse.json({ 
    ok: false, 
    error: finalError
  }, { status: 500 });
}