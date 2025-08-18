export const formatSeconds = (seconds: number): string => {
    return seconds.toString().padStart(2, '0');
};

export const formatMinutes = (minutes: number): string => {
    return minutes.toString().padStart(2, '0');
};

export const formatHours = (hours: number): string => {
    return hours.toString().padStart(2, '0');
};

export const formatDays = (days: number): string => {
    return days.toString().padStart(2, '0');
};

export const formatWeeks = (weeks: number): string => {
    return weeks.toString().padStart(2, '0');
};

export const formatMonths = (months: number): string => {
    return months.toString().padStart(2, '0');
};
