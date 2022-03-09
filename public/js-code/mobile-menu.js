  // toggle mobile menu
  $(".mobile-toggle").click(function () {
    $("header.page-header").toggleClass("menu-open");
    $("#openMenuIcon").toggleClass("hidden");
    $("#closeMenuIcon").toggleClass("hidden");
    $("html, body").toggleClass("overflow-hidden");
  });