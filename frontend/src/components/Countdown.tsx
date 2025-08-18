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

  return <div className="text-2xl font-bold">Дедлайн: {time}</div>;
};