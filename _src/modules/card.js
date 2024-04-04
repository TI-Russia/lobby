import $ from "jquery";
import { Liquid } from "liquidjs";
import tree_func from "../tools/tree";
import {
  formatNumber,
  pageTypeToConvocation,
  personFullnameToFIO,
} from "../lib/common";
import Pluralization from "../tools/pluralize";
import { getLayoutVars } from "./layout_vars";
import accordion from "./accordion";
import { formatDate } from "../lib/date";
import Data from "./data";
import { FRACTIONS } from "../constants/fractions";
import { addTargetBlank } from "./utils";

const engine = new Liquid();

const isDefaultLayout = getLayoutVars().layout === "default";
const isSF = getLayoutVars().type === "sf";
let convocation = pageTypeToConvocation(getLayoutVars().type);

const dirUrl = isSF ? "person_sf/" : "person/";
const feedbackForm = getLayoutVars().feedbackUrl;

let currentCardData = null;
let isLoading = false;
let currentLawSelected = null;
let currentLawSelectedData = null;
let isLawDetailsLoading = false;
let lawAuthorsIsShowMore = false;
let currentExpandedAccordions = new Set();
let currentScrollTop = 0;
let template;

let cardNode;

const originalTemplateHtml = $("#card_template").html();

export function setDefaulTemplate() {
  cardNode = $("#card");
  const templateHtml = cardNode.find("#card_template").html();
  template = engine.parse(templateHtml);

  cardNode.html("");

  cardNode.on("click", "#scrollToTop", function (event) {
    event.preventDefault();
    cardNode.animate(
      {
        scrollTop: 0,
      },
      500
    );
  });

  cardNode.on("scroll", function () {
    if (cardNode.scrollTop() > 200) {
      cardNode.find("#scrollToTop").show();
    } else {
      cardNode.find("#scrollToTop").hide();
    }
  });

  cardNode.on(
    accordion.EVENT_TOGGLE,
    ".card__main-info .accordion",
    function (event, isOpen) {
      const id = $(this).attr("data-accordion-id");

      if (!id) {
        return;
      }

      if (isOpen) {
        currentExpandedAccordions.add(id);
      } else {
        currentExpandedAccordions.delete(id);
      }
    }
  );

  cardNode.on("click", ".card__law-back-button", function (event) {
    event.preventDefault();
    hideLawDetails();
  });

  cardNode.on("click", "#close_btn", () => {
    HideCard();

    window.dispatchEvent(new Event("closeCard"));

    if (window.history && window.history.pushState) {
      window.history.pushState("backward", null, isSF ? "/sf" : "/");
    }
  });

  cardNode.on("click", ".card__law-info-meta-item-author", function (event) {
    event.preventDefault();
    const authorId = $(this).attr("data-author-id");
    const person = currentLawSelectedData.law_authors_enriched.find(
      (lobbist) => lobbist.id === Number(authorId)
    );

    if (!person) {
      return;
    }

    // find a circle with paerson that matches person.id and click it
    const circle = $(`circle[data-person="${person.id}"]`);

    if (circle.length > 0) {
      HideCard();
      circle[0].dispatchEvent(new Event("click"));
      window.history.pushState(
        { person: person.id },
        null,
        (person.isSF ? "./sf#id" : "./#id") + person.id
      );
    }
  });

  cardNode.on("click", ".card__law-info-meta-item-more", (e) => {
    e.preventDefault();
    lawAuthorsIsShowMore = true;
    renderLawDetails();
  });

  $(window).on("popstate", HideCard); // back button should close modal
}

if (isDefaultLayout) {
  setDefaulTemplate();
}

export function getPageType() {
  const hasHash = window.location.hash.length > 0;

  if (hasHash) {
    return "hash";
  } else {
    return "location";
  }
}

export function setCardEvents(cardNode = $("#card")) {
  const type = getPageType();

  cardNode.on("click", "#close_btn", () => {
    if (type === "hash") {
      HideCard();

      window.dispatchEvent(new Event("closeCard"));

      if (window.history && window.history.pushState) {
        window.history.pushState("backward", null, isSF ? "/sf" : "/");
      }
    } else {
      window.location = isSF ? "/sf" : "/";
    }
  });

  if (type === "location") {
    cardNode.addClass("location");
  }
}

