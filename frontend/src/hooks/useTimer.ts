import { useEffect, useState } from "react";

export const useTimer = () => {
    const [, update] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => update(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);
};