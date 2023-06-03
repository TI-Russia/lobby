import find from 'lodash/find';
import { FRACTIONS } from '../constants/fractions';

export const getFraction = (lobbist) => {
    if (lobbist.fraction) {
        const sfFraction = find(FRACTIONS, (f) => f.alias.some((el) => el === lobbist.fraction));

        if (sfFraction) {
            return sfFraction;
        }

        const fraction = find(FRACTIONS, (f) => f.id === lobbist.fraction);

        if (fraction) {
            return fraction;
        }
    }

    if (lobbist.fraction_old) {
        const fraction = find(FRACTIONS, (f) => f.alias.some((el) => el === lobbist.fraction_old));

        if (fraction) {
            return fraction;
        }
    }

    return FRACTIONS.vne;
}
