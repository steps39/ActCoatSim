var g_nextExample = "";
var g_currentExample = "leaching";
var frames = 0;
var world;
var leachProgress = [];
leachProgress[0] = [];
leachProgress[0].push([0, 0]);
var multipleLeaches = [];
var currentLabel;
var series = 0;
var firstTime;
var g_running = true;
var g_saveAll = false;
var maxFrames, maxLeached;
var particleType = 0, noParticleTypes = 1, particleTypes = [];
var ms = {noSamples:5, manualInter:false, coatWidth:96, coatHeight:48, coatCellSize:6, noLayers:1, layer1Height:24, layer2Height:24,
          topWater:true, depthOfWater:10, topcoat:false, depthOfTopcoat:10,
          scribed:false, sizeOfScribe:10, diffusionTest:false, gridFromCA:false, noStrucSteps:15, probCA:0.45, 
          square:false, radius:[10], radius2:[5], noOfParticles:[20], noOfParticles2:[20], noOfCuts:[4], noOfCuts:[4],
          minimumParticle:[3], maximumParticle:[10], minimumPVC:[0.1], maximumPVC:[1.0], minimumPVC2:[0.1], maximumPVC2:[1.0]};
var sp = {inhibitorDensity:[1], inhibitorSolubility:[1], probDiffuse:[1.0], probDissolve:[1.0], topLeak:true, leftLeak:false, rightLeak:false, bottomLeak:false};
var ac = {globalPlots:false, xSqrt:true, saveGrids:false, saveGraphs:false, captureAnimation:false, capturePlot:false, stepFrames:3, plotFrames:10,
          endFraction:0.5, noVisualUpdates:false};
var coatWidth = 96, coatHeight = 96, coatCellSize = 6;
var g_quickFinish, g_allFinish, g_allClosed, rcoatingNo, inhibitorAccessible = [], inhibitorTotal = [];
var g_grid;
var loopFinished = false;
var allStuff = [];
var discInhibitor = [];
var firstTime = true;
var myCanvas, myPlot, ctx, renderer, stage, meter, textures, pixels, pixiVersion, fileNameStem;
var gridCapturer = null;
var plotCapturer = null;
var plotPlot;
var fileNameStem;
var legendContainer = document.getElementById("Legend");
let ccOptions = {
  /* Recording options */
  format: "webm",
  framerate: "30FPS",
  start: function () {
    startRecording();
  },
  stop: function () {
    stopRecording();
  },
};

function startRecording(fileNameStem,coatingNo) {
  var lcapturer;
  lcapturer = new CCapture({
    name: generateFileNameVideo(generateFileNameSim(fileNameStem) + "CN" + (zeroNumber(coatingNo + 1,2))),
    verbose: false,
    display: false,
    framerate: parseInt(ccOptions.framerate),
    motionBlurFrames: 0,
    quality: 100,
    format: ccOptions.format,
    workersPath: "dist/src/",
    timeLimit: 0,
    frameLimit: 0,
    autoSaveTime:600,
  });
  lcapturer.start();
  return lcapturer;
}

function stopRecording(lcapturer){
  lcapturer.stop();
  lcapturer.save();
}

/*function zeroNumber(item) {
  let sitem = item.toString();
  if (item < 10) {
    sitem = "0" + sitem;
  }
  return sitem;
}*/

function zeroNumber(item, noDigits) {
  let sitem = item.toString();
  if(item == 0) {item = 1};
  for (let i=noDigits; i--;i>1){
    if (item < Math.pow(10,i)) {
      sitem = "0" + sitem;
    }
  }
  return sitem;
}

function generateFileNameStem() {
  let d = new Date();
  let name =
  zeroNumber(d.getFullYear() % 100,2) +
  zeroNumber(d.getMonth() + 1,2) +
  zeroNumber(d.getDate(),2) +
  zeroNumber(d.getHours(),2) +
  zeroNumber(d.getMinutes(),2);
  if (ms.diffusionTest) {
    name += "DT";
  } else {
    if (ms.gridFromCA) {
      name += "CA";
    } else {
      name += "PP";
    }
    if (ms.topcoat) {
      name += "T" + ms.depthOfTopcoat;
    }
    if (ms.topWater) {
      name += "W" + ms.depthOfWater;
    }
    if (ms.scribed) {
      name += "S" + ms.sizeOfScribe;
    }
    if (ms.manualInter) {
      name += "M";
    }
    if (!ms.gridFromCA) {
      for (let pt = 0; pt < noParticleTypes; pt++) {
        name += "R" + Math.round(ms.radius[pt]) + "N" + ms.noOfCuts[pt];
      }
      if (ms.noLayers === 2) {
        for (let pt = 0; pt < noParticleTypes; pt++) {
          name += "R" + Math.round(ms.radius2[pt]) + "N" + ms.noOfCuts2[pt];
        }
      }
    }
  }
  return name;
}

