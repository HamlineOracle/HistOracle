//let archive = JSON.parse("OracleArchives.json");
let archive;
let months = [];
let days = [];
let matchList;
let diff;

let date = new Date();

let m = date.getMonth() + 1;
let d = date.getDate();
let searchDepth = 300;
let results = 10;
let shuffle = false;
let random = false;

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
  if (urlParams.get("shuffle") == "true") {
    shuffle = true;
  }
  if (urlParams.get("random") == "true") {
    random = true;
  }
}

function rdate() {
  m = Math.floor(Math.random() * 12 + 1);
  d = Math.floor(Math.random() * 30 + 1);
}

function upDate(cDate) {
  if (cDate.length == 0 || true) {
    cDate = document.getElementById("cDate").value;
    console.log(cDate);
    return false;
  }
  if (cDate.length <= 5) {
    [m, d] = cDate.split("/");
  }
  window.location.href = `https://hamlineoracle.github.io/HistOracle/?month=${m}&day=${d}`;
  return false;
}

if (random) {
  rdate();
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
    if (dist <= 0 + +shuffle * 6) {
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
    //let dayAdjustment = (m - months[matchList[i]]) * 30;
    diff[matchList[i]] = Math.abs(day - days[matchList[i]]);
  }
  if (!shuffle) {
    matchList.sort((a, b) => diff[a] - diff[b]);
  }
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
        console.log(resp);
        pdfs[
          i
        ] = `https://cdm16120.contentdm.oclc.org/digital/custom/BookReader?manifest=https://cdm16120.contentdm.oclc.org//digital/iiif-info/p16120coll52/${resp["parentId"]}/manifest.json`;
        imgs[i] = resp["imageUri"];
      }).then(function () {
        rc.innerHTML += `<div class="result"><p class="issue">Oracle ${
          archive[i]["Year"]
        }-${archive[i]["Month"]}${
          ["", "-" + archive[i]["Day"]][+(archive[i]["Day"] > 0)]
        } </br><a class="archLink" href=${
          archive[i]["Link"]
        }> Archives Page</a></p> </br> <a href=${pdfs[i]}><img src=${
          imgs[i]
        }></br><div>`;
        objs.push(x);
      });
    }
  });
