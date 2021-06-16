var g_nextExample = "";
var g_currentExample = "leaching";
var frames = 0;
var world;
var leachProgress = [];
leachProgress.push([0, 0]);
var multipleLeaches = [];
var currentLabel;
var series = 0;
var firstTime;
var g_running = true;
var g_saveAll = false;
var maxFrames, maxLeached;
var ms = {noSamples:5, manualInter:false, topWater:true, depthOfWater:10, topcoat:false, depthOfTopcoat:10, scribed:false, sizeOfScribe:10, diffusionTest:false,
          gridFromCA:false, noStrucSteps:15, square:false, radius:10, noOfParticles:20, noOfCuts:4, minimumParticle:3, maximumParticle:10, minimumPVC:0.1, maximumPVC:1.0};
var sp = {inhibitorDensity:1, inhibitorSolubility:1, probDiffuse:1.0, probDissolve:1.0, topLeak:true, leftLeak:false, rightLeak:false, bottomLeak:false};
var ac = {globalPlots:false, xSqrt:true, saveGrids:false, saveGraphs:false, captureAnimation:false, capturePlot:false, stepFrames:3, plotFrames:10, endFraction:0.5, noVisualUpdates:false};
var g_quickFinish, g_allFinish, g_allClosed, rcoatingNo, inhibitorAccessible, inhibitorTotal;
var g_grid;
var loopFinished = false;
var allStuff = [];
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
  "R" + zeroNumber(Math.round(ms.radius),2);
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
      name += "R" + Math.round(ms.radius) + "N" + ms.noOfCuts;
    }
  }
  return name;
}