function generateFileNameSim(name) {
  if (ms.diffusionTest) {
    return name;
  } else {
    for (let pt = 0; pt < noParticleTypes; pt++) {
      name +=
        "ID" + zeroNumber(Math.round(sp.inhibitorDensity[pt]),2) +
        "IS" + zeroNumber(Math.round(sp.inhibitorSolubility[pt]),2) +
        "PS" + zeroNumber(Math.round(sp.probDissolve[pt]*1000),3) +
        "PD" + zeroNumber(Math.round(sp.probDiffuse[pt]*1000),3);
    }
  }
  if (sp.topLeak) {
    name += "LT";
  }
  if (sp.leftLeak) {
    name += "LL";
  }
  if (sp.bottomLeak) {
    name += "LB";
  }
  if (sp.rightLeak) {
    name += "LR";
  }
  name += "TF" + zeroNumber(Math.round(100 * ac.endFraction),2);
  return name;
}

function generateFileNameVideo(name) {
  for (let pt = 0; pt < noParticleTypes; pt++) {
    name +=
      "PVC" + zeroNumber(Math.round(100 * world.inhibitorTotal[pt] / world.coatingDry), 2) +
      "AC" + zeroNumber(Math.round(100 * world.inhibitorAccessible[pt] / world.inhibitorTotal[pt]), 2);
    return name;
  }
}

function changeInt(htmlObject) {
  return parseInt($(htmlObject).val(), 10);
}

function changeArray(htmlObject,minValue,maxValue) {
  var str = $(htmlObject).val();
  var values = str.split(",");
  for (let index = 0; index < values.length; index++) {
    var element = 1.0 * values[index];
    if (element<minValue || element>maxValue) {
      console.log("Correct - " + htmlObject + " an element is less than " + minValue + " or greater than " + maxValue);
      break;
    }
    values[index] = element;
  }
  console.log(htmlObject + " " + values);
  return values;
}

function changeFloat(htmlObject) {
  return parseFloat($(htmlObject).val(), 10);
}

function changeCheck(htmlObject) {
  return $(htmlObject).prop("checked");
}

function updateMSToPage() {
console.log("updateMSToPage");
  $("#nocoatings").val(ms.noSamples);
  $("#manualinter").prop("checked",ms.manualInter);
  $("#coatwidth").val(ms.coatWidth);
  $("#coatheight").val(ms.coatHeight);
  $("#diffusiontest").prop("checked",ms.diffusionTest);
  $("#waterontop").prop("checked",ms.topWater);
  $("#depthofwater").val(ms.depthOfWater);
  $("#topcoated").prop("checked",ms.topcoat);
  $("#depthoftopcoat").val(ms.depthOfTopcoat);
  $("#scribed").prop("checked",ms.scribed);
  $("#sizeofscribe").val(ms.sizeOfScribe);
  $("#gridfromca").prop("checked",ms.gridFromCA);
  $("#nostrucsteps").val(ms.noStrucSteps);
  $("#square").prop("checked",ms.square);
  $("#nolayers").val(ms.noLayers);
  $("#noofparticles").val(ms.noOfParticles);
  $("#noofparticles2").val(ms.noOfParticles2);
  $("#layer1height").val(ms.layer1height);
  $("#layer2height").val(ms.layer2height);
  $("#radius").val(ms.radius);
  $("#radius2").val(ms.radius2);
  $("#noofcuts").val(ms.noOfCuts);
  $("#noofcuts2").val(ms.noOfCuts2);
  $("#minparticle").val(ms.minimumParticle);
  $("#maxparticle").val(ms.maximumParticle);
  $("#minimumpvc").val(ms.minimumPVC);
  $("#maximumpvc").val(ms.maximumPVC);
  $("#minimumpvc2").val(ms.minimumPVC2);
  $("#maximumpvc2").val(ms.maximumPVC2);
}

