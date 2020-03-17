// header headline on mobile
var headerHeadline = $(".project-name h2");
if ($(window).width() <= 991 && window.location.pathname !== "/") {
  if ($(window).width() <= 768) {
    headerHeadline.html("<img src='../data/color/svg/1F64B.svg' style='padding-right: 5px; margin-bottom: -3px' width='40px' height='auto'>" + $("li.active-tab a").text());
  } else {
    headerHeadline.html(document.title);
  }
}

//------------ General Functions ------------
function shuffleArr(arr) {
  var ctr = arr.length,
    temp, index;

  // While there are elements in the array
  while (ctr > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * ctr);
    // Decrease ctr by 1
    ctr--;
    // And swap the last element with it
    temp = arr[ctr];
    arr[ctr] = arr[index];
    arr[index] = temp;
  }
  return arr;
}

//------------ nav ------------
var navItemGotClicked = false;
// mark selected item in nav
function markNavItem(item) {
  // get corresponding nav-item
  var navItem = $("#nav-items").find("[data-item='" + item + "']");
  // get corresponding mainMenu
  var mainMenu = navItem.hasClass("mainmenu") ? navItem : navItem.parents(".mainmenu");

  // close all other expanded mainmenus
  $("#nav-items .mainmenu").not(mainMenu).each(function (idx, currMainMenu) {
    var currSubMenu = $(currMainMenu).children(".submenu")[0];
    if (currSubMenu && currSubMenu.style.maxHeight) {
      currSubMenu.style.maxHeight = null;
    }
  });

  // if item is undefined set all nav-items to unchecked
  if (item === undefined) {
    $("#nav-items").find("input:checked").prop("checked", false);
  } else {
    // expand or condense submenu (if exisiting) if mainmenu was clicked and always expand submenu if submenu item was clicked
    var subMenu = mainMenu.children(".submenu")[0];
    if (subMenu) {
      if (subMenu.style.maxHeight && navItem.hasClass("mainmenu") && navItemGotClicked) {
        subMenu.style.maxHeight = null;
      } else {
        subMenu.style.maxHeight = subMenu.scrollHeight + "px";
      }
    }

    // mark (sub-)category in nav-bar as selected
    $(navItem.find("input")[0]).prop("checked", true);
  }

  navItemGotClicked = false;
}


$(document).ready(function () {
  //------------ Initialization ------------
  $("#impressum-wrapper .popover-wrapper").css("display", "flex").hide();

  //------------ Event listeners ------------
  // nav-item click listener for smooth scroll
  var navigationItems = $("#nav-items");
  if (navigationItems) {
    navigationItems.on("click", "a[href^='#']", function () {
      var href = $(this).attr("href");
      // only scroll if scrollPos is different from current pos
      if (Math.floor($(href).offset().top) != $("main").offset().top) {
        $("main").animate({
          scrollTop: $(href).position().top
        }, 500);
      }
      // mark corresponding nav-item and handle submenu expansion
      navItemGotClicked = true;
      markNavItem(href.substring(href.indexOf("#") + 1, href.length));
    });
  }

  // click listener to show impressum modal
  $("#impressumLink").click(function (e) {
    e.preventDefault();
    $("#impressum-wrapper .popover-wrapper").show();
  });

  // close overlay
  $("#close-impressum-wrapper").click(function () {
    $("#impressum-wrapper .popover-wrapper").fadeOut(400);
  });

  // toggle mobile menu
  $(".mobile-toggle").click(function () {
    $("header.page-header").toggleClass("menu-open");
    $("html, body").toggleClass("overflow-hidden");
  });

  // icon category toggle menu
  $(".category-toggle").click(function () {
    var nav = $(".nav-left");
    nav.addClass("mobile-show");
    $(".mainmenu").click(function () {
      $(".submenu li").click(function () {
        nav.removeClass("mobile-show");
      });
    });
    $(".category-close").click(function () {
      nav.removeClass("mobile-show");
    });
  });
});
