function makeTest() {
    // FIRST CREATE BINDER
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
    });
  
    inhibitorTotal = 0;
    world.initialize([{ name: "water", distribution: 100 }]);
    grid = world.createGridFromValues(
      [{ cellType: "binder", hasProperty: "open", value: 0 }],
      1
    );
  
    radius = parseInt($("#radius").val(), 10);
  
    r2 = radius * radius;
    var disc = [];
    var i2 = [];
    for (var i = 0; i <= radius; i++) {
      i2[i] = i * i;
    }
  
    //			Make a disc in the middle
    discInhibitor = 0;
    xm = world.width / 2;
    ym = world.height / 2;
    for (var y = -radius; y <= radius; y++) {
      for (var x = -radius; x <= radius; x++) {
        if (i2[Math.abs(y)] + i2[Math.abs(x)] <= r2) {
          grid[y + ym][x + xm] = 1;
          particleID[y + ym][x + xm] = 1;
          discInhibitor += 1;
        } else {
          grid[y + ym][x + xm] = 0;
        }
      }
    }
    world.palette = [];
    // Inhibitor density colour
    world.palette.push("89, 125, 206, 1");
    for (var i = 1; i <= inhibitorDensity; i++) {
  //    world.palette.push("189, 125, 206, " + ((i + 5) / (inhibitorDensity + 5))**2);
      world.palette.push("189, 125, 206, " + (i / inhibitorDensity)**2);
    }
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
                  /*                  var amt = Math.min(
                      this.inhibitor,
                      9 - neighbors[d[i]].inhibitor
                    );*/
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
          }
        },
      },
      function () {
        //init
        this.inhibitor = inhibitorDensity;
        //			console.log(this.x,this.y);
        if (!g_gridFromCA) {
          this.particleID = particleID[this.y][this.x];
        } else {
          this.particleID = 10;
        }
      }
    );
  
    // pass in our generated coating data
    world.initializeFromGrid(
      [
        { name: "inhibitor", gridValue: 1 },
        { name: "water", gridValue: 0 },
      ],
      grid
    );
    return world;
  }
  
  
  function example_leaching() {
  
      // FIRST CREATE BINDER
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
    });
  
    inhibitorTotal = 0;
    binderTotal = 0;
    topOfPrimer = 0;
    if (g_topwater) {
      topOfPrimer += depthOfWater;
    } else {
      depthOfWater = 0;
    }
    if (g_topcoat) {
      topOfPrimer += depthOfTopcoat;
    } else {
      depthOfTopcoat = 0;
    }
    if (inhibitorSolubility > inhibitorDensity) {
      inhibitorSolubility = inhibitorDensity;
    }
    var genPVC = -1.0;
    return world;
  }
  
  //-------------------------------------------------------------------------------------------

