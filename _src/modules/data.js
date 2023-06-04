import * as d3 from 'd3';
import { getLayoutVars } from './layout_vars';
import { getFraction } from '../lib/fractions';
import { getRating } from '../lib/rating';
import { prepareConvocations } from '../lib/convocations';

let data = [];
let lobby = [];
let lobby_level_0 = [];
const myGroups = new Set();
const myArrGroups = [];
const isSF = getLayoutVars().type === 'sf';
const files = {
    "duma_7": [
        'https://declarator.org/media/dumps/lobbist-small-d7.json',
        'https://declarator.org/media/dumps/lobby-group.json',
        "/assets/data/rating.json",
        "/assets/data/alias.json",
        "https://declarator.org/api/convocations/7/person_convocations",
    ],
    "duma_8": [
        'https://declarator.org/media/dumps/lobbist-small-d8.json',
        'https://declarator.org/media/dumps/lobby-group.json',
        "/assets/data/rating.json",
        "/assets/data/alias.json",
        "https://declarator.org/api/convocations/8/person_convocations",
    ],
    "sf": [
        'https://declarator.org/media/dumps/lobbist-small-sf.json',
        'https://declarator.org/media/dumps/lobby-group.json',
        "/assets/data/rating-sf.json",
        "/assets/data/alias.json",
    ],
}[getLayoutVars().type];

const promises = [];

files.forEach(function (url) {
    promises.push(d3.json(url))
});

export default Promise.all(promises).then(function (values) {
    const [rawDepOriginal, rawLobby, rawRating, rawAlias, rawConvocations] = values;

    if (!isSF) {
        const convocationsMap = rawConvocations.persons.reduce((acc, convocation) => {
            acc[convocation.person_id] = convocation.convocations;
            return acc;
        }, {});

        rawDepOriginal.forEach((dep) => {
            dep.convocations = prepareConvocations(convocationsMap[dep.person]) || [];
        });
    }
    
    const rawDep = isSF ? rawDepOriginal : rawDepOriginal.filter((dep) => dep.convocations && dep.convocations.length > 0);

    dataDepMap(rawDep, rawRating);
    const aliases = getAliasMap(rawAlias);
    getLobbyMap(rawLobby, aliases);

    return {
        lobby,
        lobby_level_0,
        data,
        rawRating,
        rawDep,
        myArrGroups,
        isSF
    };
});

function dataDepMap(rawdata, rawRating) {
    function calculateAge(birthday) { // birthday is a date
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch

        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    data = rawdata.flatMap((d) => {
        let groups = d.groups;
        groups.length == 0 ? groups = [11851] : groups // кто без групп? -> в группу "Не выявлено"
        const rating = getRating(d.person, rawRating, isSF);

        return groups.map((b) => {
            myGroups.add(b);

            return {
                ...d,
                name: d.fullname,
                fraction: getFraction(d).slug,
                age: calculateAge(new Date(d.birth_date)),
                group: b,
                groups: groups,
                rating: rating.log,
                election_method: d.election_method,
                committees: !isSF ? d.committees : getSFCommittee(d.committee),
                region: d.region ? d.region.name : null,
                goverment_body: d.goverment_body,
                total_years: d.total_years,
            };
        });
    });

    myGroups.forEach(function (value, i) {
        myArrGroups.push({id: i, val: value});
        /*set to array*/
    });
}

function getSFCommittee(committee) {
    if (committee === '0'
        || committee === null
        || committee === undefined
        || committee === ''){
        return ['Вне комитетов'];
    };

    return [committee];
}

function getLobbyMap(rawdata, aliases) {
    lobby = rawdata.map((d, i) => {
        const aliasRow = aliases.find(x => x.name == d.name);
        const alias = (aliasRow && aliasRow.alias != "null") ? aliasRow.alias : d.name;

        return {
            index: i,
            id: d.id,
            name: d.name,
            parent: d.parent,
            order: d.order,
            level: d.level,
            tree_id: d.tree_id,
            alias,
        }
    });

    lobby_level_0 = lobby.filter(x => x.level == 0);
}

function getAliasMap(rawdata) {
    return rawdata.map(x => {
        if (x.alias == "") x.alias = "null";

        return {
            id: x.id,
            name: x.name,
            alias: x.alias,
        };
    });
}
