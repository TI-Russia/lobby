import * as d3 from 'd3';

export function getRating(id, rawRating, isSF) {
    const isOldFormat = true;

    const proposedField = isOldFormat ? 'vnes' : 'filtered_number';
    const acceptedField = isOldFormat  ? 'podpis' : 'approved_number';

    const foundRatingData = findPersonRating(id, rawRating, isOldFormat);

    const ratingList = isOldFormat ? rawRating : Object.values(rawRating.success_rates);
    const max = d3.max(ratingList.map(x => calculateBaseRating(x[proposedField], x[acceptedField])));

    const ratingInitial = (foundRatingData && foundRatingData[proposedField] >= 5)
        ? calculateBaseRating(foundRatingData[proposedField], foundRatingData[acceptedField])
        : 1;

    const range = isSF ? [8, 14] : [4, 10];
    const logScale = d3.scaleLog().domain([1, max]).range(range);

    return {
        log: logScale(ratingInitial),
        sred_day: (isSF && foundRatingData) ? foundRatingData.sred_day : -1,
    };
}

function calculateBaseRating(lawProposed, lawAccepted) {
    return (Number(lawAccepted) / (Number(lawAccepted) + Number(lawProposed))) * 10 + 1
}

function findPersonRating(id, rawRating, isSF) {
    if (isSF) {
        return rawRating.find(x => x.id_declarator == id);
    }

    return rawRating.success_rates[id];
}
