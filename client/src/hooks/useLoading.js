import { useState, useEffect } from 'react';

export const useLoading = (isLoading) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  return progress;
}; 
 