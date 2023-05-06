import $ from 'jquery';
import { Liquid } from 'liquidjs';
import tree_func from '../tools/tree';
import { formatDate } from '../tools/date';
import Pluralization from '../tools/pluralize';
import { getLayoutVars } from './layout_vars';
import accordion from './accordion';

const engine = new Liquid();

const isDefaultLayout = getLayoutVars().layout === 'default';
const isSF = getLayoutVars().type === 'sf';
const dirUrl = isSF ? 'person_sf/' : 'person/';
const feedbackForm = isSF
    ? 'https://docs.google.com/forms/d/e/1FAIpQLScWdkT2GB6btR3duE5fWRzbTeg8HeLji8MR7ZW2-0oMiG7-Wg/' 
    : 'https://docs.google.com/forms/d/e/1FAIpQLSd6WGVWRwdwf7Q7oE_3RIlHR8MMdo_LVOnC0nk9YINtfYvjPw/';

let currentCardData = null;
let currentLawSelected = null;
let currentExpandedAccordions = new Set();
let currentScrollTop = 0;
let template;

let cardNode;

if (isDefaultLayout) {
    
    cardNode = $('#card');
    const templateHtml = cardNode.find("#card_template").html();
    template = engine.parse(templateHtml);

    cardNode.html('');

    cardNode.on('click', '#scrollToTop', function (event) {
        event.preventDefault();
        cardNode.animate({
            scrollTop: 0
        }, 500);
    });

    cardNode.on('scroll', function() {
        if (cardNode.scrollTop() > 200 ) {
            cardNode.find('#scrollToTop').show();
        } else {
            cardNode.find('#scrollToTop').hide();
        }
    });

    cardNode.on(accordion.EVENT_TOGGLE, '.card__main-info .accordion', function(event, isOpen) {
        const id = $(this).attr('data-id');
        if (isOpen) {
            currentExpandedAccordions.add(id);
        } else {
            currentExpandedAccordions.delete(id);
        }
    });

    cardNode.on('click', '.card__law-details-button', function (event) {
        event.preventDefault();
        const lawId = $(this).closest('.card__law').attr('data-id');
        showLawDetails(lawId);
    });

    cardNode.on('click', '.card__law-back-button', function (event) {
        event.preventDefault();
        hideLawDetails();
    });

    cardNode.on('click', '#close_btn', HideCard);
    $(window).on('popstate', HideCard); // back button should close modal
}

function HideCard() {
    cardNode.hide();
    cardNode.html('');

    currentCardData = null;
    currentLawSelected = null;
    currentScrollTop = 0;
    currentExpandedAccordions.clear();

    window.dispatchEvent(new Event('closeCard'));
    if (window.history && window.history.pushState) {
        window.history.pushState('backward', null, isSF ? './sf' :'./');
    }
}

function ShowCard(depInfo, depRating, depLobbys, lobby_list, declarations) {
    if (window.history && window.history.pushState) {
        window.history.pushState({person: depInfo.person}, null, (isSF ? './sf#id' : './#id') + depInfo.person);
    };

    currentCardData = {depInfo, depRating, depLobbys, lobby_list, declarations};
    currentScrollTop = 0;

    cardNode.show();
    renderCard();
}

function showLawDetails(lawId) {
    currentLawSelected = lawId;
    currentScrollTop = cardNode.scrollTop();
    renderCard();
}

function hideLawDetails() {
    currentLawSelected = null;
    renderCard();
}

function renderCard() {
    const {depInfo, depRating, depLobbys, lobby_list, declarations} = currentCardData;

    cardNode.html(engine.renderSync(template, {
        selectedLaw: currentLawSelected,
        info: depInfo,
        rating: depRating,
        lobbys: depLobbys,
        lastUpdate: null,
        editing: false,
        fractionClass: getFractionClass(depInfo.fraction),
        positionHtml: isSF ? getPositionSF(depInfo) : getPosition(depInfo),
        tempComissionHtml: isSF ? getTempComissionText(depInfo.temp_commission) : '',
        lawTextBringHtml: Pluralization(+depRating.vnes, "закон<br>выдвинут", "закона<br>выдвинуто", "законов<br>выдвинуто"),
        lawTextPassed: Pluralization(+depRating.podpis, "принят", "принято", "принято"),
        lawTextDay: Pluralization(Math.floor(String(depRating.sred_day).replace(',','.')), "день", "дня", "дней"),
        sredDay: Math.floor(String(depRating.sred_day).replace(',','.')),
        lobbyHtml: getLobbyMatrix(depInfo.groups, lobby_list),
        twPerson: "https://twitter.com/intent/tweet?url=http%3A%2F%2Fdumabingo.ru/" + dirUrl + depInfo.person+"&text="+depInfo.fullname,
        vkPerson: "http://vk.com/share.php?url=http%3A%2F%2Fdumabingo.ru/" + dirUrl + depInfo.person,
        openDeclaration: "https://declarator.org/person/"+depInfo.person,
        sendForm: feedbackForm + "viewform?entry.742555963="+depInfo.fullname,
    }));

    if (!currentLawSelected) {
        cardNode.find('.accordion').each(function() {
            const id = $(this).attr('data-id');

            if (currentExpandedAccordions.has(id)) {
                accordion.toggle(this, true, 0);
            }
        });
    }

    if (currentScrollTop) {
        cardNode.scrollTop(currentScrollTop);
    }
}

