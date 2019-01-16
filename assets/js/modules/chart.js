requirejs(['d3','jquery',"floatingTooltip","slider","awesomeplete","data","ShowCard","ShowedClusters","zoom"], function( d3,$,floatingTooltip ,noUiSlider,awesomeplete,Data,ShowCard,ShowedClusters,zoom ) {

    var data
    var lobby
    var lobby_level_0
    var myGroups
    var myArrGroups
    var rawDep, rawRating;

// tooltip for mouseover functionality
var tooltip = floatingTooltip('gates_tooltip', 240);
Data.then(Data=>{
    data = Data.data
    lobby = Data.lobby
    lobby_level_0= Data.lobby_level_0
    myGroups = Data.myGroups
    myArrGroups = Data.myArrGroups
    rawDep = Data.rawDep
    rawRating = Data.rawRating
    doChart();
})


function doChart() {
    var width, height, maxX, maxY, rows, client_width, client_height // width and heights of chart_grid

    const svg = d3.select('#clusters')
        .append('svg')
        .attr('id','chart')
        .append('g')

        svg.append("image")
        .attr("xlink:href","assets/images/legend.svg")
        .attr("width", 202)
        .attr("height", 41)
            .attr("x", 0)
            .attr("y", 360)

    SetupSVG()

    var padding = 2, // separation between same-color nodes
        clusterPadding = 15, // separation between different-color nodes
        maxRadius = 10;


    var n = data.length, // total number of nodes
        m = myArrGroups.length// number of distinct clusters

    var color = d3.scaleOrdinal()
        .domain(['Единая Россия','ЛДПР','КПРФ','Справедливая Россия'])
        //.range(['#50A2FE','#F2B600','#DA4141','#FF7A00'])
        .range(['is-color-er','is-color-yellow','is-color-red','is-color-orange'])
        .unknown('is-color-gray')

    var colorTest = d3.scaleSequential(d3.interpolateRainbow) //rainbow nodes
        .domain(d3.range(m));

    // The largest node for each cluster
    var clusters = new Array(m);
    var uniq=0

    var nodes = data.map(function (d) {
        var clusterParentId, clusterParent2Id
        var group=lobby.find(x => x.id === d.group)
        if (group.level==0 ) clusterParentId=group.id
        if (group.level==1 ) clusterParentId=lobby.find(x=>x.id==group.parent).id
        if (group.level==2 ) {clusterParentId=lobby.find(x=>x.id==lobby.find(x=>x.id==group.parent).parent).id;clusterParent2Id=lobby.find(x=>x.id==group.parent).id;clusterParent2Name=lobby.find(x=>x.id==group.parent).name}

        var i = +d.group,
            j = clusterParent2Id ? clusterParent2Id : +i
            //r =Math.floor(Math.random() * (maxRadius-3))+3,
            r=d.rating,
            d = {
                name: d.name,
                fraction:d.fraction,
                id: d.id,
                gender:d.gender,
                age:d.age,
                //cluster: +i,
                cluster: clusterParent2Id ? clusterParent2Id : +i,
                clusterMin: +i,

                //clusterName: group.name,
                clusterName: clusterParent2Id ? clusterParent2Name : group.name,
                clusterLevel:group.level,
                clusterParent: clusterParentId,
                clusterParentMiddle: clusterParent2Id ? clusterParent2Id : null,
                color:color(d.fraction),
                //color:colorTest((clusterParent2Id ? clusterParent2Id : +i)/10),
                election_method:d.election_method,
                committees:d.committees,
                convocations:d.convocations,
                uniq:uniq++,
                r: d.rating,
                x: /*Math.cos(i / m * 2 * Math.PI) * 300*/ + width / 2 + Math.random(),
                y: /*Math.sin(i / m * 2 * Math.PI) * 300*/ + height / 2 + Math.random()

            };


        var count=0;
        (clusters[j] ) ? count=clusters[j].count+1 : count=1 //counter of nodes in cluster
        if (!clusters[j] || (r > clusters[j].r)) {
            clusters[j] = d;
        };
        clusters[j].count=count//write count of nodes of current cluster
        return d;
    });
    nodes.sort(function(a, b) { return b.count - a.count; })
    nodes.sort(function(a, b) { return a.clusterParent - b.clusterParent; })

    //remove clones in same cluster

    nodes.forEach(function (node) {
        node.cloneClusters="null"
        var clones=nodes.filter(x=>(x.id==node.id&&x.cluster==node.cluster))
        if (clones.length>1){
            clones.forEach(function (clone,i) {
                if (i>0) {clone.clone="yes"}
                clone.cloneClusters=clones.map(x=>x.clusterMin)
            })
        }
    })
    nodes=nodes.filter(x=>x.clone!="yes")

    var clearClusters=clusters.filter(function(el) { return el; })//remove null from array
    clearClusters.sort(function(a, b) { return b.count - a.count; })
    clearClusters.sort(function(a, b) { return a.clusterParent - b.clusterParent; })
    //console.log("clearClusters",clearClusters)



    var nodes2 = nodes.concat(clearClusters);//merge nodes and clusters signs

    rows = (client_width<450) ? 30 : 8

    var columnsTotal=9
    var xScale = d3.scaleLinear()
        .domain([0, columnsTotal-1])
        .range([50, maxX]);

    var yScale = d3.scaleLinear()
        .domain([0, rows])
        .range([100, maxY]);

    clearClusters[0].col=0; clearClusters[0].row=0
    clearClusters.forEach(function (el,i,arr) {
        /*if (i>0) {
            curr = el
            prev = arr[i - 1]
            if (prev.clusterParent == curr.clusterParent) {
                delta = (i%2==0) ? 0.5 : -0.5
                if (prev.col < columnsTotal-1) {//строка не заполнена?
                    curr.col = prev.col + 1
                    curr.row = prev.row+delta
                }
                else {//переход на новую строку
                    curr.col = 0
                    curr.row = prev.row + 1+delta
                }
            }
            else {//новый кластер с новой строки
                curr.row = prev.row + 4
                curr.col = 0
                //makeTitle(curr.clusterParent,curr.row-2,0)
            }
        }*/


        (width<=450) ? GetCoordinatesForMobile(el) : GetCoordinatesForDesktop(el)


    })
    makeEncloses()

    function GetCoordinatesForDesktop(element) {
        var curr = element
        switch (curr.clusterParent) {
            case 11593://региональное
                curr.row =1
                curr.col = 8
                break;
            case 11679://отраслевое
                curr.row =2.5
                curr.col = 4.6
                break;
            case 11739://фин-пром группы
                curr.row =1.5
                curr.col = 1
                break;

            case 11550://федеральное
                curr.row =6.5
                curr.col = 2
                break;
            case 11727://общ-полит
                curr.row =6
                curr.col = 7.5
                break;

            default://не выявлено
                curr.row =7.0
                curr.col = 5.8
        }
        if (curr.cluster==11738) { //иностранное лобби
            curr.row =7.5
            curr.col = 4.5
        }
        return element
    }

    function GetCoordinatesForMobile(element) {
        var curr = element
        switch (curr.clusterParent) {
            case 11550://федеральное 2
                curr.row =8.5
                curr.col = 3
                break;
            case 11593://региональное 3
                curr.row =13.5
                curr.col = 3
                break;
            case 11679://отраслевое 1
                curr.row =2.5
                curr.col = 3
                break;
            case 11727://общ-полит 4
                curr.row =18.5
                curr.col = 3
                break;
            case 11739://фин-пром группы 5
                curr.row =23.5
                curr.col = 3
                break;
            default: // не выявлено 6
                curr.row =28
                curr.col = 3
        }
        if (curr.cluster==11738) { //иностранное лобби
            curr.row =30
            curr.col = 3
        }
        return element
    }

    function makeEncloses() {
        svg.append("g").attr("class", "encloses")
        lobby_level_0.forEach(function (level) {

            svg.select("g.encloses").append("path").attr("class", "enclose")
                .attr("fill", "none")
                .attr("id", "enclose" + level.id)

            svg.select("g.encloses").append("text")
                .attr("dy", -clusterPadding/2)
                .append("textPath") //append a textPath to the text element
                .attr("xlink:href", "#enclose" + level.id) //place the ID of the path here
                .attr("startOffset", "25%")
                .style("text-anchor", "middle") //place the text halfway on the arc
                .text(function(){
                    var t = level.alias
                    //t = t.replace("Иностранное лобби","Иностранное")
                    t = t.charAt(0).toUpperCase() + t.slice(1)
                    return t
                });
        })
    }


    function encloses() {
        lobby_level_0.forEach(function (level) {
            var e = svg.select('path.enclose#enclose'+level.id)
            var nd = nodes2.filter(x=>x.clusterParent==level.id)
            var encloseCircle = d3.packEnclose(nd)
            if (encloseCircle){
                var arc = d3.arc()
                    .innerRadius(encloseCircle.r)
                    .outerRadius(encloseCircle.r)
                    .startAngle(-180 * (3.14/180)) //converting from degs to radians
                    .endAngle(180 * (3.14/180))
                e.transition().duration(100).attr("transform", "translate("+encloseCircle.x+","+encloseCircle.y+")")
                    .attr("d",arc())
            }
        })
    }

    lastRow=clearClusters[clearClusters.length-1].row


    function makeTitle(id,row,col) {
        var group = lobby.find(x=>x.id==id)
        svg.append("text").attr("class","title").attr("y",yScale(row)).attr("x",xScale(col)).text(group.name)
    }


    function foci(clusterId){
        cluster=clearClusters.find(x=>x.cluster==clusterId)
        return {
            "x" : xScale(cluster.col),
            "y": yScale(cluster.row)
        }
    }

    var forceX = d3.forceX((d) => foci(d.cluster).x);
    var forceY = d3.forceY((d) => foci(d.cluster).y);

    var links

    var first_end=0
/*
    if (clientWidth<=450) {
        nodes = nodes.filter(x => x.clusterParent == '7753')
        clearClusters=clearClusters.filter(x => x.clusterParent == '7753')
    }
*/
    var force = d3.forceSimulation()
        .nodes(nodes.sort((a,b)=>a.cluster-b.cluster))
        .force('collide', collide)
        .force('cluster', clustering)
        .force('x',forceX.strength(0.1))
        .force('y',forceY.strength(0.1))
        .alphaDecay(0.05)
        .on("tick", tick)
        .on("end", function (){
            if (first_end==0) label_force.alpha(1).restart()
            first_end=1
        });

    var label_force=d3.forceSimulation()
        .nodes(clearClusters.filter(x=>x.count>10))
        .force("gravity1", d3.forceManyBody(-10).distanceMax(50).distanceMin(0))
        .alpha(0)
        .on("tick", tick2)

    const circles = svg.append('g')
        .datum(nodes)
        .selectAll('.circle')
        .data(d => d)
        .enter().append('circle')
        .attr('r', d => d.r)
        //.attr('fill', d=>d.color)
        .attr('class',d=>d.color)
        .attr("cx", d => d.dx)
        .attr("cy", d => d.dy)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail)
        .on('click', ClickOnCircle)
        /*.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));*/

    const labels = svg.append('g')
        //.datum(ShowedClusters(clearClusters))
        .datum(clearClusters)
        .selectAll('.g')
        .data(d => d)
        .enter().append("g")
        .attr('class', "lobby_label")
        //.attr('fill', d => d3.rgb(d.color).darker())
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("transform",d=>"translate("+d.x+" "+ d.y+")")
        .each(makeText)

    //add zoom capabilities
    var svg1=d3.select("#clusters > svg#chart")
    var g=d3.select("svg#chart > g").attr("class","all")
    var k=1
    var initialTransform = d3.zoomIdentity
        .translate(0,0)
        .scale(1);


    var zoom_handler = d3.zoom()


    var vb_w=document.getElementById("chart").viewBox.baseVal.width,
        vb_h=document.getElementById("chart").viewBox.baseVal.height

    if (vb_w<450) vb_h=1600
    vb_w=svg1.attr("width")

    zoom_handler.scaleExtent([1, 5]).translateExtent([[0,0],[vb_w,vb_h]])
        .on("zoom", function () {
            zoom.zoom_actions(g,k)})
        .on("end", function () {
            k = d3.event.transform.k
            zoom.zoomEndFunction(labels,clearClusters,zoom_handler)
        })


    d3.select('#zoom-in').on('click', function() {
        d3.event.preventDefault();
        zoom_handler.scaleBy(svg1.transition().duration(400), 1.3);
    });

    d3.select('#zoom-out').on('click', function() {
        d3.event.preventDefault();
        zoom_handler.scaleBy(svg1.transition().duration(400),1/1.3);
    });

    d3.select('#zoom-home').on('click', function() {
        d3.event.preventDefault();
        zoom.zoom_reset(labels,svg1,zoom_handler,initialTransform);
    });


    //zoom_handler(svg1)

        svg1.call(zoom_handler)
            .on("wheel.zoom", null)



    window.onresize=function (event) {
        SetupSVG(event);

    }


    function SetupSVG(resize) {
        var headerHeight=document.getElementsByTagName('header')[0].clientHeight,
            controlsHeight=document.getElementById('controls').clientHeight,
            footerHeight=document.getElementsByClassName('footer')[0].clientHeight,
            sumHeight=headerHeight+footerHeight+controlsHeight+24

        var min_width = 812,
            min_height = 600;
            client_width=document.documentElement.clientWidth,
            client_height=document.documentElement.clientHeight-sumHeight


        client_width<=812 ? width=min_width : width=client_width;
        client_width<=450 ? width=client_width : width=width;
        height = (client_width<=450 && !resize) ? client_height+100 : min_height;
        (client_height>=height && client_height>=min_height) ? height=client_height : height;

        d3.select('#clusters svg#chart')
            .attr('height', height)
            .attr('width', width)

        if   (client_width>450 || resize){
            d3.select('#clusters svg#chart').attr('viewBox','0 0 1000 600')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr("class","desktop")
            maxX=800
            maxY=600
        }
        else {
            d3.select('#clusters svg#chart').attr('viewBox','0 0 350 '+ height + ' ')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr("class","mobile")
            maxX=350
            maxY=1600
        }
    }

    function GetDepData(id) {
        var deputatInfo = rawDep.find(x=>x.id==id)
        return deputatInfo;
    }



    function makeText(d) {
        var alias=lobby.find(x=>d.clusterName==x.name).alias
        d3.select(this).append("text")
          .text(alias.charAt(0).toUpperCase() + alias.slice(1))
          .each(wrapText)
          .each(makeBack)
    }

    function makeBack() {
        var width, height, x, y
        width = this.getBBox().width+4
        height = this.getBBox().height
        x = this.getBBox().x-2
        y = this.getBBox().y
        d3.select(this.parentNode).insert("rect", "text")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("class", "backForLabel")
    }

    function wrapText() {
        var text = d3.select(this),
            width = 50,
            words = text.text().split(/\s+/).slice(0,3).reverse(),
            word,
            line = [],
            lineHeight = 1,
            tspan = text.text(null).attr("y",-words.length/2+'em')


        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("dy",  lineHeight + "em").text(word);
            }
        }
    }


    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    circles.transition()
        .duration(1000)
        .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.r);
            return function (t) {
                return d.r = i(t);
            };
        })
        .on("end",function(d,i) {
            if (i === circles.size()-1) {
                MakeSelect(clearClusters)
            }
        })
    ;

    labels.transition()
        .duration(1000)
        .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.r);
            return function (t) {
                return d.r = i(t);
            };
        });

    function tick() {
        encloses()

        circles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        labels.attr("transform",d=>"translate("+d.x+" "+ d.y+")");
        if (links) {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);}


         //if (force.alpha()>=0.1) label_force.alpha(0.1).restart();
    }
    function tick2() {
        labels
            //.attr('x', d => d.x)
            //.attr('y', d => d.y)
            .attr("transform",d=>"translate("+d.x+" "+ d.y+")");
    }

    // Move d to be adjacent to the cluster node.
    function clustering(alpha) {
        nodes.forEach((d) => {
            const cluster = clearClusters.find(x=>x.cluster==d.cluster);
            if (cluster === d) return;
            let x = d.x - cluster.x;
            let y = d.y - cluster.y;
            let l = Math.sqrt((x * x) + (y * y));
            const r = d.r + cluster.r;

            if (l !== r) {
                l = ((l - r) / l) * alpha;
                d.x -= x *= l;//d.x=d.x-x*l
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        });
    }

    function collide(alpha) {
        var quadtree = d3.quadtree()
            .x((d) => d.x)
            .y((d) => d.y)
            .addAll(nodes);

        nodes.forEach(function(d) {
            var r = d.r  + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {

                if (quad.data && (quad.data !== d)) {
                    var x = d.x - quad.data.x,
                        y = d.y - quad.data.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * 0.5;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.data.x += x;
                        quad.data.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        });
    }

    function hideLabel(d) {
        var i=d.cluster
        labels.filter(x=>x.cluster==i).classed("hovered",true)
    }

    function showLabel(d) {
        labels.classed("hovered",false)
    }

    function ClickOnCircle(d){
        HightlightCirclesOff()
        drawCloneLinks(d)
        HightlightCirclesOn(d.id)
        var depInfo=GetDepData(d.id)
        var depRating=GetRating(depInfo.person)
        var depLobbys=GetLobbyText(depInfo.groups)
        var t = new ShowCard(depInfo, depRating, depLobbys)
    }


    /*
* Function called on mouseover to display the
* details of a bubble in the tooltip.
*/
    function showDetail(d) {
        var isModalOpen=d3.select("#card").classed("is-active")
        hideLabel(d)

        if (!isModalOpen)
            drawCloneLinks(d)

        //var groupname=lobby.find(x => x.id === d.cluster)
        var groupname=lobby.find(x => x.id === d.clusterMin)

        var cloneclustersNames=""
        if (Array.isArray(d.cloneClusters))
            cloneclustersNames = d.cloneClusters.map(x=>lobby.find(y=>y.id==x))


        if (!isModalOpen)
            HightlightCirclesOn(d.id)

        var content =
            '<span class="name">'+d.name+' </span><br/>'
        if (cloneclustersNames=="")
            content+=
            '<span class="value">'+groupname.name+'</span><br/>';
        if (cloneclustersNames!="")
                content+=
            '<span class="value">'+cloneclustersNames.map(name=>name.name)+'</span><br/>';

        tooltip.showTooltip(content, d3.event);
    }
    
    function HightlightCirclesOn(id) {
        circles.filter(e=>e.id===id).transition().attr('stroke', '#000').attr('stroke-width', '2px');
    }

    function HightlightCirclesOff(id) {
        circles.transition().attr('stroke', 'none');
    }

    function drawCloneLinks(target) {
        var clones=nodes.filter(x=>x.id==target.id)
        var arr=clones.map(function (clone) {
            return{
                source:target.uniq,
                target:clone.uniq,
                value:1
            }
        })
        links = arr.map(d => Object.create(d));
        svg.select("g.links").remove()
        link = svg.insert("g",":first-child").classed("links",true)
            .attr("stroke", "#999")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        force.force("link", d3.forceLink(links).id(d => d.uniq).strength(0))
        if (force.alpha() <= 0.01){
            force.alpha(0).restart()
            force.force("link", d3.forceLink(links).id(d => d.uniq).strength(0))
        }
    }

    /*
 * Hides tooltip
 */
    function hideDetail(d) {

        var isModalOpen=d3.select("#card").classed("is-active")

        // reset outline
        if (!isModalOpen) {
            svg.select("g.links").remove()//remove clone links
            HightlightCirclesOff()
        }
        //circles.transition().attr('stroke', 'none');

        //d3.select(this).attr('stroke', d3.rgb(color(d.cluster / 10)).darker());
        tooltip.hideTooltip();
        showLabel()
    }




    /*
* Helper function to convert a number into a string
* and add commas to it to improve presentation.
*/
    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
    }

    //MakeSelect(clearClusters)

    function MakeSelect(data_clusters) {
        //createSelect("select_election_method", "Способ избрания","election_method")
        //createSelect("select_fraction", "Фракция","fraction")
        createSelect("select_committees", "Комитет","committees")
        CreateSliders()
        MakeAutoComplete()
        PresetsHandler()



        data2=lobby.sort((a,b)=>a.tree_id-b.tree_id)

        lobby.forEach(lob=>{
            if (lob.parent==null) lob.parent=1
        })
        lobby.push({id:1,name:"root",parent:"0"})
        function list_to_tree(list) {
            var map = {}, node, roots = [], i;
            for (i = 0; i < list.length; i += 1) {
                map[list[i].id] = i; // initialize the map
                list[i].children = []; // initialize the children
            }
            for (i = 0; i < list.length; i += 1) {
                node = list[i];
                if (node.parent !== "0") {
                    // if you have dangling branches check that map[node.parent] exists
                    list[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            }
            return roots;
        }
        var tree=list_to_tree(lobby.sort((a,b)=>a.order-b.order))

        var bfs = function(tree, key, collection) {
            if (!tree[key] || tree[key].length === 0) return;
            for (var i=0; i < tree[key].length; i++) {
                var child = tree[key][i]
                collection[child.id] = child;
                bfs(child, key, collection);
            }
            return;
        }

        var flattenedCollection = {};
        bfs(tree[0],"children", flattenedCollection)

        var list = Object.keys(flattenedCollection).map(function(key) {
            return flattenedCollection[key]
        });

        data_clusters.sort((a,b)=>a.clusterName-b.clusterName)
            .sort((a,b)=>a.clusterParent-b.clusterParent)

        var select = d3.select('#controls')
            .select('select#select_lobby')
            .on('change',onchange)

        d3.selectAll(".buttons button").on("click", function () {
            var value=d3.select(this).attr("value")
            var allBtns=d3.select(this.parentNode).selectAll("button")
            allBtns.classed("is-active", false)
            d3.select(this).classed("is-active", true)
            onchange()
        })

        select.append('option').text("Лобби").attr("value",-1)

        var options = select
            .selectAll('option.opt')
            .data(list).enter()
            .append('option')
            .classed("opt",true)
            .attr("value",d=>d.id)
            .text(d=>{
                x=+d.level
                if (x==0) y="\xA0"
                if (x==1) y="\xA0\xA0\xA0\xA0"
                if (x==2) y="\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0"

                if (x==0) return y+ d.name.toUpperCase()
                return y+ d.name
            })
            .each(PrependOption)
            .each(function(d) {
                t=nodes.filter(x=>x.cluster==d.id ||
                    x.clusterParent==d.id||
                    x.clusterParentMiddle==d.id||
                    x.clusterMin==d.id)
                if (t.length==0) {

                    d3.select(this).property("disabled", true)
                    d3.select(this).remove()
                }})

        onchange("init")


        function PrependOption(d){
            if (d.level==0) {
                var ti = document.createElement('option');
                ti.disabled=true
                if (this.nextSibling && this.parentNode) this.parentNode.insertBefore(ti, this);
            }
        }

        function createSelect(selector, placeholder,key) {
            jj2  = []//массив значений ключа
            data.forEach(function (dep) {
                keys=dep[key] // ключ может быть массивом значений
                Array.isArray(keys)
                    ?   keys.forEach(function (comitet) {//надо пройти по нему
                        jj2.push({key: comitet}); //получаем значения ключа в том числе и из массивов
                    })
                    :   jj2.push({key: dep[key]})//если не массив - просто берём значение
            })
            var nest=d3.nest()
                .key(d=>d.key)
                .entries(jj2)
            var opts=nest.flatMap(x=>x.key)
            var select = d3.select('#controls')
                .select('select#'+selector)
                .on('change',onchange)
            select.append('option').text(placeholder).attr("value",-1)
            var options = select
                .selectAll('option.opt')
                .data(opts).enter()
                .append('option')
                .attr("value",d=>d)
                .text((d)=>{
                    var text = key=="committees" ? d.replace("Комитет ГД п","П") : d

                    return text}
                )
        }

        function CreateSliders() {
            var conv_slider_div = document.getElementById('convocations');
            var age_slider_div = document.getElementById('age');

            conv_slider=noUiSlider.create(conv_slider_div, {
                start: [1, 7],
                step:1,
                connect: true,
                range: {
                    'min': 1,
                    'max': 7
                },
                format: {
                    from: function(value) {
                        return parseInt(value);
                    },
                    to: function(value) {
                        return parseInt(value);
                    }
                }
            });

            var snapValues1 = [
                document.getElementById('slider-snap-value-lower'),
                document.getElementById('slider-snap-value-upper')
            ];

            age_slider=noUiSlider.create(age_slider_div, {
                start: [GetMinAge(), GetMaxAge()],
                step:1,
                connect: true,
                range: {
                    'min': GetMinAge(),
                    'max': GetMaxAge()
                },
                format: {
                    from: function(value) {
                        return parseInt(value);
                    },
                    to: function(value) {
                        return parseInt(value);
                    }
                }
            });

            var snapValues2 = [
                document.getElementById('age-slider-snap-value-lower'),
                document.getElementById('age-slider-snap-value-upper')
            ];

            conv_slider.on('update', function (values, handle) {
                snapValues1[handle].innerHTML = values[handle];
                //onchange();
            });

            age_slider.on('update', function (values, handle) {
                snapValues2[handle].innerHTML = values[handle];
                //onchange();
            });

            age_slider.on('change', function (values, handle) {
                onchange();
            });
            conv_slider.on('change', function (values, handle) {
                onchange();
            });

        }

        function GetMinAge() {
            return Math.min(...data.map(x=>+x.age))
        }

        function GetMaxAge() {
            return Math.max(...data.map(x=>+x.age))
        }

        function ZoomeToLobby(active){
            //svg1.attr('viewBox',null)


            if (!active) return
            active_enclose = d3.select("#enclose"+active);//find enclose
            if (!active_enclose.node()) {
                var lob = nodes.find(x=>x.cluster==active || x.clusterMin==active)
                var parent = lobby.find(x=>x.id == lob.clusterParent)
                if (parent) active_enclose = d3.select("#enclose"+parent.id)
                else return
                if (svg1.attr("data-current_enclose")==parent.id) return
                svg1.attr("data-current_enclose",parent.id)
            }



            svg1.call(zoom_handler.transform, initialTransform);

            active=active_enclose


            var height_loc

            if (width<450) height_loc=document.documentElement.clientHeight-80
            else height_loc= height

            var bbox = active.node().getBBox(),
                ctm= active.node().getCTM(),
                bounds = [[bbox.x+ctm.e, bbox.y+ctm.f],
                    [bbox.x+ctm.e + bbox.width, bbox.y+ctm.f + bbox.height+50]];

            var dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(5, 0.9 / Math.max(dx / width, dy / height_loc))),
                translate = [width / 2 - scale * x, height_loc / 2 - scale * y+50];

            var transform = d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale);

            svg1.transition()
                .duration(450)
                .call(zoom_handler.transform, transform);
        }

        function onchange(init) {
            if (!init) d3.select("#clear").classed("is-hidden",false)
            var i_search = d3.select('input#search').property('value')
            var s_lobby = d3.select('select#select_lobby').property('value')
            if (s_lobby!=-1 && s_lobby!="") ZoomeToLobby(s_lobby)
            //var s_method = d3.select('select#select_election_method').property('value')
            /*var s_fraction = d3.select('select#select_fraction').property('value')*/
            var s_comitet = d3.select('select#select_committees').property('value')

            var r_conv=conv_slider.get()

            var r_age=age_slider.get()


            var b_fraction, b_method, b_gender

            if (d3.selectAll('#fraction .is-active').node()!=null && d3.selectAll('#fraction .is-active').size()==1)
                b_fraction=d3.select('#fraction .is-active').property('value')

            if (d3.selectAll('#method .is-active').node()!=null)
                b_method=d3.select('#method .is-active').property('value')

            if (d3.selectAll('#gender .is-active').node()!=null)
                b_gender=d3.select('#gender .is-active').property('value')

            //if (i_search!="")

            result=circles.filter(x=>
                ((i_search!="") ?
                    (x.name.toLowerCase().includes(i_search.toLowerCase()) ||
                        x.clusterName.toLowerCase().includes(i_search.toLowerCase())) : true)
                &&
                ((s_lobby!=-1 && s_lobby) ?
                    (x.cluster==s_lobby ||
                        x.cloneClusters.includes(+s_lobby) ||
                        x.clusterParent==s_lobby ||
                        x.clusterMin==s_lobby ||
                        x.clusterParentMiddle==s_lobby) : true)
                /*&&
                ((s_method!=-1) ? (x.election_method==s_method) : true)*/
                /*&&
                    ((s_fraction!=-1) ? (x.fraction==s_fraction) :true)*/
                &&
                ((s_comitet!=-1) ? x.committees.includes(s_comitet): true)
                &&
                (+x.convocations>=+r_conv[0] && +x.convocations<=+r_conv[1])
                &&
                (+x.age>=+r_age[0] && +x.age<=+r_age[1])
                &&
                (b_fraction ? (x.fraction==b_fraction) : true)
                &&
                (b_method ? (x.election_method==b_method) : true)
                &&
                (b_gender ? (x.gender==b_gender) : true)
                )

            hightlightOn(result)

        }

        var serchbox=d3.select("#search").on("keyup",onchange)
        var clearbtn=d3.select("#clear").on("click",hightlightOff)

        // Search
        function handleClickSearch(event){
            currentSearchTerm = document.getElementById("search").value;
            search(currentSearchTerm);
            return false;
        }

        function search(term){
            result=circles.filter(x=>
                (x.name.toLowerCase().includes(term.toLowerCase()) ||
                    x.clusterName.toLowerCase().includes(term.toLowerCase())))
            term!=""? hightlightOn(result): hightlightOff()
        }

        function MakeAutoComplete() {
            var input = document.getElementById("search");
            new Awesomplete(input,
                {list: rawDep.map(x=>x.fullname)}
            );
            input.addEventListener("awesomplete-highlight", function(event) {
                input.value=event.text.value
                onchange()
            });
        }

        function PresetsHandler() {

            d3.selectAll("#presets-first a").nodes().forEach(function (link) {
                var id = link.id,
                    lobby = link.getAttribute("data-lobby"),
                    age_min = link.getAttribute("data-age_min"),
                    age_max = link.getAttribute("data-age_max"),
                    conv_min = link.getAttribute("data-conv_min"),
                    conv_max = link.getAttribute("data-conv_max"),
                    method = link.getAttribute("data-method"),
                    comittee = link.getAttribute("data-comittee"),
                    gender = link.getAttribute("data-gender"),
                    fio = link.getAttribute("data-fio"),
                    fraction = link.getAttribute("data-fraction")

                link.addEventListener('click', function (e) {
                    e.preventDefault()
                    hightlightOff()

                    if (age_min && age_max)
                    age_slider.set([age_min, age_max]);

                    if (conv_min && conv_max)
                    conv_slider.set([conv_min, conv_max]);

                    if (method)
                    d3.select('#method button[value="'+method+'"]').classed("is-active",true)

                    if (fraction)
                    d3.selectAll('#fraction button').classed("is-active",false)
                    d3.select('#fraction button[value="'+fraction+'"]').classed("is-active",true)

                    if (comittee)
                    d3.select('select#select_committees').property('value',comittee)

                    if (gender)
                    d3.select('#gender button[value="'+gender+'"]').classed("is-active",true)

                    if (fio)
                    d3.select('input#search').property('value',fio)

                    if (lobby)
                    d3.select('select#select_lobby').property('value',+lobby)

                    onchange()
                });

            })
        }

        function hightlightOn(spot) {
            circles.transition().attr("class", d=>d.color).style("opacity",0.3)
            labels.transition().style("opacity",0.0)

            var circles_clusters=spot.data().map(s=>s.cluster)

            var temp=clearClusters.filter(x=>circles_clusters.includes(x.cluster))
            var temp2=ShowedClusters(temp,k).map(s=>s.cluster)

            var labels_spot=labels.filter(x=>circles_clusters.includes(x.cluster))
            labels_spot=labels.filter(x=>temp2.includes(x.cluster))

            spot.transition().style("opacity",1)
            labels_spot.transition().style("opacity",1)
        }

        function hightlightOff() {
            d3.select("#clear").classed("is-hidden",true)
            //if (client_width>450)
            svg1.attr("data-current_enclose",null)

            conv_slider.reset()
            age_slider.reset()
            d3.selectAll("#search").property("value","")
            d3.selectAll("#controls button").classed("is-active",false)
            d3.selectAll("#controls #fraction button").classed("is-active",true)
            d3.selectAll("select").property("selectedIndex", 0)
            circles.transition().attr("class", d=>d.color).style("opacity",1)
            var n = ShowedClusters(clearClusters,k).map(x=>x.cluster)
            labels.style("opacity",0).filter(x=>n.includes(x.cluster)).transition().style("opacity",1)

            zoom.zoom_reset(labels,svg1,zoom_handler,initialTransform);
        }

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

    function GetLobbyText(lobbys) {
        var text=""
        lobbys.forEach(function (l,i) {
            i>0 ? text+=", " : null
            text+=lobby.find(x=>x.id==l).name
        })
        return text
    }
}
});