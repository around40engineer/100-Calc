import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  timeLimit: number; // seconds
  onTimeUp: () => void;
}

export function Timer({ timeLimit, onTimeUp }: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setRemainingTime(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (remainingTime <= 0) {
      onTimeUpRef.current();
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [remainingTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClassName = (): string => {
    const baseClasses = 'text-4xl transition-colors duration-300';
    
    if (remainingTime <= 10) {
      return `${baseClasses} text-red-600 font-bold`;
    } else if (remainingTime <= 30) {
      return `${baseClasses} text-red-600`;
    }
    
    return `${baseClasses} text-gray-800`;
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div data-testid="timer" className={getTimerClassName()}>
        {formatTime(remainingTime)}
      </div>
    </div>
  );
}
