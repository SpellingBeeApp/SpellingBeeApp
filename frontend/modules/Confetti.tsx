import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const PartySprinkles = () => {
  useEffect(() => {
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 100,
        angle: 90,
        spread: 180,
        origin: { y: 0 },
        colors: ['#bb0000', '#ffffff', '#00ff00', '#0000ff', '#ffff00'],
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);
};

export default PartySprinkles;