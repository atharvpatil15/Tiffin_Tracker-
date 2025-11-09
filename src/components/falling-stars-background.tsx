'use client';

import { useEffect, useState } from 'react';

const STAR_COUNT = 50;

const FallingStars = () => {
  const [stars, setStars] = useState<
    {
      id: number;
      size: number;
      left: string;
      animationDuration: string;
      animationDelay: string;
    }[]
  >([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: STAR_COUNT }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1, // Star size between 1px and 3px
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 5 + 5}s`, // Duration between 5s and 10s
        animationDelay: `${Math.random() * 5}s`,
      }));
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default FallingStars;
