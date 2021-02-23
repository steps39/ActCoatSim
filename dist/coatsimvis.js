var g_nextExample = "";
var g_currentExample = "";
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
var g_topwater,
  g_topcoat,
  g_scribed,
  g_topLeak,
  g_sideLeak,
  g_bottomLeak,
  g_manualInter,
  g_gridFromCA,
  g_xSqrt;
var inhibitorSolubility,
  inhibitorDensity,
  maximumParticle,
  minimumParticle,
  maximumPVC,
  minimumPVC,
  coatingNo;
var inhibitorAccessible, inhibitorTotal;
var loopFinished = false;
var allStuff = [];
var firstTime = true;
var myCanvas, ctx, renderer, stage, meter, textures, pixels, noSamples, pixiVersion;
//var ctx, renderer, stage, meter, textures, pixels, noSamples, pixiVersion;
//const myCanvas = document.getElementById("myCanvas");
//canvasrecorder const recorder = new CanvasRecorder(myCanvas);
//var capturer = new CCapture( { display: true, format: 'webm', framerate: 1, verbose: true } );
//var capturer = new CCapture( { display: false, format: 'webm', verbose: true } );
var capturer = null;
let ccOptions = {
  /* Recording options */
  format: 'webm',
  framerate: '30FPS',
  start: function(){ startRecording(); },
  stop: function(){ stopRecording(); }
};

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
    multipleLeaches = [];
    loadExample(g_currentExample);
    //?g_running = 1;
  });
  $("#btnSaveData").on("click", function (evt) {
    saveCurrentData();
  });
  $("#btnReloadData").on("click", function (evt) {
    reloadData();
  });
 /* $("#numFrames").on("change", function (evt) {
    g_stepFrames = changeInt("#numFrames");
  });
  $("#numPlots").on("change", function (evt) {
    g_plotFrames = changeInt("#numPlots");
  });
  $("#depthofwater").on("change", function (evt) {
    depthOfWater = changeInt("#depthofwater");
  });
  $("#depthoftopcoat").on("change", function (evt) {
    depthOfTopcoat = changeInt("#depthoftopcoat");
  });
  $("#sizeofscribe").on("change", function (evt) {
    sizeOfScribe = changeInt("#sizeofscribe");
  });
  $("#inhibitordensity").on("change", function (evt) {
    inhibitorDensity = changeInt("#inhibitordensity");
  });
  $("#inhibitorsolubility").on("change", function (evt) {
    inhibitorSolubility = changeInt("#inhibitorsolubility");
  });
  $("#probdiff").on("change", function (evt) {
    probDiffusion = changeFloat("#probdiff");
  });
  $("#probsol").on("change", function (evt) {
    probSolubility = changeFloat("#probsol");
  });
  $("#waterontop").on("change", function (evt) {
    g_topwater = changeCheck("#waterontop");
  });
  $("#topcoated").on("change", function (evt) {
    g_topcoat = changeCheck("#topcoated");
  });
  $("#gridfromca").on("change", function (evt) {
    g_gridFromCA = changeCheck("#gridfromca");
  });
  $("#manualinter").on("change", function (evt) {
    g_manualInter = changeCheck("#manualinter");
  });
  $("#scribed").on("change", function (evt) {
    g_scribed = changeCheck("#scribed");
  });
  $("#nostrucsteps").on("change", function (evt) {
    noStrucSteps = changeInt("#nostrucsteps");
  });
  $("#endfraction").on("change", function (evt) {
    g_endFraction = changeFloat("#endfraction");
  });
  $("#minimumpvc").on("change", function (evt) {
    minimumPVC = changeFloat("#minimumpvc");
  });
  $("#maximumpvc").on("change", function (evt) {
    maximumPVC = changeFloat("#maximumpvc");
  });
  $("#minparticle").on("change", function (evt) {
    minimumParticle = changeInt("#minparticle");
  });
  $("#maxparticle").on("change", function (evt) {
    maximumParticle = changeInt("#maxparticle");
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
  $("#topleak").on("change", function (evt) {
    g_topLeak = changeCheck("#topleak");
  });
  // = $("").prop("checked");
  $("#sideleak").on("change", function (evt) {
    g_sideLeak = changeCheck("#sideleak");
  });
  // = $("").prop("checked");
  $("#bottomleak").on("change", function (evt) {
    g_bottomLeak = changeCheck("#bottomleak");
  });
  $("#nocoatings").on("change", function (evt) {
    noSamples = changeInt("#nocoatings");
  });
*/
  function changeInt(htmlObject) {
    return parseInt($(htmlObject).val(), 10);
  }

  function changeFloat(htmlObject) {
    return parseFloat($(htmlObject).val(), 10);
  }

  function changeCheck(htmlObject) {
    return $(htmlObject).prop("checked");
  }

  noSamples = parseInt($("#nocoatings").val(), 10);
  depthOfWater = parseInt($("#depthofwater").val(), 10);
  depthOfTopcoat = parseInt($("#depthoftopcoat").val(), 10);
  sizeOfScribe = parseInt($("#sizeofscribe").val(), 10);
  inhibitorDensity = parseInt($("#inhibitordensity").val(), 10);
  inhibitorSolubility = parseInt($("#inhibitorsolubility").val(), 10);
  probDiffusion = parseFloat($("#probdiff").val());
  probSolubility = parseFloat($("#probsol").val());
  g_topwater = $("#waterontop").prop("checked");
  g_topcoat = $("#topcoated").prop("checked");
  g_gridFromCA = $("#gridfromca").prop("checked");
  g_manualInter = $("#manualinter").prop("checked");
  g_scribed = $("#scribed").prop("checked");
  minimumPVC = parseFloat($("#minimumpvc").val());
  maximumPVC = parseFloat($("#maximumpvc").val());
  minimumParticle = parseInt($("#minparticle").val());
  maximumParticle = parseInt($("#maxparticle").val());
  noStrucSteps = parseInt($("#nostrucsteps").val(), 10);
  g_stepFrames = parseInt($("#numFrames").val(), 10);
  g_noUpdates = $("#noupdates").prop("checked");
  g_globalPlots = $("#plotCheckbox").prop("checked");
  g_xsqrt = $("#xsqrt").prop("checked");
  g_plotFrames = parseInt($("#numPlots").val(), 10);
  g_endFraction = parseFloat($("#endfraction").val());
  g_topLeak = $("#topleak").prop("checked");
  g_sideLeak = $("#sideleak").prop("checked");
  g_bottomLeak = $("#bottomleak").prop("checked");

  // loadExample("leaching");
  firstTime = true;
