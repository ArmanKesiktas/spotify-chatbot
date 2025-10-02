"use client";
import { useState } from "react";

interface Message {
  type: 'user' | 'bot';
  content: string;
  data?: Record<string, unknown>[];
  isGreeting?: boolean;
}

export default function ChatForm() {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(0);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    
    // Rate limiting: En az 3 saniye bekle
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;
    if (timeSinceLastRequest < 3000) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Lütfen ${Math.ceil((3000 - timeSinceLastRequest) / 1000)} saniye bekleyin.`
      }]);
      return;
    }

    if (!q.trim()) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "Lütfen bir soru yazın."
      }]);
      return;
    }

    const userMessage = q;
    setQ("");
    
    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);

    setLoading(true);
    setLastRequest(now);

    try {
      console.log("API çağrısı başlatılıyor...");
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      console.log("API response status:", r.status);
      const data = await r.json();
      console.log("API response data:", data);
      
      if (!data.ok) { 
        setMessages(prev => [...prev, {
          type: 'bot',
          content: data.error
        }]);
        return; 
      }
      
      // Selamlaşma kontrolü
      if (data.greeting) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: data.message,
          isGreeting: true
        }]);
        return;
      }
      
      // Backend'den formatlanmış mesaj gelir
      setMessages(prev => [...prev, {
        type: 'bot',
        content: data.message,
        data: data.data
      }]);
    } catch {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "Bağlantı hatası. Lütfen tekrar deneyin."
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[45vh] lg:h-[92vh] flex flex-col bg-gray-900">
      {/* Sohbet Alanı */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4 bg-gray-900 pb-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p>2013-2015 Spotify verileri hakkında soru sorun!</p>
          </div>
        )}
        
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${
              message.type === 'user' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-green-400 shadow-sm border border-green-600'
            }`}>
              {message.type === 'bot' && message.isGreeting ? (
                // Selamlaşma mesajı için özel formatting
                <div className="prose prose-sm prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </div>
              ) : (
                <p>{message.content}</p>
              )}
              
              {/* Bot'un veri yanıtları */}
              {message.type === 'bot' && message.data && message.data.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.data.map((row, j) => (
                    <div key={j} className="text-sm">
                      {row.track_name && row.artist_name ? (
                        <div>{String(row.track_name)} - {String(row.artist_name)}</div>
                      ) : (
                        // Diğer veri türleri için doğal format
                        Object.entries(row)
                          .filter(([key]) => !key.includes('_ms') && !key.includes('ms_'))
                          .map(([key, value]) => {
                            // Alan adlarını Türkçe'ye çevir ve değerleri formatla
                            let displayKey = key;
                            let displayValue = String(value);
                            
                            // Alan adı çevirileri
                            if (key === 'total_hours') {
                              displayKey = '';
                              const hours = Math.round(parseFloat(String(value)));
                              displayValue = `${hours.toLocaleString()} saat`;
                            } else if (key === 'artist_name') {
                              displayKey = 'Sanatçı';
                            } else if (key === 'track_name') {
                              displayKey = 'Şarkı';
                            } else if (key === 'total_plays') {
                              displayKey = '';
                              displayValue = `${parseInt(String(value)).toLocaleString()} kez dinlendi`;
                            } else if (key === 'total_listeners') {
                              displayKey = '';
                              displayValue = `${parseInt(String(value)).toLocaleString()} dinleyici`;
                            } else if (key === 'avg_plays') {
                              displayKey = '';
                              displayValue = `Ortalama ${parseFloat(String(value)).toFixed(1)} dinleme`;
                            }
                            
                            return (
                              <span key={key} className="inline-block mr-2">
                                {displayKey && <strong>{displayKey}: </strong>}
                                {displayValue}
                              </span>
                            );
                          })
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-green-400 shadow-sm border border-green-600 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base">
              <p>AI yanıt oluşturuyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Mesaj Gönderme Alanı */}
      <div className="p-2 bg-gray-800 border-t border-green-600">
        <form onSubmit={ask} className="flex gap-2">
          <input
            className="flex-1 border border-green-600 rounded-lg px-3 lg:px-4 py-2 text-sm lg:text-base text-green-400 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Örn: 2014'te en çok dinlenen şarkı hangisi?"
            disabled={loading}
            maxLength={500}
          />
          <button 
            className="px-4 lg:px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm lg:text-base" 
            disabled={loading || !q.trim()}
          >
            {loading ? "..." : "Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
