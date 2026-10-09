// Euclidean Distance calculate karne ka utility function
// Formula: sqrt(sum((a_i - b_i)^2))
export const calculateEuclideanDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors dimensions must match');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

// Registered faces me se best matching face search karne ki service
export const findBestMatch = (queryDescriptor, registeredFaceRecords, threshold = 0.45) => {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const record of registeredFaceRecords) {
    // Record me stored array of descriptors me se distance check karein
    for (const savedDescriptor of record.descriptors) {
      const distance = calculateEuclideanDistance(queryDescriptor, savedDescriptor);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          studentId: record.student._id,
          studentDetails: record.student,
          distance: distance,
        };
      }
    }
  }

  // Distance threshold se kam hona chahiye tabhi match valid maana jayega
  if (minDistance <= threshold && bestMatch) {
    return {
      isMatched: true,
      match: bestMatch,
      confidence: Math.max(0, (1 - minDistance) * 100),
    };
  }

  return {
    isMatched: false,
    confidence: 0,
    message: 'Face not recognized. Distance above acceptable threshold.',
  };
};