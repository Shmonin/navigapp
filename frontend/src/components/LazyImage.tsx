import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  threshold = 0.1,
  className,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <img
      ref={imgRef}
      src={hasError && fallback ? fallback : imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-50',
        className
      )}
      {...props}
    />
  );
};