function HideCard() {
  cardNode.hide();
  cardNode.html("");

  currentCardData = null;
  currentLawSelected = null;
  currentLawSelectedData = null;
  isLawDetailsLoading = false;
  lawAuthorsIsShowMore = false;
  currentScrollTop = 0;
  currentExpandedAccordions.clear();
}

function ShowCard({
  depInfo,
  depInfoLegacy,
  depRating,
  depLobbys,
  depSuccessRate,
  lobby,
  declarations,
  depLobbistSmallData,
}) {
  HideCard();

  if (window.history && window.history.pushState) {
    const personId = isSF ? depInfoLegacy.person : depInfo.person;
    window.history.pushState({ person: personId }, null, "#id" + personId);
  }

  setCardEvents();

  currentCardData = {
    depInfo,
    depInfoLegacy,
    depRating,
    depLobbys,
    depSuccessRate,
    lobby_list: lobby,
    declarations,
    depLobbistSmallData,
  };

  cardNode.show();
  renderCard(currentCardData);
}

function hideLawDetails() {
  currentLawSelected = null;
  lawAuthorsIsShowMore = false;
  renderCard(currentCardData);
}

export function setCardLoading(loading) {
  isLoading = loading;
}

export async function renderLawDetails(lawId) {
  if (!lawId && currentLawSelected) {
    renderLawDetailsCard({
      currentLawSelected,
      currentLawSelectedData,
      isLawDetailsLoading,
      lawAuthorsIsShowMore,
    });
  } else {
    currentLawSelected = lawId;
    currentScrollTop = cardNode.scrollTop();
    isLawDetailsLoading = true;

    const lawDetails = await fetchLawDetails(lawId);

    if ("detail" in lawDetails && lawDetails.detail === "Не найдено.") {
    } else {
      cardNode.show();
      isLawDetailsLoading = false;
      currentLawSelectedData = lawDetails;

      renderLawDetailsCard({
        currentLawSelected,
        currentLawSelectedData,
        isLawDetailsLoading,
        lawAuthorsIsShowMore,
      });
    }
  }
}

export function renderLawDetailsCard(data) {
  cardNode.html(
    engine.renderSync(template, {
      ...data,
    })
  );

  if (!currentLawSelected) {
    cardNode.find(".accordion").each(function () {
      const id = $(this).attr("data-accordion-id");

      if (currentExpandedAccordions.has(id)) {
        accordion.toggle(this, true, 0);
      }
    });
  }

  cardNode.scrollTop(currentScrollTop);
}

export function renderLoadingCard(cardNode = $("#card")) {
  template = engine.parse(originalTemplateHtml);
  cardNode.html(
    engine.renderSync(template, {
      isLoading,
    })
  );
}

export function showCard(cardNode = $("#card")) {
  setCardEvents(cardNode);
  cardNode.show();
}

export function hideCard(cardNode = $("#card")) {
  cardNode.hide();
}

