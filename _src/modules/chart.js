import $ from 'jquery';
import * as d3 from 'd3';
import noUiSlider from 'nouislider';
import Awesomplete from 'awesomplete';

import floatingTooltip from '../vendor/tooltip';
import Data from './data';
import storyTelling from '../tools/storyTelling';
import ShowCard from './card';
import ShowedClusters from '../tools/showed_clusters';
import zoom from '../tools/zoom';
import tree_func from '../tools/tree';
import { getLayoutVars } from './layout_vars';
import Pluralization from '../tools/pluralize';
import { FRACTION, getFractionColor } from '../lib/fractions';

export default function initChart () {
    var data
    var lobby
    var lobby_level_0
    var myGroups
    var myArrGroups
    var rawDep, rawRating;
    var isSF;
    var nodes, clusters, nodesWithClones;
    var isStoryShowing = 1;
    let el;

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 240);
    var width, height, maxX, maxY, rows, client_width, client_height // width and heights of chart_grid
    var svg;
    const hash = window.location.hash ? window.location.hash.substring(1) : null;

    Data.then(Data=>{
        data = Data.data;
        lobby = Data.lobby;
        lobby_level_0= Data.lobby_level_0;
        myGroups = Data.myGroups;
        myArrGroups = Data.myArrGroups;
        rawDep = Data.rawDep;
        rawRating = Data.rawRating;
        isSF = Data.isSF;
        composeNodes();
        if (isSF && !hash) {
            const storytellyng = document.getElementById('scrollytelling');
            storytellyng.style.display = 'block';
            el = storytellyng.getBoundingClientRect();
            doTelling();

        };
        doChart();
    });

    function hideTelling(){
        const div = document.getElementById('scrollytelling');
        div.style.opacity = 0;
        isStoryShowing = 0;

        document.documentElement.style.overflowY='auto';

        setTimeout(()=>{
            div.style.display = 'none';
        },200);
    }

    function doTelling(){
        const width = 600;
        const height = width / (el.width/el.height);
        const svg_relling = d3.select('#root').append('svg');
        svg_relling.attr("viewBox", [0, 0, width, height+20]);
        const g_telling = svg_relling.append("g");
        let partsTops =[];

        const radius = 6;
        const theta = Math.PI * (3 - Math.sqrt(5));
        const step = radius * 2;
        const nd = nodesWithClones.slice().sort((a,b) => a.dupelganger - b.dupelganger).sort((a,b) => a.id - b.id);
        //console.log(nd.filter(d => d.cluster == 11551).sort(d3.descending));
        const count = nd.length;

        const groups = d3.nest().key(d=>d.cluster).rollup(v => {
            return{
                count: v.length,
                name:v[0] && v[0].clusterName
            }
        }).entries(nd);
        const gp = groups.slice().sort((a,b) => b.value.count-a.value.count).slice(1,10);
        gp.forEach((d,i) => d.order = i);


        function getState(i){
            return data.map(d => d[i])
        }


        function showCircles(state){
            isStoryShowing = 1;
            const highlightClass = (node) => {

                if (state === 1){//не выявлено
                    return node.group === 1 ? 'tellingCircle' : 'tellingCircleGray'
                }
                if (state === 2){//регионы
                    return node.group === 11593 ? 'tellingCircle' : 'tellingBluredCircle'
                }
                if (state === 3){//силовики и крупный бизнес
                    return (node.group === 11551 || node.group === 11739) ? 'tellingCircle' : 'tellingBluredCircle'
                }
                if (state !==  4){
                    return 'tellingCircle'
                }
                if (node.id === 10528){//васильев
                    return 'tellingCircleAlt'
                }
                if (node.id === 10724){//клишас
                    return 'tellingCircle'
                }

                return 'tellingBluredCircle'
            }
            const data = storyTelling.updater(state);
            const dd = data.deps;
            const ll = data.labels;
            //console.log(dd, ll);
            //d3.selectAll(".section:not(#p"+state+1+")").style('opacity','0');
            //d3.selectAll("#p"+(state+1)).style('opacity',1);

            const t = d3.transition()
                .duration(300)
                .ease(d3.easeLinear);

            let points = g_telling.selectAll('circle')
                .data( dd, d=> d.unq )
            points.enter()
                .append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('class', d => highlightClass(d))
                .attr('r', 3)
                .attr('name', d => d.name + ' ' + d.unq)

            points.exit().transition(t).attr('r',0)
            points.exit().transition().delay(1000)
                .remove()

            points.transition(t)
                .attr('r', 3)
                .attr('class', d => highlightClass(d))
                .attr('name', d => d.name + ' ' + d.unq)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            let labels = g_telling.selectAll('text')
                .data( ll, d=> d.text )

            labels.enter()
                .append('text')
                .text(d => d.text)
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .attr('class', 'tellingLabel')
                .attr('fill',  'black')

            labels.exit()
                .remove()

            labels.transition(t)
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }

        function readSections(){
            const parts = document.getElementsByClassName('section');
            partsTops = Array.prototype.map.call(parts, (d,i) => {
                if (d.nodeName === 'DIV') return {'i':i, 'offsetTop': d.offsetTop, 'offsetHeight': d.offsetHeight}
            });
            return partsTops;
        }

            //createCircles();
            storyTelling.setDeps(nd);
            showCircles(hash ? 4 : 0);
            const tops = readSections().reverse();
            const div = document.getElementById('scrollytelling');
            div.addEventListener('scroll', function() {
                const witchOne = tops.find(d =>( d.offsetTop-(div.getBoundingClientRect().height) + 100)  < div.scrollTop  );
                if (witchOne){
                    const story = witchOne.i;
                    if (witchOne && story != undefined){
                        switch (story){
                            case 0:
                                isStoryShowing = 1;
                            case 1:
                            case 2:
                            case 3:
                                storyTelling.setDonutRadius(0);
                                showCircles(story);
                                break;
                            case 4:
                                storyTelling.setHalf(0);
                                showCircles(story);
                                break;
                            case 5:
                                //d3.selectAll(".section:not(#p"+story+1+")").style('opacity','0');
                                //d3.selectAll("#p"+(story+1)).style('opacity',1);
                                break;
                            case 6:
                                //isStoryShowing && setTimeout(hideTelling,300);
                        }
                    }
                }

            });

        if (hash) {
            hideTelling();
        };

        const close_cross = document.getElementById('close_cross');
        const go_btn = document.getElementById('go_to_lobby_map');
        close_cross.addEventListener('click', event => {
            hideTelling();
        });
        go_btn.addEventListener('click', event => {
            hideTelling();
        });
    }


    function composeNodes(){
        svg = d3.select('#clusters')
            .append('svg')
            .attr('id','chart')
            .append('g')
        SetupSVG();
        var n = data.length, // total number of nodes
            m = myArrGroups.length// number of distinct clusters

        var color = d3.scaleOrdinal()
            .domain(['Единая Россия','ЛДПР','КПРФ','Справедливая Россия'])
            .domain([
                FRACTION.er,
                FRACTION.ldpr,
                FRACTION.kprf,
                FRACTION.spr
            ])
            //.range(['#50A2FE','#F2B600','#DA4141','#FF7A00'])
            .range(['is-color-er','is-color-yellow','is-color-red','is-color-orange'])
            .unknown('is-color-gray')

        var colorTest = d3.scaleSequential(d3.interpolateRainbow) //rainbow nodes
            .domain(d3.range(m));

        // The largest node for each cluster
        clusters = new Array(m);
        var uniq=0

        nodes = data.map(function (d) {
            var clusterParentId, clusterParent2Id, clusterParent2Name
            var group=lobby.find(x => x.id === d.group)
            //debugger
            if (group.level==0 ) clusterParentId=group.id
            if (group.level==1 ) clusterParentId=lobby.find(x=>x.id==group.parent).id
            if (group.level==2 ) {clusterParentId=lobby.find(x=>x.id==lobby.find(x=>x.id==group.parent).parent).id;clusterParent2Id=lobby.find(x=>x.id==group.parent).id;clusterParent2Name=lobby.find(x=>x.id==group.parent).name}

            var i = +d.group,
                j = clusterParent2Id ? clusterParent2Id : +i,
                //r =Math.floor(Math.random() * (maxRadius-3))+3,
                r=d.rating,
                d = {
                    person: d.person,
                    name: d.name,
                    fraction:d.fraction,
                    id: d.id,
                    lobbist: d.lobbist,
                    groups: d.groups,
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
                    color: FRACTION[d.fraction]?.color,
                    //color:colorTest((clusterParent2Id ? clusterParent2Id : +i)/10),
                    election_method:d.election_method,
                    committees:d.committees,
                    convocations:d.convocations,
                    uniq:uniq++,
                    r: d.rating,
                    region: d.region,
                    goverment_body: d.goverment_body,
                    total_years: d.total_years,
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
            var cl = nodes.filter(x=>(x.id==node.id));
            cl.length>1 && cl.forEach((d, i) => {
                d.dupelganger = i>0 ? 1 : 0;
            });
            node.hasClones = cl.length>1 ? 1 : 0;
        })
        nodesWithClones = nodes;
        nodes=nodes.filter(x=>x.clone!="yes")


    }

    function SetupSVG(resize) {
        var headerHeight = document.getElementsByTagName('header')[0].clientHeight,
            controlsHeight = document.getElementById('controls').clientHeight,
            footerHeight = document.getElementsByClassName('footer')[0].clientHeight;

        const sumHeight = headerHeight + footerHeight + controlsHeight;

        document.body.className += ' ' +'chart'
        document.body.className = 'chart'

        //console.log(document.getElementsByClassName('extra'))

        var min_width = 812,
            min_height = 600,
            client_width = document.documentElement.clientWidth,
            client_height = document.documentElement.clientHeight - sumHeight


        client_width <= 812 ? width = min_width : width = client_width;
        (IsItMobile() || window.orientation == 90) ? width = client_width : width = width;

        height = client_height-5

        if (window.orientation == 90) {
            //height = client_height
        }

        d3.select('#clusters svg#chart')
            .attr('height', height)
            .attr('width', width)

        d3.select('#clusters svg#chart').attr('viewBox', '-100 0 1200 600')
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr("class", "desktop")
        maxX = 800
        maxY = 600
    }

    function IsItMobile() {
        var isMobile = (document.documentElement.clientWidth<=450) ?
            true :
            false;
        return isMobile
    }

    function doChart() {
        var padding = 3, // separation between same-color nodes
            clusterPadding = 15, // separation between different-color nodes
            maxRadius = 10;

        var clearClusters=clusters.filter(function(el) { return el; })//remove null from array
        clearClusters.sort(function(a, b) { return b.count - a.count; })
        clearClusters.sort(function(a, b) { return a.clusterParent - b.clusterParent; })


        var nodes2 = nodes.concat(clearClusters);//merge nodes and clusters signs

        rows=8

        var columnsTotal=9
        var xScale = d3.scaleLinear()
            .domain([0, columnsTotal-1])
            .range([50, maxX]);

        var yScale = d3.scaleLinear()
            .domain([0, rows])
            .range([100, maxY]);

        clearClusters[0].col=0; clearClusters[0].row=0
        clearClusters.forEach(function (el) {
            GetCoordinatesForDesktop(el)
        })
        makeEncloses()

        function GetCoordinatesForDesktop(element) {
            var curr = element
            switch (curr.clusterParent) {
                case 11739://фин-пром группы
                    curr.col = 0.2
                    curr.row = 1.7
                    if (isSF){
                        curr.col = 8.9
                        curr.row = 1.4
                    }
                    break;
                case 11679://отраслевое
                    curr.col = 4.6
                    curr.row = 2.2
                    if (isSF){
                        curr.col = 0.2
                        curr.row = 1.7
                    }
                    break;
                case 11593://региональное
                    curr.col = 8.9
                    curr.row = 1.4
                    if (isSF){
                        curr.col = 4.6
                        curr.row = 2.2
                    }
                    break;

                case 11550://федеральное
                    curr.col = 1.9
                    curr.row =5.5
                    break;
                case 11727://общ-полит
                    curr.col = 8.5
                    curr.row = 5.9
                    break;

                default://не выявлено
                    curr.col = 6.4
                    curr.row = 6.1
            }
            if (curr.cluster==11738) { //иностранное лобби
                curr.col = 4.5
                curr.row = 6.5
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
                    .attr("id", "encloseText" + level.id)
                    .attr("dy", -clusterPadding/2)
                    .append("textPath") //append a textPath to the text element
                    .attr("xlink:href", "#enclose" + level.id) //place the ID of the path here
                    .attr("startOffset", "25%")
                    .style("text-anchor", "middle") //place the text halfway on the arc
                    .text(function(){
                        var t = level.alias.toUpperCase()
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
                        .innerRadius(Math.max(50,encloseCircle.r))
                        .outerRadius(Math.max(50,encloseCircle.r))
                        .startAngle(-180 * (3.14/180)) //converting from degs to radians
                        .endAngle(180 * (3.14/180))
                    e.transition().duration(100).attr("transform", "translate("+encloseCircle.x+","+encloseCircle.y+")")
                        .attr("d",arc())
                }
            })
        }

        function foci(clusterId){
            let cluster=clearClusters.find(x=>x.cluster==clusterId)
            return {
                "x" : xScale(cluster.col),
                "y": yScale(cluster.row)
            }
        }

        var forceX = d3.forceX((d) => foci(d.cluster).x);
        var forceY = d3.forceY((d) => foci(d.cluster).y);

        var links,link;
        var first_end=0

        var force = d3.forceSimulation()
            .nodes(nodes.sort((a,b)=>a.cluster-b.cluster))
            .force('collide', collide)
            .force('cluster', clustering)
            .force('x',forceX.strength(0.1))
            .force('y',forceY.strength(0.1))
            .alphaDecay(0.04)
            .on("end", function (){
                if (first_end==0) label_force.alpha(1).restart()
                first_end=1
            })
            .stop();

        for (var i = 0, n = Math.ceil(Math.log(force.alphaMin()) / Math.log(1 - force.alphaDecay())); i < n; ++i) {
            force.tick();
        }

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
            .attr('class',d=>d.color)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail)
            .on('click', ClickOnCircle)

        const labels = svg.append('g')
            .datum(clearClusters)
            .selectAll('.g')
            .data(d => d)
            .enter().append("g")
            .attr('class', "lobby_label")
            .style("opacity",0)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("transform",d=>"translate("+d.x+" "+ d.y+")")
            .each(makeText)

        var isClicked=false, activeCircle=false;

        //add zoom capabilities
        var svg1=d3.select("#clusters > svg#chart")
        var g=d3.select("svg#chart > g").attr("class","all")
        var k=1
        var initialTransform = d3.zoomIdentity
            .translate(0,0)
            .scale(1);

        var zoom_handler = d3.zoom()

        var extentXMax=document.getElementById("chart").viewBox.baseVal.width,
            extentYMax=document.getElementById("chart").viewBox.baseVal.height,
            extentXMin=document.getElementById("chart").viewBox.baseVal.x,
            extentYMin=document.getElementById("chart").viewBox.baseVal.y

        var scaleExtentMax = (IsItMobile()) ? 10 : 5

        zoom_handler
            .scaleExtent([1, scaleExtentMax])
            .translateExtent([[extentXMin,extentYMin],[extentXMax,extentYMax]])
            .extent([[extentXMin,extentYMin],[extentXMax,extentYMax]])
            .on("zoom", function () {
                zoom.zoom_actions(g,k,svg1)})
            .on("end", function () {
                k = d3.event.transform.k
                zoom.zoomEndFunction(labels,clearClusters,zoom_handler,isSF)
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

        svg1.call(zoom_handler)
            .on("wheel.zoom", null)

        window.onresize=function (event) {
            SetupSVG(event);
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

        RedrawChart();
        MakeSelect(clearClusters)

        function RedrawChart() {
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
        }
        function tick2() {
            labels
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
            isClicked = true
            activeCircle = d.id
            HightlightCirclesOff()
            drawCloneLinks(d)
            HightlightCirclesOn(d.id)
            MarkActiveCirclesOn(d.id)
            $('#clusters').addClass('is-loading');
            var depRating=GetRating(d.person)
            var depLobbys=GetLobbyText(d.groups)
            var corsPrefix=getLayoutVars().isProd ? '' : 'https://cors-anywhere.herokuapp.com/'; //use cors for local development
            var dipInfoUrl = corsPrefix + "https://declarator.org/api/lobbist/"+d.lobbist+"/"
            // const dipInfoUrl = corsPrefix + 'https://declarator.org/api/lobbist/10001';
            var declarationsUrl = corsPrefix + 'https://declarator.org/api/v1/search/sections/?person=' + d.person;
            
            Promise.all([
                d3.json(dipInfoUrl),
                d3.json(declarationsUrl),
            ]).then(function([depInfo, declarations]) {
                $('#clusters').removeClass('is-loading');
                var t = new ShowCard(depInfo, depRating, depLobbys, lobby, declarations)
            });

        }


        /*
    * Function called on mouseover to display the
    * details of a bubble in the tooltip.
    */
        function showDetail(d) {
            if (d.id!=activeCircle)
                isClicked=false
            var isModalOpen=d3.select("#card").classed("is-active")
            hideLabel(d)

            //if (!isModalOpen)
                drawCloneLinks(d)

            //var groupname=lobby.find(x => x.id === d.cluster)
            var groupname=lobby.find(x => x.id === d.clusterMin)

            var cloneclustersNames=""
            if (Array.isArray(d.cloneClusters))
                cloneclustersNames = d.cloneClusters.map(x=>lobby.find(y=>y.id==x))

            //if (!isModalOpen) {
                HightlightCirclesOff()
                HightlightCirclesOn(d.id)
            //}

            var content =
                '<span class="name">'+d.name+' </span><br/>';
            if (isSF){
                content += '<span class="value">'+ d.fraction+', '+d.total_years+' '+ Pluralization(d.total_years, "год в СФ", "года в СФ", "лет в СФ")+'</span><br/>';
            }else {
                content += '<span class="value">'+ d.fraction+', '+d.convocations+' '+ Pluralization(d.convocations, "созыв", "созыва", "созывов")+'</span><br/>';
            }
            if (cloneclustersNames=="")
                content+=
                    '<span class="value">'+groupname.name+'</span><br/>';
            if (cloneclustersNames!="")
                content+=
                    '<span class="value">'+cloneclustersNames.map(name=>name.name)+'</span><br/>';


            //content += '<span class="value">Рейтинг: '+ d.r.toFixed(2)+'</span><br/>';


            tooltip.showTooltip(content, d3.event);
        }

        function HightlightCirclesOn(id) {
            circles.filter(e=>e.id===id).attr('stroke', '#000').attr('stroke-width', '2px');
        }

        function HightlightCirclesOff() {
            circles.attr('stroke', 'none');
        }

        function MarkActiveCirclesOn(id) {
            MarkActiveCirclesOff()
            circles.filter(e=>e.id==id).classed("activeCircle",true);
        }

        function MarkActiveCirclesOff() {
            circles.classed("activeCircle",false);
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
            //force.alpha(1).restart()
            RedrawChart()
            /*if (force.alpha() <= 0.01){
                force.alpha(0).restart()
                force.force("link", d3.forceLink(links).id(d => d.uniq).strength(0))
            }*/
        }

        /*
        * Hides tooltip
        */
        function hideDetail(d) {

            var isModalOpen=d3.select("#card").classed("is-active")
            // reset outline
            if (!isClicked) {
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

        function MakeSelect(data_clusters) {
            //createSelect("select_election_method", "Способ избрания","election_method")
            //createSelect("select_fraction", "Фракция","fraction")
            createSelect("select_committees", "Комитет", "committees")
            createSelect("select_position_gd", "Должность в ГД", "positions")
            createSelect("select_region", "Регион", "region")
            var conv_slider, age_slider;
            CreateSliders()
            MakeAutoComplete()
            PresetsHandler()

            //data2=lobby.sort((a,b)=>a.tree_id-b.tree_id)

            lobby.forEach(lob=>{
                if (lob.parent==null) lob.parent=1
            })
            lobby.push({id:1,name:"root",parent:"0"})

            var tree = tree_func.list_to_tree(lobby.sort((a,b)=>a.order-b.order))

            var flattenedCollection = {};
            var list=[]
            tree_func.tree_to_collection(tree[0],"children", flattenedCollection,list)

            var select = d3.select('#controls')
                .select('select#select_lobby')
                .on('change',onchange)

            d3.selectAll(".buttons button").on("click", function () {

                var value=d3.select(this).attr("value")
                var allBtns=d3.select(this.parentNode).selectAll("button")
                if (d3.select(this).classed("is-active")) {
                    if (d3.select(this.parentNode).attr("id") != "fraction")
                        d3.select(this).classed("is-active", false)
                    else{
                        if (d3.select(this.parentNode).selectAll("button.is-active").size()>1) {
                            allBtns.classed("is-active", false)
                            d3.select(this).classed("is-active", true)
                        }
                        else {
                            allBtns.classed("is-active", true)
                            d3.select(this).classed("is-active", true)
                        }
                    }
                }
                else {
                    allBtns.classed("is-active", false)
                    d3.select(this).classed("is-active", true)
                }
                onchange()
            })

            select.append('option').text("Группа интересов").attr("value",-1)

            var options = select
                .selectAll('option.opt')
                .data(list).enter()
                .append('option')
                .classed("opt",true)
                .attr("value",d=>d.id)
                .text(d=>{
                    let x=+d.level, y;
                    if (x==0) y="\xA0"
                    if (x==1) y="\xA0\xA0\xA0\xA0"
                    if (x==2) y="\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0"

                    if (x==0) return y+ d.name.toUpperCase()
                    return y+ d.name
                })
                .each(PrependOption)
                .each(function(d) {
                    let t=nodes.filter(x=>x.cluster==d.id ||
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
                let jj2  = []//массив значений ключа
                data.forEach(function (dep) {
                    let keys=dep[key] // ключ может быть массивом значений
                    Array.isArray(keys)
                        ?   keys.forEach(function (comitet) {//надо пройти по нему
                            jj2.push({key: comitet}); //получаем значения ключа в том числе и из массивов
                        })
                        :   jj2.push({key: dep[key]})//если не массив - просто берём значение
                })
                var nest=d3.nest()
                    .key(d=>d.key)
                    .entries(jj2)
                var opts=nest.flatMap(x=>x.key).sort(d3.ascending);
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
                        var text = key=="committees" ? (d && d.replace("Комитет ГД п","П")) : d

                        return text}
                    )
            }

            function CreateSliders() {
                var conv_slider_div = document.getElementById('convocations');
                var age_slider_div = document.getElementById('age');

                conv_slider=noUiSlider.create(conv_slider_div, {
                    start: [isSF?0:1, GetMaxConvocation()],
                    step:1,
                    connect: true,
                    range: {
                        'min': isSF?0:1,
                        'max': GetMaxConvocation()
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

            function GetMaxConvocation() {
                return isSF ? Math.max(...data.map(x=>+x.total_years)) : Math.max(...data.map(x=>+x.convocations));
            }

            function GetMinAge() {
                return Math.min(...data.map(x=>+x.age))
            }

            function GetMaxAge() {
                return Math.max(...data.map(x=>+x.age))
            }

            function getTranslation(transform) {
                var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttributeNS(null, "transform", transform);
                var matrix = g.transform.baseVal.consolidate().matrix;
                return [matrix.e, matrix.f];
            }

            function getViewBox(selector) {
                var svg = document.querySelector(selector);
                var box = svg.viewBox.baseVal;
                return box
            }

            function ZoomeToLobby(active){

                if (!active) return
                let active_enclose = d3.select("#enclose"+active);//find enclose
                if (!active_enclose.node()) {
                    var lob = nodes.find(x=>x.cluster==active || x.clusterMin==active)
                    var parent = lobby.find(x=>x.id == lob.clusterParent)
                    if (parent) active_enclose = d3.select("#enclose"+parent.id)
                    else return
                    if (svg1.attr("data-current_enclose")==parent.id) return
                    svg1.attr("data-current_enclose",parent.id)
                }

                //svg1.call(zoom_handler.transform, initialTransform);

                active=active_enclose

                if (IsItMobile()) height=document.documentElement.clientHeight-80
                else height= getViewBox("svg#chart").height
                width=getViewBox("svg#chart").width

                var transform = getTranslation(active.attr("transform")),
                    x = transform[0],
                    y = transform[1];


                var bbox = active.node().getBBox(),
                    bounds = [[bbox.x+x, bbox.y+y],
                        [bbox.x+x + bbox.width, bbox.y+y + bbox.height]];

                var dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = Math.max(1, Math.min(5, 0.9 / Math.max(dx / width, dy / height))),
                    translate = [width / 2 - scale * x-30, height / 2 - scale * y+30];


                var transform = d3.zoomIdentity
                    .translate(translate[0], translate[1])
                    .scale(scale);

                svg1.transition()
                    .duration(450)
                    .call(zoom_handler.transform, transform);

            }

            function onchange(init) {
                $('.hero-body').removeClass('is-loading');
                var i_search = d3.select('input#search').property('value');
                var s_lobby = d3.select('select#select_lobby').property('value');
                var s_region;
                if (isSF){
                    s_region = d3.select('select#select_region').property('value');
                }

                if (s_lobby!=-1 && s_lobby!="") ZoomeToLobby(s_lobby);
                //var s_method = d3.select('select#select_election_method').property('value')
                /*var s_fraction = d3.select('select#select_fraction').property('value')*/
                var s_comitet = d3.select('select#select_committees').property('value')

                var r_conv=conv_slider.get()

                var r_age=age_slider.get()


                var b_fraction, b_method, b_gender, b_power

                if (d3.selectAll('#fraction .is-active').node()!=null && d3.selectAll('#fraction .is-active').size()==1)
                    b_fraction=d3.select('#fraction .is-active').property('value')

                if (d3.selectAll('#method .is-active').node()!=null)
                    b_method=d3.select('#method .is-active').property('value')

                if (d3.selectAll('#gender .is-active').node()!=null)
                    b_gender=d3.select('#gender .is-active').property('value')
                if (isSF)
                {
                    if (d3.selectAll('#power .is-active').node()!=null)
                        b_power=d3.select('#power .is-active').property('value')
                }


                //if (i_search!="")

                let result=circles.filter(x=>
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
                    &&((isSF && s_region && s_region!=-1) ?
                        (x.region == s_region) : true)
                    &&
                    ((s_comitet!=-1) ? x.committees.includes(s_comitet): true)
                    &&
                    (!isSF ? (+x.convocations>=+r_conv[0] && +x.convocations<=+r_conv[1]) : true)
                    &&
                    (isSF ? (+x.total_years>=+r_conv[0] && +x.total_years<=+r_conv[1]) : true)
                    &&
                    (+x.age>=+r_age[0] && +x.age<=+r_age[1])
                    &&

                    (b_fraction ? (b_fraction == x.fraction || b_fraction == x.fraction_sf) : true)
                    &&
                    (b_method ? (x.election_method==b_method) : true)
                    &&
                    (b_gender ? (x.gender==b_gender) : true)
                    &&
                    (b_power ? (x.goverment_body==b_power) : true)
                )

                if (result.size()!=circles.size()){
                    if (!init) d3.select("#clear").classed("is-hidden",false)
                }
                else d3.select("#clear").classed("is-hidden",true)
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
                input.addEventListener("awesomplete-selectcomplete", function(event) {
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
                        fraction = link.getAttribute("data-fraction"),
                        power = link.getAttribute("data-power")

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

                        if (power)
                            d3.select('#power button[value="'+power+'"]').classed("is-active",true)

                        onchange()
                    });

                })
            }

            function hightlightOn(spot) {
                var count = circles.size() ;
                var i = count;

                var transition_fadeout = d3.transition()
                    .duration(10)
                    .ease(d3.easeLinear);

                circles.classed(d => d.color, true).transition().style("opacity", 0.2)
                    .on("end", () => {
                        i--;
                        if (i === 0 && --count > 0) {
                            spot.transition(transition_fadeout).style("opacity", 1)
                            labels.transition().style("opacity", 0.0)

                            var circles_clusters = spot.data().map(s => s.cluster)

                            var temp = clearClusters.filter(x => circles_clusters.includes(x.cluster))
                            var temp2 = ShowedClusters(temp, k, isSF).map(s => s.cluster)

                            var labels_spot = labels.filter(x => circles_clusters.includes(x.cluster))
                            labels_spot = labels.filter(x => temp2.includes(x.cluster))

                            labels_spot.transition().style("opacity", 1)
                        }
                    });
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
                circles.classed(d=>d.color,true).transition().style("opacity",1)
                var n = ShowedClusters(clearClusters,k, isSF).map(x=>x.cluster)
                labels.style("opacity",0).filter(x=>n.includes(x.cluster)).transition().style("opacity",1)

                zoom.zoom_reset(labels,svg1,zoom_handler,initialTransform);
            }

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

        function GetLobbyText(lobbys) {
            var text=""
            lobbys.forEach(function (l,i) {
                i>0 ? text+=", " : null
                text+=lobby.find(x=>x.id==l).name
            })
            return text
        }


        var hash = window.location.hash;
        if(hash) {
            var person = nodes.find(e=>e.person==hash.replace('#id',''))
            if (person) {
                isClicked=true
                ClickOnCircle(person);
                circles.classed(d=>d.color,true).transition().style("opacity",1)
            }
        }

        window.addEventListener('closeCard', closeCardListener);
        function  closeCardListener(){
            svg.select("g.links").remove()//remove clone links
            HightlightCirclesOff()
            MarkActiveCirclesOff()
            isClicked=false
        }

    }
}