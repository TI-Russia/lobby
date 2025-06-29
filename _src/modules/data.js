import * as d3 from "d3";
import { getLayoutVars } from "./layout_vars";
import { getFraction } from "../lib/fractions";
import { getRating } from "../lib/rating";
import { prepareConvocations } from "../lib/convocations";

// Базовый адрес API Декларатор, прокидывается через envify (см. gulpfile)
const DC = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getTypeByLocation() {
  const location = window.location.pathname;
  const type = location.includes("sf") ? "sf" : "duma_8";
  return type;
}

const myGroups = new Set();
const myArrGroups = [];
getLayoutVars().type = getLayoutVars().type || getTypeByLocation();
const isSF = getLayoutVars().type === "sf";
const files = {
  duma_7: [
    `${DC}/media/dumps/lobbist-small-d7.json`,
    `${DC}/api/lobby_group/`,
    "/assets/data/rating.json",
    "/assets/data/alias.json",
    `${DC}/api/convocations/7/person_convocations`,
  ],
  duma_8: [
    `${DC}/media/dumps/lobbist-small-d8.json`,
    `${DC}/api/lobby_group/`,
    "/assets/data/rating.json",
    "/assets/data/alias.json",
    `${DC}/api/convocations/8/person_convocations`,
  ],
  sf: [
    `${DC}/media/dumps/lobbist-small-sf.json`,
    `${DC}/api/lobby_group/`,
    "/assets/data/rating-sf.json",
    "/assets/data/alias.json",
  ],
}[getLayoutVars().type];

const promises = [];

files.forEach(function (url) {
  promises.push(d3.json(url));
});

export function getFilesByType(type) {
  if (!type) {
    throw new Error("Type is not defined");
  }

  return {
    duma_7: [
      `${DC}/media/dumps/lobbist-small-d7.json`,
      `${DC}/api/lobby_group/`,
      "/assets/data/rating.json",
      "/assets/data/alias.json",
      `${DC}/api/convocations/7/person_convocations`,
    ],
    duma_8: [
      `${DC}/media/dumps/lobbist-small-d8.json`,
      `${DC}/api/lobby_group/`,
      "/assets/data/rating.json",
      "/assets/data/alias.json",
      `${DC}/api/convocations/8/person_convocations`,
    ],
    sf: [
      `${DC}/media/dumps/lobbist-small-sf.json`,
      `${DC}/api/lobby_group/`,
      "/assets/data/rating-sf.json",
      "/assets/data/alias.json",
    ],
  }[type];
}

export async function test(type) {
  return getDataByType(type);
}
export async function getDataByType(...args) {
  const type = args[0];

  const files = getFilesByType(type);

  const promises = [];

  files.forEach(function (url) {
    promises.push(d3.json(url));
  });

  const values_2 = await Promise.all(promises);
  const [rawDepOriginal, rawLobby, rawRating, rawAlias, rawConvocations] =
    values_2;
  if (!isSF) {
    const convocationsMap = rawConvocations.persons.reduce(
      (acc, convocation) => {
        acc[convocation.person_id] = convocation.convocations;
        return acc;
      },
      {}
    );

    rawDepOriginal.forEach((dep) => {
      dep.convocations = prepareConvocations(convocationsMap[dep.person]) || [];
    });
  }
  const rawDep = isSF
    ? rawDepOriginal
    : rawDepOriginal.filter(
        (dep_1) => dep_1.convocations && dep_1.convocations.length > 0
      );
  const data = dataDepMap(rawDep, rawRating);
  const aliases = getAliasMap(rawAlias);
  const { lobby, lobby_level_0 } = getLobbyMap(rawLobby, aliases);

  return {
    lobby,
    lobby_level_0,
    data,
    rawRating,
    rawDep,
    myArrGroups,
    isSF,
  };
}

export default Promise.all(promises).then(function (values) {
  const [rawDepOriginal, rawLobby, rawRating, rawAlias, rawConvocations] =
    values;

  if (!isSF) {
    const convocationsMap = rawConvocations.persons.reduce(
      (acc, convocation) => {
        acc[convocation.person_id] = convocation.convocations;
        return acc;
      },
      {}
    );

    rawDepOriginal.forEach((dep) => {
      dep.convocations = prepareConvocations(convocationsMap[dep.person]) || [];
    });
  }

  const rawDep = isSF
    ? rawDepOriginal
    : rawDepOriginal.filter(
        (dep) => dep.convocations && dep.convocations.length > 0
      );

  const data = dataDepMap(rawDep, rawRating);
  const aliases = getAliasMap(rawAlias);
  const { lobby, lobby_level_0 } = getLobbyMap(rawLobby, aliases);

  return {
    lobby,
    lobby_level_0,
    data,
    rawRating,
    rawDep,
    myArrGroups,
    isSF,
  };
});

function dataDepMap(rawdata, rawRating) {
  function calculateAge(birthday) {
    // birthday is a date
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch

    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const data = rawdata.flatMap((d) => {
    let groups = d.groups;
    groups.length == 0 ? (groups = [11851]) : groups; // кто без групп? -> в группу "Не выявлено"
    const rating = getRating(d.person, rawRating, isSF);

    return groups.map((b) => {
      myGroups.add(b);

      return Object.assign({}, d, {
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
      });
    });
  });

  myGroups.forEach(function (value, i) {
    myArrGroups.push({ id: i, val: value });
    /*set to array*/
  });

  return data;
}

function getSFCommittee(committee) {
  if (
    committee === "0" ||
    committee === null ||
    committee === undefined ||
    committee === ""
  ) {
    return ["Вне комитетов"];
  }

  return [committee];
}

function getLobbyMap(rawdata, aliases) {
  const lobby = rawdata.map((d, i) => {
    const aliasRow = aliases.find((x) => x.name == d.name);
    const alias =
      aliasRow && aliasRow.alias != "null" ? aliasRow.alias : d.name;

    return {
      index: i,
      id: d.id,
      name: d.name,
      parent: d.parent,
      order: d.order,
      level: d.level,
      tree_id: d.tree_id,
      alias,
    };
  });

  const lobby_level_0 = lobby.filter((x) => x.level == 0);

  return { lobby, lobby_level_0 };
}

function getAliasMap(rawdata) {
  return rawdata.map((x) => {
    if (x.alias == "") x.alias = "null";

    return {
      id: x.id,
      name: x.name,
      alias: x.alias,
    };
  });
}
