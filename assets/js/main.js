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
        cookie:"tools/cookie"
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

require(["d3","jquery","intro","chart","cookie"], function(d3,$,intro,chart,cookie) {
    window.d3 = d3;
    intro
    chart
    /*Set Cookie for Intro*/
    var dateOfOpen = new Date(new Date().getTime());
    var date = new Date(new Date().getTime() + 3600*2 * 1000);//date+interval 2 рщгкы
    var cook = cookie.getCookie("dateOfOpen")
    if (cook==undefined) {
        cookie.setCookie("c", "set_cookie_for_2_hours");
        cookie.setCookie("dateOfOpen", dateOfOpen.toUTCString(), {expires: date.toUTCString()})
        $('.cd-intro').show();
    }
    else {
        cookie.setCookie("c", "cookie_already_was_here");
        $('.cd-intro').hide();
        $('body').removeClass('intro-open')
    }

    /*Mobile burger-button menu toggler*/
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

