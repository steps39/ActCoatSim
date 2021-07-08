function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // doesn't work with IE        [array[i], array[j]] = [array[j], array[i]];
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

var d = [0, 1, 2, 3, 4, 5, 6, 7];

function deepCopy(inObject) {
  let outObject, value, key;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value);
  }

  return outObject;
}

var world;
var grid;
var grids;
var particleID;
var particleIDs;

function createParticle(radius,noOfCuts,particle,discInhibitor){
  var particleInhibitor;
//console.log("create particle ",particle);
  if (noOfCuts>0) {
    do {
      particleInhibitor = discInhibitor;
      for (var k = 0; k <= noOfCuts; k++) {
        constant = 2.0 * radius * Math.random() - radius;
        slope = 4.0 * Math.random() - 2;
//                  						console.log(constant,slope);
        for (var y = -radius; y <= radius; y++) {
          for (var x = -radius; x <= radius; x++) {
            if (!particle[radius+y][radius+x]) {
              yl = constant + slope * x;
              if (constant > 0) {
                if (yl < y) {
                  particle[radius+y][radius+x] = 1;
                  particleInhibitor -= 1;
                }
              } else {
                if (yl > y) {
                  particle[radius+y][radius+x] = 1;
                  particleInhibitor -= 1;
                }
              }
            }
          }
        }
      }
    } while (particleInhibitor < 5);
  }/* else {
    return discInhibitor;
  }*/
  return particle;
}

function surCell(neighbor) {
//  console.log(neighbor.polymer);
  if (neighbor !== null && neighbor.polymer){
    return 1;
  }else {
    return 0;
  }
//  return (neighbor !== null && neighbor.wasInhibitor);
//  return (neighbors[position] !== null && neighbors[position]["wasInhibitor"]);
}

function hollowParticle(particle,radius){
  var size = (2*radius) + 1;
	pworld = new CAWorld({
		width: size,
		height: size,
		cellSize: 6,
	  });

  pworld.registerCellType("inhibitor", {
      process: function (neighbors) {
        count = (surCell(neighbors[1]) + surCell(neighbors[4])  + surCell(neighbors[6])  + surCell(neighbors[3]));
        if (count>0) {
          this.inhibitor = true;
        } else {
          this.inhibitor = false;
        }
        this.wasInhibitor = true;
      },
    },
    function () {
      //init
      this.polymer = false;
      this.inhibitor = true;
      this.wasInhibitor = true;
    }
  );

  pworld.registerCellType("polymer", {},
    function () {
      //init
      this.polymer = true;
      this.inhibitor = false;
      this.wasInhibitor = false;
    }
  );
  // pass in our generated coating data
    pworld.initializeFromGrid(
    [
      { name: "inhibitor", gridValue: 0 },
      { name: "polymer", gridValue: 1 },
    ],
    particle
  );
  pworld.step();
  return pworld.createGridFromValues(
    [{ cellType: "inhibitor", hasProperty: "inhibitor", value: 0 }],
    1
  );
}

function checkParticle(particle,xcentre,ycentre,radius){
  //						Test for overlap of the particle inside the grid
  touching = 0;
  for (var y = -radius; y <= radius && !touching; y++) {
    yyc = ycentre + y;
    for (var x = -radius; x <= radius && !touching; x++) {
      xxc = xcentre + x;
      if (
        yyc >= 0 &&
        xxc >= 0 &&
        yyc < world.height &&
        xxc < world.width
      ) {
        if (!particle[radius+y][radius+x] && !grid[yyc][xxc]) {
          touching += 1;
          return touching;
        }
      }
    }
  }
  return touching;
}

function placeParticle(particle,xcentre,ycentre,radius,particleNo,particleType){
  particleTypes[particleNo] = particleType;
  for (var y = -radius; y <= radius; y++) {
    yyc = ycentre + y;
    for (var x = -radius; x <= radius; x++) {
      xxc = xcentre + x;
      if (
        yyc >= 0 &&
        xxc >= 0 &&
        yyc < world.height &&
        xxc < world.width
      ) {
        if (!particle[radius+y][radius+x] && grid[yyc][xxc]) {
          grid[yyc][xxc] = 0;
          particleID[yyc][xxc] = particleNo;
        }
      }
    }
  }
}

function countCells(particle,radius){
  count = 0;
  for (var y = -radius; y <= radius; y++) {
    for (var x = -radius; x <= radius; x++) {
      if (particle[radius+y][radius+x] == 0) {
        count += 1;
      }
    }
  }
  return count;
}