function updateFromPage() {
  ms.noSamples = changeInt("#nocoatings");
  ms.manualInter = changeCheck("#manualinter");
  ms.coatWidth = changeInt("#coatwidth");
  ms.coatHeight = changeInt("#coatheight");
  ms.diffusionTest = changeCheck("#diffusiontest");
  ms.topWater = changeCheck("#waterontop");
  ms.depthOfWater = changeInt("#depthofwater");
  ms.topcoat = changeCheck("#topcoated");
  ms.depthOfTopcoat = changeInt("#depthoftopcoat");
  ms.scribed = changeCheck("#scribed");
  ms.sizeOfScribe = changeInt("#sizeofscribe");
  ms.gridFromCA = changeCheck("#gridfromca");
  ms.noStrucSteps = changeInt("#nostrucsteps");
  ms.square = changeCheck("#square");
  ms.noLayers = changeInt("#nolayers");
  ms.noOfParticles = changeArray("#noofparticles",1,1000);
  ms.noOfParticles2 = changeArray("#noofparticles2",1,1000);
  ms.layer1Height = changeInt("#layer1height");
  ms.layer2Height = changeInt("#layer2height");
  ms.radius = changeArray("#radius",1,50);
  ms.radius2 = changeArray("#radius2",1,50);
  ms.noOfCuts = changeArray("#noofcuts",0,10);
  ms.noOfCuts2 = changeArray("#noofcuts2",0,10);
  ms.minimumParticle = changeArray("#minparticle",1,200);
  ms.maximumParticle = changeArray("#maxparticle",1,200);
  ms.minimumPVC = changeArray("#minimumpvc",0.01,1.0);
  ms.maximumPVC = changeArray("#maximumpvc",0.01,1.0);
  ms.minimumPVC2 = changeArray("#minimumpvc2",0.01,1.0);
  ms.maximumPVC2 = changeArray("#maximumpvc2",0.01,1.0);
  sp.inhibitorDensity = changeArray("#inhibitordensity",1,100);
  sp.inhibitorSolubility = changeArray("#inhibitorsolubility",1,100);
  sp.probDiffuse = changeArray("#probdiff",0,1);
  sp.probDissolve = changeArray("#probsol",0,1);
  sp.topLeak = changeCheck("#topleak");
  sp.leftLeak = changeCheck("#leftleak");
  sp.rightLeak = changeCheck("#rightleak");
  sp.bottomLeak = changeCheck("#bottomleak");
  ac.globalPlots = changeCheck("#plotCheckbox");
  ac.xSqrt = changeCheck("#xsqrt");
  ac.saveGrids = changeCheck("#savegrids");
  ac.saveGraphs = changeCheck("#savegraphs");
  ac.captureAnimation = changeCheck("#captureanimation");
  ac.capturePlot = changeCheck("#captureplot");
  ac.stepFrames = changeInt("#numFrames");
  ac.plotFrames = changeInt("#numPlots");
  ac.endFraction = changeFloat("#endfraction");
  ac.noVisualUpdates = changeCheck("#noupdates");
  checkMultiInhibParams();
}

function checkMultiInhibParams() {
  // Allows single parameter to be used for all particle types
  noParticleTypes = 1;
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.noOfParticles);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.noOfParticles2);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.radius);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.radius2);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.noOfCuts);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.noOfCuts2);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.minimumParticle);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.maximumParticle);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.minimumPVC);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.maximumPVC);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.minimumPVC2);
  noParticleTypes = checkArrayLengths(noParticleTypes,ms.maximumPVC2);
  noParticleTypes = checkArrayLengths(noParticleTypes,sp.inhibitorDensity);
  noParticleTypes = checkArrayLengths(noParticleTypes,sp.inhibitorSolubility);
  noParticleTypes = checkArrayLengths(noParticleTypes,sp.probDiffuse);
  noParticleTypes = checkArrayLengths(noParticleTypes,sp.probDissolve);
  // Replicate single parameter for all particle types
  ms.noOfParticles = correctArrayLengths(noParticleTypes,ms.noOfParticles);
  ms.noOfParticles2 = correctArrayLengths(noParticleTypes,ms.noOfParticles2);
  ms.radius = correctArrayLengths(noParticleTypes,ms.radius);
  ms.radius2 = correctArrayLengths(noParticleTypes,ms.radius2);
  ms.noOfCuts = correctArrayLengths(noParticleTypes,ms.noOfCuts);
  ms.noOfCuts2 = correctArrayLengths(noParticleTypes,ms.noOfCuts2);
  ms.minimumParticle = correctArrayLengths(noParticleTypes,ms.minimumParticle);
  ms.maximumParticle = correctArrayLengths(noParticleTypes,ms.maximumParticle);
  ms.minimumPVC = correctArrayLengths(noParticleTypes,ms.minimumPVC);
  ms.maximumPVC = correctArrayLengths(noParticleTypes,ms.maximumPVC);
  ms.minimumPVC2 = correctArrayLengths(noParticleTypes,ms.minimumPVC2);
  ms.maximumPVC2 = correctArrayLengths(noParticleTypes,ms.maximumPVC2);
  sp.inhibitorDensity = correctArrayLengths(noParticleTypes,sp.inhibitorDensity);
