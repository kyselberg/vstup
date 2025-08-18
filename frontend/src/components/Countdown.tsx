import { useCountdown } from "../hooks/useCountdown";
import { END_DATE } from "../utils/constants";
import { formatHours, formatMinutes, formatSeconds } from "../utils/date";

export const Countdown = () => {
  const { days, hours, minutes, seconds } = useCountdown(END_DATE);
  const result = [];

  if (days > 0) {
    result.push(`${days} днів`);
  }

  result.push(`${formatHours(hours)}:${formatMinutes(minutes)}:${formatSeconds(seconds)}`);

  const time = result.join(', ');

  // Calculate remaining time in milliseconds to determine status
  const remainingTime = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;

  return (
    <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
      <div className="flex-shrink-0">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">Дедлайн подачі</div>
        {remainingTime > 0 ? (
          <div className="text-xl font-bold text-gray-900">{time}</div>
        ) : (
          <div className="text-xl font-bold text-red-600">Час подачі завершено</div>
        )}
      </div>
    </div>
  );
};