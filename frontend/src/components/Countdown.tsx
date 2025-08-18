import { useCountdown } from "../hooks/useCountdown";
import { END_DATE } from "../utils/constants";

export const Countdown = () => {
  const { days, hours, minutes, seconds } = useCountdown(END_DATE);

  // Calculate remaining time in milliseconds to determine status
  const remainingTime = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;

  if (remainingTime <= 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">Час подачі завершено</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-6">Дедлайн подачі</div>
          <div className="grid grid-flow-col gap-8 text-center auto-cols-max">
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-6xl text-blue-600">
                <span style={{"--value": days} as React.CSSProperties} aria-live="polite" aria-label={`${days} днів`}>
                  {days}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600 mt-2">днів</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-6xl text-green-600">
                <span style={{"--value": hours} as React.CSSProperties} aria-live="polite" aria-label={`${hours} годин`}>
                  {hours}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600 mt-2">годин</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-6xl text-orange-600">
                <span style={{"--value": minutes} as React.CSSProperties} aria-live="polite" aria-label={`${minutes} хвилин`}>
                  {minutes}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600 mt-2">хв</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-6xl text-red-600">
                <span style={{"--value": seconds} as React.CSSProperties} aria-live="polite" aria-label={`${seconds} секунд`}>
                  {seconds}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600 mt-2">сек</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};