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

define('modernizr', [], Modernizr);
require(["jquery","burger","data","intro","d3","modernizr"], function($,burger,data,intro,d3,Modernizr) {
    window.d3 = d3;
    if (Modernizr.arrow) {
        // supported arrow functions
        //console.log("supported")
    } else {
        // not-supported, it is IE
        //console.log("not-supported")
    }
});

