requirejs(["jquery"], function($) {
    /*Mobile burger-button menu toggler*/
    $(document).ready(function() {
        document.getElementById("nav-toggle").addEventListener("click", toggleNav);

        function toggleNav() {
            var nav_toggle = document.getElementById("nav-toggle");
            var menu = document.getElementById("header_menu");

            if (nav_toggle.className == "is-visible-small") {
                nav_toggle.className = "is-active is-visible-small"
                menu.className = "header-menu  is-visible"
            } else {
                nav_toggle.className = "is-visible-small"
                menu.className = "header-menu"
            }
        }
    });
});
