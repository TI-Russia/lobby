requirejs(['jquery','cookie'], function( $,cookie ) {
    $('.hero-body').addClass('is-loading');

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

