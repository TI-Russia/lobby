import { romanToArab } from 'roman-numbers';

export const prepareConvocations = (convocations) => {
    return convocations.map((convocation) => romanToArab(convocation));
};
