requirejs(['jquery','cookie'], function( $,cookie ) {
    //$('#clusters').addClass('is-loading');
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit

    /*Set Cookie for Intro*/
    var dateOfOpen = new Date(new Date().getTime());
    var date = new Date(new Date().getTime() + 3600*2 * 1000);//date+interval 2 рщгкы
    var cook = cookie.getCookie("dateOfOpen")
    if (cook==undefined) {
        $('body').addClass('intro-open')
        $('.cd-intro').show();
        $('.main-action').click(
            function (e) {
                e.preventDefault();
                //set_cookie_for_2_hours
                cookie.setCookie("dateOfOpen", dateOfOpen.toUTCString(), {expires: date.toUTCString()})
                $('.cd-intro').hide();
                $('body').removeClass('intro-open')
            })


    }
    else {
        //cookie_already_was_here
        $('.cd-intro').hide();
        $('body').removeClass('intro-open')
    }
});

