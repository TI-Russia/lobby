require.config({
    paths: {
        es6: "npm-modules/requirejs-babel/es6",
        babel: "npm-modules/requirejs-babel/babel-5.8.34.min",
        d3: "vendor/d3",
        jquery: 'vendor/jquery',
        floatingTooltip:'vendor/tooltip',
        slider:'vendor/nouislider',
        awesomeplete: 'vendor/awesomplete',
        intro: "modules/intro",
        chart: "modules/chart",
        ShowCard: "modules/card",
        data: "modules/data",
        ShowedClusters: "tools/showed_clusters",
        zoom:"tools/zoom",
        cookie:"tools/cookie",
        tree: "tools/tree",
        burger: "tools/burger",
        plural:"tools/pluralize"
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

require(["jquery","burger","data", "chart","intro","d3"], function($,burger,data,chart,intro,d3) {


    window.d3 = d3;

    //setTimeout(function(){ burger; }, 50)
    //setTimeout(function(){ intro; }, 100)


    /*require(["d3","chart"], function(d3,chart) {
        window.d3 = d3;
        chart
    });*/

});