function insertParticles(disc, radius, noOfCuts, noOfParticles, partNoInc) {
  //			Create particles
//  partNoInc = particleTypes.length;
  partExtra = 0;
  for (let pt = 0; pt < noParticleTypes; pt++) {
    for (var l = 0; l < noOfParticles[pt]; l++) {
      var particle = deepCopy(disc[pt]);
//console.log("disc length length "+particle.length+" "+disc[0].length);
//console.log("particle length length "+particle.length+" "+disc[0].length);
      touching = 1;
      attempts = 0;
      placedParticle = true;
      for (; touching != 0 && attempts < 1;) {
        attempts += 1;
        particleInhibitor = discInhibitor[pt];
        particle = createParticle(radius[pt], noOfCuts[pt], particle,particleInhibitor[pt]);
        var placingTry = 0;
        do {
          //Test for overlap of the particle inside the grid
          placingTry = placingTry + 1;
          placedParticle = false;
          ycentre = Math.floor(world.height * Math.random());
          xcentre = Math.floor(world.width * Math.random());
          touching = checkParticle(particle, xcentre, ycentre, radius[pt]);
          //If no overlap then place particle in grid
          if (!touching) {

            //CleverBit?          particle = hollowParticle(particle,radius);

            placeParticle(particle, xcentre, ycentre, radius[pt], l + partNoInc + partExtra, pt);
            placedParticle = true;
          }
        } while (!placedParticle && placingTry < 1000);
      }
    }
    partExtra = partExtra + noOfParticles[pt];
  }
}

