import ChatForm from "@/components/ChatForm";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Topbar */}
      <div className="bg-gray-800 border-b border-green-600 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Sol taraf - Logo ve başlık */}
          <div className="flex items-center">
            <svg 
              className="w-6 h-6 lg:w-8 lg:h-8 mr-3 text-green-400" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.54-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <h1 className="text-lg lg:text-xl font-bold text-green-400">
              Spotibot - Spotify Chatbot
            </h1>
          </div>
          
          {/* Sağ taraf - Sosyal medya linkleri ve data source */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Data Source */}
            <a href="https://mavenanalytics.io/challenges/maven-music-challenge" target="_blank" rel="noopener noreferrer" 
               className="flex items-center text-gray-400 hover:text-green-400 transition-colors text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Data Source</span>
              <span className="sm:hidden">Data</span>
            </a>
            
            {/* GitHub */}
            <a href="https://github.com/ArmanKesiktas" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/armankesi%CC%87ktas/" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            {/* Email */}
            <a href="mailto:kesiktasarman64@gmail.com" 
               className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sol Taraf - Açıklama ve Rehber */}
        <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col justify-center">
          <p className="text-base lg:text-xl text-green-300 leading-relaxed mb-4 lg:mb-8">
            2013-2015 yılları arası Spotify verilerini Türkçe sorularla sorgulayın. Bu kapsamlı veri seti tüm kullanıcıların dinleme geçmişini içermektedir.
          </p>
        
        {/* Kullanım Rehberi - Mobilde kompakt, desktop'ta detaylı */}
        <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-green-600">
          <h3 className="text-base lg:text-lg font-semibold text-green-400 mb-3 lg:mb-4 flex items-center">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Nasıl Kullanılır?
          </h3>
          
          {/* Mobil için kompakt görünüm */}
          <div className="block lg:hidden space-y-2 text-xs text-green-300">
            <div>
              <span className="font-medium text-green-400">🎵</span> &quot;en çok dinlenen şarkı&quot;
            </div>
            <div>
              <span className="font-medium text-green-400">🎤</span> &quot;en popüler sanatçı&quot;
            </div>
            <div>
              <span className="font-medium text-green-400">📅</span> &quot;2014&apos;te en çok dinlenen&quot;
            </div>
            <div>
              <span className="font-medium text-green-400">📊</span> &quot;toplam dinleme süresi&quot;
            </div>
          </div>
          
          {/* Desktop için detaylı görünüm */}
          <div className="hidden lg:block space-y-2 text-sm text-green-300">
            <div>
              <span className="font-medium text-green-400">🎵 En Popüler Şarkılar:</span>
              <div className="ml-4 text-xs">
                &quot;en çok dinlenen şarkı&quot; • &quot;en popüler 5 şarkı&quot;
              </div>
            </div>
            
            <div>
              <span className="font-medium text-green-400">🎤 Sanatçı Bilgileri:</span>
              <div className="ml-4 text-xs">
                &quot;en çok dinlenen sanatçı&quot; • &quot;Taylor Swift&apos;in şarkıları&quot;
              </div>
            </div>
            
            <div>
              <span className="font-medium text-green-400">📅 Tarih Bazlı Sorgular:</span>
              <div className="ml-4 text-xs">
                &quot;2013&apos;te en popüler şarkı&quot; • &quot;2015 yılının hit şarkıları&quot;
              </div>
            </div>
            
            <div>
              <span className="font-medium text-green-400">📊 İstatistikler:</span>
              <div className="ml-4 text-xs">
                &quot;toplam dinleme süresi&quot; • &quot;en uzun şarkı&quot;
              </div>
            </div>
          </div>
          
          <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-gray-700 rounded border-l-4 border-green-500">
            <p className="text-xs text-gray-400">
              💡 <strong>İpucu:</strong> 
              <span className="hidden lg:inline">Sorularınızı Türkçe olarak doğal bir şekilde yazın. Chatbot sizin için uygun SQL sorgusunu oluşturacak ve sonuçları anlaşılır bir şekilde sunacaktır.</span>
              <span className="lg:hidden">Sorularınızı Türkçe ve doğal olarak yazın.</span>
            </p>
          </div>
        </div>
        </div>
        
        {/* Ayırıcı Çizgi */}
        <div className="hidden lg:block w-px bg-green-600 opacity-30"></div>
        <div className="lg:hidden h-px bg-green-600 opacity-30 mx-4"></div>
        
        {/* Sağ Taraf - Chat */}
        <div className="w-full lg:w-1/2 min-h-[45vh] lg:h-[92vh]">
          <ChatForm />
        </div>
      </div>
    </div>
  );
}
