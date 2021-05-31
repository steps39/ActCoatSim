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

function createParticle(noOfCuts,particle){
//console.log("create particle ",particle);
  if (noOfCuts) {
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
  }
  return particle;
}

/*
world.registerCellType(
  "binder",
  {
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
    this.open = Math.random() > 0.45;
  }
);
*/

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
        }
      }
    }
  }
  return touching;
}

function placeParticle(particle,xcentre,ycentre,radius,particleNo){
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
  /*                  world.grid[yyc][xxc] = new world.cellTypes.inhibitor(
            xxc,
            yyc
          );*/
          particleID[yyc][xxc] = particleNo;
//????          if (pixiVersion > 4) {
//????            pixels[xxc + yyc * world.width].texture = textures[particleNo];
//????          } else {
  //          console.log('updategraphics',x,y,world.width);
//????            pixels[xxc + yyc * world.width].setTexture(textures[particleNo]);
//????          }
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

function insertParticles(disc){
//			Create particles
  for (var l = 0; l < noOfParticles; l++) {
    var particle = deepCopy(disc);
    touching = 1;
    attempts = 0;
    placedParticle = true;
    for (; touching != 0 && attempts < 1; ) {
      attempts += 1;
      particleInhibitor = discInhibitor;
      particle = createParticle(noOfCuts,particle);
      var placingTry = 0;
      do {
        //Test for overlap of the particle inside the grid
        placingTry = placingTry + 1;
        placedParticle = false;
        ycentre = Math.floor(world.height * Math.random());
        xcentre = Math.floor(world.width * Math.random());
        touching = checkParticle(particle,xcentre,ycentre,radius);
        //If no overlap then place particle in grid
        if (!touching) {

//CleverBit?          particle = hollowParticle(particle,radius);

          placeParticle(particle,xcentre,ycentre,radius,l);
          placedParticle = true;
        }
      } while (!placedParticle && placingTry < 1000);
    }
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

function makeDisc(radius) {
  square = true;
  var disc = [];
  if (!square) {
    //Set up square list
    r2 = radius * radius;
    var i2 = [];
    for (var i = 0; i <= radius; i++) {
      i2[i] = i * i;
    }
    //Make a circle
    discInhibitor = 0;
    for (var y = -radius; y <= radius; y++) {
      disc[radius + y] = [];
      for (var x = -radius; x <= radius; x++) {
        if (i2[Math.abs(y)] + i2[Math.abs(x)] <= r2) {
          disc[radius + y][radius + x] = 0;
          discInhibitor += 1;
        } else {
          disc[radius + y][radius + x] = 1;
        }
      }
    }
  } else {
    //Make a square
    discInhibitor = 0;
    for (var y = -radius; y <= radius; y++) {
      disc[radius + y] = [];
      for (var x = -radius; x <= radius; x++) {
        disc[radius + y][radius + x] = 0;
        discInhibitor += 1;
    }
    }
  }
  return disc;
}

function makeCoating() {
  //First create binder
  world = new CAWorld({
    width: 96,
    height: 64,
    cellSize: 6,
  });
  setWorldPalette();
  inhibitorTotal = 0;
  binderTotal = 0;
  topOfPrimer = 0;
  if (g_topcoat) {
    topOfPrimer += depthOfTopcoat;
  } else {
    //depthOfTopcoat = 0;
  }
  if (g_topwater) {
    topOfPrimer += depthOfWater;
  } else {
    //depthOfWater = 0;
  }
  if (inhibitorSolubility > inhibitorDensity) {
    inhibitorSolubility = inhibitorDensity;
  }
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
      this.inhibitor = 0;
    }
  );

  world.registerCellType(
    "inhibitor",
    {
      getColor: function () {
        //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
        if (this.inhibitor == inhibitorDensity) {
          return (this.particleID % noParticleColours) + inhibitorDensity + 3;
        } else {
          return this.inhibitor;
        }
      },
    },
    function () {
      //init
      this.inhibitor = inhibitorDensity;
      //			console.log(this.x,this.y);
      if (!g_gridFromCA && !g_diffusionTest) {
        //          console.log("partilce");
        this.particleID = particleID[this.y][this.x];
      } else {
        this.particleID = 10;//???
      }
    }
  );

/*  world.registerCellType("polymer", {
    isSolid: true,
    getColor: function () {
      return this.lighted ? inhibitorDensity + 1 : inhibitorDensity + 2;
    },
  });
*/
  world.registerCellType(
    "binder",
    {
      getColor: function () {
        return this.lighted ? inhibitorDensity + 1 : inhibitorDensity + 2;
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
      if (g_gridFromCA) {
        this.open = Math.random() > 0.45;
      } else {
        this.open = false;
      }
    }
  );

  //	console.log(genPVC);
  tries = 0;
  do {
    tries += 1;
    inhibitorTotal = 0;
    binderTotal = 0;
    world.initialize([
      { name: "binder", distribution: 100 },
      { name: "inhibitor", distribution: 0 },
      { name: "water", distribution: 0 },
    ]);
    //Cellular automaton coating generation
    if (g_gridFromCA) {
      particleID = null;
      // generate our coating, 10 steps ought to do it
      for (var i = 0; i < noStrucSteps; i++) {
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
    if (!g_gridFromCA) {
      radius = parseInt($("#radius").val(), 10);
      disc = makeDisc(radius);
      noOfParticles = parseInt($("#noofparticles").val(), 10);
      noOfCuts = parseInt($("#noofcuts").val(), 10);
      insertParticles(disc);
    }
    // fill holes in binder with inhibitor while counting
    if (g_scribed) {
      primerStart = sizeOfScribe;
    } else {
      primerStart = 0;
    }
    for (var y = topOfPrimer; y < world.height; y++) {
      for (var x = primerStart; x < world.width; x++) {
        if (grid[y][x] === 0) {
          grid[y][x] = 2;
          inhibitorTotal += 1;
        } else {
          binderTotal += 1;
        }
      }
    }
    genPVC = inhibitorTotal / (inhibitorTotal + binderTotal);
console.log("tries - ",tries,"genPVC - ",genPVC);
    if(tries>10){
      break;
    }
  } while (!(genPVC > minimumPVC && genPVC < maximumPVC));
  if (g_topcoat) {
    // fill the cell with topcoat
    for (var y = depthOfWater; y < depthOfWater + depthOfTopcoat; y++) {
      for (var x = 0; x < world.width; x++) {
        grid[y][x] = 1;
      }
    }
  }
  if (g_topwater) {
    for (var y = 0; y < depthOfWater; y++) {
      for (var x = 0; x < world.width; x++) {
        grid[y][x] = 0;
      }
    }
  }

  if (g_scribed) {
    // scribe the coating
    for (var y = 0; y < world.height; y++) {
      for (var x = 0; x < sizeOfScribe; x++) {
        grid[y][x] = 0;
      }
    }
  }
  if (g_manualInter) {
    if (g_running) {
      changeRunningState();
    }
    requestAnimationFrame(manualStructure);
  }
}

    function countAccessible() {
    //NOW JUST CREATE A NEW COATING TO COUNT ACCESSIBLE INHIBITOR
    /*world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6,
		clearRect: true
	});*/
    inhibitorAccessible = 0;
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
        process: function (neighbors) {},
      },
      function () {
        this.inhibitor = 0;
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
              neighbors[i].inhibitor == 0 &&
              this.inhibitor != 0
            ) {
              inhibitorAccessible += 1;
              this.inhibitor = 0;
              //	return;
            }
          }
        },
      },
      function () {
        //init
        this.inhibitor = 1;
      }
    );

    world.registerCellType("polymer", {
      isSolid: true,
      getColor: function () {
        return this.lighted ? 2 : 3;
      },
      process: function (neighbors) {
        //this.lighted = neighbors[world.TOP.index] && !(neighbors[world.TOP.index].inhibitor === inhibitorDensity) && !neighbors[world.TOP.index].isSolid
        //&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
      },
    });


    // pass in our generated coating data
    world.initializeFromGrid(
      [
        { name: "polymer", gridValue: 1 },
        { name: "inhibitor", gridValue: 2 },
        { name: "water", gridValue: 0 },
      ],
      grid
    );

    var previous = -1;
    do {
      previous = inhibitorAccessible;
//console.log("about to step");
      world.step();
    } while (previous != inhibitorAccessible);
