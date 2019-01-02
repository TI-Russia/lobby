function showCard(e) {
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


    var close_btn=card.select(".modal-close").on("click",() =>  card.attr("class","modal"))

    var id=e.id //iden
    var info=GetDepData(id)
    var rating=GetRating(info.person)
    var fraction_class=GetFractionClass(info.fraction)
    var positionText = GetPosition (info)

    fullname.text(info.fullname)
    photo.attr("alt",info.fullname).attr("src",info.photo)
    fraction.text(info.fraction).attr("class",fraction_class)
    position.text(positionText)
    law_number_vnes.text(rating.vnes)
    law_number_podpis.text(rating.podpis)
    sred_day.text(rating.sred_day)
    lobby.text(info.groups.toString())
    bio.html(info.bio)
    relations.html(info.relations)
    submitted.html(info.submitted)
    card.attr("class","modal is-active")
}

function GetDepData(id) {
    var deputatInfo = rawDep.find(x=>x.id==id)
    return deputatInfo;
}

function GetFractionClass(fraction) {
    var arr=[{fraction:'Единая Россия',classname:'er'},
        {fraction:'КПРФ',classname:'kprf'},
        {fraction:'ЛДПР',classname:'ldpr'},
        {fraction:'Справедливая Россия',classname:'sr'}]
    var classname=arr.find(x=>x.fraction==fraction)
    if (!classname) classname={fraction:'Вне фракций',classname:'vne'}
    return classname.classname
}

function GetRating(id) {
    var rating = rawRating.find(x=>x.id_declarator==id)
    var max=d3.max(rawRating.map(x=>+x.podpis/(+x.vnes+x.podpis)*10+1))
    if (!rating) {rating=rawRating[0];rating.no=true; rating.vnes=-1; rating.podpis=-1; rating.sred_day=-1}

    var domain = [1,max]
    var range = [4,10]
    var logScale =  d3.scaleLog().domain(domain).range(range)

    var rating_initial=1
    if (!rating.no ) rating_initial=(rating.podpis/(rating.podpis+rating.vnes))*10+1
    if (rating.vnes<5) rating_initial=1
    if (rating.no ) rating_initial=1
    var logRating=logScale(rating_initial)
    rating.log=logRating
    return rating
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

function GetLobbyChain(lobby_id) {
    //lo
}