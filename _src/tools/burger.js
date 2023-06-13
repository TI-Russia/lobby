import $ from 'jquery';
    
/*Mobile burger-button menu toggler*/
$(document).ready(function() {
    document.getElementById("nav-toggle").addEventListener("click", toggleNav);

    function toggleNav() {
        const nav_toggle = document.getElementById("nav-toggle");
        const menu = document.getElementById("header_menu");

        if (nav_toggle.className == "") {
            nav_toggle.className = "is-active is-visible";
            menu.className = "header-menu is-visible";
        } else {
            nav_toggle.className = "";
            menu.className = "header-menu";
        }
    }
});

