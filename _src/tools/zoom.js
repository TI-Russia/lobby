import * as d3 from 'd3';
import ShowedClusters from './showed_clusters';

function zoomEndFunction(labels, clearClusters, zoom_handler, isSF) {
    const k=d3.event.transform.k

    var temp2=ShowedClusters(clearClusters,k, isSF).map(x=>x.cluster)
    var labels_spot=labels.filter(x=>temp2.includes(x.cluster))
    //labels_spot.transition().style("opacity",1)
    if (k>1){
        if (k>1) {

            d3.selectAll(".maxi").style("opacity",0)
            d3.selectAll(".midi").style("opacity",0)
            d3.selectAll(".super").style("opacity",0)
            labels.attr("class","lobby_label")
            labels_spot.classed("mini",true)
            labels_spot.transition().style("opacity",1)
        }
        if (k>1.3) {
            d3.selectAll(".mini").style("opacity",0)
            d3.selectAll(".maxi").style("opacity",0)
            d3.selectAll(".super").style("opacity",0)
            labels.attr("class","lobby_label")
            labels_spot.classed("midi",true)
            labels_spot.transition().style("opacity",1)
        }
        if (k>2.1) {
            d3.selectAll(".mini").style("opacity",0)
            d3.selectAll(".midi").style("opacity",0)
            d3.selectAll(".super").style("opacity",0)
            labels.attr("class","lobby_label")
            labels_spot.classed("maxi",true)
            labels_spot.transition().style("opacity",1)
        }
        if (k>3.7) {
            d3.selectAll(".mini").style("opacity",0)
            d3.selectAll(".midi").style("opacity",0)
            d3.selectAll(".maxi").style("opacity",0)
            labels.attr("class","lobby_label")
            labels_spot.classed("super",true)
            labels_spot.transition().style("opacity",1)
        }
    }
    else {
        d3.select("svg#chart").on("zoom", null)
        d3.selectAll(".mini").style("opacity",0)
        d3.selectAll(".midi").style("opacity",0)
        d3.selectAll(".maxi").style("opacity",0)
        d3.selectAll(".super").style("opacity",0)
        labels_spot.transition().style("opacity",1)
        labels.attr("class","lobby_label")
    }
}

function zoom_actions(g,k,svg1){
    svg1.attr("data-current_enclose",null)
    g.attr("transform", d3.event.transform)
}

function zoom_reset(labels,svg1,zoom_handler,initialTransform) {
    d3.select("svg#chart.desktop").attr('viewBox','-100 0 1200 600')
    svg1.attr("data-current_enclose",null)
    labels.transition().style("opacity",0)
    svg1.transition()
        .duration(750)
        .call(zoom_handler.transform, initialTransform);
}

export default {
    zoomEndFunction,
    zoom_actions,
    zoom_reset,
};