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

export function pageTypeToConvocation(pageType) {
    switch (pageType) {
        case 'duma_7':
            return 7;
        case 'duma_8':
            return 8;
        case 'sf':
            return 8;
    }
    
    return null;
}