import { useTimer } from "./useTimer";

export const useCountdown = (endDate: Date) => {
    useTimer();

    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(difference / day);
    const hours = Math.floor((difference % day) / hour);
    const minutes = Math.floor((difference % hour) / minute);
    const seconds = Math.floor((difference % minute) / 1000);

    return { days, hours, minutes, seconds };
}