console.log("Before "+sp.inhibitorSolubility);
  sp.inhibitorSolubility = correctArrayLengths(noParticleTypes,sp.inhibitorSolubility);
console.log("After "+sp.inhibitorSolubility);
  sp.probDiffuse = correctArrayLengths(noParticleTypes,sp.probDiffuse);
  sp.probDissolve = correctArrayLengths(noParticleTypes,sp.probDissolve);
}

function checkArrayLengths(noPTs,paramArray) {
  if (noPTs < paramArray.length){
    noPTs = paramArray.length;
  };
  return noPTs;
}

function correctArrayLengths(noPTs,paramArray) {
  if (noPTs > paramArray.length){
    const element = paramArray[0];
    for (let i = 1; i < noPTs; i++) {
      paramArray[i] = element;
    };
  };
  return paramArray;
}

window.onload = function () {
  // Check for the various File API support.
  pixiVersion = PIXI.VERSION;
  console.log("PixiJS version - " + pixiVersion);
  pixiVersion = pixiVersion.charAt(0);
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  } else {
    alert("The File APIs are not fully supported in this browser.");
  }
  $(".exampleLink").on("click", function (evt) {
    multipleLeaches = [];
    loadExample($(this).attr("data-example"));
    //?    g_running = 1;
  });
  $("#btnReload").on("click", function (evt) {
    reloadExample(g_currentExample);
  });
  $("#btnPause").on("click", function (evt) {
    changeRunningState();
  });
  $("#btnStart").on("click", function (evt) {
    updateFromPage();
    loadExample(g_currentExample);
    //?g_running = 1;
  });
  $("#btnSaveData").on("click", function (evt) {
    saveEverything();
  });
  $("#btnReloadData").on("click", function (evt) {
    reloadData();
  });
  $("#btnAllFinish").on("click", function (evt) {
    g_allFinish = true;
  });
  $("#btnQuickFinish").on("click", function (evt) {
    g_quickFinish = true;
  });

  $("#endfraction").on("change", function (evt) {
    ac.endFraction = changeFloat("#endfraction");
  });
  $("#numFrames").on("change", function (evt) {
    ac.stepFrames = changeInt("#numFrames");
  });
  $("#numPlots").on("change", function (evt) {
    ac.plotFrames = changeInt("#numPlots");
  });
  $("#noupdates").on("change", function (evt) {
    ac.noVisualUpdates = changeCheck("#noupdates");
  });
  $("#plotCheckbox").on("change", function (evt) {
    ac.globalPlots = changeCheck("#plotCheckbox");
  });
  $("#xsqrt").on("change", function (evt) {
    ac.xSqrt = changeCheck("#xsqrt");
  });
  updateFromPage();
  // loadExample("leaching");
  firstTime = true;
};

function saveEverything() {
  if (!g_saveAll) {
    g_saveAll = true;
    $("#btnSaveData").text("Save Nothing");
    ac.saveGrids = true;
    ac.saveGraphs = true;
    ac.captureAnimation = true;
    ac.capturePlot = true;
    $("#savegrids").prop("checked",true);
    $("#savegraphs").prop("checked",true);
    $("#captureanimation").prop("checked",true);
    $("#captureplot").prop("checked",true);
  } else {
    g_saveAll = false;
    $("#btnSaveData").text("Save Everything");
    ac.saveGrids = false;
    ac.saveGraphs = false;
    ac.captureAnimation = false;
    ac.capturePlot = false;
    $("#savegrids").prop("checked",false);
    $("#savegraphs").prop("checked",false);
    $("#captureanimation").prop("checked",false);
    $("#captureplot").prop("checked",false);
  }
}