export function renderCard(data, cardNode = $("#card")) {
  convocation = pageTypeToConvocation(getLayoutVars().type);
  const {
    depInfo,
    depInfoLegacy,
    depRating,
    depLobbys,
    depSuccessRate,
    lobby_list,
    declarations,
    depLobbistSmallData,
  } = data;
  const { square, income } = calclulateDeclarationHilights(
    declarations.results
  );
  const { lawStatProposed, lawStatAccepted } = calculateLawStat(
    depSuccessRate.success_rate
  );
  const prevConvocationUrl = calculatePrevConvocationUrl(depLobbistSmallData);
  template = engine.parse(originalTemplateHtml);

  cardNode.html(
    engine.renderSync(template, {
      photo: isSF
        ? depInfoLegacy.photo
        : `https://declarator.org/media/${depInfo.photo}`,
      bio: addTargetBlank(isSF ? depInfoLegacy.bio : depInfo.bio) || null,
      submitted:
        addTargetBlank(isSF ? depInfoLegacy.submitted : depInfo.submitted) ||
        null,
      relations:
        addTargetBlank(isSF ? depInfoLegacy.relations : depInfo.relations) ||
        null,
      conclusion:
        addTargetBlank(isSF ? depInfoLegacy.conclusion : depInfo.conclusion) ||
        null,
      currentLawSelected,
      currentLawSelectedData,
      isLawDetailsLoading,
      lawAuthorsIsShowMore,
      lobbys: depLobbys,
      lobbyHtml: getLobbyMatrix(depLobbistSmallData.groups, lobby_list),
      lastUpdate: formatDate(depLobbistSmallData.modified_when),
      editing: depLobbistSmallData.draft,
      income,
      square,
      fullname: depLobbistSmallData.fullname,
      fraction: isSF
        ? depInfoLegacy.fraction
        : FRACTIONS[depLobbistSmallData.fraction]?.name,
      fractionClass: isSF
        ? depInfoLegacy.fraction
        : depLobbistSmallData.fraction,
      positionHtml: isSF
        ? getPositionSF(depInfoLegacy)
        : getPosition(depLobbistSmallData),
      tempComissionHtml: isSF
        ? getTempComissionText(depInfoLegacy.temp_commission)
        : "",
      twPerson: `https://twitter.com/intent/tweet?url=http%3A%2F%2Fdumabingo.org/${dirUrl}${depLobbistSmallData.person}&text=${depLobbistSmallData.fullname}`,
      vkPerson: `http://vk.com/share.php?url=http%3A%2F%2Fdumabingo.org/${dirUrl}${depLobbistSmallData.person}`,
      openDeclaration: depLobbistSmallData.person
        ? `https://declarator.org/person/${depLobbistSmallData.person}`
        : null,
      openRupep: depLobbistSmallData.rupep
        ? `https://rupep.org/person/${depLobbistSmallData.rupep}`
        : null,
      sendForm: feedbackForm,
      laws: depLobbistSmallData.law_draft_apis?.length
        ? depLobbistSmallData.law_draft_apis
        : null,
      lawStat: !isSF,
      lawStatProposed,
      lawStatAccepted,
      lawTextBringHtml: Pluralization(
        lawStatProposed,
        "закон<br>выдвинут",
        "закона<br>выдвинуто",
        "законов<br>выдвинуто"
      ),
      lawTextPassed: Pluralization(
        lawStatAccepted,
        "принят",
        "принято",
        "принято"
      ),
      lawTextDay: Pluralization(
        Math.floor(String(depRating.sred_day).replace(",", ".")),
        "день",
        "дня",
        "дней"
      ),
      sredDay: Math.floor(String(depRating.sred_day).replace(",", ".")),
      prevConvocationUrl,
    })
  );

  if (!currentLawSelected) {
    cardNode.find(".accordion").each(function () {
      const id = $(this).attr("data-accordion-id");

      if (currentExpandedAccordions.has(id)) {
        accordion.toggle(this, true, 0);
      }
    });
  }

  cardNode.scrollTop(currentScrollTop);
}

function getFractionClass(fraction) {
  return (
    {
      "Единая Россия": "er",
      КПРФ: "kprf",
      ЛДПР: "ldpr",
      "Справедливая Россия": "sr",
      "Новые люди": "nl",
    }[fraction] || "vne"
  );
}

function getPosition(info) {
  let comitet = info.committee;
  const sposob = info.election_method;
  const soziv = info.convocations.length || 1;
  const gender = info.gender ? info.gender.toLowerCase() : "м";

  if (
    comitet === "0" ||
    comitet === null ||
    comitet === undefined ||
    comitet === ""
  ) {
    comitet = "";
  }

  let chlen = comitet.replace("Комитет ГД ", "Член комитета ");
  if (comitet) chlen += ", ";
  const izbran = gender === "ж" || gender === "f" ? "избрана" : "избран";
  const kak =
    sposob === "одномандатный округ"
      ? " по одномандатному округу"
      : " по списку";
  const raz = soziv === 2 || soziv === 3 || soziv === 4 ? " раза" : " раз";
  const sozvan = soziv === 1 ? izbran + " впервые" : izbran + " " + soziv + raz;

  return chlen + izbran + kak + ", " + sozvan;
}

function getPositionSF(info) {
  let comitet = info.committee;
  const gender = info.gender?.toLowerCase() || "м";
  const region = info.region?.genitive;
  let chem = info.goverment_body || "";
  const position = info.position;

  if (
    comitet === "0" ||
    comitet === null ||
    comitet === undefined ||
    comitet === ""
  ) {
    comitet = "";
  }

  chem = chem.replace("исполнительный ", "исполнительным ");
  chem = chem.replace("законодательный ", "законодательным ");
  chem = chem.replace("орган ", "органом ");
  chem += ", ";

  let chlen = position + comitet.replace("Комитет ", " ");
  if (comitet !== " ") chlen += ", ";
  const delegirovan =
    gender == "ж" || gender == "f" ? "делегирована " : "делегирован ";
  const vsovete = "в Совете Федерации с " + info.start_year + " года";
  const predstavitel = region ? ". Представитель " + region : "";

  return chlen + delegirovan + chem + vsovete + predstavitel;
}

