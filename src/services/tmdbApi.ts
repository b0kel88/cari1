const TMDB_API_KEY = '1a787bc46b64e0e98e76618b12e07870';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class TMDBApi {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
  }

  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}&language=id-ID`;
    
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
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/popular?page=${page}`);
  }

  // Get trending movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`);
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/top_rated?page=${page}`);
  }

  // Get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/now_playing?page=${page}`);
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/upcoming?page=${page}`);
  }

  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/search/movie?query=${encodedQuery}&page=${page}`);
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<Movie & { genres: Genre[]; runtime: number }> {
    return this.fetchFromTMDB<Movie & { genres: Genre[]; runtime: number }>(`/movie/${movieId}`);
  }

  // Get movie genres
  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
  }

  // Get movies by genre
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/discover/movie?with_genres=${genreId}&page=${page}`);
  }

  // Get movie videos (trailers)
  async getMovieVideos(movieId: number): Promise<{ results: any[] }> {
    return this.fetchFromTMDB<{ results: any[] }>(`/movie/${movieId}/videos`);
  }

  // Helper function to get full image URL
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  // Helper function to format runtime
  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  // Helper function to format rating
  formatRating(rating: number): string {
    return (rating / 10 * 10).toFixed(1);
  }
}

export const tmdbApi = new TMDBApi();
export { TMDB_IMAGE_BASE_URL };