function generateFileNameSim(name) {
  if (ms.diffusionTest) {
    return name;
  } else {
    name +=
      "ID" + zeroNumber(Math.round(sp.inhibitorDensity),2) +
      "IS" + zeroNumber(Math.round(sp.inhibitorSolubility),2) +
      "PS" + zeroNumber(Math.round(sp.probDissolve*1000),3) +
      "PD" + zeroNumber(Math.round(sp.probDiffuse*1000),3);
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
  name +=
      "PVC" + zeroNumber(Math.round(100 * world.inhibitorTotal / world.coatingDry),2) +
      "AC" + zeroNumber(Math.round(100 * world.inhibitorAccessible / world.inhibitorTotal),2);
  return name;
}

function changeInt(htmlObject) {
  return parseInt($(htmlObject).val(), 10);
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
  $("#diffusiontest").prop("checked",ms.diffusionTest);
  $("#waterontop").prop("checked",ms.topWater);
  $("#depthofwater").val(ms.depthOfWater);
  $("#topcoated").prop("checked",ms.topcoat);
  $("#depthoftopcoat").val(ms.depthOfTopcoat);
  $("#scribed").prop("checked",ms.scribed);
  $("#sizeofscribe").val(ms.sizeOfScribe);
  $("#gridfromca").prop("checked",ms.gridFromCA);
  $("#nostrucsteps").val(ms.noStrucSteps);
  $("#square").val(ms.square);
  $("#radius").val(ms.radius);
  $("#noofparticles").val(ms.noOfParticles);
  $("#noofcuts").val(ms.noOfCuts);
  $("#minparticle").val(ms.minimumParticle);
  $("#maxparticle").val(ms.maximumParticle);
  $("#minimumpvc").val(ms.minimumPVC);
  $("#maximumpvc").val(ms.maximumPVC);
}

function updateFromPage() {
  ms.noSamples = changeInt("#nocoatings");
  ms.manualInter = changeCheck("#manualinter");
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
  ms.radius = changeInt("#radius");
  ms.noOfParticles = changeInt("#noofparticles");
  ms.noOfCuts = changeInt("#noofcuts");
  ms.minimumParticle = changeInt("#minparticle");
  ms.maximumParticle = changeInt("#maxparticle");
  ms.minimumPVC = changeFloat("#minimumpvc");
  ms.maximumPVC = changeFloat("#maximumpvc");
  sp.inhibitorDensity = changeInt("#inhibitordensity");
  sp.inhibitorSolubility = changeInt("#inhibitorsolubility");
  sp.probDiffuse = changeFloat("#probdiff");
  sp.probDissolve = changeFloat("#probsol");
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
//  ac.stepFrames = parseInt($("#numFrames").val(), 10);
  ac.plotFrames = changeInt("#numPlots");
  ac.endFraction = changeFloat("#endfraction");
  ac.noVisualUpdates = changeCheck("#noupdates");
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
      coatingNo += 1;
      if (allStuff.length < coatingNo + 1) {
        return;
      }
      console.log("About to simulate system " + (coatingNo + 1));
      // record = allStuff.shift();
      record = allStuff[coatingNo];
      if (leachProgress.length > 1) {
        multipleLeaches.push({ label: currentLabel, data: leachProgress });
      } else {
        multipleLeaches = [];
      }
      grid = record[0];
      particleID = record[1];
      coatingDry = record[2][4];
      binderTotal = record[2][5];
      inhibitorTotal = record[2][6];
      inhibitorAccessible = record[2][7];
      console.log("Inhibitor total accessible ", inhibitorTotal,inhibitorAccessible);
      firstTime = true;
      //?      g_running = 1;
      frames = 0;
      leachProgress = [];
      leachProgress.push([0, 0]);
      world = simulation();
//      world = makeTest();
      frames = 0;
      series += 1;
      leachProgress = [];
      leachProgress.push([0, 0]);
      world.leached = 0;
      world.inhibitorTotal *= sp.inhibitorDensity;
      world.inhibitorAccessible *= sp.inhibitorDensity;
      world.coatingDry =
        (world.height - world.depthOfWater) * world.width * sp.inhibitorDensity;
      currentLabel =
        "Inhibitor PVC: " +
        (world.inhibitorTotal / world.coatingDry).toPrecision(2) +
        "  Accessible: " +
        (world.inhibitorAccessible / world.inhibitorTotal).toPrecision(2) +
        "  Inhib - Den: " +
        sp.inhibitorDensity +
        "  Sol: " +
        sp.inhibitorSolubility +
        "  Prob - Diff: " +
        sp.probDiffuse +
        "  Diss: " +
        sp.probDissolve;
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
console.log("render 2 - ",frames);
      }
    }
    world.step();
    leachProgress.push([frames, world.leached / world.coatingDry]);
     // limit speed of simulation
    if (frames % ac.stepFrames === 0) {
      $("#currentstep").text(frames);
      if (!ac.noVisualUpdates) {
        updateGrid(pixels, world, textures);
        frameText.text = "#: " + frames;
        stage.addChild(frameText);
        renderer.render(stage);
console.log("render 3 - ",frames);
      }
      if (frames % ac.plotFrames === 0) {
        var xmax,
          ymax,
          y = world.leached / world.coatingDry;
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
          if (multipleLeaches.length == 0) {
            plotPlot = $.plot(
              $("#Graph"),
              [{ label: currentLabel, data: leachProgress }],
              options
            );
          } else {
            plotPlot = $.plot(
              $("#Graph"),
              multipleLeaches.concat({
                label: currentLabel,
                data: leachProgress,
              }),
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
    if (
      (world.leached < ac.endFraction * world.inhibitorAccessible) &&
      !g_quickFinish && !g_allFinish
    ) {
      requestAnimationFrame(loop);
      if (ac.captureAnimation) {
        gridCapturer.capture(renderer.view);
      }
    } else {
//      $("#quickfinish").prop("checked", false);
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
    makeCoating();
    countAccessible();
    var record = [];
    record.push(grid);
    record.push(particleID);
    coatingDry = world.height - ms.depthOfWater;
    if (!ms.scribed) {
      coatingDry *= world.width;
    } else {
      coatingDry *= world.width - ms.sizeOfScribe;
    };
    record.push([
      ms.minimumPVC,
      ms.maximumPVC,
      ms.minimumParticle,
      ms.maximumParticle,
      coatingDry,
      binderTotal,
      inhibitorTotal,
      inhibitorAccessible,
    ]);
    allStuff.push(record);
    console.log(
      "Inhibitor PVC: " +
        (inhibitorTotal / (inhibitorTotal + binderTotal)).toPrecision(2) +
        " Accessible: " +
        (inhibitorAccessible / inhibitorTotal).toPrecision(2)
    );
  };
  if(ac.saveGrids){
    saveGrids();
  }
};

function wrappedLoop() {
  return new Promise((resolve) => {
    loop();
    resolve("Done");
  });
}

function saveGrids() {
  var saveStuff = {
    ms: ms, allStuff: allStuff
  }
//  ret = JSON.stringify(allStuff);
  ret = JSON.stringify(saveStuff);
  var BB = new Blob([ret], { type: "text/plain;charset=UTF-8" });
//saving
  saveAs(BB, fileNameStem + ".json");
}

function loadGrids(allStuff) {
  for (const record of allStuff) {
    //      record = allStuff[i];
    grid = record[0];
    particleID = record[1];
    coatingDry = record[2][4];
    binderTotal = record[2][5];
    inhibitorTotal = record[2][6];
    inhibitorAccessible = record[2][7];
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
    ret = JSON.stringify({ label: currentLabel, data: leachProgress });
  } else {
    ret = JSON.stringify(
      multipleLeaches.concat({ label: currentLabel, data: leachProgress })
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
    gridTest(64,96,ms.radius);
  }
//  graphPicture('#Graph',(fileNameStem+'XYG'),coatingNo);
//  graphPicture('#Legend',(fileNameStem+'XYL'),coatingNo);
//  saveGrids();
//  saveCurrentData();
  firstTime = true;
  leachProgress = [];
  coatingNo = -1;
//  $("#allfinish").prop("checked", false);
  g_allFinish = false;
  g_allClosed = false;
  loop();
}

function reloadExample(example) {
  updateFromPage();
  multipleLeaches.push({ label: currentLabel, data: leachProgress });
  firstTime = true;
  leachProgress = [];
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
