require.config({
    paths: {
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
        storyTelling: "tools/storyTelling",
        burger: "tools/burger",
        plural:"tools/pluralize",
        es5_ShowCard:"es5/card",
        es5_chart:"es5/chart",
        es5_d3:"es5/d3-v4",
        es5_ShowedClusters:"es5/showed_clusters",
        es5_tree:"es5/tree",
        es5_zoom:"es5/zoom",
        warning:"es5/warning"
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
if (Modernizr.arrow) {
    // supported arrow functions
    require(["jquery","burger","data","intro","d3"], function($,burger,data,intro,d3) {
        window.d3 = d3;
    });
} else {
    // not-supported, it is IE
    require(["jquery","burger","intro","es5_d3", "warning"], function( $,burger,intro,d3, warning) {
        window.d3 = d3;
    });
}


