import find from 'lodash/find';

export const FRACTION = {
    er: {
        name: 'Единая Россия',
        alias: ['Единая Россия'],
        color: 'is-color-er',
        id: 1,
        slug: 'er',
    },
    kprf: {
        name: 'КПРФ',
        alias: ['КПРФ'],
        color: 'is-color-red',
        id: 2,
        slug: 'kprf',
    },
    nl: {
        name: 'Новые люди',
        alias: ['Новые люди'],
        color: 'is-color-mint',
        id: 3,
        slug: 'nl',
    },
    sr: {
        name: 'Справедливая Россия',
        alias: ['Справедливая Россия'],
        color: 'is-color-orange',
        id: 5,
        slug: 'sr',
    },
    ldpr: {
        name: 'ЛДПР',
        alias: ['ЛДПР'],
        color: 'is-color-yellow',
        id: 9, // 9, 7, 8 ? why?
        slug: 'ldpr',
    },
    vne: {
        name: 'Вне фракции',
        alias: ['Вне фракции', 'беспартийный', 'беспартийная'],
        color: 'is-color-gray',
        id: 0, 
        slug: null,
    }
};

export const getFractionColor = (lobbist) => {
    if (lobbist.fraction) {
        const sfFraction = find(FRACTION, (f) => f.alias.some((el) => el === lobbist.fraction));

        if (sfFraction) {
            return sfFraction.color;
        }

        const fraction = find(FRACTION, (f) => f.id === lobbist.fraction);

        if (fraction) {
            return fraction.color;
        }
    }

    if (lobbist.fraction_old) {
        const fraction = find(FRACTION, (f) => f.alias.some((el) => el === lobbist.fraction_old));

        if (fraction) {
            return fraction.color;
        }
    }

    return FRACTION.vne.color;
};
