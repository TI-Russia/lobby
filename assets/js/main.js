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

    document.getElementById("nav-toggle").addEventListener ("click", toggleNav);
    function toggleNav() {
        var nav = document.getElementById("nav-menu");
        var className = nav.getAttribute("class");
        if(className == "is-visible-small is-hidden") {
            nav.className = "is-visible-small";
            document.getElementById("header-title").className="column c1 is-hidden"
        } else {
            document.getElementById("header-title").className="column c1"
            nav.className = "is-visible-small is-hidden" ;
        }
    }

});