function updateSimpleGrid(pixels, world, textures) {
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

function makeDisc(rradius) {
  var disc = [];
  for (let pt = 0; pt < noParticleTypes; pt++) {
    disc[pt] = [];
    radius = rradius[pt];
    if (!ms.square) {
      //Set up square list
      r2 = radius * radius;
      var i2 = [];
      for (var i = 0; i <= radius; i++) {
        i2[i] = i * i;
      }
      //Make a circle
      discInhibitor[pt] = 0;
      for (var y = -radius; y <= radius; y++) {
        disc[pt][radius + y] = [];
        for (var x = -radius; x <= radius; x++) {
          if (i2[Math.abs(y)] + i2[Math.abs(x)] <= r2) {
            disc[pt][radius + y][radius + x] = 0;
            discInhibitor[pt] += 1;
          } else {
            disc[pt][radius + y][radius + x] = 1;
          }
        }
      }
    } else {
      //Make a square
      discInhibitor[pt] = 0;
      for (var y = -radius; y <= radius; y++) {
        disc[pt][radius + y] = [];
        for (var x = -radius; x <= radius; x++) {
          disc[pt][radius + y][radius + x] = 0;
          discInhibitor[pt] += 1;
        }
      }
    }
  }
//console.log("disc length length "+disc.length+" "+disc[0].length+disc[0][0].length);
  return disc;
}


function makeCoating(coatWidth, coatHeight, coatCellSize) {
  particleTypes = [];
  inhibitorAccessible = [];
  inhibitorTotal = [];
  if (ms.noLayers===1){
    grid = makeLayer(coatWidth, coatHeight, coatCellSize, ms.radius,  ms.noOfCuts, ms.minimumPVC, ms.maximumPVC, ms.noOfParticles, 0);
  } else {
    grid1 = makeLayer(coatWidth,ms.layer1Height,coatCellSize, ms.radius, ms.noOfCuts, ms.minimumPVC, ms.maximumPVC, ms.noOfParticles, 0);
    particleID1 = particleID;
    grid2 = makeLayer(coatWidth,ms.layer2Height,coatCellSize, ms.radius2, ms.noOfCuts2, ms.minimumPVC2, ms.maximumPVC2, ms.noOfParticles2, ms.noOfParticles);
    particleID2 = particleID;
    grid = [].concat(grid1,grid2);
    particleID  = [].concat(particleID1,particleID2);
  }
  topOfPrimer = 0;
  if (ms.topcoat) {
    topOfPrimer += ms.depthOfTopcoat;
  } else {
    //ms.depthOfTopcoat = 0;
  }
  if (ms.topWater) {
    topOfPrimer += ms.depthOfWater;
  } else {
    //ms.depthOfWater = 0;
  }
  if (ms.topcoat) {
    // fill the cell with topcoat
    for (var y = ms.depthOfWater; y < ms.depthOfWater + ms.depthOfTopcoat; y++) {
      for (var x = 0; x < coatWidth; x++) {
        grid[y][x] = 1;
      }
    }
  }
  if (ms.topWater) {
    for (var y = 0; y < ms.depthOfWater; y++) {
      for (var x = 0; x < coatWidth; x++) {
        grid[y][x] = 0;
      }
    }
  }

  if (ms.scribed) {
    // scribe the coating
    for (var y = 0; y < coatHeight; y++) {
      for (var x = 0; x < ms.sizeOfScribe; x++) {
        grid[y][x] = 0;
      }
    }
  }
  //Calculate real PVC now water / scribe added / layers appended
  for (let pt = 0; pt < noParticleTypes; pt++) {
    inhibitorTotal[pt] = 0;
    if (sp.inhibitorSolubility[pt] > sp.inhibitorDensity[pt]) {
      sp.inhibitorSolubility[pt] = sp.inhibitorDensity[pt];
    }
  }
  binderTotal = 0;
    if (ms.scribed) {
      primerStart = ms.sizeOfScribe;
    } else {
      primerStart = 0;
    }
    for (var y = topOfPrimer; y < coatHeight; y++) {
      for (var x = primerStart; x < coatWidth; x++) {
        if (grid[y][x] === 2) {
//console.log("before - inhibitorTotal",inhibitorTotal);
          inhibitorTotal[particleTypes[particleID[y][x]]] += 1;
//console.log("after - inhibitorTotal",inhibitorTotal);
        } else {
          binderTotal += 1;
        }
      }
    }
console.log("Full coating - Binder Total - ",binderTotal,";  Inhibitor Total - ",inhibitorTotal);

  if (ms.manualInter) {
    if (g_running) {
      changeRunningState();
    }
    requestAnimationFrame(manualStructure);
  }
}

function makeLayer(coatWidth, coatHeight, coatCellSize, radius, noOfCuts, minimumPVC, maximumPVC, noOfParticles, partNoInc) {
  //First create binder
  world = new CAWorld({
    width: coatWidth,
    height: coatHeight,
    cellSize: coatCellSize,
  });
  setWorldPalette();
  var inhibitorTotal = [];
  for (let pt = 0; pt < noParticleTypes; pt++) {
    inhibitorTotal[pt] = 0;
  }
  var binderTotal = 0;

  var genPVC = -1.0;

  world.registerCellType(
    "water",
    {
      getColor: function () {
        //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
        return this.inhibitor;
      },
    },
    function () {
      for (let pt = 0; pt < noParticleTypes; pt++) {
        this.inhibitor[pt] = 0;
      }
    }
  );

  world.registerCellType(
    "inhibitor",
    {
      getColor: function () {
        //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
        return 1;
//        return world.particleColourStart[this.particleType] + this.inhibitor[this.particleType];
/*        if (this.inhibitor[particleTypes[this.particleID]] == sp.inhibitorDensity[particleTypes[this.particleID]]) {
          return (this.particleID % noParticleColours) + sp.inhibitorDensity[particleTypes[this.particleID]] + 3;
        } else {
          return this.inhibitor[particleTypes[this.particleID]];
        }*/
      },
    },
    function () {
      //init
      //			console.log(this.x,this.y);
      if (!ms.gridFromCA && !ms.diffusionTest) {
        //          console.log("partilce");
        this.particleID = particleID[this.y][this.x];
      } else {
        this.particleID = 10;//???
      }
      this.inhibitor[particleTypes[this.particleID]] = sp.inhibitorDensity[particleTypes[this.particleID]];
    }
  );

/*  world.registerCellType("polymer", {
    isSolid: true,
    getColor: function () {
      return this.lighted ? sp.inhibitorDensity + 1 : sp.inhibitorDensity + 2;
    },
  });
*/
  world.registerCellType(
    "binder",
    {
      getColor: function () {
        return this.lighted ? sp.inhibitorDensity + 1 : sp.inhibitorDensity + 2;
      },
      process: function (neighbors) {
        var surrounding = this.countSurroundingCellsWithValue(
          neighbors,
          "wasOpen"
        );
        this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
        //			this.open = 2;
      },
      reset: function () {
        this.wasOpen = this.open;
      },
    },
    function () {
      //init
      if (ms.gridFromCA) {
        this.open = Math.random() > ms.probCA;
      } else {
        this.open = false;
      }
    }
  );

  //	console.log(genPVC);
  tries = 0;
  do {
    tries += 1;
    inhibitorTotal = [];
    for (let pt = 0; pt < noParticleTypes; pt++) {
      inhibitorTotal[pt] = 0;
    }
    binderTotal = 0;
    world.initialize([
      { name: "binder", distribution: 100 },
      { name: "inhibitor", distribution: 0 },
      { name: "water", distribution: 0 },
    ]);
    //Cellular automaton coating generation
    if (ms.gridFromCA) {
      particleID = null;
      // generate our coating, 10 steps ought to do it
      for (var i = 0; i < ms.noStrucSteps; i++) {
        world.step();
      }
    }
    grid = world.createGridFromValues(
      [{ cellType: "binder", hasProperty: "open", value: 0 }],
      1
    );
    particleID = [];
    for (y = 0; y < world.height; y++) {
      particleID[y] = [];
      for (x = 0; x < world.width; x++) {
        particleID[y][x] = 1;
      }
    }

    //Particle placing coating generation
    if (!ms.gridFromCA) {
      disc = makeDisc(radius);
//console.log("disc length length "+disc.length+" "+disc[0].length);
      insertParticles(disc,radius,noOfCuts,noOfParticles,partNoInc);
    }
    // fill holes in binder with inhibitor while counting
//    if (ms.scribed) {
//      primerStart = ms.sizeOfScribe;
//    } else {
      primerStart = 0;
//    }
    topOfPrimer=0;
    for (var y = topOfPrimer; y < world.height; y++) {
      for (var x = primerStart; x < world.width; x++) {
        if (grid[y][x] === 0) {
          grid[y][x] = 2;
          inhibitorTotal[particleTypes[particleID[y][x]]] += 1;
        } else {
          binderTotal += 1;
        }
      }
    }
    genPVC = math.sum(inhibitorTotal) / (math.sum(inhibitorTotal) + binderTotal);
console.log("tries - ",tries," genPVC - ",genPVC);//," minimumPVC - ",minimumPVC," maximumPVC - ",maximumPVC,"ending - ",!(genPVC > minimumPVC && genPVC < maximumPVC));
    if(tries>10){
      break;
    }
  } while (!(genPVC > minimumPVC && genPVC < maximumPVC));
  return grid;
}

function countAccessible(grid) {
  //NOW JUST CREATE A NEW COATING TO COUNT ACCESSIBLE INHIBITOR
  world = new CAWorld({
  width: grid[0].length,
  height: grid.length,
  cellSize: 6,
  clearRect: true
});
  for (let pt = 0; pt < noParticleTypes; pt++) {
    inhibitorAccessible[pt] = 0;
  }
  world.palette = [];
  world.palette.push("89, 125, 206, 1");
  world.palette.push("189, 125, 206, 1");
  world.palette.push("109, 170, 44, 1");
  world.palette.push("68, 36, 52, 1");

  world.registerCellType(
    "water",
    {
      getColor: function () {
        //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
        return this.inhibitor;
      },
      process: function (neighbors) { },
    },
    function () {
      this.inhibitor = [];
      for (let pt = 0; pt < noParticleTypes; pt++) {
        this.inhibitor[pt] = 0;
      }
    }
  );

  world.registerCellType(
    "inhibitor",
    {
      getColor: function () {
        //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
        return this.inhibitor;
      },
      process: function (neighbors) {
        for (i = 0; i <= 7; i++) {
          if (
            neighbors[i] !== null &&
            neighbors[i].cellType === "water" &&
            this.inhibitor[this.particleType] != 0
          ) {
            inhibitorAccessible[this.particleType] += 1;
//console.log("particleTypes[this.particleID]"+this.particleType+" "+this.x+" "+this.y);
lastx = this.x;
lasty = this.y;
            world.grid[this.y][this.x] = new world.cellTypes.water(
              this.x,
              this.y
            );
            this.inhibitor[this.particleType] = 0;
            return;
          }
        }
      },
    },
    function () {
      //init
      this.inhibitor = [];
      this.particleType = particleTypes[particleID[this.y][this.x]];
      this.inhibitor[this.particleType] = 1;
//console.log("setting inhibitor *");
    }
  );

  world.registerCellType("polymer", {
    isSolid: true,
    getColor: function () {
      return world.palette.length;
    },
    process: function (neighbors) {
      //this.lighted = neighbors[world.TOP.index] && !(neighbors[world.TOP.index].inhibitor === sp.inhibitorDensity) && !neighbors[world.TOP.index].isSolid
      //&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
    },
  });

  //console.log("count accessible grid ",grid);
  // pass in our generated coating data
  world.initializeFromGrid(
    [
      { name: "polymer", gridValue: 1 },
      { name: "inhibitor", gridValue: 2 },
      { name: "water", gridValue: 0 },
    ],
    grid
  );


//  var previous = [-1];
  var counter = 0;
  do {
    previous = inhibitorAccessible;
    //console.log("about to step");
    world.step();
    if(math.sum(previous) == math.sum(inhibitorAccessible)){
      counter += 1;
    }
  } while (counter<50);
  console.log("count gid "+grid.length+" "+grid[0].length+" "+world.height+" "+world.width);
  console.log("count accessible inhibitor "+lastx+" "+lasty+" "+math.sum(inhibitorAccessible));
  //    resolve(inhibitorAccessible);
  //});
}

function saveGrid(grid) {
/*	let d = new Date();
	let name = zeroNumber(d.getFullYear()%100) + zeroNumber(d.getMonth()+1) + zeroNumber(d.getDate()) +
				 zeroNumber(d.getHours()) + zeroNumber(d.getMinutes());
	coatingDry = (world.height-ms.depthOfWater)*world.width;
	name += 'grid' + 'P' + Math.round(100*inhibitorTotal/coatingDry) +
				'A' + Math.round(100*inhibitorAccessible/inhibitorTotal); */
	ret = JSON.stringify(grid);
	var BB = new Blob([ret], {type: "text/plain;charset=UTF-8"});
//  saveAs(BB, name + ".json");
  saveAs(BB, fileNameStem + ".json");
}

function setWorldPalette() {
  function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
  }
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt((myTrim(hex)).substring(0, 2), 16);
    color[1] = parseInt((myTrim(hex)).substring(2, 4), 16);
    color[2] = parseInt((myTrim(hex)).substring(4, 6), 16);
    return (color[0] + "," + color[1] + "," + color[2]);
  }
  world.palette = [];
  world.particleColourStart = [];
  // Inhibitor density colour
  world.palette.push("89, 125, 206, 1");
  for (let pt = 0; pt < noParticleTypes; pt++) {
    world.particleColourStart[pt] = world.palette.length;
    var rainbow = new Rainbow();
    if (sp.inhibitorDensity[pt] > 1) {
      rainbow.setNumberRange(1, sp.inhibitorDensity[pt]);
    } else {
      rainbow.setNumberRange(1, sp.inhibitorDensity[pt] + 1);
    }
    colourEnds = [['pink', 'purple'],['yellow', 'orange'],['lime', 'green'],['tomato','red']]
/*    if(pt === 0){
      rainbow.setSpectrum('pink', 'purple');
    } else {
      rainbow.setSpectrum('yellow', 'orange');
    }*/
    rainbow.setSpectrum(colourEnds[pt][0],colourEnds[pt][1]);
    for (var i = 1; i <= sp.inhibitorDensity[pt] + 1; i++) {
      world.palette.push(convertToRGB(rainbow.colourAt(i)));
      // + ((i + 5) / (sp.inhibitorDensity[pt] + 5)));
//      world.palette.push(convertToRGB(rainbow.colourAt(i)) + ((i + 5) / (sp.inhibitorDensity[pt] + 5)));
//console.log("colours "+convertToRGB(rainbow.colourAt(i)) + ((i + 5) / (sp.inhibitorDensity[pt] + 5)));
    }
  }

  //  Original colour range
  /*    for (var i = 1; i <= sp.inhibitorDensity; i++) {
      world.palette.push("189, 125, 206, " + (i + 5) / (sp.inhibitorDensity + 5));
    }*/
  // Polymer surface and bulk
  world.palette.push("109, 170, 44, 1");
  world.palette.push("192, 192, 192, 1");
  //Colours for all the different particles
  // Tropical tangerine - https://www.color-hex.com/color-palette/99086
  world.palette.push("255,134,134,0.5");
  world.palette.push("255,161,147,0.5");
  world.palette.push("255,187,172,0.5");
  world.palette.push("255,209,191,0.5");
  world.palette.push("255,227,210,0.5");
  // Purple pastel - https://www.color-hex.com/color-palette/99091
  world.palette.push("191,131,255,0.5");
  world.palette.push("255,171,247,0.5");
  world.palette.push("255,149,192,0.5");
  world.palette.push("254,134,255,0.5");
  world.palette.push("176,185,255,0.5");
  // Gradient mango - https://www.color-hex.com/color-palette/98930
  world.palette.push("255,226,88,0.5");
  world.palette.push("255,211,87,0.5");
  world.palette.push("255,196,85,0.5");
  world.palette.push("255,181,83,0.5");
  world.palette.push("255.167.81,0.5");
  // Misty seafoam - https://www.color-hex.com/color-palette/98935
  world.palette.push("124,205,144,0.5");
  world.palette.push("204,255,204,0.5");
  world.palette.push("182,252,213,0.5");
  world.palette.push("211,255,206,0.5");
  world.palette.push("180,238,180,0.5");
  // Water
  world.palette.push("0,0,128,1");
