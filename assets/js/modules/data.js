define(["d3"], function(d3) {
    var data=[];
    var lobby=[];
    var lobby_level_0=[];
    var myGroups = new Set();
    var myArrGroups = new Array()
    var files = [
        "assets/data/deputates.json",
        "assets/data/lobby_group.json",
        "assets/data/rating.json",
        "assets/data/alias.json"
    ];
    var promises = [];
    var rawDep, rawRating, rawAlias, aliases;

    files.forEach(function (url) {
        promises.push(d3.json(url))
    });

    var cors="https://cors-anywhere.herokuapp.com/"
    var url_lobby="https://dev.declarator.org/api/lobby_group/"
    //promises.push(getAPI(allData,null,url_lobby));

    return Promise.all(promises).then(function (values) {
        //console.log("file1", values[0]) //dep
        //console.log("files2", values[1])//lobby
        //console.log("url", JSON.stringify(values[2]))//lobby from url
        rawDep = values[0]
        var rawLobby = values[1] //change to load from url
        rawRating = values[2] //
        rawAlias=values[3]
        dataDepMap(rawDep)
        getAliasMap(rawAlias)
        getLobbyMap(rawLobby,aliases)

        return {
            lobby: lobby,
            lobby_level_0: lobby_level_0,
            data: data,
            rawRating: rawRating,
            rawDep:rawDep,
            myGroups: myGroups,
            myArrGroups: myArrGroups,
        }
    });

    function getAPI(allData, startFrom,url) {
        return fetch(startFrom ? cors+startFrom : cors+url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With':'XMLHttpRequest'
            },
        }).then(response => response.json())
            .then(data => {
                //console.log("data.next",data.results)
                allData=allData.concat(data.results);
                const nextPage = data.next;
                if (!nextPage)
                    return allData;
                else
                    return getAPI(allData, nextPage,url);
            });
    }

    function GetRating(id) {
        var rating = rawRating.find(x=>x.id_declarator==id)
        var max=d3.max(rawRating.map(x=>+x.podpis/(+x.vnes+x.podpis)*10+1))
        if (!rating) {rating=new Object();rating.no=true; rating.vnes=-1; rating.podpis=-1; rating.sred_day=-1}

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


    function dataDepMap(rawdata) {
        Object.defineProperties(Array.prototype, {
            'flatMap': {
                value: function (lambda) {
                    return Array.prototype.concat.apply([], this.map(lambda));
                },
                writeable: false,
                enumerable: false
            }
        });
        function calculateAge(birthday) { // birthday is a date
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        data = rawdata.flatMap((d) => {
            groups = d.groups
            groups.length==0 ? groups=[11851] : groups // кто без групп? -> в группу "Не выявлено"
            var rating=Math.floor(Math.random() * (10-4))+4
            rating=GetRating(d.person)
            return groups.map((b) => {
                myGroups.add(b)
                /*the set provide unique values of lobby groups*/
                return {
                    id: d.id,
                    name: d.fullname,
                    fraction:d.fraction,
                    gender:d.gender,
                    age:calculateAge( new Date(d.birth_date)),
                    group: b,
                    rating: rating.log,
                    election_method:d.election_method,
                    committees:d.committees,
                    convocations:d.convocations.length!=0 ? d.convocations.length : 1
                }
            })
        });
        var i = 0
        myGroups.forEach(function (value) {
            myArrGroups.push({id: i++, val: value});
            /*set to array*/
        });
    }

    function getLobbyMap(rawdata,aliases) {
        lobby = rawdata.map((d,i) => {
            var aliasRow = aliases.find(x=>x.name==d.name)
            var alias = (aliasRow && aliasRow.alias!="null") ? aliasRow.alias : d.name
            return {
                index:i,
                id: d.id,
                name: d.name,
                parent:d.parent,
                order:d.order,
                level:d.level,
                tree_id:d.tree_id,
                alias:alias
            }
        })
        lobby_level_0=lobby.filter(x=>x.level==0)
    }

    function getAliasMap(rawdata) {
        aliases=rawdata.map(x=>{
            if (x.alias=="") x.alias="null"
            return {
                id: x.id,
                name: x.name,
                alias:x.alias
            }
        })

    }

});
