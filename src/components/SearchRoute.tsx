import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Search, Loader2, Film, Star, Calendar, Clock } from 'lucide-react';

// Supabase configuration
const supabaseUrl = 'https://meaixkadnilpcnkqluqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWl4a2FkbmlscGNua3FsdXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzA4NjIsImV4cCI6MjA2NTUwNjg2Mn0.GWyTfpeIXU4O6GITJvup87KD0-3jLgNNcZ-NfSMNYLo';

const supabase = createClient(supabaseUrl, supabaseKey);

// TMDB API configuration
const TMDB_API_KEY = '1a787bc46b64e0e98e76618b12e07870';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface CachedResult {
  query_text: string;
  result_json: any;
  created_at: string;
}

const SearchRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const searchQuery = searchParams.get('q') || '';

  // Function to fetch from TMDB API
  const fetchFromTMDB = async (query: string) => {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=id-ID`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      throw error;
    }
  };

  // Function to check cache and fetch data
  const searchMovies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if data exists in Supabase cache
      const { data: cachedData, error: cacheError } = await supabase
        .from('film_cache')
        .select('*')
        .eq('query_text', searchQuery.toLowerCase())
        .single();

      if (cacheError && cacheError.code !== 'PGRST116') {
        console.error('Cache check error:', cacheError);
      }

      if (cachedData && cachedData.result_json) {
        // Use cached data
        console.log('Using cached data for query:', searchQuery);
        setMovies(cachedData.result_json.results || []);
      } else {
        // Fetch from TMDB API
        console.log('Fetching from TMDB API for query:', searchQuery);
        const tmdbResult = await fetchFromTMDB(searchQuery);
        
        // Save to Supabase cache
        const { error: insertError } = await supabase
          .from('film_cache')
          .insert([{
            query_text: searchQuery.toLowerCase(),
            result_json: tmdbResult,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error saving to cache:', insertError);
        } else {
          console.log('Saved to cache successfully');
        }

        setMovies(tmdbResult.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Terjadi kesalahan saat mencari film. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to search when query parameter changes
  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      searchMovies(searchQuery);
    } else {
      setMovies([]);
      setLoading(false);
    }
  }, [searchQuery, searchMovies]);

  // Handle new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const newUrl = `/cari?q=${encodeURIComponent(query.trim())}`;
      window.history.pushState({}, '', newUrl);
      searchMovies(query.trim());
    }
  };

  // Get image URL
  const getImageUrl = (path: string, size: string = 'w500'): string => {
    if (!path) return 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CARI FILM
              </div>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari film untuk review..."
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-full pl-12 pr-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200"
                >
                  Cari
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Hasil Pencarian: "{searchQuery}"
            </h1>
            <p className="text-gray-400">
              {loading ? 'Mencari...' : `${movies.length} film ditemukan`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Mencari film terbaik untuk Anda...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop';
                    }}
                  />
                  
                  {/* Overlay */}
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

                  {/* Action Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full shadow-lg transition-colors text-xs font-semibold">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && searchQuery && movies.length === 0 && !error && (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Tidak ada film yang ditemukan
            </h3>
            <p className="text-gray-500 mb-6">
              Coba gunakan kata kunci yang berbeda untuk pencarian Anda
            </p>
            <button
              onClick={() => {
                setQuery('');
                window.history.pushState({}, '', '/cari');
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Default State */}
        {!searchQuery && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎬</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              Cari Film untuk Review
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Masukkan judul film yang ingin Anda cari untuk melihat review dan trailer
            </p>
            
            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-400 mb-4">Pencarian Populer:</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['Avengers', 'Spider-Man', 'Batman', 'Joker', 'Inception', 'Interstellar'].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(term);
                      const newUrl = `/cari?q=${encodeURIComponent(term)}`;
                      window.history.pushState({}, '', newUrl);
                      searchMovies(term);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-colors border border-gray-700 hover:border-gray-600"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 CARI FILM. Powered by TMDB API & Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchRoute;