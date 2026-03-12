const SUPABASE_URL = 'https://oxwhqvsoelqqsblmqkxx.supabase.co';
const DEFAULT_CDN_BASE_URL = 'https://server1.simplelecture.com/video';

export function extractJobIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://example.com${url}`);
    
    const job = urlObj.searchParams.get('job');
    if (job) return job;
    
    const jobId = urlObj.searchParams.get('job_id');
    if (jobId) return jobId;
    
    const pathMatch = url.match(/\/(player|video|watch|review)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch?.[2]) return pathMatch[2];
    
    const jobMatch = url.match(/[?&]job=([a-zA-Z0-9_-]+)/);
    if (jobMatch?.[1]) return jobMatch[1];
    
    const jobIdMatch = url.match(/[?&]job_id=([a-zA-Z0-9_-]+)/);
    if (jobIdMatch?.[1]) return jobIdMatch[1];
    
    const uuidMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (uuidMatch?.[1]) return uuidMatch[1];
    
    return null;
  } catch (e) {
    return null;
  }
}

function cleanPath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/+/g, '/');
}

export function getCdnMediaUrl(
  jobId: string | null,
  filePath: string,
  cdnBaseUrl: string = DEFAULT_CDN_BASE_URL
): string {
  if (!jobId) {
    console.warn('[mediaResolver] No jobId provided, returning path as-is');
    return filePath;
  }
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  const cleanedPath = cleanPath(filePath);
  
  const params = new URLSearchParams({
    action: 'cdn_proxy',
    job_id: jobId,
    file_path: cleanedPath,
    cdn_base_url: cdnBaseUrl,
  });
  
  return `${SUPABASE_URL}/functions/v1/video-generation-proxy?${params}`;
}

export function getMediaUrl(jobId: string | null, path: string): string {
  return getCdnMediaUrl(jobId, path);
}

export function getAvatarVideoPath(sectionId: number): string {
  return `avatars/section_${sectionId}_avatar.mp4`;
}

export function resolveMediaPath(path: string, type: 'avatar' | 'video' = 'video'): string {
  if (!path) return path;
  
  let fullPath = path;
  const hasSubfolder = path.includes('avatars/') || path.includes('videos/') || path.includes('audio/');
  
  if (!hasSubfolder) {
    if (type === 'avatar') fullPath = 'avatars/' + path;
    else if (type === 'video') fullPath = 'videos/' + path;
  }
  
  if (!fullPath.match(/\.(mp4|webm|mov)$/i)) {
    fullPath = fullPath + '.mp4';
  }
  
  return fullPath;
}

export function getPresentationUrl(jobId: string | null): string | null {
  if (!jobId) return null;
  
  const params = new URLSearchParams({
    action: 'get_presentation',
    job_id: jobId,
  });
  
  return `${SUPABASE_URL}/functions/v1/video-generation-proxy?${params}`;
}

export function createMediaResolver(jobId: string | null) {
  return (path: string): string => getCdnMediaUrl(jobId, path);
}
