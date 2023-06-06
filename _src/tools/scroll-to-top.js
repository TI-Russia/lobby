import $ from 'jquery';

$(window).scroll(function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        document.getElementById("scrollToTop").style.display = "block";
    } else {
        document.getElementById("scrollToTop").style.display = "none";
    }
});

$(document).on('click', '#scrollToTop', function (event) {
    event.preventDefault();
    $('html, body').animate({
        scrollTop: 0,
    }, 500);
});