function setupAnimation(){
console.log("setting up Animation");
  myCanvas = document.getElementById("myCanvas");
  myCanvas.width = world.cellSize * world.width;
  myCanvas.height = world.cellSize * world.height;
  if (ac.captureAnimation) {
    gridCapturer = startRecording(fileNameStem,coatingNo);
  }
  if (pixiVersion > 4) {
    renderer = new PIXI.Application({
      width: myCanvas.width,
      height: myCanvas.height,
      view: myCanvas,
    });
    stage = renderer.stage;
    frameText = new PIXI.Text("#: 0");
    frameText.x = 5;
    frameText.y = 5;
    frameText.style.fill = "red";
    frameText.style.fontSize = "10";
    stage.addChild(frameText);
  } else {
    renderer =
      renderer ||
      new PIXI.autoDetectRenderer(
        myCanvas.width,
        myCanvas.height,
        myCanvas,
        { antialias: true, transparent: false }
      );
    // create the root of the scene graph
    stage = stage || new PIXI.Stage(0xffffff);
  }
  textures = [];
  pixels = [];
// local but I think only used here - textureCanvas, textureCtx, baseTexture
  var textureCanvas = document.createElement("canvas");
  textureCanvas.width = world.cellSize * world.palette.length;
  textureCanvas.height = world.cellSize;
  var textureCtx = textureCanvas.getContext("2d");
  for (var i = 0; i < world.palette.length; i++) {
    textureCtx.fillStyle = "rgba(" + world.palette[i] + ")";
    textureCtx.fillRect(
      i * world.cellSize,
      0,
      world.cellSize,
      world.cellSize
    );
  }
  if (pixiVersion > 4) {
    var baseTexture = new PIXI.BaseTexture.from(textureCanvas);
  } else {
    var baseTexture = new PIXI.BaseTexture.fromCanvas(textureCanvas);
  }
  for (var i = 0; i < world.palette.length; i++) {
    textures.push(
      new PIXI.Texture(
        baseTexture,
        new PIXI.Rectangle(
          i * world.cellSize,
          0,
          world.cellSize,
          world.cellSize
        )
      )
    );
  }
  drawGrid(pixels, world, stage, textures);
  renderer.render(stage);
console.log("render 1 - ",frames);
console.log("set up Animation");
}

