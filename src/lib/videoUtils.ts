export const DEFAULT_YOUTUBE_ID = '5qap5aO4i9A';

export function extractYouTubeId(url?: string): string {
  if (!url) return '';
  
  // Match standard 11-char YouTube ID patterns
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: match any standalone 11-char sequence if it looks like a YouTube URL
  if (url.includes('youtube') || url.includes('youtu.be')) {
    const fallbackMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  return '';
}

export function formatYouTubeEmbedUrl(url?: string): string {
  if (!url) return `https://www.youtube-nocookie.com/embed/${DEFAULT_YOUTUBE_ID}`;

  const id = extractYouTubeId(url);
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  // Handle case where url is already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
    const embedMatch = url.match(/embed\/([^"&?\/\s]{11})/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`;
    }
    return url.replace('www.youtube.com/embed/', 'www.youtube-nocookie.com/embed/');
  }

  // If it's a youtube URL, never return a raw watch link (which causes X-Frame-Options refusal)
  if (isYouTubeUrl(url)) {
    return `https://www.youtube-nocookie.com/embed/${DEFAULT_YOUTUBE_ID}`;
  }

  return url;
}

export function getYouTubeWatchUrl(url?: string): string {
  const id = extractYouTubeId(url) || DEFAULT_YOUTUBE_ID;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function getYouTubeThumbnail(url?: string, fallbackUrl?: string): string {
  const id = extractYouTubeId(url);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return fallbackUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop';
}

export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com');
}
