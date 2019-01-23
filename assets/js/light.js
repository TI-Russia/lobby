require.config({
    paths: {
        jquery: 'vendor/jquery',
        intro: "modules/intro",
        cookie:"tools/cookie",
        burger: "tools/burger",
        about:"modules/about"
    }
});

require(["burger","about"], function(burger,about) {
    burger
    about
});

