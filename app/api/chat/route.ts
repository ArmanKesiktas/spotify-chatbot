import { NextResponse } from "next/server";
import { getModel } from "@/lib/chatinit";
import { dbSchema } from "@/lib/schemaPrompt";
import { query } from "@/lib/db";

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

  console.log("Final SQL:", sql);
  return sql;
}

export async function POST(req: Request) {
  try {
    console.log("API route çağrıldı");
    const { message } = await req.json();
    console.log("Gelen mesaj:", message);

    // Environment variables kontrolü
    console.log("Environment check - GOOGLE_AI_API_KEY exists:", !!process.env.GOOGLE_AI_API_KEY);
    console.log("Environment check - POSTGRES_URL exists:", !!process.env.POSTGRES_URL);
    console.log("Environment check - DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // Rate limiting kontrolü
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Mesaj boş olamaz" }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ ok: false, error: "Mesaj çok uzun (max 500 karakter)" }, { status: 400 });
    }

    // Basit ve kısa prompt
    const prompt = `Database table: spotify_plays
Columns: id, ts (timestamp), username, platform, ms_played, conn_country, ip_addr_decrypted, user_agent_decrypted, track_name, artist_name, album_name, spotify_track_uri

Question: ${message}

Write a PostgreSQL SELECT query. Rules:
- Only SELECT statements
- Use EXTRACT(YEAR FROM ts) for year filtering
- Add appropriate LIMIT
- No code blocks, just the SQL

SQL:`;

    // Retry logic ile AI çağrısı
    let lastError = null;
    console.log("Environment check - GOOGLE_AI_API_KEY exists:", !!process.env.GOOGLE_AI_API_KEY);
    console.log("Environment check - DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`AI çağrısı deneme ${attempt}/3`);
        const model = await getModel();
        const result = await model.generateContent(prompt);
        
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

        return NextResponse.json({ ok: true, sql, rows });
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // Son deneme, fallback kullan
        console.log("AI başarısız, fallback SQL kullanılıyor");
        const fallbackSql = "SELECT track_name, artist_name, ms_played FROM spotify_plays ORDER BY ms_played DESC LIMIT 5";
        
        try {
          const result = await query(fallbackSql);
          console.log("Fallback query successful:", result);
          
          if (result.length === 0) {
            return NextResponse.json({ 
              ok: false, 
              error: "Henüz hiç veri yok. Lütfen daha sonra tekrar deneyin." 
            }, { status: 404 });
          }

          return NextResponse.json({ 
            ok: true, 
            rows: result,
            message: `AI şu anda yanıt veremiyor, en çok dinlenen 5 şarkınızı gösteriyorum`,
            sql: fallbackSql
          });
        } catch (dbError) {
          console.error("Fallback database hatası:", dbError);
          // Normal hata döndür
        }
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}
