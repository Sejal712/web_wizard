import React, { useState } from 'react';

// Helper component to handle image loading with fallback
const ImageWithFallback = ({ filename, alt, className, ...props }) => {
  const [imageSrc, setImageSrc] = useState(`http://localhost:5000/uploads/compressed/${filename}`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      // Try the regular uploads directory as fallback
      setImageSrc(`http://localhost:5000/uploads/${filename}`);
      setHasError(true);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
