define(['jquery','d3'], function( $,d3 ) {
function ShowCard(depInfo, depRating, depLobbys) {

    var card=d3.select("#card"),          //container
        photo=card.select("#photo img"),
        fullname=card.select("#fullname"),
        fraction=card.select("#fraction_text"),
        position=card.select("#position"),
        law_number_vnes=card.select("#law_number_vnes"),
        law_number_podpis=card.select("#law_number_podpis"),
        sred_day=card.select("#sred_day"),
        lobby=card.select("#lobby"),
        bio=card.select("#bio"),
        relations=card.select("#relations"),
        submitted=card.select("#submitted")

    d3.selectAll("#card .is-hidden").classed("is-hidden",false)

    var close_btn=card.select(".close_btn")
        .on("click",() =>{
            document.getElementById('card').scrollTop = 0; // scroll to top
            card.attr("class","modal")
        })

    /*back button should close modal*/
    window.history.pushState('forward', null, './#id'+depInfo.person);
    if (window.history && window.history.pushState) {
        $(window).on('popstate', function () {
            card.attr("class","modal")
        });
    }

    //var id=e.id //iden
    var info=depInfo
    var rating=depRating
    var fraction_class=GetFractionClass(info.fraction)
    var positionText = GetPosition (info)
    var lobbyText = depLobbys

    fullname.text(info.fullname)
    photo.attr("alt",info.fullname).attr("src",info.photo)
    fraction.text(info.fraction).attr("class",fraction_class)
    position.text(positionText)
    law_number_vnes.text(rating.vnes)
    law_number_podpis.text(rating.podpis)
    if (rating.podpis==0) HideBlockByClass("law_signed")
    if (rating.no==true) HideBlockByClass("laws_block")
    sred_day.text(Math.floor(String(rating.sred_day).replace(',','.')))
    lobby.text(lobbyText)
    if (!lobbyText) HideBlockByClass("lobby_block")
    bio.html(info.bio)
    relations.html(info.relations)
    submitted.html(info.submitted)
    card.attr("class","modal is-active")

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
        var comitet=info.committees[0],
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

    function HideBlockByClass(classname) {
        d3.selectAll("."+classname+"").classed("is-hidden",true)
    }

}

return ShowCard

});