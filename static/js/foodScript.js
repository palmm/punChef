var jsonData;
var links = new Array();

var foodType = 0;
var pictureNumber = 0;

var preLoadedPictures = [];
var loadingImages = [];

var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var googleImageAPI1 = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=';
var googleImageAPI2 = '&container=focus&resize_w=' + viewWidth + '&refresh=2592000';

init();

function init() {
  // setCSS();
  parseJSON(saveJSONToArray);
}

document.getElementById('foodPicture').onclick = function () {
  // Only change image if there is an image preloaded
  if (preLoadedPictures.length > 0) {
    changeImage(loadPictures(1));
    console.log(preLoadedPictures);
  }
}

// function setCSS () {
//   console.log(viewWidth + 'x' + viewHeight);
//   $('.pictureContainer').css({height: viewHeight-5, width: viewWidth-5});
// }

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
          links[foodTypeNumber].push(url[i].url);
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
        loadingImages[i].src = googleImageAPI1 + links[foodType][pictureNumber] + googleImageAPI2;

        $(loadingImages[i]).on('load', function() {
          preLoadedPictures.push(this);
          console.log(preLoadedPictures);
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
  $('#foodPicture').attr('src', preLoadedPictures.pop().src);
}
