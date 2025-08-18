"use client";

// this is blog functionality

import { useState } from "react";

export default function BlogImage({ src, alt, className, fallbackSrc = "/next.svg" }) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
} 