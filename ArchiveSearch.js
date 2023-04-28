//let archive = JSON.parse("OracleArchives.json");
let archive;
let months = [];
let days = [];
let matchList;
let diff;

let date = new Date();

let m = date.getMonth() + 1;
let d = date.getDate();
let searchDepth = 200;
let results = 10;

if (window.location.search) {
  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("month")) {
    m = urlParams.get("month");
  }
  if (urlParams.get("day")) {
    d = urlParams.get("day");
  }
  if (urlParams.get("depth")) {
    searchDepth = urlParams.get("depth");
  }
  if (urlParams.get("results")) {
    results = urlParams.get("results");
  }
}

let objs = [];
let pdfs = {};
let imgs = {};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function getIMG(archIndex) {
  let n = archive[archIndex]["Link"].split("/id/")[1];
  let flink = `https://cdm16120.contentdm.oclc.org/digital/api/collections/p16120coll52/items/${n}/false`;
  let x = await fetch(flink);
  return x.json();
}

let compareMonth = function (month, returnCount) {
  let match = [];
  let dist;
  for (let i = 0; i < months.length; i++) {
    dist = Math.abs(month - months[i]);
    if (dist == 0) {
      match.push(i);
    }
    if (match.length >= returnCount) {
      break;
    }
  }
  return match;
};

let dayOrder = function (day) {
  diff = {};
  for (let i = 0; i < matchList.length; i++) {
    diff[matchList[i]] = Math.abs(day - days[matchList[i]]);
  }
  matchList.sort((a, b) => diff[a] - diff[b]);
};

$.getJSON("OracleArchives.json", function (data) {
  archive = data;
  shuffleArray(archive);
  //return archive;
})
  .then(function () {
    for (let i = 0; i < archive.length; i++) {
      months.push(archive[i]["Month"]);
      days.push(archive[i]["Day"]);
    }
    //return months;
  })
  .then(function () {
    matchList = compareMonth(m, searchDepth);
  })
  .then(function () {
    dayOrder(d);
    matchList = matchList.slice(0, results);
  })
  .then(function () {
    let output = [];
    let rc = document.getElementById("resultsContainer");

    for (let i of matchList) {
      console.log(archive[i]);
      //output.push(archive[i]);
      let x = getIMG(i);
      x.then(function (resp) {
        //console.log(resp);
        pdfs[i] =
          "https://cdm16120.contentdm.oclc.org/digital" + resp["downloadUri"];
        imgs[i] = resp["imageUri"];
      }).then(function () {
        rc.innerHTML += `<div class="result"><p class="issue">Oracle ${
          archive[i]["Year"]
        }-${archive[i]["Month"]}${
          (archive[i]["Day"] > 0) * ("-" + archive[i]["Day"])
        } </br><a class="archLink" href=${
          archive[i]["Link"]
        }> Archives Page</a></p> </br> <a href=${pdfs[i]}><img src=${
          imgs[i]
        }></br><div>`;
        objs.push(x);
      });
    }
  });