function getFractionClass(fraction) {
    return {
        'Единая Россия': 'er',
        'КПРФ': 'kprf',
        'ЛДПР': 'ldpr',
        'Справедливая Россия': 'sr',
        'Новые люди': 'nl',
    }[fraction] || 'vne';
}

function getPosition(info) {
    const comitet=info.committee || '';
    const sposob=info.election_method;
    const soziv=info.convocations.length || 1;
    const gender=info.gender ? info.gender.toLowerCase() : 'м';

    var chlen = comitet.replace("Комитет ГД ","Член комитета ")
    if (comitet) chlen+= ", "
    var izbran = (gender=="ж" || gender=="f") ? "избрана" : "избран"
    var kak = (sposob=="одномандатный округ") ? " по одномандатному округу" : " по списку"
    var raz = (soziv==2 || soziv==3 || soziv==4 ) ? " раза" : " раз"
    var sozvan = (soziv==1) ? izbran+" впервые" : izbran+' '+soziv+raz

    return chlen + izbran + kak+ ', '+ sozvan
}

function getPositionSF(info) {
    var comitet=info.committee,
        gender=info.gender,
        region = info.region.genitive,
        chem = info.goverment_body,
        position = info.position;

    if (comitet === '0'
        || comitet === null
        || comitet === undefined
        || comitet === ''){
        comitet = ""
    }

    gender = !gender ? "м" : gender.toLowerCase();
    //comitet = !comitet ? " " : comitet;
    chem = chem.replace("исполнительный ","исполнительным ");
    chem = chem.replace("законодательный ","законодательным ");
    chem = chem.replace("орган ","органом ");
    chem +=', ';

    var chlen = position + comitet.replace("Комитет "," ");
    if (comitet !== " ") chlen+= ", ";
    var delegirovan = (gender=="ж" || gender=="f") ? "делегирована " : "делегирован ";
    var vsovete = "в Совете Федерации с " + info.start_year +" года";
    var predstavitel = ". Представитель " + region;

    var summary = chlen + delegirovan + chem + vsovete  + predstavitel;
    return summary;
}

function getTempComissionText(temp_commission){
    const list = (temp_commission || []).map(function (node) {
        return "<li>"+node.charAt(0).toUpperCase() + str.slice(1)+"</li>";
    });

    return list.length ? '<ul>' + list.join('') + '</ul>' : '';
}

function getLobbyMatrix(nodes, lobby_list) {
    var rows = [];
    nodes.forEach(function (node) {
        var parents=tree_func.findAncestors( node, lobby_list)
        rows.push(parents.map(y=>lobby_list.find(x=>x.id==y).name))
    })

    var content='';

    if (rows.length) {
        rows.forEach(function (row, i, arr) {
            if (i === 0 || row[0] !== arr[i-1][0]) {
                content+='<h3>' + row[0].toLowerCase().replace(' лобби','') + '</h3>';
            }

            row=row.slice(1)

            content += '<ul>';
            const str = row[0]?.charAt(0)?.toUpperCase() + row[0]?.slice(1)
            content += "<li>"+str+"</li>"

            row=row.slice(1)

            content += '<div class="content"><ul>';
            row.forEach(function (str,i,arr) {
                str = str.charAt(0).toUpperCase() + str.slice(1)
                content += "<li>" + str + "</li>";
            })
            content += '</ul></div></ul>';
        })
    }

    return '<div class="card__lobby-matrix">' + content + '</div>';
}

export default ShowCard;
