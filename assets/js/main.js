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
        vk:"vendor/vk",
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

require(["d3","jquery","intro","chart","vk"], function(d3,$,intro,chart,vk) {
    window.d3 = d3;
    intro
    chart
    vk
    document.getElementById('vk_share_button').innerHTML = VK.Share.button({noparse:false}, {type: 'custom ', text:"<span class='icon is-large'><i class='fab fa-vk'></i></span>"});


});

