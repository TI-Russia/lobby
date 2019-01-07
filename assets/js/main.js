require.config({
    paths: {
        d3: "http://d3js.org/d3.v5.min",
        jquery: 'jquery',
        floatingTooltip:'tooltip',
        slider:'nouislider',
        awesomeplete: 'awesomplete',
        intro: "modules/intro",
        chart: "modules/chart",
        ShowCard: "modules/card",
        data: "modules/data"
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

