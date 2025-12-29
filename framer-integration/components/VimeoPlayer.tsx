import React, { useEffect, useRef, useState } from 'react';

interface VimeoPlayerProps {
  videoId: string;
  onProgress?: (data: { currentTime: number; duration: number; percentage: number }) => void;
  onComplete?: () => void;
  startTime?: number;
}

export default function VimeoPlayer({ videoId, onProgress, onComplete, startTime = 0 }: VimeoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load Vimeo Player API script
    if (typeof window !== 'undefined' && !(window as any).Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializePlayer();
      };
    } else if ((window as any).Vimeo) {
      initializePlayer();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!iframeRef.current || !(window as any).Vimeo) return;

    const Vimeo = (window as any).Vimeo;
    const vimeoPlayer = new Vimeo.Player(iframeRef.current);

    setPlayer(vimeoPlayer);

    // Set start time if resuming
    if (startTime > 0) {
      vimeoPlayer.setCurrentTime(startTime).catch((error: any) => {
        console.error('Error setting start time:', error);
      });
    }

    // Track progress every 5 seconds
    progressInterval.current = setInterval(async () => {
      try {
        const currentTime = await vimeoPlayer.getCurrentTime();
        const duration = await vimeoPlayer.getDuration();
        const percentage = (currentTime / duration) * 100;

        if (onProgress) {
          onProgress({ currentTime, duration, percentage });
        }
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }, 5000);

    // Handle video end
    vimeoPlayer.on('ended', () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (onComplete) {
        onComplete();
      }
    });

    // Handle errors
    vimeoPlayer.on('error', (error: any) => {
      console.error('Vimeo player error:', error);
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.playerWrapper}>
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${videoId}?h=&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`}
          style={styles.iframe}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video Player"
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    position: 'relative' as const,
  },
  playerWrapper: {
    position: 'relative' as const,
    paddingBottom: '56.25%', // 16:9 aspect ratio
    height: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    backgroundColor: '#000000',
  },
  iframe: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};
