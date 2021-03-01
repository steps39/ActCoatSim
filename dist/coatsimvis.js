var g_nextExample = "";
var g_currentExample = "leaching";
var frames = 0;
var world;
var leachProgress = [];
leachProgress.push([0, 0]);
var multipleLeaches = [];
var currentLabel;
var series = 0;
var firstTime, g_endFraction;
var g_running = true;
var g_globalPlots = false;
var maxFrames, maxLeached;
var g_topwater, g_topcoat, g_scribed, g_topLeak, g_leftLeak, g_rightLeak, g_bottomLeak, g_manualInter, g_gridFromCA, g_xSqrt, g_quickFinish, g_allFinish, g_captureAnimation, g_capturePlot;
var inhibitorSolubility, inhibitorDensity, maximumParticle, minimumParticle, maximumPVC, minimumPVC, coatingNo, inhibitorAccessible, inhibitorTotal;
var loopFinished = false;
var allStuff = [];
var firstTime = true;
var myCanvas, myPlot, ctx, renderer, stage, meter, textures, pixels, noSamples, pixiVersion, fileNameStem;
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
    name: fileNameStem + (coatingNo + 1),
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

function zeroNumber(item) {
  let sitem = item.toString();
  if (item < 10) {
    sitem = "0" + sitem;
  }
  return sitem;
}

function generateFileNameStem() {
  let d = new Date();
  let name =
    zeroNumber(d.getFullYear() % 100) +
    zeroNumber(d.getMonth() + 1) +
    zeroNumber(d.getDate()) +
    zeroNumber(d.getHours()) +
    zeroNumber(d.getMinutes());
  if (g_gridFromCA) {
    name += "CA";
  } else {
    name += "PP";
  }
  if (g_manualInter) {
    name += "M";
  }
  name +=
    "grid" +
    "PS" +
    Math.round(100 * minimumPVC) +
    "PL" +
    Math.round(100 * maximumPVC);
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

function updateFromPage() {
  noSamples = changeInt("#nocoatings");
  g_stepFrames = changeInt("#numFrames");
  g_plotFrames = changeInt("#numPlots");
  depthOfWater = changeInt("#depthofwater");
  depthOfTopcoat = changeInt("#depthoftopcoat");
  sizeOfScribe = changeInt("#sizeofscribe");
  inhibitorDensity = changeInt("#inhibitordensity");
  inhibitorSolubility = changeInt("#inhibitorsolubility");
  probDiffusion = changeFloat("#probdiff");
  probSolubility = changeFloat("#probsol");
  g_topwater = changeCheck("#waterontop");
  g_topcoat = changeCheck("#topcoated");
  g_gridFromCA = changeCheck("#gridfromca");
  g_manualInter = changeCheck("#manualinter");
  g_scribed = changeCheck("#scribed");
  noStrucSteps = changeInt("#nostrucsteps");
  g_endFraction = changeFloat("#endfraction");
  minimumPVC = changeFloat("#minimumpvc");
  maximumPVC = changeFloat("#maximumpvc");
  minimumParticle = changeInt("#minparticle");
  maximumParticle = changeInt("#maxparticle");
  g_stepFrames = parseInt($("#numFrames").val(), 10);
  g_noUpdates = changeCheck("#noupdates");
  g_globalPlots = changeCheck("#plotCheckbox");
  g_xSqrt = changeCheck("#xsqrt");
  g_topLeak = changeCheck("#topleak");
  g_leftLeak = changeCheck("#leftleak");
  g_rightLeak = changeCheck("#rightleak");
  g_bottomLeak = changeCheck("#bottomleak");
  g_captureAnimation = changeCheck("#captureanimation");
  g_capturePlot = changeCheck("#captureplot");
}

window.onload = function () {
  // Check for the various File API support.
  pixiVersion = PIXI.VERSION;
  console.log("PixiJS version - " + pixiVersion);
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
    saveCurrentData();
  });
  $("#btnReloadData").on("click", function (evt) {
    reloadData();
  });
  $("#endfraction").on("change", function (evt) {
    g_endFraction = changeFloat("#endfraction");
  });
  $("#numFrames").on("change", function (evt) {
    g_stepFrames = changeInt("#numFrames");
  });
  $("#numPlots").on("change", function (evt) {
    g_plotFrames = changeInt("#numPlots");
  });
  $("#noupdates").on("change", function (evt) {
    g_noUpdates = changeCheck("#noupdates");
  });
  $("#plotCheckbox").on("change", function (evt) {
    g_globalPlots = changeCheck("#plotCheckbox");
  });
  $("#xsqrt").on("change", function (evt) {
    g_xSqrt = changeCheck("#xsqrt");
  });
  $("#quickfinish").on("change", function (evt) {
    g_quickFinish = changeCheck("#quickfinish");
  });
