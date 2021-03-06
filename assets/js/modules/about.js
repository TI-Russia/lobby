requirejs(["jquery"], function ($) {
    document.documentElement.style.overflowY = 'auto';
    $(window).scroll(function () {
        var scrollTop = $(document).scrollTop();
        var anchors = $('body').find('.about-section');

        for (var i = 0; i < anchors.length; i++) {
            if (scrollTop + 110 > $(anchors[i]).offset().top && scrollTop < $(anchors[i]).offset().top + $(anchors[i]).height() - 50) {
                $('.about-menu li#menu_' + $(anchors[i]).attr('id')).addClass('active');
            } else {
                $('.about-menu li#menu_' + $(anchors[i]).attr('id')).removeClass('active');
            }
        }
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            document.getElementById("scrollToTop").style.display = "block";
        } else {
            document.getElementById("scrollToTop").style.display = "none";
        }
    });

    $(document).on('click', 'a[href^="#"]', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
    });
    $(document).on('click', '#scrollToTop', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
});