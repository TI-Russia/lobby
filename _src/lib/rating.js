import * as d3 from 'd3';

export function getRating(id, rawRating, isSF) {
    let rating = rawRating.find(x => x.id_declarator == id);
    const max = d3.max(rawRating.map(x => +x.podpis / (+x.vnes + x.podpis) * 10 + 1));
    
    if (!rating) {
        rating = {
            no: true,
            vnes: -1,
            podpis: -1,
            sred_day: -1,
        };
    }

    const domain = [1, max];
    const range = isSF ? [8, 14] : [4, 10];
    const logScale = d3.scaleLog().domain(domain).range(range);

    let rating_initial = 1;
    if (!rating.no) rating_initial = (rating.podpis / (rating.podpis + rating.vnes)) * 10 + 1;
    if (rating.vnes < 5) rating_initial = 1;
    if (rating.no) rating_initial = 1
    const logRating = logScale(rating_initial);
    rating.log = logRating;

    return rating;
}