function loop() {
//console.log("into loop");
  if (g_allFinish && g_allClosed) {
    return;
  }
  if (firstTime) {
//console.log("into loop - first time");
    try {
      var rrecord;
      rrecord = [];
      coatingNo += 1;
      if (allStuff.length < coatingNo + 1) {
        return;
      }
      console.log("About to simulate system " + (coatingNo + 1));
      // rrecord = allStuff.shift();
      rrecord = allStuff[coatingNo];
      if (leachProgress[0].length > 1) {
        multipleLeaches=multipleLeaches.concat(stuffToPlot);
//        multipleLeaches.push({ label: currentLabel, data: leachProgress });
      } else {
        multipleLeaches = [];
      }
      grid = rrecord[0];
      particleID = rrecord[1];
      coatingDry = rrecord[2][4];
      binderTotal = rrecord[2][5];
      inhibitorTotal = rrecord[2][6];
      inhibitorAccessible = rrecord[2][7];
/*console.log("grid ",math.sum(grid));
console.log("particleID ",math.sum(particleID));
console.log("Inhibitor total accessible ", inhibitorTotal, inhibitorAccessible);
console.log("Record[2]: ",coatingNo," ",rrecord[2][6]," ",rrecord[2][7]);
console.log("AllStuff: ",coatingNo," ",allStuff[coatingNo][2][6]," ",allStuff[coatingNo][2][7]);*/
      firstTime = true;
      //?      g_running = 1;
      frames = 0;
      leachProgress = [];
      leachProgress.push([0, 0]);
      world = simulation(ms.coatWidth, ms.coatHeight, ms.coatCellSize);
      //      world = makeTest();
      frames = 0;
      series += 1;
      leachProgress = [];
      world.leached = [];
      world.binderTotal = binderTotal;
      //      world.coatingDry = binderTotal;
      world.inhibitorTotal = inhibitorTotal;// * sp.inhibitorDensity[pt];
      world.inhibitorAccessible = inhibitorAccessible;// * sp.inhibitorDensity[pt];
      for (let pt = 0; pt < noParticleTypes; pt++) {
        leachProgress[pt] = [];
        leachProgress[pt].push([0, 0]);
        world.leached[pt] = 0;
        //        world.inhibitorTotal[pt] = inhibitorTotal[pt];// * sp.inhibitorDensity[pt];
        //        world.inhibitorAccessible[pt] = inhibitorAccessible[pt];// * sp.inhibitorDensity[pt];
      }
      world.coatingDry =
        (world.height - world.depthOfWater) * (world.width);// - world.sizeOfScribe);// * sp.inhibitorDensity;
      currentLabel = [];
      for (let pt = 0; pt < noParticleTypes; pt++) {
        currentLabel[pt] = "C" + zeroNumber(coatingNo, 2);
        if (noParticleTypes > 1) {
          currentLabel[pt] += "P" + zeroNumber(pt, 2);
        }
        currentLabel[pt] += ": " +
          "Inhibitor PVC: " +
          (world.inhibitorTotal[pt] / world.coatingDry).toPrecision(2) +
          "  Accessible: " +
          (world.inhibitorAccessible[pt] / world.inhibitorTotal[pt]).toPrecision(2) +
          "  Inhib - Den: " +
          sp.inhibitorDensity[pt] +
          "  Sol: " +
          sp.inhibitorSolubility[pt] +
          "  Prob - Diff: " +
          sp.probDiffuse[pt] +
          "  Diss: " +
          sp.probDissolve[pt];
      };
      console.log(currentLabel);

      setupAnimation();

      $("#btnApplyChanges").removeClass("btn-danger");
      $("#btnApplyChanges").addClass("btn-success");
    } catch (ex) {
      console.log(ex);
      $("#btnApplyChanges").removeClass("btn-success");
      $("#btnApplyChanges").addClass("btn-danger");
    }
    firstTime = false;
  }
  if (g_running) {
    // Draw before anything happens
    if (frames == 0) {
      if (ac.captureAnimation) {
        updateGrid(pixels, world, textures);
        stage.addChild(frameText);
        renderer.render(stage);
        gridCapturer.capture(renderer.view);
//console.log("render 2 - ",frames);
      }
    }
    world.step();
    for (let pt = 0; pt < noParticleTypes; pt++) {
      leachProgress[pt].push([frames, world.leached[pt] / (world.coatingDry * sp.inhibitorDensity[pt])]);
    }
     // limit speed of simulation
    if (frames % ac.stepFrames === 0) {
      $("#currentstep").text(frames);
      if (!ac.noVisualUpdates) {
        updateGrid(pixels, world, textures);
        frameText.text = "#: " + frames;
        stage.addChild(frameText);
        renderer.render(stage);
//console.log("render 3 - ",frames);
      }
      if (frames % ac.plotFrames === 0) {
        var xmax, ymax, y;
        for (let pt = 0; pt < noParticleTypes; pt++) {
          y = world.leached[pt] / (world.coatingDry * sp.inhibitorDensity[pt]);
          if (frames > maxFrames) {
            maxFrames = frames;
          }
          if (y > maxLeached) {
            maxLeached = y;
          }
          if (ac.globalPlots) {
            xmax = maxFrames;
            ymax = maxLeached;
          } else {
            xmax = frames;
            ymax = y;
          }
        }
        if (!ac.noVisualUpdates) {
          var options = {
            canvas: true,
            grid: {
              hoverable: true,
              mouseActiveRadius: 4,
              backgroundColor: "#fdfdfd",
            },
            xaxis: {
              min: 0,
              max: xmax,
              axisLabel: "Time Steps",
              transform: function (v) {
                if (ac.xSqrt) {
                  var x = Math.sqrt(v);
                } else {
                  var x = v;
                }
                return x;
              },
              inverseTransform: function (v) {
                if (ac.xSqrt) {
                  var x = v * v;
                } else {
                  var x = v;
                }
                return x;
              },
            },
            yaxis: {
              min: 0,
              max: ymax,
              axisLabel: "Cumulative Fraction of Coating Leached",
            },
            legend: { container: legendContainer, show: true },
//            legend: { container: $("#Legend"), show: true },
          };
          stuffToPlot = [];
//          stuffToPlot.push({label: currentLabel[0],data: leachProgress[0]});
          for (let pt = 0; pt < noParticleTypes; pt++) {
            stuffToPlot.push({label: currentLabel[pt],data: leachProgress[pt]});
          }
          if (multipleLeaches.length == 0) {
            plotPlot = $.plot(
              $("#Graph"),
              stuffToPlot,
              //              [{ label: currentLabel[0], data: leachProgress[0] },{ label: currentLabel[1], data: leachProgress[1] }],
              options
            );
          } else {
            plotPlot = $.plot(
              $("#Graph"),
              multipleLeaches.concat(stuffToPlot),
              options
            );
          }
          //          plotPlot.render();
          //          myPlot = plotPlot.getCanvas();
          //          myPlot.render();
        }
      }
    }
    frames++;
//    g_allFinish = changeCheck("#allfinish");
//console.log("End leaching criteria :"+coatingNo+" "+math.sum(world.leached)+" "+ac.endFraction+" "+math.sum(math.dotMultiply(world.inhibitorAccessible, sp.inhibitorDensity)));
    if (
// Need to think about whether end point should be whole pigment or individual types
// Does inhibitorAccessible just need to be number of cells but this is different to what is counted via leaching
      (math.sum(world.leached) < ac.endFraction * math.sum(math.dotMultiply(world.inhibitorAccessible, sp.inhibitorDensity))) &&
      !g_quickFinish && !g_allFinish
    ) {
      requestAnimationFrame(loop);
      if (ac.captureAnimation) {
        gridCapturer.capture(renderer.view);
      }
    } else {
//      $("#quickfinish").prop("checked", false);
console.log("IA: "+world.inhibitorAccessible+" ID: "+sp.inhibitorDensity);
      g_quickFinish = false;
      firstTime = true;
      requestAnimationFrame(loop);
      if (ac.captureAnimation) {
        renderer.render(stage);
console.log("render 4 - ",frames);
        gridCapturer.capture(renderer.view);
        stopRecording(gridCapturer);
      }
      if ((ms.noSamples == (coatingNo + 1)) || g_allFinish) {
        g_allClosed = true;
        if (ac.capturePlot) {
          if (ms.diffusionTest) {
            graphPicture('#Graph',(fileNameStem + "XYG"),coatingNo);
            graphPicture('#Legend',(fileNameStem + "XYL"),coatingNo);

          } else {
            graphPicture('#Graph',(fileNameStem+'XYG'),coatingNo);
            graphPicture('#Legend',(fileNameStem+'XYL'),coatingNo);
          }
        }
        if(ac.saveGraphs) {
          saveCurrentData();
        }
      }
    };
  };
};

