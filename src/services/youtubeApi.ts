const YOUTUBE_API_KEY = 'AIzaSyBugjvd6hPnrzbwvQwjaPeK6U0S7hFio9c';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

class YouTubeApi {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
    this.baseUrl = YOUTUBE_BASE_URL;
  }

  private async fetchFromYouTube<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${this.apiKey}`;
    
    console.log('YouTube API URL:', url); // Debug log
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API Error Response:', errorText);
        throw new Error(`YouTube API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('YouTube API Response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching from YouTube:', error);
      // Return empty response instead of throwing
      return {
        items: [],
        pageInfo: { totalResults: 0, resultsPerPage: 0 }
      } as T;
    }
  }

  // Search for movie trailers with better query
  async searchMovieTrailer(movieTitle: string, year?: string): Promise<YouTubeSearchResponse> {
    // Clean movie title and create better search query
    const cleanTitle = movieTitle.replace(/[^\w\s]/gi, '').trim();
    const queries = [
      `${cleanTitle} official trailer ${year || ''}`,
      `${cleanTitle} trailer ${year || ''}`,
      `${cleanTitle} movie trailer`
    ];
    
    // Try multiple queries to get better results
    for (const query of queries) {
      try {
        const encodedQuery = encodeURIComponent(query.trim());
        const result = await this.fetchFromYouTube<YouTubeSearchResponse>(
          `/search?part=snippet&q=${encodedQuery}&type=video&maxResults=3&order=relevance&videoDuration=short&videoDefinition=high`
        );
        
        if (result.items && result.items.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`Failed to search with query: ${query}`, error);
        continue;
      }
    }
    
    // Return empty result if all queries fail
    return {
      items: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 }
    };
  }

  // Search for movie reviews with better query
  async searchMovieReviews(movieTitle: string, year?: string): Promise<YouTubeSearchResponse> {
    // Clean movie title and create better search query
    const cleanTitle = movieTitle.replace(/[^\w\s]/gi, '').trim();
    const queries = [
      `${cleanTitle} review ${year || ''}`,
      `${cleanTitle} movie review`,
      `${cleanTitle} film review`,
      `review ${cleanTitle}`
    ];
    
    // Try multiple queries to get better results
    for (const query of queries) {
      try {
        const encodedQuery = encodeURIComponent(query.trim());
        const result = await this.fetchFromYouTube<YouTubeSearchResponse>(
          `/search?part=snippet&q=${encodedQuery}&type=video&maxResults=6&order=relevance&videoDuration=medium`
        );
        
        if (result.items && result.items.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`Failed to search with query: ${query}`, error);
        continue;
      }
    }
    
    // Return empty result if all queries fail
    return {
      items: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 }
    };
  }

  // Get video details
  async getVideoDetails(videoId: string): Promise<any> {
    try {
      return await this.fetchFromYouTube<any>(
        `/videos?part=snippet,statistics,contentDetails&id=${videoId}`
      );
    } catch (error) {
      console.error('Error getting video details:', error);
      return null;
    }
  }

  // Helper function to get YouTube video URL
  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Helper function to get YouTube embed URL
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  }

  // Helper function to get thumbnail URL
  getThumbnailUrl(video: YouTubeVideo, quality: 'default' | 'medium' | 'high' = 'medium'): string {
    return video.snippet.thumbnails[quality]?.url || video.snippet.thumbnails.default?.url || '';
  }

  // Helper function to format duration
  formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let formatted = '';
    if (hours) formatted += `${hours}:`;
    if (minutes) formatted += `${minutes.padStart(2, '0')}:`;
    if (seconds) formatted += seconds.padStart(2, '0');
    
    return formatted || '0:00';
  }

  // Helper function to format view count
  formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  }

  // Helper function to format published date
  formatPublishedDate(publishedAt: string): string {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 30) return `${diffDays} hari lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.fetchFromYouTube<any>('/search?part=snippet&q=test&type=video&maxResults=1');
      return result && result.items && Array.isArray(result.items);
    } catch (error) {
      console.error('YouTube API connection test failed:', error);
      return false;
    }
  }
}

export const youtubeApi = new YouTubeApi();