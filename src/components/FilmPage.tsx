import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Star, Calendar, Clock, Loader2, Youtube, MessageSquare, Eye, ThumbsUp, ExternalLink } from 'lucide-react';
import { tmdbApi, Movie, Genre } from '../services/tmdbApi';
import { youtubeApi, YouTubeVideo } from '../services/youtubeApi';

interface FilmPageProps {
  onBack: () => void;
}

interface MovieWithTrailers extends Movie {
  trailers?: YouTubeVideo[];
  reviews?: YouTubeVideo[];
}

const FilmPage: React.FC<FilmPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieWithTrailers[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<MovieWithTrailers[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieWithTrailers | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'error'>('checking');

  // Test YouTube API on component mount
  useEffect(() => {
    const testYouTubeAPI = async () => {
      try {
        const isWorking = await youtubeApi.testConnection();
        setApiStatus(isWorking ? 'working' : 'error');
        if (!isWorking) {
          console.warn('YouTube API tidak dapat diakses. Fitur trailer dan review mungkin tidak berfungsi.');
        }
      } catch (error) {
        console.error('Error testing YouTube API:', error);
        setApiStatus('error');
      }
    };

    testYouTubeAPI();
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [popularMovies, genresData] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getGenres()
        ]);
        
        setMovies(popularMovies.results);
        setGenres(genresData.genres);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await tmdbApi.searchMovies(searchQuery);
      setSearchResults(results.results);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle genre selection
  const handleGenreSelect = async (genreId: number) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      // Load popular movies again
      try {
        const popularMovies = await tmdbApi.getPopularMovies();
        setMovies(popularMovies.results);
      } catch (error) {
        console.error('Error loading popular movies:', error);
      }
      return;
    }

    try {
      setSelectedGenre(genreId);
      const genreMovies = await tmdbApi.getMoviesByGenre(genreId);
      setMovies(genreMovies.results);
    } catch (error) {
      console.error('Error loading movies by genre:', error);
    }
  };

  // Load trailers for a movie
  const loadTrailers = async (movie: MovieWithTrailers) => {
    if (apiStatus === 'error') {
      alert('YouTube API tidak tersedia. Silakan coba lagi nanti.');
      return;
    }

    try {
      setLoadingTrailers(true);
      const year = new Date(movie.release_date).getFullYear().toString();
      console.log(`Searching trailers for: ${movie.title} (${year})`);
      
      const trailerResults = await youtubeApi.searchMovieTrailer(movie.title, year);
      console.log('Trailer results:', trailerResults);
      
      const updatedMovie = { ...movie, trailers: trailerResults.items };
      setSelectedMovie(updatedMovie);
      setShowTrailerModal(true);
    } catch (error) {
      console.error('Error loading trailers:', error);
      // Show modal even if no trailers found
      setSelectedMovie({ ...movie, trailers: [] });
      setShowTrailerModal(true);
    } finally {
      setLoadingTrailers(false);
    }
  };

  // Load reviews for a movie
  const loadReviews = async (movie: MovieWithTrailers) => {
    if (apiStatus === 'error') {
      alert('YouTube API tidak tersedia. Silakan coba lagi nanti.');
      return;
    }

    try {
      setLoadingReviews(true);
      const year = new Date(movie.release_date).getFullYear().toString();
      console.log(`Searching reviews for: ${movie.title} (${year})`);
      
      const reviewResults = await youtubeApi.searchMovieReviews(movie.title, year);
      console.log('Review results:', reviewResults);
      
      const updatedMovie = { ...movie, reviews: reviewResults.items };
      setSelectedMovie(updatedMovie);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Show modal even if no reviews found
      setSelectedMovie({ ...movie, reviews: [] });
      setShowReviewModal(true);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Close modals
  const closeModals = () => {
    setShowTrailerModal(false);
    setShowReviewModal(false);
    setSelectedMovie(null);
  };

  const displayMovies = searchResults.length > 0 ? searchResults : movies;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  CARITAHU REVIEW
                </div>
                {/* API Status Indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'working' ? 'bg-green-500' : 
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} title={`YouTube API: ${apiStatus}`}></div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cari film untuk review..."
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 w-64"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* API Status Warning */}
        {apiStatus === 'error' && (
          <div className="mb-6 bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-200">
                <strong>Peringatan:</strong> YouTube API tidak dapat diakses. Fitur trailer dan review mungkin tidak berfungsi dengan baik.
              </p>
            </div>
          </div>
        )}

        {/* Genre Grid */}
        {!loading && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Pilih Genre untuk Review</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`p-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                    selectedGenre === genre.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="ml-2 text-gray-300">Memuat film...</span>
          </div>
        )}

        {/* Search Results Header */}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Hasil Pencarian untuk "{searchQuery}" ({searchResults.length} film)
            </h2>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && displayMovies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {searchResults.length > 0 ? 'Film untuk Review' : 
               selectedGenre ? `Film ${genres.find(g => g.id === selectedGenre)?.name} untuk Review` : 
               'Film Populer untuk Review'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {displayMovies.slice(0, 24).map((movie) => (
                <div
                  key={movie.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
                    <img
                      src={movie.poster_path ? tmdbApi.getImageUrl(movie.poster_path) : 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <h3 className="font-bold text-white mb-1 line-clamp-2 text-sm">{movie.title}</h3>
                        <div className="flex items-center space-x-3 text-xs text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Text Based */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <button 
                        onClick={() => loadTrailers(movie)}
                        disabled={loadingTrailers || apiStatus === 'error'}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full shadow-lg transition-colors disabled:opacity-50 text-xs font-semibold"
                        title="Lihat Trailer"
                      >
                        {loadingTrailers ? 'Loading...' : 'Trailer'}
                      </button>
                      <button 
                        onClick={() => loadReviews(movie)}
                        disabled={loadingReviews || apiStatus === 'error'}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full shadow-lg transition-colors disabled:opacity-50 text-xs font-semibold"
                        title="Lihat Review"
                      >
                        {loadingReviews ? 'Loading...' : 'Review'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Tidak ada film yang ditemukan untuk "{searchQuery}"</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Kembali ke Film Populer
            </button>
          </div>
        )}

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400">Kategori Review</h3>
            <div className="space-y-2">
              {genres.slice(0, 8).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`block w-full text-left p-2 rounded transition-colors ${
                    selectedGenre === genre.id
                      ? 'text-white bg-red-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* CARITAHU Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">CARITAHU Review</h3>
            <div className="space-y-2">
              {['DCEU Movie Reviews', 'MCU Movie Reviews', 'Korean Movie Reviews', 'Netflix Reviews', 'Marvel Series Reviews', 'Coming Soon Reviews'].map((item, index) => (
                <button
                  key={index}
                  className="block w-full text-left p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              CARITAHU REVIEW
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            CARITAHU Review adalah platform review film, series, anime, drakor terlengkap di Indonesia. 
            Kami menyediakan trailer resmi, review mendalam, dan analisis film dari berbagai genre. 
            Dengan integrasi YouTube API, Anda dapat menonton trailer dan review dari reviewer terpercaya 
            langsung dari platform kami. Temukan film favorit Anda dan baca review yang objektif 
            sebelum menonton.
          </p>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Youtube className="w-6 h-6 text-red-500" />
                  <span>Trailer - {selectedMovie.title}</span>
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              {selectedMovie.trailers && selectedMovie.trailers.length > 0 ? (
                <div className="space-y-4">
                  {selectedMovie.trailers.map((trailer, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={youtubeApi.getEmbedUrl(trailer.id.videoId)}
                          title={trailer.snippet.title}
                          className="w-full h-full"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2">{trailer.snippet.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{trailer.snippet.channelTitle}</p>
                        <p className="text-gray-300 text-sm line-clamp-2">{trailer.snippet.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {youtubeApi.formatPublishedDate(trailer.snippet.publishedAt)}
                          </span>
                          <a
                            href={youtubeApi.getVideoUrl(trailer.id.videoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-red-500 hover:text-red-400 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Buka di YouTube</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Youtube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Tidak ada trailer yang ditemukan untuk film ini</p>
                  <p className="text-gray-500 text-sm">
                    {apiStatus === 'error' ? 'YouTube API tidak tersedia' : 'Coba cari dengan kata kunci yang berbeda'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                  <span>Review - {selectedMovie.title}</span>
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              {selectedMovie.reviews && selectedMovie.reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedMovie.reviews.map((review, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={youtubeApi.getEmbedUrl(review.id.videoId)}
                          title={review.snippet.title}
                          className="w-full h-full"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">{review.snippet.title}</h3>
                        <p className="text-blue-400 text-sm mb-2 font-medium">{review.snippet.channelTitle}</p>
                        <p className="text-gray-300 text-sm line-clamp-3 mb-3">{review.snippet.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {youtubeApi.formatPublishedDate(review.snippet.publishedAt)}
                          </span>
                          <a
                            href={youtubeApi.getVideoUrl(review.id.videoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>YouTube</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Tidak ada review yang ditemukan untuk film ini</p>
                  <p className="text-gray-500 text-sm">
                    {apiStatus === 'error' ? 'YouTube API tidak tersedia' : 'Coba cari dengan kata kunci yang berbeda'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              Copyright © 2024 by CARITAHU REVIEW. All Rights Reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              {['Bantuan', 'DMCA', 'Privacy', 'Discord', 'Telegram', 'Instagram'].map((link, index) => (
                <button
                  key={index}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FilmPage;