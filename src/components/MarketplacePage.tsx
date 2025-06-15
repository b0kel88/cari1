import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, ShoppingCart, Heart, Eye, TrendingUp, Filter, Grid, List, MapPin, Truck, Shield, Award } from 'lucide-react';

interface MarketplacePageProps {
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  platform: 'shopee' | 'lazada' | 'tokopedia';
  seller: string;
  location: string;
  sold: number;
  discount?: number;
  freeShipping: boolean;
  badge?: string;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock trending products
  const trendingProducts = [
    'iPhone 15 Pro Max',
    'Samsung Galaxy S24',
    'MacBook Air M3',
    'AirPods Pro',
    'PlayStation 5',
    'Nintendo Switch',
    'Xiaomi 14',
    'iPad Pro',
    'Apple Watch',
    'Gaming Chair'
  ];

  // Mock product data generator
  const generateMockProducts = (query: string): Product[] => {
    const platforms: ('shopee' | 'lazada' | 'tokopedia')[] = ['shopee', 'lazada', 'tokopedia'];
    const products: Product[] = [];

    platforms.forEach((platform, platformIndex) => {
      for (let i = 0; i < 5; i++) {
        const productId = `${platform}-${i + 1}`;
        const basePrice = Math.floor(Math.random() * 5000000) + 50000;
        const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : 0;
        const finalPrice = discount > 0 ? Math.floor(basePrice * (1 - discount / 100)) : basePrice;

        products.push({
          id: productId,
          name: `${query} ${platform.charAt(0).toUpperCase() + platform.slice(1)} Edition ${i + 1}`,
          price: finalPrice,
          originalPrice: discount > 0 ? basePrice : undefined,
          rating: 4 + Math.random(),
          reviews: Math.floor(Math.random() * 1000) + 10,
          image: `https://images.pexels.com/photos/${2000000 + platformIndex * 1000 + i}/pexels-photo-${2000000 + platformIndex * 1000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop`,
          platform,
          seller: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Store ${i + 1}`,
          location: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'][Math.floor(Math.random() * 5)],
          sold: Math.floor(Math.random() * 500) + 10,
          discount,
          freeShipping: Math.random() > 0.3,
          badge: Math.random() > 0.7 ? ['Best Seller', 'Top Rated', 'New Arrival'][Math.floor(Math.random() * 3)] : undefined
        });
      }
    });

    return products.sort(() => Math.random() - 0.5);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = generateMockProducts(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  // Handle trending search
  const handleTrendingSearch = (trend: string) => {
    setSearchQuery(trend);
    const results = generateMockProducts(trend);
    setSearchResults(results);
  };

  // Format price to Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get platform colors
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'shopee': return 'from-orange-500 to-red-500';
      case 'lazada': return 'from-blue-500 to-purple-500';
      case 'tokopedia': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Get platform logo
  const getPlatformLogo = (platform: string) => {
    const logoStyle = "text-white font-bold text-lg";
    switch (platform) {
      case 'shopee': return <span className={logoStyle}>Shopee</span>;
      case 'lazada': return <span className={logoStyle}>Lazada</span>;
      case 'tokopedia': return <span className={logoStyle}>Tokopedia</span>;
      default: return <span className={logoStyle}>{platform}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    CARI TAHU
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Marketplace Terpercaya</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <button className="text-orange-600 font-semibold border-b-2 border-orange-600 pb-1">
                  Semua Produk
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Elektronik</button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Fashion</button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">Rumah</button>
              </nav>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Platform Logos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cari di Platform Terpercaya</h2>
          <div className="flex justify-center space-x-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl">Shopee</h3>
                <p className="text-white/80 text-sm">Gratis Ongkir</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl">Lazada</h3>
                <p className="text-white/80 text-sm">Pengiriman Cepat</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl">Tokopedia</h3>
                <p className="text-white/80 text-sm">Terpercaya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400 ml-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Cari produk di Shopee, Lazada, dan Tokopedia..."
                  className="flex-1 px-4 py-5 text-gray-700 text-lg focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-5 font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isSearching ? 'Mencari...' : 'Cari'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Trending Section - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span>Trending Pencarian</span>
              </h3>
              <div className="space-y-2">
                {trendingProducts.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingSearch(trend)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700 hover:text-orange-600 border border-transparent hover:border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>{trend}</span>
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results - Right Column */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {searchResults.length > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Hasil Pencarian "{searchQuery}"
                  </h2>
                  <p className="text-gray-600">{searchResults.length} produk ditemukan</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="relevance">Relevansi</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="sold">Terlaris</option>
                  </select>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Mencari produk terbaik untuk Anda...</p>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {searchResults.length > 0 && !isSearching && (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                        }}
                      />
                      
                      {/* Platform Badge */}
                      <div className={`absolute top-2 left-2 bg-gradient-to-r ${getPlatformColor(product.platform)} px-2 py-1 rounded-full`}>
                        <span className="text-white text-xs font-semibold">
                          {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Product Badge */}
                      {product.badge && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {product.badge}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        {!product.discount && (
                          <>
                            <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md">
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-orange-600">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({product.reviews} ulasan)
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.sold} terjual
                        </span>
                      </div>

                      {/* Seller and Location */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span className="truncate">{product.seller}</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{product.location}</span>
                        </div>
                      </div>

                      {/* Free Shipping */}
                      {product.freeShipping && (
                        <div className="flex items-center space-x-1 text-green-600 text-sm mb-3">
                          <Truck className="w-4 h-4" />
                          <span className="font-medium">Gratis Ongkir</span>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button className={`w-full bg-gradient-to-r ${getPlatformColor(product.platform)} text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2`}>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Beli Sekarang</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                <p className="text-gray-600 text-lg mb-4">Tidak ada produk yang ditemukan untuk "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Coba Pencarian Lain
                </button>
              </div>
            )}

            {/* Default State */}
            {!searchQuery && searchResults.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Mulai Pencarian Anda</h3>
                <p className="text-gray-600 mb-6">Cari produk favorit Anda di Shopee, Lazada, dan Tokopedia</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {trendingProducts.slice(0, 5).map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingSearch(trend)}
                      className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm font-medium transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">CARI TAHU</span>
              </div>
              <p className="text-gray-400 text-sm">
                Platform pencarian produk terpercaya yang menghubungkan Anda dengan marketplace terbaik di Indonesia.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Shopee</div>
                <div className="hover:text-white cursor-pointer transition-colors">Lazada</div>
                <div className="hover:text-white cursor-pointer transition-colors">Tokopedia</div>
                <div className="hover:text-white cursor-pointer transition-colors">Blibli</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kategori</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Elektronik</div>
                <div className="hover:text-white cursor-pointer transition-colors">Fashion</div>
                <div className="hover:text-white cursor-pointer transition-colors">Rumah & Taman</div>
                <div className="hover:text-white cursor-pointer transition-colors">Olahraga</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Cara Berbelanja</div>
                <div className="hover:text-white cursor-pointer transition-colors">Kebijakan Privasi</div>
                <div className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</div>
                <div className="hover:text-white cursor-pointer transition-colors">Hubungi Kami</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 CARI TAHU Marketplace. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <button className="hover:text-white transition-colors">Tentang Kami</button>
              <button className="hover:text-white transition-colors">Karir</button>
              <button className="hover:text-white transition-colors">Blog</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplacePage;