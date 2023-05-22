export function formatNumber(num) {
    return String(num)
        .split('')
        .reverse()
        .reduce((acc, el, i) => {
            if (i && i % 3 === 0) {
                acc.push(' ');
            }
            acc.push(el);
            return acc;
        }, [])
        .reverse()
        .join('');
}