function coatingBit(stuff) {
  for (let i = 0; i < ms.noSamples; i++) {
    console.log("About to make coating " + (i + 1));
    makeCoating(ms.coatWidth, ms.coatHeight, ms.coatCellSize);
    countAccessible(grid);
    var rrecord = [];
    rrecord.push(grid);
    rrecord.push(particleID);
    coatingDry = world.height - ms.depthOfWater;
    if (!ms.scribed) {
      coatingDry *= world.width;
    } else {
      coatingDry *= world.width - ms.sizeOfScribe;
    };
    console.log("Before push - Inhibitor total accessible ", inhibitorTotal,inhibitorAccessible);

    rrecord.push([
      ms.minimumPVC,
      ms.maximumPVC,
      ms.minimumParticle,
      ms.maximumParticle,
      coatingDry,
      binderTotal,
      deepCopy(inhibitorTotal),
      deepCopy(inhibitorAccessible),
    ]);
    allStuff.push(rrecord);
    for (let pt = 0; pt < noParticleTypes; pt++) {
      console.log(
        "Inhibitor PVC: " +
        (inhibitorTotal[pt] / (math.sum(inhibitorTotal[pt]) + binderTotal)).toPrecision(2) +
        " Accessible: " +
        (inhibitorAccessible[pt] / inhibitorTotal[pt]).toPrecision(2)
      );
    }
//console.log("Record[2]: ",i," ",rrecord[2][6]," ",rrecord[2][7]);
//console.log("AllStuff: ",i," ",allStuff[i][2][6]," ",allStuff[i][2][7]);
  };
  if(ac.saveGrids){
    saveGrids();
  }
};

/*function wrappedLoop() {
  return new Promise((resolve) => {
    loop();
    resolve("Done");
  });
}*/

function saveGrids() {
  var saveStuff = {
    params : ms, info : allStuff
//    ms: ms, allStuff: allStuff
  }
//  ret = JSON.stringify(allStuff);
  ret = JSON.stringify(saveStuff);
  var BB = new Blob([ret], { type: "text/plain;charset=UTF-8" });
//saving
  saveAs(BB, fileNameStem + ".json");
}

