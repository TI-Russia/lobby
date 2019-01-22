requirejs(['jquery','cookie'], function( $,cookie ) {
    //$('#clusters').addClass('is-loading');
    /*Set Cookie for Intro*/
    var dateOfOpen = new Date(new Date().getTime());
    var date = new Date(new Date().getTime() + 3600*2 * 1000);//date+interval 2 рщгкы
    var cook = cookie.getCookie("dateOfOpen")
    if (cook==undefined) {
        //set_cookie_for_2_hours
        cookie.setCookie("dateOfOpen", dateOfOpen.toUTCString(), {expires: date.toUTCString()})
        $('body').addClass('intro-open')
        $('.cd-intro').show();
    }
    else {
        //cookie_already_was_here
        $('.cd-intro').hide();
        $('body').removeClass('intro-open')
    }
});

