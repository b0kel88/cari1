import React, { useState } from 'react';
import { Search, Camera, Mic, Grid3X3, Moon, Sun, TrendingUp, X } from 'lucide-react';
import FilmPage from './components/FilmPage';
import EnhancedFilmPage from './components/EnhancedFilmPage';
import NewsPage from './components/NewsPage';
import MarketplacePage from './components/MarketplacePage';
import SearchRoute from './components/SearchRoute';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const trendingSearches = [
    'Cuaca hari ini',
    'Resep masakan Indonesia',
    'Berita terkini',
    'Cara belajar coding',
    'Tempat wisata Jakarta',
    'Tutorial React',
    'Kesehatan mental',
    'Olahraga di rumah'
  ];

  const menuItems = [
    { name: 'Tes IQ', color: 'from-yellow-500 to-yellow-400', id: 'tes-iq' },
    { name: 'Marketplace', color: 'from-green-500 to-green-400', id: 'marketplace' },
    { name: 'Berita', color: 'from-red-500 to-red-400', id: 'berita' },
    { name: 'Film', color: 'from-purple-500 to-purple-400', id: 'film' },
    { name: 'Selesaikan Soal', color: 'from-cyan-500 to-cyan-400', id: 'selesaikan-soal' }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.id === 'film') {
      setCurrentPage('enhanced-film');
    } else if (item.id === 'berita') {
      setCurrentPage('berita');
    } else if (item.id === 'marketplace') {
      setCurrentPage('marketplace');
    } else {
      console.log(`Navigating to: ${item.name}`);
      alert(`Navigasi ke: ${item.name}\n\nID: ${item.id}`);
    }
    closeMenu();
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search route
      setCurrentPage('search');
      // In a real app, you'd use React Router here
      window.history.pushState({}, '', `/cari?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close menu when clicking outside or pressing ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Show Search Route
  if (currentPage === 'search') {
    return <SearchRoute />;
  }

  // Show Enhanced Film Page
  if (currentPage === 'enhanced-film') {
    return <EnhancedFilmPage onBack={handleBackToHome} />;
  }

  // Show Film Page (original)
  if (currentPage === 'film') {
    return <FilmPage onBack={handleBackToHome} />;
  }

  // Show News Page
  if (currentPage === 'berita') {
    return <NewsPage onBack={handleBackToHome} />;
  }

  // Show Marketplace Page
  if (currentPage === 'marketplace') {
    return <MarketplacePage onBack={handleBackToHome} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-500 via-blue-400 to-teal-400'
    }`}>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        {/* Logo Section - Top Left */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="text-orange-400">
                <path d="M8 32C8 32 12 28 20 28C28 28 32 32 32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M12 24C12 24 14 22 20 22C26 22 28 24 28 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M16 16C16 16 17 15 20 15C23 15 24 16 24 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="20" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold tracking-wide">
                <span className="text-yellow-300">CARI</span>{' '}
                <span className="text-white">TAHU</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200 group"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
            ) : (
              <Moon className="w-6 h-6 text-white group-hover:text-blue-200 transition-colors" />
            )}
          </button>
          <button 
            onClick={toggleMenu}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200 group"
            aria-label="Menu"
          >
            <Grid3X3 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 min-h-[calc(100vh-300px)]">
        {/* Main Title Section - Centered */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-wider">
            <span className="text-yellow-300">CARI</span>{' '}
            <span className="text-white">TAHU</span>
          </h1>
          <p className="text-xl text-white/90 font-light">
            Temukan semua yang ingin Anda ketahui
          </p>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-2xl mb-12">
          {/* Main Search Bar */}
          <div className="relative bg-white rounded-full shadow-2xl border border-white/20 overflow-hidden group hover:shadow-3xl transition-all duration-300 mb-6">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cari informasi, berita, tutorial, dan lainnya..."
                className="flex-1 px-4 py-5 text-gray-700 text-lg focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Camera and Voice Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button className="p-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-full transition-all duration-200 hover:scale-105 group shadow-lg backdrop-blur-sm">
              <Camera className="w-6 h-6 group-hover:scale-110 transition-transform drop-shadow-sm" />
            </button>
            <button className="p-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-full transition-all duration-200 hover:scale-105 group shadow-lg backdrop-blur-sm">
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform drop-shadow-sm" />
            </button>
          </div>
          
          {/* Search Button - Centered */}
          <div className="flex justify-center mb-12">
            <button 
              onClick={handleSearch}
              className="px-8 py-4 bg-white/90 hover:bg-white text-gray-700 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Cari Sekarang
            </button>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="w-5 h-5 text-white/80 mr-3" />
            <h2 className="text-white/90 font-medium text-lg">Pencarian Trending</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingSearches.map((trend, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(trend)}
                className="px-5 py-4 bg-white/10 hover:bg-white/20 text-white/90 rounded-xl border border-white/20 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg text-sm backdrop-blur-sm"
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-white/70 text-sm space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Tentang</a>
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat</a>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Bahasa Indonesia</a>
            <a href="#" className="hover:text-white transition-colors">English</a>
          </div>
        </div>
      </footer>

      {/* Popup Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeMenu}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="text-center mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Menu Aplikasi</h3>
                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 text-sm">Pilih layanan yang ingin Anda gunakan</p>
            </div>
            
            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {menuItems.slice(0, 4).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={`p-5 bg-gradient-to-br ${item.color} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            
            {/* Full width menu item */}
            <button
              onClick={() => handleMenuItemClick(menuItems[4])}
              className={`w-full p-5 bg-gradient-to-br ${menuItems[4].color} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1 mb-6`}
            >
              {menuItems[4].name}
            </button>
            
            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;