import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

// Check if FFmpeg is available at startup
let ffmpegAvailable = false;
try {
  execSync('which ffmpeg', { stdio: 'pipe' });
  ffmpegAvailable = true;
  console.log('FFmpeg is available for video generation');
} catch {
  console.warn('FFmpeg is not available - video generation will be disabled');
}

interface SlideContent {
  title: string;
  keyPoints: string[];
  narration: string;
  duration?: number;
}

interface VideoGenerationRequest {
  question: string;
  slides: SlideContent[];
  audioBase64?: string;
  outputFormat?: 'mp4' | 'webm';
}

interface VideoGenerationResult {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  error?: string;
  duration?: number;
}

const TEMP_DIR = path.join(os.tmpdir(), 'edu-videos');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'videos');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, '\\\\\\\\')
    .replace(/'/g, "\\\\'")
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export async function generateEducationalVideo(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  // Check if FFmpeg is available
  if (!ffmpegAvailable) {
    return {
      success: false,
      error: 'FFmpeg is not available on this system. Video generation is disabled.',
    };
  }

  const { slides, audioBase64, outputFormat = 'mp4' } = request;
  const videoId = `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputPath = path.join(OUTPUT_DIR, `${videoId}.${outputFormat}`);

  try {
    const wordsPerMinute = 150;
    let totalDuration = 0;
    const slidesDurations: number[] = [];

    for (const slide of slides) {
      const wordCount = slide.narration.split(/\s+/).length;
      const duration = Math.max((wordCount / wordsPerMinute) * 60, 5);
      slidesDurations.push(duration);
      totalDuration += duration;
    }

    let audioPath: string | null = null;
    if (audioBase64) {
      audioPath = path.join(TEMP_DIR, `${videoId}_audio.wav`);
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      fs.writeFileSync(audioPath, audioBuffer);

      const audioDuration = await getAudioDuration(audioPath);
      if (audioDuration > 0) {
        const scaleFactor = audioDuration / totalDuration;
        for (let i = 0; i < slidesDurations.length; i++) {
          slidesDurations[i] *= scaleFactor;
        }
        totalDuration = audioDuration;
      }
    }

    const filterComplex = buildFilterComplex(slides, slidesDurations, 1920, 1080);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()
        .input('color=c=#1a1a2e:s=1920x1080:d=' + Math.ceil(totalDuration))
        .inputFormat('lavfi')
        .complexFilter(filterComplex.filters, filterComplex.outputLabel)
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-r', '30',
        ]);

      if (audioPath && fs.existsSync(audioPath)) {
        command
          .input(audioPath)
          .outputOptions(['-c:a', 'aac', '-b:a', '128k', '-shortest']);
      }

      command
        .output(outputPath)
        .on('start', (cmdline) => {
          console.log('FFmpeg started:', cmdline);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent?.toFixed(1) + '% done');
        })
        .on('end', () => {
          console.log('Video generation completed');
          if (audioPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
          }
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          if (audioPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
          }
          reject(err);
        })
        .run();
    });

    return {
      success: true,
      videoPath: outputPath,
      videoUrl: `/videos/${videoId}.${outputFormat}`,
      duration: totalDuration,
    };
  } catch (error) {
    console.error('Video generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function buildFilterComplex(
  slides: SlideContent[],
  durations: number[],
  width: number,
  height: number
): { filters: string; outputLabel: string } {
  const filters: string[] = [];
  let currentTime = 0;
  const overlayLabels: string[] = [];

  filters.push('[0:v]format=rgba[base]');

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const duration = durations[i];
    const startTime = currentTime;
    const endTime = currentTime + duration;
    const fadeIn = Math.min(0.5, duration * 0.1);
    const fadeOut = Math.min(0.5, duration * 0.1);

    const titleLines = wrapText(slide.title, 40);
    const titleText = escapeFFmpegText(titleLines.join('\\n'));
    
    const titleLabel = `title${i}`;
    const prevLabel = i === 0 ? 'base' : `out${i - 1}`;

    filters.push(
      `[${prevLabel}]drawtext=text='${titleText}':` +
      `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:` +
      `fontsize=56:fontcolor=white:` +
      `x=(w-text_w)/2:y=h*0.15:` +
      `enable='between(t,${startTime},${endTime})':` +
      `alpha='if(lt(t-${startTime},${fadeIn}),(t-${startTime})/${fadeIn},` +
      `if(gt(t,${endTime - fadeOut}),(${endTime}-t)/${fadeOut},1))'` +
      `[${titleLabel}]`
    );

    let lastLabel = titleLabel;
    for (let j = 0; j < Math.min(slide.keyPoints.length, 5); j++) {
      const point = slide.keyPoints[j];
      const pointText = escapeFFmpegText('• ' + wrapText(point, 50).join('\\n  '));
      const pointLabel = `point${i}_${j}`;
      const pointDelay = startTime + (j + 1) * (duration / (slide.keyPoints.length + 2));
      const pointFadeIn = 0.3;

      filters.push(
        `[${lastLabel}]drawtext=text='${pointText}':` +
        `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:` +
        `fontsize=36:fontcolor=white:` +
        `x=w*0.1:y=h*0.35+${j * 70}:` +
        `enable='between(t,${pointDelay},${endTime})':` +
        `alpha='if(lt(t-${pointDelay},${pointFadeIn}),(t-${pointDelay})/${pointFadeIn},` +
        `if(gt(t,${endTime - fadeOut}),(${endTime}-t)/${fadeOut},1))'` +
        `[${pointLabel}]`
      );
      lastLabel = pointLabel;
    }

    const slideNumLabel = `slidenum${i}`;
    const slideNumText = escapeFFmpegText(`${i + 1} / ${slides.length}`);
    filters.push(
      `[${lastLabel}]drawtext=text='${slideNumText}':` +
      `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:` +
      `fontsize=24:fontcolor=gray:` +
      `x=w-text_w-30:y=h-50:` +
      `enable='between(t,${startTime},${endTime})'` +
      `[out${i}]`
    );

    currentTime = endTime;
  }

  return {
    filters: filters.join(';'),
    outputLabel: `out${slides.length - 1}`,
  };
}

async function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err || !metadata?.format?.duration) {
        resolve(0);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}

export function cleanupOldVideos(maxAgeHours: number = 24): void {
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old video: ${file}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
