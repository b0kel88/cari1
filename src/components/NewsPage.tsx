import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, Cloud, Sun, CloudRain, Wind, Eye, MessageCircle, Share2, Clock, TrendingUp, Globe, Zap, Heart, Bookmark } from 'lucide-react';

interface NewsPageProps {
  onBack: () => void;
}

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  views: number;
  comments: number;
  likes: number;
  tags: string[];
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const NewsPage: React.FC<NewsPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'Cerah',
    icon: 'sun',
    humidity: 65,
    windSpeed: 12
  });

  const categories = [
    { name: 'Semua', color: 'from-blue-500 to-blue-600', icon: Globe },
    { name: 'Politik', color: 'from-red-500 to-red-600', icon: Zap },
    { name: 'Ekonomi', color: 'from-green-500 to-green-600', icon: TrendingUp },
    { name: 'Teknologi', color: 'from-purple-500 to-purple-600', icon: Zap },
    { name: 'Olahraga', color: 'from-orange-500 to-orange-600', icon: Heart },
    { name: 'Hiburan', color: 'from-pink-500 to-pink-600', icon: Heart },
    { name: 'Kesehatan', color: 'from-teal-500 to-teal-600', icon: Heart },
    { name: 'Pendidikan', color: 'from-indigo-500 to-indigo-600', icon: Bookmark }
  ];

  const newsArticles: NewsArticle[] = [
    {
      id: 1,
      title: "Perkembangan Teknologi AI di Indonesia Mencapai Rekor Tertinggi",
      summary: "Industri kecerdasan buatan di Indonesia mengalami pertumbuhan signifikan dengan investasi mencapai triliunan rupiah.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Teknologi",
      author: "Ahmad Rizki",
      publishedAt: "2024-01-15T10:30:00Z",
      imageUrl: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 15420,
      comments: 89,
      likes: 234,
      tags: ["AI", "Teknologi", "Indonesia", "Investasi"]
    },
    {
      id: 2,
      title: "Ekonomi Digital Indonesia Tumbuh 25% di Kuartal Pertama",
      summary: "Sektor e-commerce dan fintech menjadi pendorong utama pertumbuhan ekonomi digital nasional.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Ekonomi",
      author: "Sari Dewi",
      publishedAt: "2024-01-15T09:15:00Z",
      imageUrl: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 12350,
      comments: 67,
      likes: 189,
      tags: ["Ekonomi", "Digital", "E-commerce", "Fintech"]
    },
    {
      id: 3,
      title: "Tim Nasional Indonesia Raih Prestasi Gemilang di Ajang Internasional",
      summary: "Atlet-atlet muda Indonesia berhasil meraih medali emas dalam kompetisi olahraga tingkat Asia.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Olahraga",
      author: "Budi Santoso",
      publishedAt: "2024-01-15T08:45:00Z",
      imageUrl: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 18750,
      comments: 156,
      likes: 445,
      tags: ["Olahraga", "Prestasi", "Indonesia", "Internasional"]
    },
    {
      id: 4,
      title: "Breakthrough Penelitian Kesehatan: Obat Baru untuk Diabetes",
      summary: "Peneliti Indonesia berhasil mengembangkan terapi inovatif untuk pengobatan diabetes tipe 2.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Kesehatan",
      author: "Dr. Maya Sari",
      publishedAt: "2024-01-15T07:20:00Z",
      imageUrl: "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 9840,
      comments: 43,
      likes: 167,
      tags: ["Kesehatan", "Penelitian", "Diabetes", "Inovasi"]
    },
    {
      id: 5,
      title: "Revolusi Pendidikan: Platform Belajar Online Gratis untuk Semua",
      summary: "Pemerintah meluncurkan inisiatif pendidikan digital yang dapat diakses oleh seluruh masyarakat Indonesia.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Pendidikan",
      author: "Prof. Indira Sari",
      publishedAt: "2024-01-15T06:00:00Z",
      imageUrl: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 11200,
      comments: 78,
      likes: 298,
      tags: ["Pendidikan", "Digital", "Gratis", "Pemerintah"]
    },
    {
      id: 6,
      title: "Festival Film Indonesia 2024: Karya Sineas Muda Mencuri Perhatian",
      summary: "Industri perfilman tanah air menunjukkan kreativitas tinggi dengan berbagai genre film yang inovatif.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: "Hiburan",
      author: "Rina Kusuma",
      publishedAt: "2024-01-14T20:30:00Z",
      imageUrl: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
      views: 8650,
      comments: 92,
      likes: 203,
      tags: ["Film", "Festival", "Sineas", "Indonesia"]
    }
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format date in Indonesian
  const formatDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return `${dayName}, ${day} ${month} ${year} • ${time}`;
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    return `${Math.floor(diffInHours / 24)} hari yang lalu`;
  };

  // Get weather icon
  const getWeatherIcon = () => {
    switch (weather.icon) {
      case 'sun': return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'cloud': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rain': return <CloudRain className="w-6 h-6 text-blue-400" />;
      default: return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  // Filter articles by category
  const filteredArticles = selectedCategory && selectedCategory !== 'Semua' 
    ? newsArticles.filter(article => article.category === selectedCategory)
    : newsArticles;

  // Search articles
  const searchedArticles = searchQuery
    ? filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredArticles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" className="text-white">
                    <path d="M8 32C8 32 12 28 20 28C28 28 32 32 32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M12 24C12 24 14 22 20 22C26 22 28 24 28 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M16 16C16 16 17 15 20 15C23 15 24 16 24 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="20" cy="12" r="3" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CARI TAHU
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Portal Berita Terpercaya</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                  Berita
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Trending</button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Terbaru</button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Populer</button>
              </nav>
            </div>

            {/* Date, Weather & Search */}
            <div className="flex items-center space-x-6">
              {/* Date & Time */}
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatDate(currentDate)}</span>
              </div>

              {/* Weather */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg">
                {getWeatherIcon()}
                <div>
                  <div className="font-semibold">{weather.temperature}°C</div>
                  <div className="text-xs">{weather.condition}</div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita..."
                  className="bg-white/80 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Kategori Berita</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.name || (selectedCategory === '' && category.name === 'Semua')
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white/80 hover:bg-white text-gray-700 hover:shadow-md'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Breaking News Banner */}
        <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-sm font-bold">BREAKING</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">Berita Terkini: Perkembangan teknologi AI mencapai milestone baru di Indonesia</p>
            </div>
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Main News Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            {searchedArticles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={searchedArticles[0].imageUrl}
                    alt={searchedArticles[0].title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {searchedArticles[0].category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
                    {searchedArticles[0].title}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {searchedArticles[0].summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{timeAgo(searchedArticles[0].publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{searchedArticles[0].views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{searchedArticles[0].comments}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Articles */}
            <div className="space-y-6">
              {searchedArticles.slice(1).map((article) => (
                <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{timeAgo(article.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{article.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{article.likes}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">oleh {article.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                {getWeatherIcon()}
                <span>Cuaca Hari Ini</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Suhu</span>
                  <span className="text-2xl font-bold">{weather.temperature}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kondisi</span>
                  <span className="font-semibold">{weather.condition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kelembaban</span>
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Angin</span>
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span>Trending Topics</span>
              </h3>
              <div className="space-y-3">
                {['#TeknologiAI', '#EkonomiDigital', '#PrestasiOlahraga', '#InovasiKesehatan', '#PendidikanDigital'].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-blue-600 font-medium">{topic}</span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4">Statistik Hari Ini</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Berita Baru</span>
                  <span className="text-xl font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Pembaca</span>
                  <span className="text-xl font-bold">156K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Komentar</span>
                  <span className="text-xl font-bold">892</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Results */}
        {searchQuery && searchedArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <p className="text-gray-600 text-lg mb-4">Tidak ada berita yang ditemukan untuk "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Lihat Semua Berita
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" className="text-white">
                    <path d="M8 32C8 32 12 28 20 28C28 28 32 32 32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M12 24C12 24 14 22 20 22C26 22 28 24 28 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M16 16C16 16 17 15 20 15C23 15 24 16 24 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="20" cy="12" r="3" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-xl font-bold">CARI TAHU</span>
              </div>
              <p className="text-gray-400 text-sm">
                Portal berita terpercaya yang menyajikan informasi terkini dan akurat untuk masyarakat Indonesia.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kategori</h4>
              <div className="space-y-2 text-sm text-gray-400">
                {categories.slice(1, 5).map((cat, index) => (
                  <div key={index} className="hover:text-white cursor-pointer transition-colors">
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Breaking News</div>
                <div className="hover:text-white cursor-pointer transition-colors">Newsletter</div>
                <div className="hover:text-white cursor-pointer transition-colors">RSS Feed</div>
                <div className="hover:text-white cursor-pointer transition-colors">Mobile App</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>redaksi@caritahu.com</div>
                <div>+62 21 1234 5678</div>
                <div>Jakarta, Indonesia</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 CARI TAHU. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <button className="hover:text-white transition-colors">Kebijakan Privasi</button>
              <button className="hover:text-white transition-colors">Syarat & Ketentuan</button>
              <button className="hover:text-white transition-colors">Kontak</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsPage;