requirejs(['jquery'], function( $ ) {
    $('body').addClass('intro-open')
    $('.main-action').click(
        function (e) {
            e.preventDefault();
            $('.cd-intro').hide();
            $('body').removeClass('intro-open')
        })
});