//  noParticleColours = world.palette.length - (sp.inhibitorDensity + 4);
  noParticleColours = world.palette.length - 4;
  for (let pt = 0; pt < noParticleTypes; pt++) {
    noParticleColours =  noParticleColours - sp.inhibitorDensity[pt];
  }
}

function waterColour(inhibitors){
  let colourNumber = colourNumbers;
  for (let pt = 0; pt < inhibitors.length; pt++) {
    colourNumber = colourNumbers[inhibitors[pt]];
  }
  return colourNumber
}

  function simulation(coatWidth, coatHeight,coatCellSize) {
    //USE OUR CELL TO CREATE A NEW COATING CONTAINING INHIBITOR
    
    world = new CAWorld({
      width: coatWidth,
      height: coatHeight,
      cellSize: coatCellSize,
      clearRect: true,
    });
    setWorldPalette();
    world.depthOfWater = ms.depthOfWater;
    world.inhibitorTotal = [];
    world.leached = [];
    world.inhibitorAccessible = [];
console.log("resetting world array sizes - ia "+world.inhibitorAccessible.length);
    for (let pt = 0; pt < noParticleTypes; pt++) {
      world.inhibitorTotal[pt] = inhibitorTotal[pt];
      world.leached[pt] = 0;
      world.inhibitorAccessible[pt] = inhibitorAccessible[pt];
    }
    world.binderTotal = binderTotal;

    e = [];
    for (let pt = 0; pt < noParticleTypes; pt++) {
      e.push(pt);
    }

    world.registerCellType(
      "water",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          if (math.sum(this.inhibitor) > 0) {
            if (noParticleTypes == 1) {
              return world.particleColourStart[0] + this.inhibitor[0];
            } else {
              shuffleArray(e);
              for (let pt = 0; pt < noParticleTypes; pt++) {
                if (this.inhibitor[e[pt]] > 0) {
                  return world.particleColourStart[e[pt]] + this.inhibitor[e[pt]];
                  console.log("world.particleColourStart[this.particleType] + this.inhibitor[pt]", world.particleColourStart[this.particleType] + this.inhibitor[pt]);
                }
              }
            }
          }
          return 0;
        },
        process: function (neighbors) {
          if (math.sum(this.inhibitor)) {
            //inhibitor can escape on any side if allowed
            if (
              ((sp.topLeak && neighbors[world.TOP.index] === null) ||
                (sp.leftLeak && neighbors[world.LEFT.index] === null) ||
                (sp.rightLeak && neighbors[world.RIGHT.index] === null) ||
                (sp.bottomLeak && neighbors[world.BOTTOM.index] === null)) &&
              Math.random() < 1.02
            ) {
              for (let pt = 0; pt < noParticleTypes; pt++) {
                world.leached[pt] += this.inhibitor[pt];
                this.inhibitor[pt] = 0;
              }
              return;
            }
            for (let pt = 0; pt < noParticleTypes; pt++) {
              shuffleArray(d);
              for (i = 0; i <= 7 && this.inhibitor[pt]; i++) {
                if (
                  neighbors[d[i]] !== null &&
                  neighbors[d[i]].cellType === "water" &&
                  neighbors[d[i]].inhibitor[pt] < sp.inhibitorSolubility[pt]
                ) {
                  if (Math.random() <= sp.probDiffuse[pt]) {
                    /*                  var amt = Math.min(
                                        this.inhibitor,
                                        9 - neighbors[d[i]].inhibitor
                                      );*/
                    var amt = 1;
                    this.inhibitor[pt] -= amt;
                    neighbors[d[i]].inhibitor[pt] += amt;
                    if (!math.sum(this.inhibitor)) {
                      return;
                    }
                  }
                }
              }
            }
          }
        },
      },
      function () {
        this.inhibitor = [];
        for (let pt = 0; pt < noParticleTypes; pt++) {
          this.inhibitor[pt] = 0;
        }
      }
    );

    world.registerCellType(
      "inhibitor",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          return world.particleColourStart[this.particleType] + this.inhibitor[this.particleType];
          /*for (let pt = 0; pt < noParticleTypes; pt++) {
            if (this.inhibitor[pt] == sp.inhibitorDensity[pt]) {
              return (this.particleID % noParticleColours) + sp.inhibitorDensity[pt] + 3;
            } else {
              return this.inhibitor[pt];
            }
          }*/
        },
        process: function (neighbors) {
/*          if (this.inhibitor.reduce((a, b) => a + b, 0)) {
            for (let pt = 0; pt < noParticleTypes; pt++) {*/
          if (this.inhibitor[this.particleType]) {
            shuffleArray(d);
            for (i = 0; i <= 7 && this.inhibitor[this.particleType]; i++) {
              if (
                neighbors[d[i]] !== null &&
                neighbors[d[i]].cellType === "water" &&
                neighbors[d[i]].inhibitor[this.particleType] < sp.inhibitorSolubility[this.particleType]
              ) {
                if (Math.random() <= sp.probDissolve[this.particleType]) {
                  //                  var amt = Math.min(
                  //                    this.inhibitor,
                  //                    9 - neighbors[d[i]].inhibitor
                  //                  );
                  var amt = 1;
                  this.inhibitor[this.particleType] -= amt;
                  neighbors[d[i]].inhibitor[this.particleType] += amt;
                  if (this.inhibitor[this.particleType] === 0) {
                    world.grid[this.y][this.x] = new world.cellTypes.water(
                      this.x,
                      this.y
                    );
                    for (let pt = 0; pt < noParticleTypes; pt++) {
                      this.inhibitor[pt] = 0;
                    }
                    return;
                  }
                }
              }
            }
          }
        },
      },
      function () {
        //init
        this.inhibitor = [];
        if (!ms.gridFromCA && !ms.diffusionTest) {
          this.particleID = particleID[this.y][this.x];
          this.particleType = particleTypes[particleID[this.y][this.x]];
          this.inhibitor[this.particleType] = sp.inhibitorDensity[this.particleType];
            } else {
          this.particleID = 10;
        }
      }
    );

    world.registerCellType("polymer", {
      isSolid: true,
      getColor: function () {
//        return this.lighted ? sp.inhibitorDensity + 1 : sp.inhibitorDensity + 2;
        return world.palette.length-2;
      },
/*      process: function (neighbors) {
        this.lighted =
          neighbors[world.TOP.index] &&
          !(neighbors[world.TOP.index].inhibitor === sp.inhibitorDensity) &&
          !neighbors[world.TOP.index].isSolid &&
          neighbors[world.BOTTOM.index] &&
          neighbors[world.BOTTOM.index].isSolid;
      },*/
    });
    if (!ms.diffusionTest) {
      // pass in our generated coating data
      world.initializeFromGrid(
        [
          { name: "water", gridValue: 0 },
          { name: "polymer", gridValue: 1 },
          { name: "inhibitor", gridValue: 2 },
        ],
        grid
      );
    } else {
      // pass in the diffusion test system
      world.initializeFromGrid(
        [
          { name: "water", gridValue: 0 },
          { name: "inhibitor", gridValue: 1 },
        ],
        grid
      );
    }
	return world;
}

