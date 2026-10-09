import React, { useRef, useEffect } from 'react';

const Camera = ({ onVideoReady, onError }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            if (onVideoReady) onVideoReady(videoRef.current);
          };
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (onError) onError('Camera permission denied or camera unavailable.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: '100%', borderRadius: '12px', transform: 'scaleX(-1)' }}
      />
    </div>
  );
};

export default Camera;