//?  g_running = 1;

};

//const myCanvas = document.getElementById("myCanvas");
//const recorder = new CanvasRecorder(myCanvas);
function loop() {
  if (firstTime) {
    try {
      coatingNo += 1;
      if (allStuff.length < coatingNo + 1) {
        return;
      }
      console.log("About to simulate coating " + coatingNo);
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
      // console.log(
      //   "In function loop - Inhibitor accessible " + inhibitorAccessible
      // );

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
//      capturer = new CCapture( { display: false, format: 'webm', framerate: 30, motionBlurFrames: 1, quality: 100, timeLimit:0, frameLimit: 0, verbose: false} );
      capturer = new CCapture( {
        verbose: false,
        display: false,
        framerate: parseInt(ccOptions.framerate),
        motionBlurFrames: 0,
        quality: 100,
        format: ccOptions.format,
        workersPath: 'dist/src/',
        timeLimit: 0,
        frameLimit: 0,
        autoSaveTime: 0,
      } );
      capturer.start();
      //      recorder = new CanvasRecorder(myCanvas);
//      recorder.start();
if (pixiVersion == "5.3.3") {
//  app = new PIXI.Application({ width : myCanvas.width, height : myCanvas.height, 
  renderer = new PIXI.Application({ width : myCanvas.width, height : myCanvas.height, 
      view : myCanvas });
//      stage = app.stage;
      stage = renderer.stage;
    } else {
      renderer = renderer || new PIXI.autoDetectRenderer(myCanvas.width, myCanvas.height, myCanvas, {antialias: true, transparent: false});
//      renderer = renderer || new PIXI.autoDetectRenderer(myCanvas.width, myCanvas.height, myCanvas, null, true); {antialias: true, transparent: false});
      // create the root of the scene graph
      stage = stage || new PIXI.Stage(0xFFFFFF);
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
if (pixiVersion =="5.3.3") {
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
//canvasrecorder       recorder.start();
      drawGrid(pixels, world, stage, textures);
//      app.render(stage);
      renderer.render(stage);
//      renderer.render(stage);
//      capturer.capture(renderer.view);
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
    //console.log("In loop function - not first time Inhibitor accessible " + inhibitorAccessible);
    world.step();
    leachProgress.push([frames, world.leached / world.coatingDry]);
    //srg      g_noUpdates = $("#noupdates").prop("checked");
    //srg      g_globalPlots = $("#plotCheckbox").prop("checked");
    //srg      g_noUpdates = $("#noupdates").prop("checked");
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
            grid: {
              hoverable: true,
              mouseActiveRadius: 4,
              backgroundColor: "#fdfdfd",
            },
            xaxis: { min: 0, max: xmax, axisLabel: "Time Steps" 
      , transform: function (v)
      { if (g_xSqrt)
          {
           var x = Math.sqrt(v);
          } else {
           var x = v;
          }
          return x
        },
      inverseTransform: function (v)
      {
        if (g_xSqrt)
        {
         var x = v*v;
        } else {
         var x = v;
        }
        return x
      }
    },
            yaxis: {
              min: 0,
              max: ymax,
              axisLabel: "Cumulative Fraction of Coating Leached",
            },
            legend: { container: $("#Legend") },
          };
          if (multipleLeaches.length == 0) {
            $.plot(
              $("#Graph"),
              [{ label: currentLabel, data: leachProgress }],
              options
            );
          } else {
            $.plot(
              $("#Graph"),
              multipleLeaches.concat({
                label: currentLabel,
                data: leachProgress,
              }),
              options
            );
          }
        }
      }
    }
    frames++;
    g_endFraction = parseFloat($("#endfraction").val());
    if (world.leached < g_endFraction * world.inhibitorAccessible) {
      requestAnimationFrame(loop);
      renderer.render(stage);
      capturer.capture(renderer.view);
//      console.log('request animation frame - 1');
    } else {
      firstTime = true;
      requestAnimationFrame(loop);
      renderer.render(stage);
      capturer.capture(renderer.view);
//      console.log('request animation frame - 2');
      capturer.stop();
      // default save, will download automatically a file called {name}.extension (webm/gif/tar)
      capturer.save();
//canvasrecorder       recorder.stop();
//canvasrecorder       recorder.save('fred.webm');
    }
  }
