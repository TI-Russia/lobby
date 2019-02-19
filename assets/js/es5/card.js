"use strict";

define(["jquery", "es5_d3", "es5_tree", "plural"], function($, d3, tree_func, plural) {
    function ShowCard(depInfo, depRating, depLobbys, lobby_list) {
        var card = d3.select("#card"),
            //container
            photo = card.select("#photo img"),
            fullname = card.select("#fullname"),
            fraction = card.select("#fraction_text"),
            position = card.select("#position"),
            law_number_vnes = card.select("#law_number_vnes"),
            law_text_bring = card.select("#law_text_bring"),
            law_number_podpis = card.select("#law_number_podpis"),
            law_text_passed = card.select("#law_text_passed"),
            law_text_day = card.select("#law_text_day"),
            sred_day = card.select("#sred_day"),
            lobby = card.select("#lobby"),
            bio = card.select("#bio"),
            relations = card.select("#relations"),
            conclusion = card.select("#conclusion"),
            submitted = card.select("#submitted");
        d3.selectAll("#card .is-hidden").classed("is-hidden", false);
        var close_btn = card.select(".close_btn").on("click", function() {
            document.getElementById("card").scrollTop = 0; // scroll to top

            card.attr("class", "modal");
        });
        /*back button should close modal*/

        window.history.pushState("forward", null, "./#id" + depInfo.person);

        if (window.history && window.history.pushState) {
            $(window).on("popstate", function() {
                card.attr("class", "modal");
            });
        } //var id=e.id //iden

        var info = depInfo;
        var rating = depRating;
        var fraction_class = GetFractionClass(info.fraction);
        var positionText = GetPosition(info);
        var lobbyText = depLobbys;
        /*image loader*/

        var img = new Image();

        img.onload = function() {
            //console.log("image is ready")
            photo.attr("alt", info.fullname).attr("src", info.photo);
        };

        img.onerror = function() {
            //console.log("the image has failed")
        };

        img.src = info.photo;
        fullname.text(info.fullname);
        fraction.text(info.fraction).attr("class", fraction_class);
        position.text(positionText);
        law_number_vnes.text(rating.vnes);
        law_text_bring.html(
            Pluralization(
                +rating.vnes,
                "закон<br>внесён",
                "закона<br>внесено",
                "законов<br>внесено"
            )
        );
        law_number_podpis.text(rating.podpis);
        law_text_passed.text(
            Pluralization(+rating.podpis, "принят", "принято", "принято")
        );
        law_text_day.text(
            Pluralization(
                Math.floor(String(rating.sred_day).replace(",", ".")),
                "день",
                "дня",
                "дней"
            )
        );
        if (rating.podpis == 1) HideBlockByClass("law_text_average");
        if (rating.podpis == 0) HideBlockByClass("law_signed");
        if (rating.no == true) HideBlockByClass("laws_block");
        sred_day.text(Math.floor(String(rating.sred_day).replace(",", ".")));
        if (!lobbyText) HideBlockByClass("lobby_block");
        bio.html(info.bio);
        relations.html(info.relations);
        submitted.html(info.submitted);
        conclusion.html(info.conclusion);
        card.attr("class", "modal is-active");
        var matrix = GetLobbyMatrix();
        lobby.html(matrix);

        function GetFractionClass(fraction) {
            var arr = [
                {
                    fraction: "Единая Россия",
                    classname: "er"
                },
                {
                    fraction: "КПРФ",
                    classname: "kprf"
                },
                {
                    fraction: "ЛДПР",
                    classname: "ldpr"
                },
                {
                    fraction: "Справедливая Россия",
                    classname: "sr"
                }
            ];
            var classname = arr.find(function(x) {
                return x.fraction == fraction;
            });
            if (!classname)
                classname = {
                    fraction: "Вне фракций",
                    classname: "vne"
                };
            return classname.classname;
        }

        function GetPosition(info) {
            var comitet = info.committee,
                sposob = info.election_method,
                soziv = info.convocations.length,
                gender = info.gender;
            gender = !gender ? "м" : gender.toLowerCase();
            comitet = !comitet ? "" : comitet;
            soziv = !soziv ? 1 : soziv;
            var chlen = comitet.replace("Комитет ГД ", "Член комитета ");
            if (comitet) chlen += ", ";
            var izbran = gender == "ж" || gender == "f" ? "избрана" : "избран";
            var kak =
                sposob == "одномандатный округ"
                    ? " по одномандатному округу"
                    : " по списку";
            var raz = soziv == 2 || soziv == 3 || soziv == 4 ? " раза" : " раз";
            var sozvan =
                soziv == 1 ? izbran + " впервые" : izbran + " " + soziv + raz;
            var position = chlen + izbran + kak + ", " + sozvan;
            return position;
        }

        function GetLobbyMatrix() {
            var nodes = depInfo.groups;
            var rows = [];
            nodes.forEach(function(node) {
                var parents = tree_func.findAncestors(node, lobby_list);
                rows.push(
                    parents.map(function(y) {
                        return lobby_list.find(function(x) {
                            return x.id == y;
                        }).name;
                    })
                );
            });
            var content = "";
            rows.forEach(function(row, i, arr) {
                if (i > 0 && row[0] == arr[i - 1][0]) {
                    //row[0]= "*"
                } else {
                    content += "<h3>" + row[0].toLowerCase().replace(" лобби", "");
                    if (row.length > 1) content += ":";
                    content += "</h3>";
                }

                row = row.slice(1);
                content += "<ul>";
                row.forEach(function(str, i, arr) {
                    str = str.charAt(0).toUpperCase() + str.slice(1);
                    content += "<li>" + str + "</li>";
                });
                content += "</ul>";
            });
            return content;
        }

        function HideBlockByClass(classname) {
            d3.selectAll("." + classname + "").classed("is-hidden", true);
        }
    }

    return ShowCard;
});
