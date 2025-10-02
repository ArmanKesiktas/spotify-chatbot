import { NextResponse } from "next/server";
import { getModel } from "@/lib/chatinit";
import { dbSchema } from "@/lib/schemaPrompt";
import { query } from "@/lib/db";

function secure(sqlRaw: string): string {
  // Temizlik
  let sql = sqlRaw.replace(/```/g, "").replace(/sql/gi, "").trim();
  
  // Sadece tek satır SQL al (çoklu satır varsa ilkini al)
  sql = sql.split('\n')[0].trim();
  
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
    const { message } = await req.json();

    // Rate limiting kontrolü
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Mesaj boş olamaz" }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ ok: false, error: "Mesaj çok uzun (max 500 karakter)" }, { status: 400 });
    }

    const prompt = `Sen bir SQL uzmanısın. Kullanıcı Türkçe soru soracak.

${dbSchema}

GÖREV: Kullanıcının sorusuna göre SADECE PostgreSQL SELECT sorgusu yaz.

ÖNEMLİ KURALLAR:
- Kod bloğu kullanma
- Sadece SQL kodu döndür
- Eğer kullanıcı TEKİL ifade kullanıyorsa (örn: "en çok dinlenen şarkı", "en popüler sanatçı") LIMIT 1 kullan
- Eğer kullanıcı ÇOĞUL ifade kullanıyorsa (örn: "en çok dinlenen şarkılar", "popüler sanatçılar") veya sayı belirtiyorsa (örn: "5 şarkı", "10 sanatçı") uygun LIMIT kullan
- Sayı belirtilmemişse varsayılan olarak LIMIT 10 kullan

ÖRNEKLER:
- "en çok dinlenen şarkı" → LIMIT 1
- "en çok dinlenen 3 şarkı" → LIMIT 3  
- "en popüler şarkılar" → LIMIT 10
- "en çok dinlenen sanatçı" → LIMIT 1

Kullanıcı sorusu: ${message}

SQL:`;

    // Retry logic ile AI çağrısı
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = await getModel();
        const result = await model.generateContent(prompt);
        
        // AI yanıtını daha detaylı kontrol et
        if (!result || !result.response) {
          throw new Error("AI'dan geçersiz yanıt alındı");
        }
        
        const text = result.response.text();
        console.log("AI Raw Response:", text);
        
        if (!text || text.trim() === "") {
          throw new Error("Üzgünüm, böyle bir veri bulamadım. Başka bir soru sormaya ne dersiniz?");
        }
        
        const sql = secure(text);
        const rows = await query(sql);

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
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}
