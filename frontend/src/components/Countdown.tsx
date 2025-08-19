import { useCountdown } from "../hooks/useCountdown";
import { END_DATE } from "../utils/constants";

export const Countdown = () => {
  const { days, hours, minutes, seconds } = useCountdown(END_DATE);

  // Calculate remaining time in milliseconds to determine status
  const remainingTime = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;

  if (remainingTime <= 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="card bg-base-100 shadow-xl border-2 border-base-300 p-3">
          <div className="text-sm font-bold text-error text-center">Час подачі завершено</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="card bg-base-100 shadow-xl border-2 border-base-300 p-3">
        <div className="text-center">
          <div className="text-xs font-semibold text-base-content mb-2">Дедлайн подачі</div>
          <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-lg text-primary">
                <span style={{"--value": days} as React.CSSProperties} aria-live="polite" aria-label={`${days} днів`}>
                  {days}
                </span>
              </span>
              <span className="text-xs font-medium text-base-content/70">д</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-lg text-success">
                <span style={{"--value": hours} as React.CSSProperties} aria-live="polite" aria-label={`${hours} годин`}>
                  {hours}
                </span>
              </span>
              <span className="text-xs font-medium text-base-content/70">г</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-lg text-warning">
                <span style={{"--value": minutes} as React.CSSProperties} aria-live="polite" aria-label={`${minutes} хвилин`}>
                  {minutes}
                </span>
              </span>
              <span className="text-xs font-medium text-base-content/70">х</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-lg text-error">
                <span style={{"--value": seconds} as React.CSSProperties} aria-live="polite" aria-label={`${seconds} секунд`}>
                  {seconds}
                </span>
              </span>
              <span className="text-xs font-medium text-base-content/70">с</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};