import React, { useState, useEffect } from 'react';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingStarsProps = {
  rating: number;
  size?: number;
  className?: string;
  showText?: boolean;
  showEmptyStars?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  count?: number;
};

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 20,
  className = '',
  showText = false,
  showEmptyStars = true,
  interactive = false,
  onChange,
  readOnly = false,
  count,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [displayRating, setDisplayRating] = useState(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleMouseEnter = (index: number) => {
    if (interactive && !readOnly) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && !readOnly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (interactive && !readOnly && onChange) {
      const newRating = index + 1;
      onChange(newRating);
    }
  };

  const currentRating = hoverRating || displayRating;
  const fullStars = Math.floor(currentRating);
  const hasHalfStar = currentRating % 1 >= 0.5 && currentRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = starValue <= fullStars;
    const isHalf = starValue === fullStars + 1 && hasHalfStar;

    if (isFilled) {
      return (
        <Star
          key={index}
          className="text-yellow-400 fill-yellow-400"
          size={size}
          onMouseEnter={() => handleMouseEnter(index)}
          onClick={() => handleClick(index)}
        />
      );
    }

    if (isHalf) {
      return (
        <StarHalf
          key={index}
          className="text-yellow-400 fill-yellow-400"
          size={size}
          onMouseEnter={() => handleMouseEnter(index)}
          onClick={() => handleClick(index)}
        />
      );
    }

    if (showEmptyStars) {
      return (
        <Star
          key={index}
          className="text-gray-300 dark:text-gray-600"
          size={size}
          onMouseEnter={() => handleMouseEnter(index)}
          onClick={() => handleClick(index)}
        />
      );
    }

    return null;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className="flex" 
        onMouseLeave={interactive && !readOnly ? handleMouseLeave : undefined}
      >
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>
      
      {showText && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {displayRating.toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
