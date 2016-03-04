var jsonData;
var links = new Array();

var foodType = 0;
var pictureNumber = 0;
var waitingForPicture = false;

var preLoadedPictures = [];
var loadingImages = [];

var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var aboutTextDown = false;

init();

function init() {
  parseJSON(saveJSONToArray);

  //Only have 2 image sizes for better fetching of cache on image server
  if (viewWidth >= 1920) {
    viewWidth = 1920;
  } else {
    viewWidth = 1280;
  }
}

document.getElementById('generateButton').onclick = function () {
  // Only change image if there is an image preloaded
  if (preLoadedPictures.length > 0) {
    changeImage(loadPictures(1));
    console.log(preLoadedPictures);
  } else {
    showSpinner();
    waitingForPicture = true;
  }
}

document.getElementById('headerAbout').onclick = function () {
  if(aboutTextDown) {
    $("#aboutArrow").css("transform", "rotate(0deg)");
    $("#moreInfoBar").css("max-height", "0px");
  } else {
    $("#aboutArrow").css("transform", "rotate(180deg)");
    $("#moreInfoBar").css("max-height", "70px");
  }

  console.log(aboutTextDown);
  aboutTextDown = !aboutTextDown;
}

function parseJSON (callback) {
  $.getJSON("./static/other/links.json", function(data) {
    jsonData = data;
  }).success(function () {
    if (typeof callback=="function") callback();
  });
}

function saveJSONToArray () {
  var foodTypeNumber = 0;
  $.each(jsonData, function(i, food) {
      $.each(food, function(j, url) {
        links[foodTypeNumber] = new Array();

        for (var i = 0; i < url.length; i++) {
          var unRouted = url[i].url;
          var routed1, routed2;
          var totalLink;

          // Routing thorught rsz.io to downsize images and save on image sizes
          routed1 = unRouted.substring(0, unRouted.indexOf(".com")+4);
          routed2 = unRouted.substring(unRouted.indexOf(".com")+4, unRouted.length);

          totalLink = routed1 + '.rsz.io' + routed2 + '?width=' + viewWidth;

          links[foodTypeNumber].push(totalLink);
        }

        foodTypeNumber = foodTypeNumber + 1;
      });
  });

  // Preload/load/pick picture to get the ball rolling
  generateRandoms(loadPictures(8));
}

// Takes toLoad (int), creates that number of images and starts loading them
// When images are done loading, they are pushed onto preLoadedPictures
function loadPictures (toLoad) {
  for (i = 0; i < toLoad; ++i) {
    loadingImages[i] = new Image();
    generateRandoms(
      function () {
        loadingImages[i].src = links[foodType][pictureNumber];

        $(loadingImages[i]).on('load', function() {
          preLoadedPictures.push(this);
          if(waitingForPicture) {
            changeImage(loadPictures(1));
          }

          // TODO: remove (testing)
          // console.log(preLoadedPictures);
        });
      }
    );
  }
}

// Generate random food and picture of that food and callback for synchronicity
function generateRandoms (callback) {
  foodType = Math.floor(Math.random() * links.length);
  pictureNumber = Math.floor(Math.random() * links[foodType].length);

  if (typeof callback=="function") callback();
}

function changeImage () {
  var image = preLoadedPictures.pop().src;
  image = 'url(' + image + ')';
  $('.pictureContainer').css('background-image', image);

  if(waitingForPicture) {
    waitingForPicture = false;
    hideSpinner();
  }
}

function showSpinner () {
  $("#spinner").css("display", "inline");
  console.log("Showing spinner");
}

function hideSpinner () {
  $("#spinner").css("display", "none");
  console.log("hidding spinner");
}
