require.config({
    paths: {
        d3: "d3",
        jquery: 'jquery',
        floatingTooltip:'tooltip',
        slider:'nouislider',
        awesomeplete: 'awesomplete',
        intro: "modules/intro",
        chart: "modules/chart",
        ShowCard: "modules/card",
        data: "modules/data",
        ShowedClusters: "tools/showed_clusters",
        zoom:"tools/zoom"
    },
    shim: {
        awesomeplete:{
            exports: 'awesomeplete'
        },
        floatingTooltip: {
            exports: 'floatingTooltip'
        }
    }
});

require(["d3","jquery","intro","chart"], function(d3,$,intro,chart) {
    window.d3 = d3;
    intro
    chart
});

