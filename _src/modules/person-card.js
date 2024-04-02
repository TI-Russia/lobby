import * as d3 from "d3";
import { getRating } from "../lib/rating";
import { getDataByType, getTypeByLocation } from "./data";
import { getLobbyText } from "./getLobbyText";
import {
  renderCard,
  renderLoadingCard,
  showCard,
  setCardLoading,
} from "./card";

async function fetchPersonById(personId, sozyv = getTypeByLocation()) {
  try {
    const { data, lobby, rawRating, isSF } = await getDataByType(sozyv);
    const foundPerson = await foundPersonById(personId, data);
    if (!foundPerson) {
      throw new Error("Person not found");
    }
    const foundPersonInfo = data.find(
      (person) => person.person === foundPerson.person
    );

    const dipInfoURL = isSF
      ? `https://declarator.org/api/lobbist/${foundPersonInfo.id}/`
      : `https://declarator.org/api/lobbist_detail/${foundPersonInfo.id}/`;
    const declarationsURL = `https://declarator.org/api/v1/search/sections/?person=${foundPersonInfo.person}`;
    const successRateURL = `https://declarator.org/api/persons/${foundPersonInfo.person}/success_rate`;

    const [depInfo, declarations, depSuccessRate] = await Promise.all([
      d3.json(dipInfoURL),
      d3.json(declarationsURL),
      d3.json(successRateURL),
    ]);
    const depRating = getRating(foundPersonInfo.person, rawRating, isSF);
    const depLobbys = getLobbyText(foundPersonInfo.groups, lobby);

    return {
      ...(isSF ? { depInfoLegacy: depInfo } : { depInfo }),
      depRating,
      depLobbys,
      depSuccessRate,
      lobby_list: lobby,
      declarations,
      depLobbistSmallData: foundPersonInfo,
    };
  } catch (e) {
    if (sozyv === "duma_7") {
      throw new Error(e);
    }
    const fetched = await fetchPersonById(personId, "duma_7");
    changePageInfo("duma_7");

    return fetched;
  }
}

async function foundPersonById(id, data) {
  const foundPerson = data.find((info) => info.person === id);

  return foundPerson;
}

function getPersonIdFromLocation() {
  const path = window.location.pathname;
  const parts = path.split("/");
  const personId = parts[2];
  return Number(personId);
}

async function start() {
  // person or person_sf
  if (!window.location.pathname.match(/person/)) {
    return;
  }

  setCardLoading(true);
  showCard();
  renderLoadingCard();
  const personId = getPersonIdFromLocation();
  const data = await fetchPersonById(personId);
  setCardLoading(false);
  renderCard(data);
}

start();

function changePageInfo(sozyv = "duma_8") {
  if (sozyv === "duma_7") {
    const base = document.querySelector('link[href$="duma-8.css"]');
    //  add after
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assets/css/duma-7.css";
    base.parentNode.insertBefore(link, base.nextSibling);
  }
  window.LAYOUT_VARS = {
    type: sozyv,
  };
}