//    resolve(inhibitorAccessible);
//});
  }

function saveGrid(grid) {
/*	let d = new Date();
	let name = zeroNumber(d.getFullYear()%100) + zeroNumber(d.getMonth()+1) + zeroNumber(d.getDate()) +
				 zeroNumber(d.getHours()) + zeroNumber(d.getMinutes());
	coatingDry = (world.height-depthOfWater)*world.width;
	name += 'grid' + 'P' + Math.round(100*inhibitorTotal/coatingDry) +
				'A' + Math.round(100*inhibitorAccessible/inhibitorTotal); */
	ret = JSON.stringify(grid);
	var BB = new Blob([ret], {type: "text/plain;charset=UTF-8"});
//  saveAs(BB, name + ".txt");
  saveAs(BB, fileNameStem + ".txt");
}

function setWorldPalette() {
  world.palette = [];
  // Inhibitor density colour
  world.palette.push("89, 125, 206, 1");
    function myTrim(x) {
      return x.replace(/^\s+|\s+$/gm,'');
    }
    function convertToRGB (hex) {
    var color = [];
    color[0] = parseInt ((myTrim(hex)).substring (0, 2), 16);
    color[1] = parseInt ((myTrim(hex)).substring (2, 4), 16);
    color[2] = parseInt ((myTrim(hex)).substring (4, 6), 16);
    return (color[0] + "," + color[1] + "," + color[2]);
  }
  var rainbow = new Rainbow();
  if (inhibitorDensity>1) {
    rainbow.setNumberRange(1, inhibitorDensity);
  } else {
    rainbow.setNumberRange(1, inhibitorDensity+1);
  }
  rainbow.setSpectrum('pink', 'purple');
  for (var i = 1; i <= inhibitorDensity; i++) {
    world.palette.push(convertToRGB(rainbow.colourAt(i)) + ((i + 5) / (inhibitorDensity + 5)));
//      world.palette.push(convertToRGB(rainbow.colourAt(i))+",0.5");
  }
//  Original colour range
/*    for (var i = 1; i <= inhibitorDensity; i++) {
    world.palette.push("189, 125, 206, " + (i + 5) / (inhibitorDensity + 5));
  }*/
  // Polymer surface and bulk
  world.palette.push("109, 170, 44, 1");
  world.palette.push("192, 192, 192, 1");
  //	world.palette.push('68, 36, 52, 1');
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
  /*	world.palette.push('0,0,0,0.1');
world.palette.push('255,255,255,0.1');
world.palette.push('255,0,0,0.1');
world.palette.push('0,255,0,1');
world.palette.push('0,0,255,1');
world.palette.push('255,255,0,1');
world.palette.push('0,255,255,1');
world.palette.push('255,0,255,1');
world.palette.push('192,192,192,1');
world.palette.push('128,128,128,1');
world.palette.push('128,0,0,1');
world.palette.push('128,128,0,1');
world.palette.push('0,128,0,1');
world.palette.push('128,0,128,1');
world.palette.push('0,128,128,1');*/
  // Water
  world.palette.push("0,0,128,1");
  noParticleColours = world.palette.length - (inhibitorDensity + 4);
}