/*  $("#allfinish").on("change", function (evt) {
    g_allFinish = changeCheck("#allfinish");
  });*/
  updateFromPage();
  // loadExample("leaching");
  firstTime = true;
};

function loop() {
  if (g_allFinish) {
    return;
  }
  if (firstTime) {
    try {
      coatingNo += 1;
      if (allStuff.length < coatingNo + 1) {
        return;
      }
      console.log("About to simulate coating " + (coatingNo + 1));
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
      world.inhibitorTotal *= inhibitorDensity;
      world.inhibitorAccessible *= inhibitorDensity;
      world.coatingDry =
        (world.height - world.depthOfWater) * world.width * inhibitorDensity;
      currentLabel =
        "Inhibitor PVC: " +
        (world.inhibitorTotal / world.coatingDry).toPrecision(2) +
        "     Accessible: " +
        (world.inhibitorAccessible / world.inhibitorTotal).toPrecision(2) +
        "     Density: " +
        inhibitorDensity +
        "    Solubility: " +
        inhibitorSolubility;
      console.log(currentLabel);
      myCanvas = document.getElementById("myCanvas");
      myCanvas.width = world.cellSize * world.width;
      myCanvas.height = world.cellSize * world.height;
      if (g_captureAnimation) {
        gridCapturer = startRecording(fileNameStem + "PVC" + Math.round(100*world.inhibitorTotal / world.coatingDry) +
                        "IA" + Math.round(100*world.inhibitorAccessible / world.inhibitorTotal) + "C",coatingNo);
      }
//      plotCapturer = startRecording(fileNameStem + "P",coatingNo);
      if (pixiVersion == "5.3.3") {
        //  app = new PIXI.Application({ width : myCanvas.width, height : myCanvas.height,
        renderer = new PIXI.Application({
          width: myCanvas.width,
          height: myCanvas.height,
          view: myCanvas,
        });
        //      stage = app.stage;
        stage = renderer.stage;
      } else {
        renderer =
          renderer ||
          new PIXI.autoDetectRenderer(
            myCanvas.width,
            myCanvas.height,
            myCanvas,
            { antialias: true, transparent: false }
          );
        //      renderer = renderer || new PIXI.autoDetectRenderer(myCanvas.width, myCanvas.height, myCanvas, null, true); {antialias: true, transparent: false});
        // create the root of the scene graph
        stage = stage || new PIXI.Stage(0xffffff);
      }
      //    recorder = new CanvasRecorder(stage);
      //	            forceCanvas: true, view : document.getElementById("myCanvas") });
      //	  document.body.appendChild(app.view);
      //      renderer = PIXI.Renderer({ width : myCanvas.width, height : myCanvas.height, view: myCanvas });
      //renderer = PIXI.autoDetectRenderer(myCanvas.width, myCanvas.height, { view: myCanvas });
      /*      renderer =
        renderer ||
        new PIXI.autoDetectRenderer(
          myCanvas.width,
          myCanvas.height,
          myCanvas,
          null,
          true
        );*/

      // create the root of the scene graph
      //      stage = app.stage;
      //      stage = new PIXI.Container();
      //      stage = stage || new PIXI.Stage(0xffffff);
      textures = [];
      pixels = [];
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
      if (pixiVersion == "5.3.3") {
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
    world.step();
    leachProgress.push([frames, world.leached / world.coatingDry]);
    // limit speed of simulation
    if (frames % g_stepFrames === 0) {
      //        console.log("here we are running");
      /*            world.step();
            leachProgress.push([frames,world.leached/world.inhibitorTotal]);*/
      $("#currentstep").text(frames);
      if (!g_noUpdates) {
        updateGrid(pixels, world, textures);
        //        app.render(stage);
        renderer.render(stage);
        //        capturer.capture(renderer.view);
        //        renderer.render(stage);
      }
      if (frames % g_plotFrames === 0) {
        var xmax,
          ymax,
          y = world.leached / world.coatingDry;
        if (frames > maxFrames) {
          maxFrames = frames;
        }
        if (y > maxLeached) {
          maxLeached = y;
        }
        if (g_globalPlots) {
          xmax = maxFrames;
          ymax = maxLeached;
        } else {
          xmax = frames;
          ymax = y;
        }
        if (!g_noUpdates) {
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
                if (g_xSqrt) {
                  var x = Math.sqrt(v);
                } else {
                  var x = v;
                }
                return x;
              },
              inverseTransform: function (v) {
                if (g_xSqrt) {
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
    g_allFinish = changeCheck("#allfinish");
    if (
      (world.leached < g_endFraction * world.inhibitorAccessible) &&
      !g_quickFinish && !g_allFinish
    ) {
      requestAnimationFrame(loop);
      if (g_captureAnimation) {
        renderer.render(stage);
        gridCapturer.capture(renderer.view);
      }
//      plotCapturer.capture(myPlot);
    } else {
      $("#quickfinish").prop("checked", false);
      g_quickFinish = false;
      firstTime = true;
      requestAnimationFrame(loop);
      if (g_captureAnimation) {
        renderer.render(stage);
        gridCapturer.capture(renderer.view);
        stopRecording(gridCapturer);
      }
//      plotCapturer.capture(myPlot);
//      stopRecording(plotCapturer);
      if ((noSamples == (coatingNo + 1)) || g_allFinish) {
        if (g_capturePlot) {
          graphPicture('#Graph',(fileNameStem+'XYG'),coatingNo);
          graphPicture('#Legend',(fileNameStem+'XYL'),coatingNo);
        }
        saveCurrentData();
      }
    };
  };
};

function coatingBit(stuff) {
  fileNameStem = generateFileNameStem();
  for (let i = 0; i < noSamples; i++) {
    console.log("About to make coating " + (i + 1));
    makeCoating();
    countAccessible();
    var record = [];
    record.push(grid);
    record.push(particleID);
    coatingDry = world.height - depthOfWater;
    if (!g_scribed) {
      coatingDry *= world.width;
    } else {
      coatingDry *= world.width - sizeOfScribe;
    };
    record.push([
      minimumPVC,
      maximumPVC,
      minimumParticle,
      maximumParticle,
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
  saveGrids();
};

function wrappedLoop() {
  return new Promise((resolve) => {
    loop();
    resolve("Done");
  });
}

function saveGrids() {
  ret = JSON.stringify(allStuff);
  var BB = new Blob([ret], { type: "text/plain;charset=UTF-8" });
  saveAs(BB, fileNameStem + ".txt");
}

function changeStepFrames() {
  g_stepFrames = parseInt($("#numFrames").val(), 10);
}

function changePlotFrames() {
  g_plotFrames = parseInt($("#numPlots").val(), 10);
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
  saveAs(BB, fileNameStem + "GD" + ".txt");
  //	multipleLeaches = JSON.parse(ret);
  //	multipleLeaches = JSON.parse(BB.slice(contentType="text/plain;charset=UTF8"));
}

function graphPicture(element,fileNameBit,coatNo) {
  var ccanvas;
  html2canvas(document.querySelector(element)).then(function(ccanvas) {
    console.log(ccanvas);
    fileNameBit = fileNameBit + (coatNo + 1) + '.png';
    saveAs(ccanvas.toDataURL(), fileNameBit);
  });
}

function loadExample(example) {
  updateFromPage();
  allStuff = [];
  coatingBit();
//  graphPicture('#Graph',(fileNameStem+'XYG'),coatingNo);
//  graphPicture('#Legend',(fileNameStem+'XYL'),coatingNo);
//  saveGrids();
//  saveCurrentData();
  firstTime = true;
  leachProgress = [];
  coatingNo = -1;
  $("#allfinish").prop("checked", false);
  g_allFinish = false;
  loop();
}

function reloadExample(example) {
  multipleLeaches.push({ label: currentLabel, data: leachProgress });
  loadExample(example);
}

function updateGrid(pixels, world, textures) {
  for (var y = 0; y < world.height; y++) {
    for (var x = 0; x < world.width; x++) {
      var newColor = world.grid[y][x].getColor();
      if (newColor !== world.grid[y][x].oldColor) {
        if (pixiVersion == "5.3.3") {
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