function gridTest(height, width, radius) {
  var grid = [];
  var particleID = [];
  var record = [];
  for (var y = 0; y < height; y++) {
    grid[y] = [];
    //    particleID[y] = []
    for (var x = 0; x < width; x++) {
      grid[y][x] = 0;
      //      particleID[y][x] = 1;
    }
  }
  //			Make a disc in the middle
  discInhibitor = 0;
  xm = Math.round(width / 2);
  ym = Math.round(height / 2);
  r2 = radius * radius;
  var i2 = [];
  for (var i = 0; i <= radius; i++) {
    i2[i] = i * i;
  }
  for (var y = -radius; y <= radius; y++) {
    for (var x = -radius; x <= radius; x++) {
      if (i2[Math.abs(y)] + i2[Math.abs(x)] <= r2) {
        grid[y + ym][x + xm] = 1;
        //        particleID[y + ym][x + xm] = 1;
        discInhibitor += 1;
      } else {
        grid[y + ym][x + xm] = 0;
      }
    }
  }
  particleID = null;
  coatingDry = height;
  binderTotal = height * width;
  ms.minimumPVC = discInhibitor / binderTotal;
  ms.maximumPVC = ms.minimumPVC;
  ms.minimumParticle = radius;
  ms.maximumParticle = radius;
  inhibitorTotal = discInhibitor;
  inhibitorAccessible = discInhibitor;
  record.push(grid);
  record.push(particleID);
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
console.log("gridTest");
  for (i = 1; i <= ms.noSamples; i++) {
    allStuff.push(record);
  }
  //  g_grid = grid;
}