function simulation() {
    // NOW USE OUR CELL TO CREATE A NEW COATING CONTAINING INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
    setWorldPalette();
    world.depthOfWater = depthOfWater;
    world.inhibitorTotal = inhibitorTotal;
    world.inhibitorAccessible = inhibitorAccessible;
    world.binderTotal = binderTotal;
    world.leached = 0;

    world.registerCellType(
      "water",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          return this.inhibitor;
        },
        process: function (neighbors) {
          if (this.inhibitor) {
            //inhibitor can escape on any side if allowed
            if (
              ((g_topLeak && neighbors[world.TOP.index] === null) ||
                (g_leftLeak && neighbors[world.LEFT.index] === null) ||
                (g_rightLeak && neighbors[world.RIGHT.index] === null) ||
                (g_bottomLeak && neighbors[world.BOTTOM.index] === null)) &&
              Math.random() < 1.02
            ) {
              world.leached += this.inhibitor;
              this.inhibitor = 0;
              return;
            }
            shuffleArray(d);
            for (i = 0; i <= 7 && this.inhibitor; i++) {
              if (
                neighbors[d[i]] !== null &&
                neighbors[d[i]].cellType === "water" &&
                neighbors[d[i]].inhibitor < inhibitorSolubility
              ) {
                if (Math.random() <= probDiffusion) {
/*                  var amt = Math.min(
                    this.inhibitor,
                    9 - neighbors[d[i]].inhibitor
                  );*/
                  var amt = 1;
                  this.inhibitor -= amt;
                  neighbors[d[i]].inhibitor += amt;
                  if (this.inhibitor === 0) {
                    return;
                  }
                }
              }
            }
          }
        },
      },
      function () {
        this.inhibitor = 0;
      }
    );

    world.registerCellType(
      "inhibitor",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          if (this.inhibitor == inhibitorDensity) {
            return (this.particleID % noParticleColours) + inhibitorDensity + 3;
          } else {
            return this.inhibitor;
          }
        },
        process: function (neighbors) {
          if (this.inhibitor) {
            shuffleArray(d);
            for (i = 0; i <= 7 && this.inhibitor; i++) {
              if (
                neighbors[d[i]] !== null &&
                neighbors[d[i]].cellType === "water" &&
                neighbors[d[i]].inhibitor < inhibitorSolubility
              ) {
                if (Math.random() <= probSolubility) {
//                  var amt = Math.min(
//                    this.inhibitor,
//                    9 - neighbors[d[i]].inhibitor
//                  );
                  var amt = 1;
                  this.inhibitor -= amt;
                  neighbors[d[i]].inhibitor += amt;
                  if (this.inhibitor === 0) {
                    world.grid[this.y][this.x] = new world.cellTypes.water(
                      this.x,
                      this.y
                    );
                    this.inhibitor = 0;
                    return;
                  }
                }
              }
            }
/*          if (this.inhibitor === 0) {
            world.grid[this.y][this.x] = new world.cellTypes.water(
              this.x,
              this.y
            );
            this.inhibitor = 0;
            return;*/
          }
        },
      },
      function () {
        //init
        this.inhibitor = inhibitorDensity;
        //			console.log(this.x,this.y);
        if (!g_gridFromCA && !g_diffusionTest) {
//          console.log("partilce");
          this.particleID = particleID[this.y][this.x];
        } else {
          this.particleID = 10;
        }
      }
    );

    world.registerCellType("polymer", {
      isSolid: true,
      getColor: function () {
        return this.lighted ? inhibitorDensity + 1 : inhibitorDensity + 2;
      },
/*      process: function (neighbors) {
        this.lighted =
          neighbors[world.TOP.index] &&
          !(neighbors[world.TOP.index].inhibitor === inhibitorDensity) &&
          !neighbors[world.TOP.index].isSolid &&
          neighbors[world.BOTTOM.index] &&
          neighbors[world.BOTTOM.index].isSolid;
      },*/
    });
    if (!g_diffusionTest) {
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

function gridTest(height, width,radius) {
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
  minimumPVC = discInhibitor / binderTotal;
  maximumPVC = minimumPVC;
  minimumParticle = radius;
  maximumParticle = radius;
  inhibitorTotal = discInhibitor;
  inhibitorAccessible = discInhibitor;
  record.push(grid);
  record.push(particleID);
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
  for (i=1;i<=noSamples;i++) {
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
    minY = depthOfWater + depthOfTopcoat;
    minX = sizeOfScribe;

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

    if (g_topwater) {
      // fill the cell to depth of water with water
      c.fillStyle = "blue";
      c.fillRect(0, 0, world.width * cellDim, depthOfWater * cellDim);
    }

    if (g_topcoat) {
      // fill the cell with topcoat
      c.fillStyle = "brown";
      c.fillRect(
        0,
        depthOfWater * cellDim,
        world.width * cellDim,
        (depthOfWater + depthOfTopcoat) * cellDim,
        cellDim,
        cellDim
      );
    }

    if (g_scribed) {
      c.fillStyle = "blue";
      c.fillRect(0, 0, sizeOfScribe * cellDim, world.height * cellDim);
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
        particleID[y][x] = noOfParticles + 1;
      }
    }
  }
  drawFreeBox();
}