//  requestAnimationFrame(loop);
//  console.log('request animation frame - 3');
  //  capturer.capture(renderer.view);  
//  recorder.stop();
//  recorder.save('fred.webm');
}

function coatingBit(stuff) {
  for (let i = 0; i < noSamples; i++) {
    console.log("About to make coating " + i);
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
    }
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
    console.log('Inhibitor PVC: ' + (inhibitorTotal/(inhibitorTotal+binderTotal)).toPrecision(2)
    + ' Accessible: ' + (inhibitorAccessible/inhibitorTotal).toPrecision(2));
  }
}


function wrappedLoop() {
  return new Promise((resolve) => {
    loop();
    resolve("Done");
  });
}

function saveGrids() {
  let d = new Date();
  let name =
    zeroNumber(d.getFullYear() % 100) +
    zeroNumber(d.getMonth() + 1) +
    zeroNumber(d.getDate()) +
    zeroNumber(d.getHours(d)) +
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
  ret = JSON.stringify(allStuff);
  var BB = new Blob([ret], { type: "text/plain;charset=UTF-8" });
  saveAs(BB, name + ".txt");
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
  saveAs(BB, "ActCoatSim" + ".txt");
  //	multipleLeaches = JSON.parse(ret);
  //	multipleLeaches = JSON.parse(BB.slice(contentType="text/plain;charset=UTF8"));
}

function loadExample(example) {
  allStuff = [];
  coatingBit();
  saveGrids();
  //  loadGrids();
  firstTime = true;
  leachProgress = [];
  coatingNo = -1;
  loop();
  /*  g_currentExample = example;
  g_nextExample = "example_" + example;
  $("#exampleName").text(example);
  firstTime = true;
  g_running = 0;
  frames = 0;
  leachProgress = [];
  leachProgress.push([0, 0]);
  g_topLeak = $("#topleak").prop("checked");
  g_sideLeak = $("#sideleak").prop("checked");
  g_bottomLeak = $("#bottomleak").prop("checked");
  g_globalPlots = $("#plotCheckbox").prop("checked");
  //   console.log(g_globalPlots);*/
}

function reloadExample(example) {
  multipleLeaches.push({ label: currentLabel, data: leachProgress });
  loadExample(example);
//  g_running = 1;
}

function updateGrid(pixels, world, textures) {
//  console.log('updategrid');
  for (var y = 0; y < world.height; y++) {
    for (var x = 0; x < world.width; x++) {
      var newColor = world.grid[y][x].getColor();
      if (newColor !== world.grid[y][x].oldColor) {
        if (pixiVersion == "5.3.3") {
        pixels[x + y * world.width].texture = textures[newColor];
        } else {
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
  //This is where to savet he thumbnail initial structure   renderer.
}