function example_barrier() {
    // FIRST CREATE BINDER
    var world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
    });
  
    depthOfWater = 20;
    inhibitorTotal = 0;
    binderTotal = 0;
    //	inhibitorSolubility = 1;
    //	inhibitorDensity = 9;
  //srg  inhibitorDensity = parseInt($("#inhibitordensity").val(), 10);
  //srg  inhibitorSolubility = parseInt($("#inhibitorsolubility").val(), 10);
    if (inhibitorSolubility > inhibitorDensity) {
      inhibitorSolubility = inhibitorDensity;
    }
    var genPVC = -1.0;
  //srg  minimumPVC = parseFloat($("#minimumpvc").val());
  //srg  maximumPVC = parseFloat($("#maximumpvc").val());
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
  
    //	console.log(genPVC);
    do {
      inhibitorTotal = 0;
      binderTotal = 0;
      world.initialize([{ name: "binder", distribution: 100 }]);
      // generate our coating, 10 steps ought to do it
      for (var i = 0; i < 15; i++) {
        world.step();
      }
  
      var grid = world.createGridFromValues(
        [{ cellType: "binder", hasProperty: "open", value: 0 }],
        1
      );
  
      // fill holes in binder with inhibitor while counting
      for (var y = depthOfWater; y < world.height; y++) {
        for (var x = 0; x < world.width; x++) {
          if (grid[y][x] === 0) {
            grid[y][x] = 2;
            inhibitorTotal += 1;
          } else {
            binderTotal += 1;
          }
        }
      }
      genPVC = inhibitorTotal / (inhibitorTotal + binderTotal);
      //	console.log(genPVC)
    } while (genPVC < minimumPVC || genPVC > maximumPVC);
  
    // fill the cell to depth of water with water
    for (var y = 0; y < depthOfWater; y++) {
      for (var x = 0; x < world.width; x++) {
        grid[y][x] = 0;
      }
    }
    // Make up a pattern for grid
    dx = 0;
    for (var y = depthOfWater; y < world.height; y++) {
      blanky = y % 3;
      if (!blanky) {
        dx += 1;
      }
      for (var x = 0; x < world.width; x++) {
        blankx = (dx + x) % 9;
        if (blanky && blankx) {
          grid[y][x] = 2;
        } else {
          grid[y][x] = 1;
        }
      }
    }
  
    //NOW JUST CREATE A NEW COATING TO COUNT ACCESSIBLE INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("89, 125, 206, 1");
    world.palette.push("189, 125, 206, 1");
    world.palette.push("109, 170, 44, 1");
    world.palette.push("68, 36, 52, 1");
  
    inhibitorAccessible = 0;
  
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
      world.step();
    } while (previous != inhibitorAccessible);
  
    // NOW USE OUR CELL TO CREATE A NEW COATING CONTAINING INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("109, 170, 44, 1");
    for (var i = 1; i <= inhibitorDensity; i++) {
      world.palette.push("89, 125, 206, " + (i + 5) / (inhibitorDensity + 5));
    }
    world.palette.push("68, 36, 52, 1");
    world.palette.push("68, 36, 52, 1");
  
    world.depthOfWater = depthOfWater;
    world.inhibitorTotal = inhibitorTotal;
    world.inhibitorAccessible = inhibitorAccessible;
    world.binderTotal = binderTotal;
    world.leached = 0;
  
    world.registerCellType(
      "polymer",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          return this.inhibitor;
        },
        process: function (neighbors) {
          if (this.inhibitor) {
            //inhibitor can escape on the bottom row
            if (
              neighbors[world.BOTTOM.index] === null &&
              this.inhibitor != 0 &&
              Math.random() < 0.2
            ) {
              world.leached += this.inhibitor;
              this.inhibitor = 0;
              return;
            }
            shuffleArray(d);
            for (i = 0; i <= 7 && this.inhibitor; i++) {
              if (
                neighbors[d[i]] !== null &&
                this.inhibitor &&
                neighbors[d[i]].cellType === "polymer" &&
                neighbors[d[i]].inhibitor < inhibitorSolubility
              ) {
                if (Math.random() < 10.2) {
                  var amt = Math.min(
                    this.inhibitor,
                    9 - neighbors[d[i]].inhibitor
                  );
                  amt = 1;
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
      "water",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          return this.inhibitor;
        },
        process: function (neighbors) {
          if (this.inhibitor) {
            shuffleArray(d);
            for (i = 0; i <= 7 && this.inhibitor; i++) {
              if (
                neighbors[d[i]] !== null &&
                neighbors[d[i]].cellType === "polymer" &&
                neighbors[d[i]].inhibitor < inhibitorSolubility &&
                this.inhibitor > 0
              ) {
                if (Math.random() < 10.2) {
                  var amt = Math.min(
                    this.inhibitor,
                    9 - neighbors[d[i]].inhibitor
                  );
                  amt = 1;
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
          }
        },
      },
      function () {
        //init
        this.inhibitor = inhibitorDensity;
      }
    );
  
    world.registerCellType("inhibitor", {
      isSolid: true,
      getColor: function () {
        return this.lighted ? inhibitorDensity + 1 : inhibitorDensity + 2;
      },
      process: function (neighbors) {
        this.lighted =
          neighbors[world.TOP.index] &&
          !(neighbors[world.TOP.index].inhibitor === inhibitorDensity) &&
          !neighbors[world.TOP.index].isSolid &&
          neighbors[world.BOTTOM.index] &&
          neighbors[world.BOTTOM.index].isSolid;
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
    return world;
  }
  
  //------------------------------------------------------------------------------------------------------------
  
  function example_barrier_static() {
    // FIRST CREATE BINDER
    var world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
    });
  
    depthOfWater = 20;
    inhibitorTotal = 0;
    binderTotal = 0;
    //	inhibitorSolubility = 1;
    //	inhibitorDensity = 9;
    inhibitorDensity = parseInt($("#inhibitordensity").val(), 10);
    inhibitorSolubility = parseInt($("#inhibitorsolubility").val(), 10);
    if (inhibitorSolubility > inhibitorDensity) {
      inhibitorSolubility = inhibitorDensity;
    }
    var genPVC = -1.0;
  //  minimumPVC = parseFloat($("#minimumpvc").val());
  //  maximumPVC = parseFloat($("#maximumpvc").val());
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
  
    //	console.log(genPVC);
    do {
      inhibitorTotal = 0;
      binderTotal = 0;
      world.initialize([{ name: "binder", distribution: 100 }]);
      // generate our coating, 10 steps ought to do it
      for (var i = 0; i < 15; i++) {
        world.step();
      }
  
      var grid = world.createGridFromValues(
        [{ cellType: "binder", hasProperty: "open", value: 0 }],
        1
      );
  
      // fill the cell to depth of water with water
      for (var y = 0; y < depthOfWater; y++) {
        for (var x = 0; x < world.width; x++) {
          grid[y][x] = 0;
        }
      }
      // fill holes in binder with inhibitor while counting
      for (var y = depthOfWater; y < world.height; y++) {
        for (var x = 0; x < world.width; x++) {
          if (grid[y][x] === 0) {
            grid[y][x] = 2;
            inhibitorTotal += 1;
          } else {
            binderTotal += 1;
          }
        }
      }
      genPVC = inhibitorTotal / (inhibitorTotal + binderTotal);
      //	console.log(genPVC)
    } while (genPVC < minimumPVC || genPVC > maximumPVC);
  
    //NOW JUST CREATE A NEW COATING TO COUNT ACCESSIBLE INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("89, 125, 206, 1");
    world.palette.push("189, 125, 206, 1");
    world.palette.push("109, 170, 44, 1");
    world.palette.push("68, 36, 52, 1");
  
    inhibitorAccessible = 0;
  
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
      world.step();
    } while (previous != inhibitorAccessible);
  
    // NOW USE OUR CELL TO CREATE A NEW COATING CONTAINING INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("89, 125, 206, 1");
    for (var i = 1; i <= inhibitorDensity; i++) {
      world.palette.push("189, 125, 206, " + (i + 5) / (inhibitorDensity + 5));
    }
    world.palette.push("109, 170, 44, 1");
    world.palette.push("68, 36, 52, 1");
  
    world.depthOfWater = depthOfWater;
    world.inhibitorTotal = inhibitorTotal;
    world.inhibitorAccessible = inhibitorAccessible;
    world.binderTotal = binderTotal;
    world.leached = 0;
  
    world.registerCellType(
      "polymer",
      {
        getColor: function () {
          //return '89, 125, 206, ' + (this.inhibitor ? Math.max(0.3, this.inhibitor/9) : 0);
          return this.inhibitor;
        },
        process: function (neighbors) {
          //inhibitor can escape on the top row
          if (
            neighbors[world.TOP.index] === null &&
            this.inhibitor != 0 &&
            Math.random() < 1.02
          ) {
            world.leached += this.inhibitor;
            this.inhibitor = 0;
            return;
          }
          for (i = 0; i <= 7; i++) {
            if (
              neighbors[i] !== null &&
              this.inhibitor &&
              neighbors[i].cellType === "water" &&
              neighbors[i].inhibitor < inhibitorSolubility
            ) {
              if (Math.random() < 0.2) {
                var amt = Math.min(this.inhibitor, 9 - neighbors[i].inhibitor);
                amt = 1;
                this.inhibitor -= amt;
                neighbors[i].inhibitor += amt;
                if (this.inhibitor === 0) {
                  return;
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
      "water",
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
              neighbors[i].inhibitor < inhibitorSolubility
            ) {
              if (Math.random() < 0.2) {
                var amt = Math.min(this.inhibitor, 9 - neighbors[i].inhibitor);
                amt = 1;
                this.inhibitor -= amt;
                neighbors[i].inhibitor += amt;
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
        },
      },
      function () {
        //init
        this.inhibitor = inhibitorDensity;
      }
    );
  
    world.registerCellType("inhibitor", {
      isSolid: true,
      getColor: function () {
        return this.lighted ? inhibitorDensity + 1 : inhibitorDensity + 2;
      },
      process: function (neighbors) {
        this.lighted =
          neighbors[world.TOP.index] &&
          !(neighbors[world.TOP.index].inhibitor === inhibitorDensity) &&
          !neighbors[world.TOP.index].isSolid &&
          neighbors[world.BOTTOM.index] &&
          neighbors[world.BOTTOM.index].isSolid;
      },
    });
  
    world.initializeFromGrid(
      [
        { name: "polymer", gridValue: 1 },
        { name: "inhibitor", gridValue: 2 },
        { name: "water", gridValue: 0 },
      ],
      grid
    );
  
    /*water, inhibitor, polymer
  Original	// pass in our generated coating data
      world.initializeFromGrid([
          { name: 'polymer', gridValue: 1 },
          { name: 'inhibitor', gridValue: 2 },
          { name: 'water', gridValue: 0 }
      ], grid);
  
  
  /*
      // pass in our generated coating data
      world.initializeFromGrid([
          { name: 'water', gridValue: 1 },
          { name: 'polymer', gridValue: 2 },
          { name: 'inhibitor', gridValue: 0 }
      ], grid);
  */
    return world;
  }
  
  function example_barrier_broken() {
    // FIRST CREATE BINDER
    var world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
    });
  
    depthOfWater = 20;
    inhibitorTotal = 0;
    binderTotal = 0;
  //srg  inhibitorDensity = parseInt($("#inhibitordensity").val(), 10);
  //srg  inhibitorSolubility = parseInt($("#inhibitorsolubility").val(), 10);
    if (inhibitorSolubility > inhibitorDensity) {
      inhibitorSolubility = inhibitorDensity;
    }
    var genPVC = -1.0;
  //srg  minimumPVC = parseFloat($("#minimumpvc").val());
  //srg  maximumPVC = parseFloat($("#maximumpvc").val());
    world.registerCellType(
      "binder",
      {
        process: function (neighbors) {
          var surrounding = this.countSurroundingCellsWithValue(
            neighbors,
            "wasOpen"
          );
          this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
  
          //			this.open = (neighbors[3] && neighbors[4]);
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
  
    //	console.log(genPVC);
    do {
      inhibitorTotal = 0;
      binderTotal = 0;
      world.initialize([{ name: "binder", distribution: 100 }]);
      // generate our coating, 10 steps ought to do it
      for (var i = 0; i < 15; i++) {
        world.step();
      }
  
      var grid = world.createGridFromValues(
        [{ cellType: "binder", hasProperty: "open", value: 0 }],
        1
      );
  
      // fill the cell to depth of water with water
      for (var y = 0; y < depthOfWater; y++) {
        for (var x = 0; x < world.width; x++) {
          grid[y][x] = 0;
        }
      }
      // fill holes in binder with inhibitor while counting
      for (var y = depthOfWater; y < world.height; y++) {
        for (var x = 0; x < world.width; x++) {
          if (grid[y][x] === 0) {
            grid[y][x] = 2;
            inhibitorTotal += 1;
          } else {
            binderTotal += 1;
          }
        }
      }
      genPVC = inhibitorTotal / (inhibitorTotal + binderTotal);
      //	console.log(genPVC)
    } while (genPVC < minimumPVC || genPVC > maximumPVC);
  
    //NOW JUST CREATE A NEW COATING TO COUNT ACCESSIBLE INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("89, 125, 206, 1");
    world.palette.push("189, 125, 206, 1");
    world.palette.push("109, 170, 44, 1");
    world.palette.push("68, 36, 52, 1");
  
    inhibitorAccessible = 0;
  
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
      "polymer",
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
  
    world.registerCellType("filler", {
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
        { name: "filler", gridValue: 1 },
        { name: "polymer", gridValue: 2 },
        { name: "water", gridValue: 0 },
      ],
      grid
    );
  
    var previous = -1;
    do {
      previous = inhibitorAccessible;
      world.step();
    } while (previous != inhibitorAccessible);
  
    // NOW USE OUR CELL TO CREATE A NEW COATING CONTAINING INHIBITOR
    world = new CAWorld({
      width: 96,
      height: 64,
      cellSize: 6,
      clearRect: true,
    });
  
    world.palette = [];
    world.palette.push("89, 125, 206, 1");
    for (var i = 1; i <= inhibitorDensity; i++) {
      world.palette.push("189, 125, 206, " + (i + 5) / (inhibitorDensity + 5));
    }
    world.palette.push("109, 170, 44, 1");
    world.palette.push("68, 36, 52, 1");
  
    world.depthOfWater = depthOfWater;
    world.inhibitorTotal = inhibitorTotal;
    world.inhibitorAccessible = inhibitorAccessible;
    world.binderTotal = binderTotal;
    world.leached = 0;
  
    world.registerCellType(
      "water",
      {
        getColor: function () {
          //			console.log(333);
          //			console.log(this.water);
          return this.water;
        },
        process: function (neighbors) {
          for (i = 0; i <= 7; i++) {
            if (
              neighbors[i] !== null &&
              neighbors[i].cellType === "polymer" &&
              neighbors[i].water < 1 &&
              Math.random() < 10.2
            ) {
              console.log(111);
              //					console.log(111);
              //					var amt = Math.min(this.water, 9 - neighbors[i].water);
              var amt = 1;
              //					this.water = amt;
              neighbors[i].water += amt;
              //					this.water = 1;
              /*					if (this.water === 0) {
                          return;
                      }*/
            }
          }
        },
      },
      function () {
        //init
        this.water = 9;
      }
    );
  
    world.registerCellType(
      "filler",
      {
        isSolid: true,
        getColor: function () {
          return 10;
        },
        process: function (neighbors) {},
      },
      function () {
        //init
      }
    );
  
    world.registerCellType(
      "polymer",
      {
        getColor: function () {
          console.log(34444);
          console.log(this.water);
          return Math.max(5, 5 - 2);
        },
        process: function (neighbors) {
          //water can react with the metal
          /*			if (neighbors[world.Bottom.index] === null && this.water != 0 && Math.random() < 1.02) {
                  world.leached += this.water;
                  this.water = 0;
                  return;
              } */
          for (i = 0; i <= 7; i++) {
            if (
              neighbors[i] !== null &&
              this.water > 0 &&
              neighbors[i].cellType === "polymer" &&
              Math.random() < 10.2
            ) {
              console.log(222);
              //					var amt = Math.min(this.water, 9 - neighbors[i].water);
              var amt = 1;
              this.water = 0;
              neighbors[i].water += amt;
              /*					if (this.water === 0) {
                          return;
                      }*/
            }
          }
        },
      },
      function () {
        //init
        this.water = 0;
      }
    );
  
    // pass in our generated coating data
    world.initializeFromGrid(
      [
        { name: "filler", gridValue: 2 },
        { name: "polymer", gridValue: 1 },
        { name: "water", gridValue: 0 },
      ],
      grid
    );
  
    return world;
  }
  