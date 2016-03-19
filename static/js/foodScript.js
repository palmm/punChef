var linkJSON, punJSON;
var links = new Array();
var puns = new Array();

var foodType = 0;
var pictureNumber = 0;
var punNumber = 0;
var waitingForPicture = false;

var loadingImages = [];
var preLoadedPictures = [];
var holdingPuns = [];
var goodPuns = []; // I think the name of this variable is ironic?

var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var aboutTextDown = false;

init();

function init() {
  // Parses and loads JSON for puns and food then loads 8 pictures to pre load
  getJSON(function (){
    loadPictures(8)
  });

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
    nextImage(loadPictures(1));
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

  aboutTextDown = !aboutTextDown;
}

function getJSON (callback) {
  var doneSaving1 = false;
  var doneSaving2 = false;

  $.getJSON("./static/other/links.json", function(data) {
    linkJSON = data;
  }).success(function () {
    var foodTypeNumber = 0;

    $.each(linkJSON, function(i, food) {
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

    doneSaving1 = true;

    if (typeof callback=="function" && doneSaving2) {
      callback();
    }
  });

  $.getJSON("./static/other/puns.json", function(data) {
    punJSON = data;
  }).success(function () {
    var punTypeNumber = 0;
    $.each(punJSON, function(i, food) {
        $.each(food, function(j, pun) {
          puns[punTypeNumber] = new Array();

          for (var i = 0; i < pun.length; i++) {
            puns[punTypeNumber].push(pun[i].text);
          }

          punTypeNumber = punTypeNumber + 1;
        });
    });

    doneSaving2 = true;

    if (typeof callback=="function" && doneSaving1) {
      callback();
    }
  });
}

// Takes toLoad (int), creates that number of images and starts loading them
// When images are done loading, they are pushed onto preLoadedPictures and
// a relevant pun is pushed onto pun aray
function loadPictures (toLoad) {
  for (i = 0; i < toLoad; i++) {
    var imageNumber = loadingImages.length; // will always return 'next' array elem
    loadingImages[imageNumber] = new Image();
    holdingPuns[imageNumber] = new String();

    generateRandoms(
      function () {
        loadingImages[imageNumber].src = links[foodType][pictureNumber];
        holdingPuns[imageNumber] = puns[foodType][punNumber];

        $(loadingImages[imageNumber]).on('load', function() {
          var thisNumber = loadingImages.indexOf(this);

          //remove the image and pun once image is loaded
          //push onto final waiting arrays
          preLoadedPictures.push(this);
          goodPuns.push(holdingPuns[thisNumber])

          loadingImages = removeArrayElement(thisNumber, loadingImages);
          holdingPuns = removeArrayElement(thisNumber, holdingPuns);

          if(waitingForPicture) {
            nextImage(loadPictures(1));
          }
        });
      }
    );
  }
}

// used by load function to remove loaded images once they're done
function removeArrayElement (elemToRemove, array) {
  var newArray = [];

  for (i = 0; i < array.length; i++)
    if(i != elemToRemove)
      newArray.push(array[i]);

  return newArray;
}

// Generate random food and picture of that food and callback for synchronicity
function generateRandoms (callback) {
  foodType = Math.floor(Math.random() * links.length);
  pictureNumber = Math.floor(Math.random() * links[foodType].length);
  punNumber = Math.floor(Math.random() * puns[foodType].length);

  if (typeof callback=="function") callback();
}

// Change the image and pun displayed by popping off from array of loaded pun and pictures
function nextImage () {
  var image = preLoadedPictures.pop().src;
  var pun = goodPuns.pop();

  image = 'url(' + image + ')';
  $('.pictureContainer').css('background-image', image);
  $('#pun').html(pun);

  if(waitingForPicture) {
    waitingForPicture = false;
    hideSpinner();
  }
}

function showSpinner () {
  $("#spinner").css("display", "inline");
}

function hideSpinner () {
  $("#spinner").css("display", "none");
}
