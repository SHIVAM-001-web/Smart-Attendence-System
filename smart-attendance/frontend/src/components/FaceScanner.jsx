import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Camera from './Camera';

const FaceScanner = ({ onFaceDetected, isProcessing }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading AI Models...');
  const [cameraError, setCameraError] = useState(null);
  
  const videoElementRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatusMessage('AI Models Loaded. Initializing Camera...');
      } catch (error) {
        console.error('Failed to load Face-API models:', error);
        setStatusMessage('Failed to load computer vision models.');
      }
    };

    loadModels();

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const handleVideoReady = (videoNode) => {
    videoElementRef.current = videoNode;
    setStatusMessage('Position your face clearly inside the camera frame.');

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      // Direct return if server request is in-flight or camera missing
      if (!videoElementRef.current || isProcessing) return;

      const detections = await faceapi
        .detectAllFaces(videoElementRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (canvasRef.current && videoElementRef.current) {
        const displaySize = {
          width: videoElementRef.current.videoWidth,
          height: videoElementRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);

        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }

      if (detections.length === 0) {
        setStatusMessage('No face detected. Please face the camera.');
      } else if (detections.length > 1) {
        setStatusMessage('Multiple faces detected! Ensure only one person is visible.');
      } else {
        const singleFace = detections[0];
        const descriptorArray = Array.from(singleFace.descriptor);

        setStatusMessage('Face detected! Saving biometrics to database...');
        
        // Lock execution immediately
        if (onFaceDetected) {
          onFaceDetected(descriptorArray);
        }
      }
    }, 400); // Increased interval to 400ms for stable frame processing
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {cameraError ? (
        <div style={{ color: '#ef4444', padding: '20px', border: '1px solid #ef4444', borderRadius: '8px' }}>
          {cameraError}
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '640px' }}>
          {modelsLoaded && <Camera onVideoReady={handleVideoReady} onError={setCameraError} />}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              transform: 'scaleX(-1)',
            }}
          />
        </div>
      )}

      <div
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          borderRadius: '6px',
          background: '#1e293b',
          color: '#38bdf8',
          fontWeight: '500',
          display: 'inline-block',
        }}
      >
        {statusMessage}
      </div>
    </div>
  );
};

export default FaceScanner;