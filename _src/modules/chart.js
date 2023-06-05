import $ from 'jquery';
import * as d3 from 'd3';
import noUiSlider from 'nouislider';
import Awesomplete from 'awesomplete';
import findKey from 'lodash/findKey';

import floatingTooltip from '../vendor/tooltip';
import Data from './data';
import storyTelling from '../tools/storyTelling';
import ShowCard from './card';
import ShowedClusters from '../tools/showed_clusters';
import zoom from '../tools/zoom';
import tree_func from '../tools/tree';
import Pluralization from '../tools/pluralize';
import { FRACTIONS } from '../constants/fractions';
import { POSITIONS } from '../constants/positions';
import { getRating } from '../lib/rating';

export default async function initChart () {
    let nodes;
    let clusters; 
    let nodesWithClones;
    let el;
    let isStoryShowing;

    // tooltip for mouseover functionality
    const tooltip = floatingTooltip('gates_tooltip', 240);
    let width, height, maxX, maxY, rows;  // width and heights of chart_grid
    let svg;
    const hash = window.location.hash ? window.location.hash.substring(1) : null;

    const { data, lobby, lobby_level_0, myArrGroups, rawDep, rawRating, isSF } = await Data;

    composeNodes();

    if (isSF && !hash) {
        const storytellyng = document.getElementById('scrollytelling');
        storytellyng.style.display = 'block';
        el = storytellyng.getBoundingClientRect();
        doTelling();
    };
    doChart();

    function hideTelling() {
        const div = document.getElementById('scrollytelling');
        div.style.opacity = 0;
        isStoryShowing = 0;

        document.documentElement.style.overflowY='auto';

        setTimeout(()=>{
            div.style.display = 'none';
        }, 200);
    }

    function doTelling() {
        const width = 600;
        const height = width / (el.width / el.height);
        const svg_relling = d3.select('#root').append('svg');
        svg_relling.attr("viewBox", [0, 0, width, height + 20]);
        const g_telling = svg_relling.append("g");
        let partsTops = [];

        const nd = nodesWithClones.slice().sort((a,b) => a.dupelganger - b.dupelganger).sort((a,b) => a.id - b.id);

        const groups = d3.nest().key(d=>d.cluster).rollup(v => {
            return {
                count: v.length,
                name: v[0] && v[0].clusterName
            };
        }).entries(nd);

        const gp = groups.slice().sort((a,b) => b.value.count-a.value.count).slice(1,10);

        gp.forEach((d,i) => d.order = i);

        function showCircles(state) {
            isStoryShowing = 1;
            const highlightClass = (node) => {
                if (state === 1) {//не выявлено
                    return node.group === 1 ? 'tellingCircle' : 'tellingCircleGray';
                }
                if (state === 2) {//регионы
                    return node.group === 11593 ? 'tellingCircle' : 'tellingBluredCircle';
                }
                if (state === 3) {//силовики и крупный бизнес
                    return (node.group === 11551 || node.group === 11739) ? 'tellingCircle' : 'tellingBluredCircle';
                }
                if (state !== 4 ) {
                    return 'tellingCircle';
                }
                if (node.id === 10528) {//васильев
                    return 'tellingCircleAlt';
                }
                if (node.id === 10724) {//клишас
                    return 'tellingCircle';
                }

                return 'tellingBluredCircle'
            }

            const data = storyTelling.updater(state);
            const dd = data.deps;
            const ll = data.labels;

            const t = d3.transition()
                .duration(300)
                .ease(d3.easeLinear);

            let points = g_telling.selectAll('circle')
                .data(dd, d => d.unq);

            points.enter()
                .append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('class', d => highlightClass(d))
                .attr('r', 3)
                .attr('name', d => `${d.name} ${d.unq}`);

            points.exit().transition(t).attr('r', 0);
            points.exit().transition().delay(1000)
                .remove()

            points.transition(t)
                .attr('r', 3)
                .attr('class', d => highlightClass(d))
                .attr('name', d => `${d.name} ${d.unq}`)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            let labels = g_telling.selectAll('text')
                .data(ll, d=> d.text);

            labels.enter()
                .append('text')
                .text(d => d.text)
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .attr('class', 'tellingLabel')
                .attr('fill',  'black');

            labels.exit()
                .remove();

            labels.transition(t)
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }

        function readSections() {
            const parts = document.getElementsByClassName('section');
            partsTops = Array.prototype.map.call(parts, (d, i) => {
                if (d.nodeName === 'DIV') return {
                    i, 
                    offsetTop: d.offsetTop,
                    offsetHeight: d.offsetHeight,
                }
            });

            return partsTops;
        }


        storyTelling.setDeps(nd);
        showCircles(hash ? 4 : 0);
        const tops = readSections().reverse();
        const div = document.getElementById('scrollytelling');

        div.addEventListener('scroll', function() {
            const witchOne = tops.find(d => (d.offsetTop - (div.getBoundingClientRect().height) + 100) < div.scrollTop);
            if (witchOne) {
                const story = witchOne.i;
                if (witchOne && story != undefined){
                    switch (story) {
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

    function composeNodes() {
        svg = d3.select('#clusters')
            .append('svg')
            .attr('id','chart')
            .append('g');
        SetupSVG();
        const m = myArrGroups.length; // number of distinct clusters

        // The largest node for each cluster
        clusters = new Array(m);
        let uniq = 0;

        nodes = data.reduce(function (acc, d) {
            let clusterParentId, clusterParent2Id, clusterParent2Name;
            const group = lobby.find(x => x.id === d.group);

            if (!group) {
                return acc;
            }

            if (group.level == 0) clusterParentId = group.id;
            if (group.level == 1) clusterParentId = lobby.find(x => x.id == group.parent).id;
            if (group.level == 2) {
                clusterParentId = lobby.find(x => x.id == lobby.find(x => x.id == group.parent).parent).id;
                clusterParent2Id = lobby.find(x => x.id == group.parent).id;
                clusterParent2Name = lobby.find(x => x.id == group.parent).name
            }

            const i = +d.group;
            const j = clusterParent2Id ? clusterParent2Id : +i;
            const r = d.rating;
            d = {
                ...d,
                cluster: clusterParent2Id ? clusterParent2Id : +i,
                clusterMin: +i,
                clusterName: clusterParent2Id ? clusterParent2Name : group.name,
                clusterLevel: group.level,
                clusterParent: clusterParentId,
                clusterParentMiddle: clusterParent2Id ? clusterParent2Id : null,
                color: FRACTIONS[d.fraction]?.color,
                uniq: uniq++,
                r: d.rating,
                x: /*Math.cos(i / m * 2 * Math.PI) * 300*/ + width / 2 + Math.random(),
                y: /*Math.sin(i / m * 2 * Math.PI) * 300*/ + height / 2 + Math.random(),
            };

            let count = clusters[j] ? clusters[j].count + 1 : 1; //counter of nodes in cluster
            if (!clusters[j] || (r > clusters[j].r)) {
                clusters[j] = d;
            };
            clusters[j].count = count; //write count of nodes of current cluster

            return acc.concat(d);
        }, []);
        nodes.sort(function(a, b) { return b.count - a.count; })
        nodes.sort(function(a, b) { return a.clusterParent - b.clusterParent; })

        //remove clones in same cluster

        nodes.forEach(function (node) {
            node.cloneClusters = "null";
            const clones = nodes.filter(x => (x.id == node.id && x.cluster == node.cluster));
            if (clones.length > 1) {
                clones.forEach(function (clone,i) {
                    if (i>0) { clone.clone = "yes" }
                    clone.cloneClusters = clones.map(x => x.clusterMin);
                });
            }
            const cl = nodes.filter(x => (x.id == node.id));
            cl.length > 1 && cl.forEach((d, i) => {
                d.dupelganger = i > 0 ? 1 : 0;
            });
            node.hasClones = cl.length > 1 ? 1 : 0;
        })
        nodesWithClones = nodes;
        nodes=nodes.filter(x => x.clone != "yes");
    }

    function SetupSVG() {
        const headerHeight = document.getElementsByTagName('header')[0].clientHeight;
        const controlsHeight = document.getElementById('controls').clientHeight;
        const footerHeight = document.getElementsByClassName('footer')[0].clientHeight;
        const footerExtraHeight = document.getElementsByClassName("extra")[0].clientHeight;

        const sumHeight = headerHeight + footerHeight + controlsHeight - footerExtraHeight;

        document.body.className += ' ' + 'chart';
        document.body.className = 'chart';

        const min_width = 812;
        const client_width = document.documentElement.clientWidth;
        const client_height = document.documentElement.clientHeight - sumHeight;

        if (IsItMobile() || window.orientation == 90) {
            width = client_width
        } else {
            width = client_width <= 812 ? min_width : client_width;
        }

        height = client_height - 5;

        d3.select('#clusters svg#chart')
            .attr('height', height)
            .attr('width', width);

        d3.select('#clusters svg#chart').attr('viewBox', '-100 0 1200 600')
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr("class", "desktop");
        maxX = 800;
        maxY = 600;
    }

    function IsItMobile() {
        return document.documentElement.clientWidth <= 450;
    }

    function doChart() {
        const padding = 3; // separation between same-color nodes
        const clusterPadding = 15; // separation between different-color nodes

        const clearClusters = clusters.filter(Boolean); //remove null from array
        clearClusters.sort(function(a, b) { return b.count - a.count; })
        clearClusters.sort(function(a, b) { return a.clusterParent - b.clusterParent; })

        const nodes2 = nodes.concat(clearClusters); //merge nodes and clusters signs

        rows = 8;

        const columnsTotal = 9;
        const xScale = d3.scaleLinear()
            .domain([0, columnsTotal-1])
            .range([50, maxX]);

        const yScale = d3.scaleLinear()
            .domain([0, rows])
            .range([100, maxY]);

        clearClusters[0].col = 0;
        clearClusters[0].row = 0;

        clearClusters.forEach(function (el) {
            GetCoordinatesForDesktop(el)
        });

        makeEncloses();

        function GetCoordinatesForDesktop(element) {
            const curr = element;

            switch (curr.clusterParent) {
                case 11739://фин-пром группы
                    curr.col = 0.2;
                    curr.row = 1.7;
                    if (isSF){
                        curr.col = 8.9;
                        curr.row = 1.4;
                    }
                    break;
                case 11679://отраслевое
                    curr.col = 4.6;
                    curr.row = 2.2;
                    if (isSF){
                        curr.col = 0.2;
                        curr.row = 1.7;
                    }
                    break;
                case 11593://региональное
                    curr.col = 8.9;
                    curr.row = 1.4;
                    if (isSF){
                        curr.col = 4.6;
                        curr.row = 2.2;
                    }
                    break;

                case 11550://федеральное
                    curr.col = 1.9;
                    curr.row = 5.5;
                    break;
                case 11727://общ-полит
                    curr.col = 8.5;
                    curr.row = 5.9;
                    break;

                default://не выявлено
                    curr.col = 6.4;
                    curr.row = 6.1;
            }
            if (curr.cluster == 11738) { //иностранное лобби
                curr.col = 4.5;
                curr.row = 6.5;
            }

            return element;
        }

        function makeEncloses() {
            svg.append("g").attr("class", "encloses");

            lobby_level_0.forEach(function (level) {
                svg.select("g.encloses").append("path").attr("class", "enclose")
                    .attr("fill", "none")
                    .attr("id", "enclose" + level.id);

                svg.select("g.encloses").append("text")
                    .attr("id", "encloseText" + level.id)
                    .attr("dy", -clusterPadding / 2)
                    .append("textPath") //append a textPath to the text element
                    .attr("xlink:href", "#enclose" + level.id) //place the ID of the path here
                    .attr("startOffset", "25%")
                    .style("text-anchor", "middle") //place the text halfway on the arc
                    .text(function() {
                        let t = level.alias.toUpperCase();
                        t = t.charAt(0).toUpperCase() + t.slice(1);
                        return t;
                    });
            })
        }

        function encloses() {
            lobby_level_0.forEach(function (level) {
                const e = svg.select('path.enclose#enclose' + level.id);
                const nd = nodes2.filter(x => x.clusterParent == level.id);
                const encloseCircle = d3.packEnclose(nd);
                if (encloseCircle) {
                    const arc = d3.arc()
                        .innerRadius(Math.max(50,encloseCircle.r))
                        .outerRadius(Math.max(50,encloseCircle.r))
                        .startAngle(-180 * (3.14 / 180)) //converting from degs to radians
                        .endAngle(180 * (3.14 / 180));
                        
                    e.transition()
                        .duration(100)
                        .attr("transform", `translate(${encloseCircle.x},${encloseCircle.y})`)
                        .attr("d", arc());
                }
            });
        }

        function foci(clusterId){
            let cluster = clearClusters.find(x => x.cluster == clusterId);

            return {
                x: xScale(cluster.col),
                y: yScale(cluster.row),
            };
        }

        const forceX = d3.forceX((d) => foci(d.cluster).x);
        const forceY = d3.forceY((d) => foci(d.cluster).y);

        let links, link;
        let first_end = 0;

        const force = d3.forceSimulation()
            .nodes(nodes.sort((a,b) => a.cluster - b.cluster))
            .force('collide', collide)
            .force('cluster', clustering)
            .force('x', forceX.strength(0.1))
            .force('y', forceY.strength(0.1))
            .alphaDecay(0.04)
            .on("end", function() {
                if (first_end == 0) label_force.alpha(1).restart();
                first_end = 1;
            })
            .stop();

        for (let i = 0, n = Math.ceil(Math.log(force.alphaMin()) / Math.log(1 - force.alphaDecay())); i < n; ++i) {
            force.tick();
        }

        const label_force = d3.forceSimulation()
            .nodes(clearClusters.filter(x => x.count > 10))
            .force("gravity1", d3.forceManyBody(-10).distanceMax(50).distanceMin(0))
            .alpha(0)
            .on("tick", tick2)

        const circles = svg.append('g')
            .datum(nodes)
            .selectAll('.circle')
            .data(d => d)
            .enter().append('circle')
            .attr('r', d => d.r)
            .attr('class', d => d.color)
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
            .style("opacity", 0)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("transform", d => `translate(${d.x} ${d.y})`)
            .each(makeText)

        let isClicked = false, activeCircle = false;

        //add zoom capabilities
        const svg1 = d3.select("#clusters > svg#chart");
        const g = d3.select("svg#chart > g").attr("class", "all");
        let k = 1;
        const initialTransform = d3.zoomIdentity
            .translate(0,0)
            .scale(1);

        const zoom_handler = d3.zoom();

        const extentXMax = document.getElementById("chart").viewBox.baseVal.width;
        const extentYMax = document.getElementById("chart").viewBox.baseVal.height;
        const extentXMin = document.getElementById("chart").viewBox.baseVal.x;
        const extentYMin = document.getElementById("chart").viewBox.baseVal.y;

        const scaleExtentMax = IsItMobile() ? 10 : 5;

        zoom_handler
            .scaleExtent([1, scaleExtentMax])
            .translateExtent([[extentXMin,extentYMin], [extentXMax,extentYMax]])
            .extent([[extentXMin, extentYMin],[extentXMax, extentYMax]])
            .on("zoom", function() {
                zoom.zoom_actions(g, k, svg1);
            })
            .on("end", function() {
                k = d3.event.transform.k;
                zoom.zoomEndFunction(labels, clearClusters, zoom_handler, isSF);
            });

        d3.select('#zoom-in').on('click', function() {
            d3.event.preventDefault();
            zoom_handler.scaleBy(svg1.transition().duration(400), 1.3);
        });

        d3.select('#zoom-out').on('click', function() {
            d3.event.preventDefault();
            zoom_handler.scaleBy(svg1.transition().duration(400), 1 / 1.3);
        });

        d3.select('#zoom-home').on('click', function() {
            d3.event.preventDefault();
            zoom.zoom_reset(labels, svg1, zoom_handler, initialTransform);
        });

        svg1.call(zoom_handler)
            .on("wheel.zoom", null)

        window.onresize = function (event) {
            SetupSVG(event);
        }

        function makeText(d) {
            const alias = lobby.find(x => d.clusterName == x.name).alias;
            d3.select(this).append("text")
                .text(alias.charAt(0).toUpperCase() + alias.slice(1))
                .each(wrapText)
                .each(makeBack);
        }

        function makeBack() {
            const width = this.getBBox().width + 4;
            const height = this.getBBox().height;
            const x = this.getBBox().x - 2;
            const y = this.getBBox().y;

            d3.select(this.parentNode).insert("rect", "text")
                .attr("x", x)
                .attr("y", y)
                .attr("width", width)
                .attr("height", height)
                .attr("class", "backForLabel")
        }

        function wrapText() {
            const text = d3.select(this);
            const width = 50;
            const words = text.text().split(/\s+/).slice(0, 3).reverse();
            let word;
            let line = [];
            let lineHeight = 1;
            let tspan = text.text(null).attr("y", -words.length / 2 + 'em');

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));

                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("dy", lineHeight + "em").text(word);
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

            labels.attr("transform", d => `translate(${d.x} ${d.y})`);
            if (links) {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            }
        }

        function tick2() {
            labels
                .attr("transform", d => `translate(${d.x} ${d.y})`);
        }

        // Move d to be adjacent to the cluster node.
        function clustering(alpha) {
            nodes.forEach((d) => {
                const cluster = clearClusters.find(x => x.cluster == d.cluster);
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

        function collide() {
            const quadtree = d3.quadtree()
                .x((d) => d.x)
                .y((d) => d.y)
                .addAll(nodes);

            nodes.forEach(function(d) {
                const r = d.r + Math.max(padding, clusterPadding);
                const nx1 = d.x - r;
                const nx2 = d.x + r;
                const ny1 = d.y - r;
                const ny2 = d.y + r;

                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.data && (quad.data !== d)) {
                        let x = d.x - quad.data.x;
                        let y = d.y - quad.data.y;
                        let l = Math.sqrt(x * x + y * y);
                        const r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);

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
            const i = d.cluster;
            labels.filter(x => x.cluster == i).classed("hovered", true);
        }

        function showLabel() {
            labels.classed("hovered", false);
        }

        function ClickOnCircle(d){
            isClicked = true;
            activeCircle = d.id;
            HightlightCirclesOff();
            drawCloneLinks(d);
            HightlightCirclesOn(d.id);
            MarkActiveCirclesOn(d.id);
            $('#clusters').addClass('is-loading');
            const depRating=getRating(d.person, rawRating, isSF);
            const depLobbys=GetLobbyText(d.groups);
            const dipInfoURL = isSF
                ? `https://declarator.org/api/lobbist/${d.id}/`
                : `https://declarator.org/api/lobbist_detail/${d.id}/`;
            const declarationsURL = `https://declarator.org/api/v1/search/sections/?person=${d.person}`;
            const successRateURL = `https://declarator.org/api/persons/${d.person}/success_rate`;
            
            Promise.all([
                d3.json(dipInfoURL),
                d3.json(declarationsURL),
                d3.json(successRateURL),
            ]).then(function([depInfo, declarations, depSuccessRate]) {
                $('#clusters').removeClass('is-loading');
                new ShowCard({
                    ...(isSF ? { depInfoLegacy: depInfo } : { depInfo }),
                    depRating, 
                    depLobbys, 
                    depSuccessRate,
                    lobby, 
                    declarations,
                    depLobbistSmallData: d,
                });
            });
        }


        /*
        * Function called on mouseover to display the
        * details of a bubble in the tooltip.
        */
        function showDetail(d) {
            if (d.id != activeCircle) {
                isClicked = false;
            }

            hideLabel(d);
            drawCloneLinks(d)

            const groupname = lobby.find(x => x.id === d.clusterMin);

            let cloneclustersNames = "";

            if (Array.isArray(d.cloneClusters)) {
                cloneclustersNames = d.cloneClusters.map(x => lobby.find(y => y.id == x));
            }

            HightlightCirclesOff();
            HightlightCirclesOn(d.id);

            let content = `<span class="name">${d.name} </span><br/>`;

            if (isSF){
                content += `<span class="value">${FRACTIONS[d.fraction].name}, ${d.total_years} ${Pluralization(d.total_years, "год в СФ", "года в СФ", "лет в СФ")}</span><br/>`;
            } else {
                content += `<span class="value">${FRACTIONS[d.fraction].name}, ${d.convocations.length} ${Pluralization(d.convocations.length, "созыв", "созыва", "созывов")}</span><br/>`;
            }

            if (cloneclustersNames == "") {
                content += `<span class="value">${groupname.name}</span><br/>`;
            }
            if (cloneclustersNames != "") {
                content += `<span class="value">${cloneclustersNames.map(name=>name.name)}</span><br/>`;
            }

            tooltip.showTooltip(content, d3.event);
        }

        function HightlightCirclesOn(id) {
            circles.filter(e => e.id === id).attr('stroke', '#000').attr('stroke-width', '2px');
        }

        function HightlightCirclesOff() {
            circles.attr('stroke', 'none');
        }

        function MarkActiveCirclesOn(id) {
            MarkActiveCirclesOff()
            circles.filter(e => e.id == id).classed("activeCircle", true);
        }

        function MarkActiveCirclesOff() {
            circles.classed("activeCircle", false);
        }

        function drawCloneLinks(target) {
            const clones = nodes.filter(x => x.id == target.id);
            const arr = clones.map(function (clone) {
                return{
                    source: target.uniq,
                    target: clone.uniq,
                    value: 1,
                };
            });

            links = arr.map(d => Object.create(d));
            svg.select("g.links").remove();
            link = svg.insert("g", ":first-child").classed("links", true)
                .attr("stroke", "#999")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width", d => Math.sqrt(d.value));
            force.force("link", d3.forceLink(links).id(d => d.uniq).strength(0));
            RedrawChart();
        }

        /*
        * Hides tooltip
        */
        function hideDetail(d) {
            // reset outline
            if (!isClicked) {
                svg.select("g.links").remove(); //remove clone links
                HightlightCirclesOff();
            }
            tooltip.hideTooltip();
            showLabel();
        }

        function MakeSelect() {
            createSelect("select_committees", "Комитет", "committees");
            createSelect("select_position_gd", "Должность в ГД", "positions", POSITIONS);
            createSelect("select_region", "Регион", "region");
            let conv_slider, age_slider;
            CreateSliders();
            MakeAutoComplete();
            PresetsHandler();

            lobby.forEach(lob => {
                if (lob.parent == null) {
                    lob.parent = 1;
                }
            });

            lobby.push({id: 1, name: "root", parent: "0"});

            const tree = tree_func.list_to_tree(lobby.sort((a, b) => a.order - b.order));

            const flattenedCollection = {};
            const list = [];
            tree_func.tree_to_collection(tree[0], "children", flattenedCollection, list);

            const select = d3.select('#controls')
                .select('select#select_lobby')
                .on('change', onchange);

            d3.selectAll(".buttons button").on("click", function () {
                const allBtns = d3.select(this.parentNode).selectAll("button");

                if (d3.select(this).classed("is-active")) {
                    if (d3.select(this.parentNode).attr("id") != "fraction") {
                        d3.select(this).classed("is-active", false);
                    }
                    else {
                        if (d3.select(this.parentNode).selectAll("button.is-active").size() > 1) {
                            allBtns.classed("is-active", false);
                            d3.select(this).classed("is-active", true);
                        } else {
                            allBtns.classed("is-active", true);
                            d3.select(this).classed("is-active", true);
                        }
                    }
                } else {
                    allBtns.classed("is-active", false);
                    d3.select(this).classed("is-active", true);
                }
                onchange();
            })

            select.append('option').text("Группа интересов").attr("value", -1);

            select
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
                    const ti = document.createElement('option');
                    ti.disabled = true;
                    if (this.nextSibling && this.parentNode) this.parentNode.insertBefore(ti, this);
                }
            }

            function createSelect(selector, placeholder, key, map) {
                //массив значений ключа
                const jj2 = data.reduce((acc, dep) => {
                    const val = dep[key];
                    // ключ может быть массивом значений
                    const keys = Array.isArray(val) ? val : [val];

                    keys.forEach((item) => {//надо пройти по нему
                        acc.push({
                            key: map ? map[item] : item
                        }); //получаем значения ключа в том числе и из массивов
                    })

                    return acc;
                }, []);

                const nest=d3.nest()
                    .key(d=>d.key)
                    .entries(jj2);

                const opts=nest.flatMap(x=>x.key).sort(d3.ascending);

                const select = d3.select('#controls')
                    .select('select#' + selector)
                    .on('change', onchange);
                select.append('option').text(placeholder).attr("value", -1);
                select
                    .selectAll('option.opt')
                    .data(opts).enter()
                    .append('option')
                    .attr("value",d=>d)
                    .text((d)=>{
                        const text = key=="committees" ? (d && d.replace("Комитет ГД п","П")) : d

                        return text
                    })
            }

            function CreateSliders() {
                const conv_slider_div = document.getElementById('convocations');
                const age_slider_div = document.getElementById('age');

                conv_slider = noUiSlider.create(conv_slider_div, {
                    start: [isSF? 0: 1, GetMaxConvocation()],
                    step: 1,
                    connect: true,
                    range: {
                        min: isSF?0:1,
                        max: GetMaxConvocation(),
                    },
                    format: {
                        from: function(value) {
                            return parseInt(value);
                        },
                        to: function(value) {
                            return parseInt(value);
                        },
                    }
                });

                const snapValues1 = [
                    document.getElementById('slider-snap-value-lower'),
                    document.getElementById('slider-snap-value-upper'),
                ];

                age_slider = noUiSlider.create(age_slider_div, {
                    start: [GetMinAge(), GetMaxAge()],
                    step: 1,
                    connect: true,
                    range: {
                        'min': GetMinAge(),
                        'max': GetMaxAge(),
                    },
                    format: {
                        from: function(value) {
                            return parseInt(value);
                        },
                        to: function(value) {
                            return parseInt(value);
                        },
                    },
                });

                const snapValues2 = [
                    document.getElementById('age-slider-snap-value-lower'),
                    document.getElementById('age-slider-snap-value-upper'),
                ];

                conv_slider.on('update', function (values, handle) {
                    snapValues1[handle].innerHTML = values[handle];
                });

                age_slider.on('update', function (values, handle) {
                    snapValues2[handle].innerHTML = values[handle];
                });

                age_slider.on('change', function () {
                    onchange();
                });

                conv_slider.on('change', function () {
                    onchange();
                });
            }

            function GetMaxConvocation() {
                return isSF
                    ? Math.max(...data.map(x => + x.total_years))
                    : data.reduce((acc, dep) => Math.max(acc, ...dep.convocations), 0);
            }

            function GetMinAge() {
                return Math.min(...data.map(x => +x.age));
            }

            function GetMaxAge() {
                return Math.max(...data.map(x => +x.age));
            }

            function getTranslation(transform) {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttributeNS(null, "transform", transform);
                const matrix = g.transform.baseVal.consolidate().matrix;
                return [matrix.e, matrix.f];
            }

            function getViewBox(selector) {
                const svg = document.querySelector(selector);
                const box = svg.viewBox.baseVal;
                return box;
            }

            function ZoomeToLobby(active) {
                if (!active) return;
                let active_enclose = d3.select("#enclose" + active);//find enclose
                if (!active_enclose.node()) {
                    const lob = nodes.find(x => x.cluster == active || x.clusterMin == active);
                    const parent = lobby.find(x => x.id == lob.clusterParent);
                    if (parent) {
                        active_enclose = d3.select("#enclose" + parent.id);
                    } else {
                        return;
                    }
                    if (svg1.attr("data-current_enclose") == parent.id) return
                    svg1.attr("data-current_enclose", parent.id);
                }

                active = active_enclose;

                if (IsItMobile()) {
                    height = document.documentElement.clientHeight - 80;
                } else {
                    height = getViewBox("svg#chart").height;
                }
                width = getViewBox("svg#chart").width;

                const bbox = active.node().getBBox();
                const bounds = [
                    [bbox.x+x, bbox.y+y],
                    [bbox.x+x + bbox.width, bbox.y+y + bbox.height],
                ];

                const dx = bounds[1][0] - bounds[0][0];
                const dy = bounds[1][1] - bounds[0][1];
                const x = (bounds[0][0] + bounds[1][0]) / 2;
                const y = (bounds[0][1] + bounds[1][1]) / 2;
                const scale = Math.max(1, Math.min(5, 0.9 / Math.max(dx / width, dy / height)));
                const translate = [width / 2 - scale * x-30, height / 2 - scale * y+30];

                const transform = d3.zoomIdentity
                    .translate(translate[0], translate[1])
                    .scale(scale);

                svg1.transition()
                    .duration(450)
                    .call(zoom_handler.transform, transform);

            }

            function onchange(init) {
                $('.hero-body').removeClass('is-loading');
                const i_search = d3.select('input#search').property('value');
                const s_lobby = d3.select('select#select_lobby').property('value');

                let s_position_gd_raw;
                let s_position_gd;
                let s_region;

                if (isSF){
                    s_region = d3.select('select#select_region').property('value');
                } else {
                    s_position_gd_raw = d3.select('select#select_position_gd').property('value');
                    s_position_gd = s_position_gd_raw && Number(findKey(POSITIONS, (val) => val === s_position_gd_raw));
                }

                if (s_lobby != -1 && s_lobby != "") {
                    ZoomeToLobby(s_lobby);
                }

                const s_comitet = d3.select('select#select_committees').property('value');

                const r_conv = conv_slider.get();
                const r_age = age_slider.get();

                let b_fraction, b_method, b_gender, b_power;

                if (d3.selectAll('#fraction .is-active').node() != null && d3.selectAll('#fraction .is-active').size() == 1) {
                    b_fraction = d3.select('#fraction .is-active').property('value');
                }

                if (d3.selectAll('#method .is-active').node() != null) {
                    b_method = d3.select('#method .is-active').property('value');
                }

                if (d3.selectAll('#gender .is-active').node() != null) {
                    b_gender = d3.select('#gender .is-active').property('value');
                }

                if (isSF) {
                    if (d3.selectAll('#power .is-active').node() != null) {
                        b_power = d3.select('#power .is-active').property('value');
                    }
                }

                let result = circles.filter(x =>
                    ((i_search != "") ?
                        (x.name.toLowerCase().includes(i_search.toLowerCase()) ||
                            x.clusterName.toLowerCase().includes(i_search.toLowerCase())) : true)
                    &&
                    ((s_lobby != -1 && s_lobby) ?
                        (x.cluster == s_lobby ||
                            x.cloneClusters.includes(+s_lobby) ||
                            x.clusterParent == s_lobby ||
                            x.clusterMin == s_lobby ||
                            x.clusterParentMiddle == s_lobby) : true)
                    &&
                    ((isSF && s_region && s_region != -1) ?
                        (x.region == s_region) : true)
                    &&
                    ((s_comitet != -1) ? x.committees.includes(s_comitet) : true)
                    &&
                    (s_position_gd ? x.positions.includes(s_position_gd) : true)
                    &&
                    (!isSF ? (+x.convocations.length >= +r_conv[0] && +x.convocations.length <= +r_conv[1]) : true)
                    &&
                    (isSF ? (+x.total_years >= +r_conv[0] && +x.total_years <= +r_conv[1]) : true)
                    &&
                    (+x.age >= +r_age[0] && +x.age <= +r_age[1])
                    &&
                    (b_fraction ? (b_fraction == x.fraction || b_fraction == x.fraction_sf) : true)
                    &&
                    (b_method ? (x.election_method == b_method) : true)
                    &&
                    (b_gender ? (x.gender == b_gender) : true)
                    &&
                    (b_power ? (x.goverment_body == b_power) : true)
                )

                if (result.size() != circles.size()) {
                    if (!init) d3.select("#clear").classed("is-hidden", false);
                }
                else d3.select("#clear").classed("is-hidden", true)
                hightlightOn(result);
            }

            d3.select("#search").on("keyup", onchange);
            d3.select("#clear").on("click", hightlightOff);

            function MakeAutoComplete() {
                const input = document.getElementById("search");
                new Awesomplete(input,
                    {list: rawDep.map(x => x.fullname)}
                );
                input.addEventListener("awesomplete-highlight", function(event) {
                    input.value = event.text.value;
                    onchange();
                });
                input.addEventListener("awesomplete-selectcomplete", function() {
                    onchange();
                });
            }

            function PresetsHandler() {
                d3.selectAll("#presets-first a").nodes().forEach(function (link) {
                    const lobby = link.getAttribute("data-lobby");
                    const age_min = link.getAttribute("data-age_min");
                    const age_max = link.getAttribute("data-age_max");
                    const conv_min = link.getAttribute("data-conv_min");
                    const conv_max = link.getAttribute("data-conv_max");
                    const method = link.getAttribute("data-method");
                    const comittee = link.getAttribute("data-comittee");
                    const gender = link.getAttribute("data-gender");
                    const fio = link.getAttribute("data-fio");
                    const fraction = link.getAttribute("data-fraction");
                    const power = link.getAttribute("data-power");

                    link.addEventListener('click', function (e) {
                        e.preventDefault()
                        hightlightOff()

                        if (age_min && age_max)
                            age_slider.set([age_min, age_max]);

                        if (conv_min && conv_max)
                            conv_slider.set([conv_min, conv_max]);

                        if (method) {
                            d3.select(`#method button[value="${method}"]`).classed("is-active", true);
                        }

                        if (fraction) {
                            d3.selectAll('#fraction button').classed("is-active", false);
                        }
                        d3.select(`#fraction button[value="${fraction}"]`).classed("is-active", true);

                        if (comittee) {
                            d3.select('select#select_committees').property('value', comittee);
                        }

                        if (gender) {
                            d3.select(`#gender button[value="${gender}"]`).classed("is-active", true);
                        }

                        if (fio) {
                            d3.select('input#search').property('value', fio);
                        }

                        if (lobby) {
                            d3.select('select#select_lobby').property('value', +lobby);
                        }

                        if (power) {
                            d3.select(`#power button[value="${power}"]`).classed("is-active", true);
                        }

                        onchange();
                    });
                });
            }

            function hightlightOn(spot) {
                let count = circles.size();
                let i = count;

                const transition_fadeout = d3.transition()
                    .duration(10)
                    .ease(d3.easeLinear);

                circles.classed(d => d.color, true).transition().style("opacity", 0.2)
                    .on("end", () => {
                        i--;
                        if (i === 0 && --count > 0) {
                            spot.transition(transition_fadeout).style("opacity", 1);
                            labels.transition().style("opacity", 0.0);

                            const circles_clusters = spot.data().map(s => s.cluster);

                            const temp = clearClusters.filter(x => circles_clusters.includes(x.cluster));
                            const temp2 = ShowedClusters(temp, k, isSF).map(s => s.cluster);

                            const labels_spot = labels.filter(x => temp2.includes(x.cluster));

                            labels_spot.transition().style("opacity", 1);
                        }
                    });
            }

            function hightlightOff() {
                d3.select("#clear").classed("is-hidden", true);
                svg1.attr("data-current_enclose", null);

                conv_slider.reset();
                age_slider.reset();
                d3.selectAll("#search").property("value", "");
                d3.selectAll("#controls button").classed("is-active", false);
                d3.selectAll("#controls #fraction button").classed("is-active", true);
                d3.selectAll("select").property("selectedIndex", 0);
                circles.classed(d => d.color,true).transition().style("opacity", 1);
                const n = ShowedClusters(clearClusters, k, isSF).map(x => x.cluster);
                labels.style("opacity", 0).filter(x => n.includes(x.cluster)).transition().style("opacity", 1);

                zoom.zoom_reset(labels, svg1, zoom_handler, initialTransform);
            }
        }

        function GetLobbyText(lobbys) {
            let text = "";

            lobbys.forEach(function(l, i) {
                if (i > 0) {
                    text += ", ";
                }

                text += lobby.find(x => x.id == l).name;
            });

            return text;
        }

        const hash = window.location.hash;

        if (hash) {
            const person = nodes.find(e => e.person == hash.replace('#id', ''));

            if (person) {
                isClicked = true;
                ClickOnCircle(person);
                circles.classed(d => d.color, true).transition().style("opacity", 1);
            }
        }

        window.addEventListener('closeCard', closeCardListener);

        function closeCardListener() {
            svg.select("g.links").remove(); //remove clone links
            HightlightCirclesOff();
            MarkActiveCirclesOff();
            isClicked = false;
        }
    }
}