function getTempComissionText(temp_commission) {
  const list = (temp_commission || []).map(function (node) {
    return `<li>${node.charAt(0).toUpperCase() + str.slice(1)}</li>`;
  });

  return list.length ? `<ul>${list.join("")}</ul>` : "";
}

function getLobbyMatrix(nodes, lobby_list) {
  const rows = [];

  nodes.forEach(function (node) {
    const parents = tree_func.findAncestors(node, lobby_list);
    rows.push(parents.map((y) => lobby_list.find((x) => x.id == y).name));
  });

  let content = "";

  if (rows.length) {
    rows.forEach(function (row, i, arr) {
      if (i === 0 || row[0] !== arr[i - 1][0]) {
        content += `<h3>${row[0].toLowerCase().replace(" лобби", "")}</h3>`;
      }

      row = row.slice(1);

      if (row.length) {
        content += "<ul>";
        const str = row[0]?.charAt(0)?.toUpperCase() + row[0]?.slice(1);
        content += `<li>${str}</li>`;

        row = row.slice(1);

        content += '<div class="content"><ul>';

        row.forEach(function (str) {
          str = str.charAt(0).toUpperCase() + str.slice(1);
          content += `<li>${str}</li>`;
        });

        content += "</ul></div></ul>";
      }
    });
  }

  return `<div class="card__lobby-matrix">${content}</div>`;
}

function calculateLawStat(depSuccessRate) {
  const { filtered_number, approved_number } =
    depSuccessRate[`convocation_${convocation}`] || {};

  return {
    lawStatProposed: filtered_number || 0,
    lawStatAccepted: approved_number || 0,
  };
}

function calclulateDeclarationHilights(declarations = []) {
  const latestDeclaration = declarations
    // Антикоррупционная декларация
    .filter((declaration) => declaration.main?.document_type?.id === 1)
    // Могут быть пересечения (2 и более декларации за один год, одного или разных типов).
    // Если несколько а/к декларациий за один год - берем декларацию с большим ID.
    .reduce((acc, declaration) => {
      if (!acc) {
        return declaration;
      }
      if (declaration.main.year > acc.main.year) {
        return declaration;
      }
      return acc;
    }, null);

  if (!latestDeclaration) {
    return {
      square: null,
      income: null,
    };
  }

  const square = latestDeclaration.real_estates
    .filter((r) => r.own_type.id === 20) // только индивидуальная
    .reduce((acc, realEstate) => {
      return acc + realEstate.square;
    }, 0);

  const income = latestDeclaration.incomes.reduce((acc, income) => {
    return acc + income.size;
  }, 0);

  return {
    square: formatNumber(Math.round(square)),
    income: formatNumber(Math.round(income)),
  };
}

async function fetchLawDetails(lawId) {
  let response;

  try {
    response = await fetch(
      `https://declarator.org/api/law_draft_api/${lawId}/`
    ).then((r) => r.json());
  } catch (e) {
    console.error(e);
  }

  const { rawDep: lobbistSmallListRaw } = await Data;

  const law_authors_enriched = (response?.law_authors || []).map(
    (authorPersonId) => {
      const person = lobbistSmallListRaw.find(
        (lobbist) => lobbist.person === authorPersonId
      );

      if (person) {
        return {
          name: personFullnameToFIO(person.fullname),
          id: person.person,
          isSf: isSF,
        };
      }

      return {
        name: authorPersonId,
        id: authorPersonId,
        isSf: isSF,
      };
    }
  );

  const law_authors_enriched_cut = law_authors_enriched?.slice(0, 3);

  return {
    ...response,
    law_authors_enriched,
    law_authors_enriched_cut,
    law_authors_enriched_more_size: Math.max(
      0,
      law_authors_enriched.length - law_authors_enriched_cut.length
    ),
  };
}

function calculatePrevConvocationUrl(depInfo) {
  if (isSF) return null;

  const prevConvocation = convocation - 1;

  if (prevConvocation >= 7 && depInfo.convocations.includes(prevConvocation)) {
    return `/sozyv${prevConvocation}#id${depInfo.person}`;
  }

  return null;
}

export default ShowCard;
