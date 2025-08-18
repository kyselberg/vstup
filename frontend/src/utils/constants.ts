export const END_DATE = (() => {
    const now = new Date();
    now.setFullYear(2025, 7, 25);
    now.setHours(18, 0, 0, 0);
    return now;
})();