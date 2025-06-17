import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Star, Calendar, Clock, Loader2, Youtube, MessageSquare, Eye, ThumbsUp, ExternalLink, Filter, Grid, List, TrendingUp, Award, Users, Bookmark } from 'lucide-react';
import { tmdbApi, Movie, Genre } from '../services/tmdbApi';
import { youtubeApi, YouTubeVideo } from '../services/youtubeApi';
import { createClient } from '@supabase/supabase-js';

interface EnhancedFilmPageProps {
  onBack: () => void;
}

interface MovieWithExtras extends Movie {
  trailers?: YouTubeVideo[];
  reviews?: YouTubeVideo[];
  userRating?: number;
  isBookmarked?: boolean;
}

interface UserReview {
  id: string;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  movie_id: number;
  helpful_count: number;
}

// Supabase configuration
const supabaseUrl = 'https://meaixkadnilpcnkqluqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWl4a2FkbmlscGNua3FsdXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzA4NjIsImV4cCI6MjA2NTUwNjg2Mn0.GWyTfpeIXU4O6GITJvup87KD0-3jLgNNcZ-NfSMNYLo';

const supabase = createClient(supabaseUrl, supabaseKey);

const EnhancedFilmPage: React.FC<EnhancedFilmPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieWithExtras[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<MovieWithExtras[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieWithExtras | null>(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'error'>('checking');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '', userName: '' });

  // Test YouTube API on component mount
  useEffect(() => {
    const testYouTubeAPI = async () => {
      try {
        const isWorking = await youtubeApi.testConnection();
        setApiStatus(isWorking ? 'working' : 'error');
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

  // Load movie details with trailers and reviews
  const loadMovieDetails = async (movie: MovieWithExtras) => {
    if (apiStatus === 'error') {
      setSelectedMovie(movie);
      setShowMovieModal(true);
      return;
    }

    try {
      setLoadingExtras(true);
      const year = new Date(movie.release_date).getFullYear().toString();
      
      const [trailerResults, reviewResults, userReviewsData] = await Promise.all([
        youtubeApi.searchMovieTrailer(movie.title, year),
        youtubeApi.searchMovieReviews(movie.title, year),
        loadUserReviews(movie.id)
      ]);
      
      const updatedMovie = { 
        ...movie, 
        trailers: trailerResults.items,
        reviews: reviewResults.items 
      };
      
      setSelectedMovie(updatedMovie);
      setUserReviews(userReviewsData);
      setShowMovieModal(true);
    } catch (error) {
      console.error('Error loading movie details:', error);
      setSelectedMovie({ ...movie, trailers: [], reviews: [] });
      setShowMovieModal(true);
    } finally {
      setLoadingExtras(false);
    }
  };

  // Load user reviews from Supabase
  const loadUserReviews = async (movieId: number): Promise<UserReview[]> => {
    try {
      const { data, error } = await supabase
        .from('movie_reviews')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading user reviews:', error);
      return [];
    }
  };

  // Submit user review
  const submitReview = async () => {
    if (!selectedMovie || !newReview.userName.trim() || !newReview.text.trim()) {
      alert('Mohon lengkapi semua field review');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('movie_reviews')
        .insert([{
          movie_id: selectedMovie.id,
          user_name: newReview.userName,
          rating: newReview.rating,
          review_text: newReview.text,
          helpful_count: 0
        }]);

      if (error) {
        console.error('Error submitting review:', error);
        alert('Gagal mengirim review. Silakan coba lagi.');
        return;
      }

      // Reload reviews
      const updatedReviews = await loadUserReviews(selectedMovie.id);
      setUserReviews(updatedReviews);
      
      // Reset form
      setNewReview({ rating: 5, text: '', userName: '' });
      setShowReviewForm(false);
      
      alert('Review berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Gagal mengirim review. Silakan coba lagi.');
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

  // Close modal
  const closeModal = () => {
    setShowMovieModal(false);
    setSelectedMovie(null);
    setUserReviews([]);
    setShowReviewForm(false);
    setNewReview({ rating: 5, text: '', userName: '' });
  };

  // Sort movies
  const sortMovies = (movies: MovieWithExtras[]) => {
    switch (sortBy) {
      case 'rating':
        return [...movies].sort((a, b) => b.vote_average - a.vote_average);
      case 'year':
        return [...movies].sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
      case 'title':
        return [...movies].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return movies;
    }
  };

  const displayMovies = sortMovies(searchResults.length > 0 ? searchResults : movies);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
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
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'working' ? 'bg-green-500' : 
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} title={`YouTube API: ${apiStatus}`}></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="popularity">Popularitas</option>
                <option value="rating">Rating</option>
                <option value="year">Tahun</option>
                <option value="title">Judul</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Cari film..."
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

        {/* Genre Filter */}
        {!loading && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Pilih Genre untuk Review</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
                    selectedGenre === genre.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
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

        {/* Movies Display */}
        {!loading && displayMovies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {searchResults.length > 0 ? 'Film untuk Review' : 
               selectedGenre ? `Film ${genres.find(g => g.id === selectedGenre)?.name} untuk Review` : 
               'Film Populer untuk Review'}
            </h2>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {displayMovies.slice(0, 24).map((movie) => (
                  <div
                    key={movie.id}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => loadMovieDetails(movie)}
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
                      
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full shadow-lg text-xs font-semibold">
                          {loadingExtras ? 'Loading...' : 'Review'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayMovies.slice(0, 20).map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                    onClick={() => loadMovieDetails(movie)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={movie.poster_path ? tmdbApi.getImageUrl(movie.poster_path, 'w200') : 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop'}
                        alt={movie.title}
                        className="w-16 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{movie.title}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{movie.overview}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Lihat Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      </div>

      {/* Movie Detail Modal */}
      {showMovieModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">{selectedMovie.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Movie Info */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <img
                    src={selectedMovie.poster_path ? tmdbApi.getImageUrl(selectedMovie.poster_path) : 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop'}
                    alt={selectedMovie.title}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-lg font-bold">{selectedMovie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{selectedMovie.overview}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Tulis Review</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Bookmark className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Tulis Review Anda</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Nama</label>
                      <input
                        type="text"
                        value={newReview.userName}
                        onChange={(e) => setNewReview({...newReview, userName: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Masukkan nama Anda"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setNewReview({...newReview, rating})}
                            className={`p-2 rounded ${newReview.rating >= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Review</label>
                      <textarea
                        value={newReview.text}
                        onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-32"
                        placeholder="Tulis review Anda tentang film ini..."
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={submitReview}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Kirim Review
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Trailers Section */}
              {selectedMovie.trailers && selectedMovie.trailers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Youtube className="w-6 h-6 text-red-500" />
                    <span>Trailer</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedMovie.trailers.slice(0, 2).map((trailer, index) => (
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
                          <h4 className="font-semibold text-white mb-2 line-clamp-2">{trailer.snippet.title}</h4>
                          <p className="text-gray-400 text-sm">{trailer.snippet.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Reviews Section */}
              {selectedMovie.reviews && selectedMovie.reviews.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                    <span>Review YouTube</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedMovie.reviews.slice(0, 4).map((review, index) => (
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
                          <h4 className="font-semibold text-white mb-2 line-clamp-2">{review.snippet.title}</h4>
                          <p className="text-blue-400 text-sm font-medium">{review.snippet.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Reviews Section */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-6 h-6 text-green-500" />
                  <span>Review Pengguna ({userReviews.length})</span>
                </h3>
                
                {userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {review.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{review.user_name}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {new Date(review.created_at).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{review.helpful_count}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Belum ada review pengguna untuk film ini</p>
                    <p className="text-gray-500 text-sm">Jadilah yang pertama memberikan review!</p>
                  </div>
                )}
              </div>
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

export default EnhancedFilmPage;