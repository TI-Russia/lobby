import * as d3 from 'd3';
import { getLayoutVars } from './layout_vars';
import { getFraction } from '../lib/fractions';
import { getRating } from '../lib/rating';

let data = [];
let lobby = [];
let lobby_level_0 = [];
const myGroups = new Set();
const myArrGroups = [];
const isSF = getLayoutVars().type === 'sf';
const prefix = 'https://declarator.org/media/dumps/';
const files = {
    "duma_7": [
        prefix + 'lobbist-small-d7.json',
        prefix + 'lobby-group.json',
        "/assets/data/rating.json",
        "/assets/data/alias.json",
    ],
    "duma_8": [
        prefix + 'lobbist-small-d8.json',
        prefix + 'lobby-group.json',
        "/assets/data/rating.json",
        "/assets/data/alias.json",
    ],
    "sf": [
        prefix + 'lobbist-small-sf.json',
        prefix + 'lobby-group.json',
        "/assets/data/rating-sf.json",
        "/assets/data/alias.json"
    ],
}[getLayoutVars().type];

const promises = [];
let rawDep, rawRating, rawAlias, aliases;

files.forEach(function (url) {
    promises.push(d3.json(url))
});

export default Promise.all(promises).then(function (values) {
    if (isSF) {
        rawDep = values[0];
    } else {
        rawDep = values[0].filter((dep) => dep.convocations && dep.convocations.length > 0);
    }
    const rawLobby = values[1] //change to load from url
    rawRating = values[2]
    rawAlias = values[3]
    dataDepMap(rawDep)
    getAliasMap(rawAlias)
    getLobbyMap(rawLobby, aliases)

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

function dataDepMap(rawdata) {
    function calculateAge(birthday) { // birthday is a date
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch

        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    data = rawdata.flatMap((d) => {
        let groups = d.groups;
        groups.length == 0 ? groups = [11851] : groups // кто без групп? -> в группу "Не выявлено"
        const rating=getRating(d.person, rawRating, isSF);

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
                convocations: d.convocations.length!=0 ? d.convocations.length : 1,
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
    aliases = rawdata.map(x => {
        if (x.alias == "") x.alias = "null";

        return {
            id: x.id,
            name: x.name,
            alias: x.alias,
        };
    });
}
