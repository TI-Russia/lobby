define(['jquery','d3', 'tree', 'plural'], function( $,d3, tree_func, plural) {
function ShowCard(depInfo, depRating, depLobbys, lobby_list, isSF) {
    var url = isSF ? './cjdtn' : './';
    var card=d3.select("#card"),          //container
        photo=card.select("#photo img"),
        fullname=card.select("#fullname"),
        fraction=card.select("#fraction_text"),
        position=card.select("#position"),
        temp_comission=card.select("#temp_comission"),
        law_number_vnes=card.select("#law_number_vnes"),
        law_text_bring=card.select("#law_text_bring"),
        law_number_podpis=card.select("#law_number_podpis"),
        law_text_passed=card.select("#law_text_passed"),
        law_text_day=card.select("#law_text_day"),
        sred_day=card.select("#sred_day"),
        lobby=card.select("#lobby"),
        bio=card.select("#bio"),
        relations=card.select("#relations"),
        conclusion=card.select("#conclusion"),
        submitted=card.select("#submitted"),
        fb_person=card.select("#fb_person"),
        tw_person=card.select("#tw_person"),
        vk_person=card.select("#vk_person"),
        open_declaration=card.select("#open_declaration"),
        send_form=card.select("#send_form")

    d3.selectAll("#card .is-hidden").classed("is-hidden",false);

    var close_btn=card.select(".close_btn")
        .on("click",() =>{
            photo.attr("src",'assets/images/blank.jpg')
            document.getElementById('card').scrollTop = 0; // scroll to top

            card.attr("class","modal")
            //TODO:make url;
            window.history.pushState('backward', null, isSF ? './cjdtn' :'./');
            window.dispatchEvent(new Event('closeCard'));
        })

    /*back button should close modal*/

    window.history.pushState({person:depInfo.person}, null, (isSF ? './cjdtn#id' : './#id') + depInfo.person);

    if (window.history && window.history.pushState) {
        window.onpopstate = function(event) {
            window.history.pushState('backward', null, isSF ? './cjdtn' :'./');
            window.dispatchEvent(new Event('closeCard'));
            card.attr("class","modal")
        };
    };


    //var id=e.id //iden
    var info=depInfo;
    var rating=depRating;
    var fraction_class = GetFractionClass(info.fraction);
    var positionText = isSF ? GetPositionSF(info) : GetPosition(info);
    var lobbyText = depLobbys;


    /*image loader*/
    var img = new Image();
    img.onload = function() {
        //console.log("image is ready")
        photo.attr("alt",info.fullname).attr("src",info.photo)
    };
    img.onerror = function() {
        //console.log("the image has failed")
    };
    img.src = info.photo;


    fullname.text(info.fullname);
    fraction.text(info.fraction).attr("class",fraction_class);
    position.text(positionText);
    isSF && temp_comission.text(getTempComissionText());
    law_number_vnes.text(rating.vnes);
    law_text_bring.html(Pluralization(+rating.vnes, "закон<br>внесён", "закона<br>внесено", "законов<br>внесено"));
    law_number_podpis.text(rating.podpis);
    law_text_passed.text(Pluralization(+rating.podpis, "принят", "принято", "принято"));
    law_text_day.text(Pluralization(Math.floor(String(rating.sred_day).replace(',','.')), "день", "дня", "дней"));
    if (rating.podpis==1) HideBlockByClass("law_text_average");
    if (rating.podpis==0) HideBlockByClass("law_signed");
    if (rating.no==true) HideBlockByClass("laws_block");
    sred_day.text(Math.floor(String(rating.sred_day).replace(',','.')));
    if (!lobbyText) HideBlockByClass("lobby_block");
    bio.html(info.bio);
    relations.html(info.relations);
    submitted.html(info.submitted);
    conclusion.html(info.conclusion);
    const dirUrl = isSF ? 'person_sf/' : 'person/';
    fb_person.attr("href","https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fdumabingo.ru/" + dirUrl + info.person)
    tw_person.attr("href","https://twitter.com/intent/tweet?url=http%3A%2F%2Fdumabingo.ru/" + dirUrl + info.person+"&text="+info.fullname)
    vk_person.attr("href","http://vk.com/share.php?url=http%3A%2F%2Fdumabingo.ru/" + dirUrl + info.person)
    open_declaration.attr("href","https://declarator.org/person/"+info.person)
    send_form.attr("href","https://docs.google.com/forms/d/e/1FAIpQLSd6WGVWRwdwf7Q7oE_3RIlHR8MMdo_LVOnC0nk9YINtfYvjPw/viewform?entry.742555963="+info.fullname)
    card.attr("class","modal is-active")
    var matrix=GetLobbyMatrix()
    lobby.html(matrix)

    function GetFractionClass(fraction) {
        var arr=[{fraction:'Единая Россия',classname:'er'},
            {fraction:'КПРФ',classname:'kprf'},
            {fraction:'ЛДПР',classname:'ldpr'},
            {fraction:'Справедливая Россия',classname:'sr'}]
        var classname=arr.find(x=>x.fraction==fraction)
        if (!classname) classname={fraction:'Вне фракций',classname:'vne'}
        return classname.classname
    }

    function GetPosition(info) {
        var comitet=info.committee,
            sposob=info.election_method,
            soziv=info.convocations.length,
            gender=info.gender

        gender = !gender ? "м" : gender.toLowerCase()
        comitet = !comitet ? "" : comitet
        soziv = !soziv ? 1 : soziv

        var chlen = comitet.replace("Комитет ГД ","Член комитета ")
        if (comitet) chlen+= ", "
        var izbran = (gender=="ж" || gender=="f") ? "избрана" : "избран"
        var kak = (sposob=="одномандатный округ") ? " по одномандатному округу" : " по списку"
        var raz = (soziv==2 || soziv==3 || soziv==4 ) ? " раза" : " раз"
        var sozvan = (soziv==1) ? izbran+" впервые" : izbran+' '+soziv+raz

        var position=chlen + izbran + kak+ ', '+ sozvan
        return position
    }

    function GetPositionSF(info) {
        var comitet=info.committee,
            sposob=info.election_method,
            soziv=info.convocations.length,
            gender=info.gender,
            letVsf = info.total_years,
            region = info.region.genitive,
            chem = info.goverment_body

        gender = !gender ? "м" : gender.toLowerCase();
        comitet = !comitet ? "" : comitet;
        chem = chem.replace("исполнительный ","исполнительным ");
        chem = chem.replace("законодательный ","законодательным ");
        chem = chem.replace("орган ","органом ");
        chem +=', ';

        var chlen = comitet.replace("Комитет ","Член комитета ");
        if (comitet) chlen+= ", ";
        var delegirovan = (gender=="ж" || gender=="f") ? "делегирована " : "делегирован ";
        var vsovete = "в Совете Федерации с " + (new Date().getFullYear()-letVsf)+" года";
        var predstavitel = ". Представитель " + region;

        var position = chlen + delegirovan + chem + vsovete  + predstavitel;
        return position;
    }

    function getTempComissionText(){
        var nodes = depInfo.temp_commission;
        var rows = [];
        var content="";
        nodes && nodes.forEach(function (node) {
            node = node.charAt(0).toUpperCase() + str.slice(1)
            content+="<li>"+node+"</li>"
        });
        if (nodes) content+="</ul>";
        return content
    }

    function GetLobbyMatrix() {
        var nodes = depInfo.groups;
        var rows = [];
        nodes.forEach(function (node) {
            var parents=tree_func.findAncestors( node, lobby_list)
            rows.push(parents.map(y=>lobby_list.find(x=>x.id==y).name))
        })
        var content="";
        rows.forEach(function (row,i,arr) {
            if (i>0 && row[0]==arr[i-1][0]) {
                //row[0]= "*"
            }
            else {
                content+="<h3>"+row[0].toLowerCase().replace(" лобби","")
                if (row.length>1) content+=":"
                content+="</h3>"
            }
            row=row.slice(1)

            content+="<ul>"
            row.forEach(function (str,i,arr) {
                str = str.charAt(0).toUpperCase() + str.slice(1)
                content+="<li>"+str+"</li>"
            })
            content+="</ul>"

        })

        return content
    }


    function HideBlockByClass(classname) {
        d3.selectAll("."+classname+"").classed("is-hidden",true)
    }

    $('#card').scroll(function(){
        var card =  document.getElementById("card")
        if (card.scrollTop > 200 ) {
            document.getElementById("scrollToTop").style.display = "block";
        } else {
            document.getElementById("scrollToTop").style.display = "none";
        }
    });
    $(document).on('click', '#scrollToTop', function (event) {
        event.preventDefault();
        $('#card').animate({
            scrollTop: 0
        }, 500);
    });

}

return ShowCard

});