function loadGrids(allStuff) {
  for (var rrecord of allStuff) {
    //      rrecord = allStuff[i];
    grid = rrecord[0];
    particleID = rrecord[1];
    coatingDry = rrecord[2][4];
    binderTotal = rrecord[2][5];
    inhibitorTotal = rrecord[2][6];
    inhibitorAccessible = rrecord[2][7];
    console.log("Coating Dry " + coatingDry);
    console.log("Inhibitor accessible " + inhibitorAccessible);
    requestAnimationFrame(loop);
  }
}

function changeStepFrames() {
  ac.stepFrames = parseInt($("#numFrames").val(), 10);
}

function changePlotFrames() {
  ac.plotFrames = parseInt($("#numPlots").val(), 10);
}

function changeRunningState() {
  if (g_running) {
    g_running = false;
    $("#playpause").text("Play");
  } else {
    g_running = true;
    $("#playpause").text("Pause");
  }
}

function saveCurrentData() {
  if (multipleLeaches.length == 0) {
    ret = JSON.stringify(stuffToPlot);
//    ret = JSON.stringify({ label: currentLabel, data: leachProgress });
  } else {
    ret = JSON.stringify(
      multipleLeaches.concat(stuffToPlot)
//      multipleLeaches.concat({ label: currentLabel, data: leachProgress })
    );
  }
  var BB = new Blob([ret], { type: "text/plain;charset=UTF-8" });
//saving
  saveAs(BB, generateFileNameSim(fileNameStem) + "GD" + ".json");
  //	multipleLeaches = JSON.parse(ret);
  //	multipleLeaches = JSON.parse(BB.slice(contentType="text/plain;charset=UTF8"));
}

function graphPicture(element,fileNameBit,coatNo) {
  var ccanvas;
  html2canvas(document.querySelector(element)).then(function(ccanvas) {
    console.log(ccanvas);
    fileNameBit = generateFileNameSim(fileNameBit) + '.png';
    saveAs(ccanvas.toDataURL(), fileNameBit);
  });
}

function loadExample(example) {
  updateFromPage();
  allStuff = [];
  fileNameStem = generateFileNameStem();
  if (!ms.diffusionTest) {
    coatingBit();
  } else {
    gridTest(64,96,ms.radius[1]);
  }
//  graphPicture('#Graph',(fileNameStem+'XYG'),coatingNo);
//  graphPicture('#Legend',(fileNameStem+'XYL'),coatingNo);
//  saveGrids();
//  saveCurrentData();
  firstTime = true;
  leachProgress = [];
  leachProgress[0] = [];
  leachProgress[0].push([0, 0]);
    coatingNo = -1;
//  $("#allfinish").prop("checked", false);
  g_allFinish = false;
  g_allClosed = false;
 loop();
}

function reloadExample(example) {
  updateFromPage();
  multipleLeaches.push(stuffToPlot);
//  multipleLeaches.push({ label: currentLabel, data: leachProgress });
  firstTime = true;
  leachProgress = [];
  leachProgress[0] = [];
  leachProgress[0].push([0, 0]);
    coatingNo = -1;
//  fileNameStem = generateFileNameStem();
//  $("#allfinish").prop("checked", false);
  g_allFinish = false;
  g_allClosed = false;
  loop();
//  loadExample(example);
}

function updateGrid(pixels, world, textures) {
  for (var y = 0; y < world.height; y++) {
    for (var x = 0; x < world.width; x++) {
      if (world.grid[y][x].cellType === undefined) {
        console.log("undefined type ",x,y);
      };
      var newColor = world.grid[y][x].getColor();
      if (newColor !== world.grid[y][x].oldColor) {
        if (pixiVersion > 4) {
          pixels[x + y * world.width].texture = textures[newColor];
        } else {
//          console.log('updategraphics',x,y,world.width);
          pixels[x + y * world.width].setTexture(textures[newColor]);
        }
        world.grid[y][x].oldColor = newColor;
      }
    }
  }
}

function drawGrid(pixels, world, stage, textures) {
  try {
    stage.removeChildren();
  } catch (ex) {
    console.log(ex);
  }
  for (var y = 0; y < world.height; y++) {
    for (var x = 0; x < world.width; x++) {
      var sprite = new PIXI.Sprite(textures[0]);
      pixels[x + y * world.width] = sprite;
      sprite.x = x * world.cellSize;
      sprite.y = y * world.cellSize;
      stage.addChild(sprite);
    }
  }
}
