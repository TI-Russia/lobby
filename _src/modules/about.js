import $ from 'jquery';

import { getLayoutVars } from './layout_vars';

if (getLayoutVars().layout === 'page-about') {
    document.documentElement.style.overflowY = 'auto';

    $(window).scroll(function () {
        const scrollTop = $(document).scrollTop();
        const anchors = $('body').find('.md-page-section');

        for (let i = 0; i < anchors.length; i++) {
            if (scrollTop + 110 > $(anchors[i]).offset().top && scrollTop < $(anchors[i]).offset().top + $(anchors[i]).height() - 50) {
                $('.about-menu li#menu_' + $(anchors[i]).attr('id')).addClass('active');
            } else {
                $('.about-menu li#menu_' + $(anchors[i]).attr('id')).removeClass('active');
            }
        }
    });

    $(document).on('click', 'a[href^="#"]', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top,
        }, 500);
    });
}