function manualStructure() {
  var freeCanvas = document.getElementById("drawcanvas"),
    c = freeCanvas.getContext("2d");
  var drawing = false;
  freeCanvas.addEventListener("click", handleClick);
  freeCanvas.addEventListener("mousemove", handleMove);
  console.log(c.offsetLeft, c.offsetTop);
  console.log(freeCanvas.offsetLeft, freeCanvas.offsetTop);
  /*	offsetx = freeCanvas.getBoundingClientRect().left;
offsety = freeCanvas.getBoundingClientRect().top;*/

  function drawFreeBox() {
    c.beginPath();
    c.fillStyle = "white";
    c.lineWidth = 1;
    c.strokeStyle = "black";
    cellDim = Math.floor(600 / world.width);
    //cellDim = 40;
    console.log(c.offestLeft, c.offsetTop);
    // Make it all polymer
    c.fillStyle = "brown";
    c.fillRect(0, 0, world.width * cellDim, world.height * cellDim);
    minY = ms.depthOfWater + ms.depthOfTopcoat;
    minX = ms.sizeOfScribe;

    for (var row = 0; row <= world.height; row++) {
      //	c.beginPath()
      c.moveTo(0, row * cellDim);
      c.lineTo(world.width * cellDim, row * cellDim);
      c.stroke();
      //		c.closePath();
    }
    for (var column = 0; column <= world.width; column++) {
      //	c.beginPath()
      c.moveTo(column * cellDim, 0);
      c.lineTo(column * cellDim, world.height * cellDim);
      c.stroke();
      //c.closePath();
    }

    if (ms.topWater) {
      // fill the cell to depth of water with water
      c.fillStyle = "blue";
      c.fillRect(0, 0, world.width * cellDim, ms.depthOfWater * cellDim);
    }

    if (ms.topcoat) {
      // fill the cell with topcoat
      c.fillStyle = "brown";
      c.fillRect(
        0,
        ms.depthOfWater * cellDim,
        world.width * cellDim,
        (ms.depthOfWater + ms.depthOfTopcoat) * cellDim,
        cellDim,
        cellDim
      );
    }

    if (ms.scribed) {
      c.fillStyle = "blue";
      c.fillRect(0, 0, ms.sizeOfScribe * cellDim, world.height * cellDim);
    }
    c.fillStyle = "green";
    for (var y = topOfPrimer; y < world.height; y++) {
      for (var x = primerStart; x < world.width; x++) {
        if (grid[y][x] === 2) {
          c.fillRect(x * cellDim, y * cellDim, cellDim, cellDim);
        }
      }
    }
    c.closePath();
  }

  function handleClick(e) {
    if (drawing) {
      drawing = false;
      console.log("Not drawing");
    } else {
      drawing = true;
      console.log("Drawing");
    }
  }

  function handleMove(e) {
    if (drawing) {
      c.fillStyle = "green";
      var canvasWidthCorrection = freeCanvas.width / freeCanvas.offsetWidth;
      var canvasHeightCorrection =
        freeCanvas.height / freeCanvas.offsetHeight;
      var corWidthCellDim = cellDim * canvasWidthCorrection;
      var corHeightCellDim = cellDim * canvasHeightCorrection;
      offsetx = freeCanvas.getBoundingClientRect().left;
      offsety = freeCanvas.getBoundingClientRect().top;
      var x = Math.floor(
        ((e.clientX - offsetx) * canvasWidthCorrection) / cellDim
      );
      var y = Math.floor(
        ((e.clientY - offsety) * canvasHeightCorrection) / cellDim
      );
      if (x < world.width && y < world.height && x >= minX && y >= minY) {
        c.fillRect(
          Math.round(x * cellDim),
          Math.round(y * cellDim),
          cellDim,
          cellDim
        );
        inhibitorTotal += 1;
        binderTotal -= 1;
        grid[y][x] = 2;
        particleID[y][x] = ms.noOfParticles + 1;
      }
    }
  }
  drawFreeBox();
}

