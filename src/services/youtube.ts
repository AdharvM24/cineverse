import { VideoItem } from '../types/movie';

export const youtubeService = {
  getBestTrailer(videos: VideoItem[]): VideoItem | null {
    if (!videos || videos.length === 0) return null;

    // Filter YouTube videos
    const ytVideos = videos.filter(
      (v) => v.site?.toLowerCase() === 'youtube' && Boolean(v.key)
    );

    if (ytVideos.length === 0) return null;

    // 1. Official Trailer
    const officialTrailer = ytVideos.find(
      (v) => v.type === 'Trailer' && v.official
    );
    if (officialTrailer) return officialTrailer;

    // 2. Any Trailer
    const anyTrailer = ytVideos.find((v) => v.type === 'Trailer');
    if (anyTrailer) return anyTrailer;

    // 3. Official Teaser
    const officialTeaser = ytVideos.find(
      (v) => v.type === 'Teaser' && v.official
    );
    if (officialTeaser) return officialTeaser;

    // 4. Any Teaser or Clip
    const anyTeaser = ytVideos.find((v) => v.type === 'Teaser');
    if (anyTeaser) return anyTeaser;

    return ytVideos[0];
  },

  getYoutubeEmbedUrl(key: string, autoplay = true): string {
    const autoPlayParam = autoplay ? '1' : '0';
    return `https://www.youtube.com/embed/${key}?autoplay=${autoPlayParam}&rel=0&playsinline=1&modestbranding=1&color=white`;
  },

  getYoutubeWatchUrl(key: string): string {
    return `https://www.youtube.com/watch?v=${key}`;
  },

  getYoutubeThumbnail(key: string, quality: 'hqdefault' | 'maxresdefault' = 'hqdefault'): string {
    return `https://img.youtube.com/vi/${key}/${quality}.jpg`;
  },
};

export default youtubeService;

