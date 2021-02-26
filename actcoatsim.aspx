<!DOCTYPE html>
<html>

<head lang="en">
    <meta charset="UTF-8">
    <title>ActCoatSim</title>

    <link rel="stylesheet" href="./dist/bootstrap.min.css">
    <link rel="stylesheet" href="./dist/sastyles.css">
    <link rel="stylesheet" href="./style.css">
    <script src="./dist/jquery.min.js"></script>
    <script src="./dist/bootstrap.min.js"></script>

</head>

<body>
    <button id="btnPause" class="btn btn-default"><span id="playpause">Pause</span></button>
    <button id="btnReload" class="btn btn-default">Regenerate</button>
    <button id="btnStart" class="btn btn-default">Full Reset</button>
    Current Step: <span id="currentstep">0</span>
    <button id="btnSaveData" class="btn btn-default">Save Data</button>
    <div>
        <label for="reloaddata" class="btn">Reload Data</label>
        <input id="reloaddata" style="visibility:hidden;" type="file" name="files[]"></input>
    </div>
        <div class="container">
            <div class="jumbotron">
                <div class="row">
                    <div class="col-md-8" style="text-align: center">
                        <canvas id="myCanvas"></canvas>
                    </div>
                    <div id="fullgraph">
                        <div class="col-md-8" style="text-align: center">
    <!--                        <div id="Graph" class="flot-graph"></div>
                                <canvas id="Graph"></canvas> -->
                            <div id="Graph" style="margin-left: 0.9625rem;margin-right: 0.9625rem;width: 96%;height: 340px;"></div>
                        </div>
                        <div class="col-md-8" style="text-align: center">
                            <div id="Legend" class="flot-legend"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div> <!-- /container -->

    <ul class="nav nav-pills">
        <li class="active"><a data-toggle="pill" href="#generate">Microstructure Parameters</a></li>
        <li><a data-toggle="pill" href="#kinetics">Simulation Parameters</a></li>
        <li><a data-toggle="pill" href="#running">Simulation Controls</a></li>
    </ul>

    <div class="tab-content">
        <div id="generate" class="tab-pane fade in active">
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="true">
                    <span id="exampleName">Dropdown</span>
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li><a class="exampleLink" data-example="leaching">Active Coating</a></li>
                    <li><a class="exampleLink" data-example="barrier">Barrier</a></li>
                </ul>
            </div>
            <div class="row">
                <div class="row">
                    <div class="col-sm-5">
                        <label for="nocoatings" class="col-sm-5 control-label">No of Coatings</label>
                        <input name="nocoatings" id="nocoatings" class="form-control" type="number" value="5" min="1"
                            style="width: 96px" />
                    </div>
                    <div class="col-sm-5">
                        <label for="manualinter" class="col-sm-5 control-label">Manual Intervention</label>
                        <input name="manualinter" id="manualinter" class="form-check-input" type="checkbox">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="gridfromca" class="col-sm-5 control-label">CA Microstructure</label>
                        <input name="gridfromca" id="gridfromca" class="form-check-input" type="checkbox">
                    </div>
                    <div class="col-sm-5">
                        <label for="nostrucsteps" class="col-sm-5 control-label">No Refinement Steps</label>
                        <input name="nostrucsteps" id="nostrucsteps" class="form-control" type="number" value="15" min="1"
                            style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="waterontop" class="col-sm-5 control-label">Top Water</label>
                        <input name="waterontop" id="waterontop" class="form-check-input" type="checkbox" checked>
                    </div>
                    <div class="col-sm-5">
                        <label for="depthofwater" class="col-sm-5 control-label">Depth of Water</label>
                        <input name="depthofwater" id="depthofwater" class="form-control" type="number" value="10"
                            min="1" style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="topcoated" class="col-sm-5 control-label">Topcoated</label>
                        <input name="topcoated" id="topcoated" class="form-check-input" type="checkbox">
                    </div>
                    <div class="col-sm-5">
                        <label for="depthoftopcoat" class="col-sm-5 control-label">Depth of Topcoat</label>
                        <input name="depthoftopcoat" id="depthoftopcoat" class="form-control" type="number" value="10"
                            min="1" style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="scribed" class="col-sm-5 control-label">Scribed</label>
                        <input name="scribed" id="scribed" class="form-check-input" type="checkbox">
                    </div>
                    <div class="col-sm-5">
                        <label for="sizeofscribe" class="col-sm-5 control-label">Size of Scribe</label>
                        <input name="sizeofscribe" id="sizeofscribe" class="form-control" type="number" value="10"
                            min="1" style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="radius" class="col-sm-5 control-label">Radius</label>
                        <input name="radius" id="radius" class="form-control" type="number" value="10" min="1"
                            style="width: 96px" />
                    </div>
                    <div class="col-sm-5">
                        <label for="noofparticles" class="col-sm-5 control-label">No of Particles</label>
                        <input name="noofparticles" id="noofparticles" class="form-control" type="number" value="20"
                            min="1" style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="noofcuts" class="col-sm-5 control-label">No of Particle Cuts</label>
                        <input name="noofcuts" id="noofcuts" class="form-control" type="number" value="4" min="0"
                            style="width: 96px" />
                    </div>
                    <div class="col-sm-5">
                        <label for="restrictrange" class="col-sm-5 control-label">Restrict Range</label>
                        <input name="restrictrange" id="restrictrange" class="form-check-input" type="checkbox">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="minparticle" class="col-sm-5 control-label">Minimum Particle Size</label>
                        <input name="minparticle" id="minparticle" class="form-control" type="number" value="3" min="1"
                            style="width: 96px" />
                    </div>
                    <div class="col-sm-5">
                        <label for="maxparticle" class="col-sm-5 control-label">Maximum Particle Size</label>
                        <input name="maxparticle" id="maxparticle" class="form-control" type="number" value="10" min="1"
                            style="width: 96px" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <label for="minimumpvc" class="col-sm-5 control-label">Minimum PVC</label>
                        <input name="minimumpvc" id="minimumpvc" class="form-control" type="number" value="0.1"
                            min="0.0" style="width: 96px" />
                    </div>
                    <div class="col-sm-5">
                        <label for="maximumpvc" class="col-sm-5 control-label">Maximum PVC</label>
                        <input name="maximumpvc" id="maximumpvc" class="form-control" type="number" value="1.0"
                            min="0.01" style="width: 96px" />
                    </div>
                </div>
            </div>
        </div>
        <div id="kinetics" class="tab-pane fade">
            <h3>Kinetics</h3>
            <div class="row">
                <div class="col-sm-5">
                    <label for="inhibitordensity" class="col-sm-5 control-label">Inhibitor Density</label>
                    <input name="inhibitordensity" id="inhibitordensity" class="form-control" type="number" value="1"
                        min="1" style="width: 96px" />
                </div>
                <div class="col-sm-5">
                    <label for="inhibitorsolubility" class="col-sm-5 control-label">Inhibitor Solubility</label>
                    <input name="inhibitorsolubility" id="inhibitorsolubility" class="form-control" type="number"
                        value="1" min="1" style="width: 96px" />
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="probdiff" class="col-sm-5 control-label">Probability of Diffusion</label>
                    <input name="probdiff" id="probdiff" class="form-control" type="number" value="1.0" min="0.01"
                        max="1.0" style="width: 96px" />
                </div>
                <div class="col-sm-5">
                    <label for="probsol" class="col-sm-5 control-label">Probability of Solubility</label>
                    <input name="probsol" id="probsol" class="form-control" type="number" value="1.0" min="0.01"
                        max="1.0" style="width: 96px" />
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="topleak" class="col-sm-5 control-label">Loose from Top</label>
                    <input name="topleak" id="topleak" class="form-check-input" type="checkbox" checked>
                </div>
                <div class="col-sm-5">
                    <label for="sideleak" class="col-sm-5 control-label">Loose from Side</label>
                    <input name="sideleak" id="sideleak" class="form-check-input" type="checkbox">
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="bottomleak" class="col-sm-5 control-label">Loose from Bottom</label>
                    <input name="bottomleak" id="bottomleak" class="form-check-input" type="checkbox">
                </div>
            </div>
        </div>
        <div id="running" class="tab-pane fade">
            <h3>Running</h3>
            <div class="row">
                <div class="col-sm-5">
                    <label for="numFrames" class="col-sm-5 control-label">Number of frames</label>
                    <input name="numFrames" id="numFrames" class="form-control" type="number" value="3" min="1"
                        style="width: 96px" />
                </div>
                <div class="col-sm-5">
                    <label for="numPlots" class="col-sm-5 control-label">Number of plots</label>
                    <input name="numPlots" id="numPlots" class="form-control" type="number" value="10" min="1"
                        style="width: 96px" />
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="endfraction" class="col-sm-5 control-label">Terminal Fraction</label>
                    <input name="endfraction" id="endfraction" class="form-control" type="number" value="0.5" min="0.0"
                        max="1.0" style="width: 96px" />
                </div>
                <div class="col-sm-5">
                    <label for="noupdates" class="col-sm-5 control-label">No Visual Updates</label>
                    <input name="noupdates" id="noupdates" class="form-check-input" type="checkbox">
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="plotCheckbox" class="col-sm-5 control-label">Global Plot</label>
                    <input name="plotCheckbox" id="plotCheckbox" class="form-check-input" type="checkbox">
                </div>
                <div class="col-sm-5">
                    <label for="xsqrt" class="col-sm-5 control-label">X Square Root</label>
                    <input name="xsqrt" id="xsqrt" class="form-check-input" type="checkbox">
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <label for="quickfinish" class="col-sm-5 control-label">End this Simulation</label>
                    <input name="quickfinish" id="quickfinish" class="form-check-input" type="checkbox">
                </div>
            </div>
        </div>
	</div>

        <script>
            /*		<div>
                        <label for="savedata" class="btn">Save Data</label>
                        <input id="savedata" style="visibility:hidden;" type="file" name="files[]"></input>
                    </div>
            function saveFileSelect(evt) {
                var files = evt.target.files; // FileList object
                var reader = new FileReader();
            
                // Closure to capture the file information.
                reader.onload = function(){
                if (multipleLeaches.length == 0) {
                    ret=JSON.stringify({ label : currentLabel, data:leachProgress});
                } else {
                    ret = JSON.stringify(multipleLeaches.concat({ label : currentLabel, data:leachProgress}));
                };
                var BB = new Blob([ret], {type: "text/plain;charset=UTF-8"});
                saveAs(BB, "./fred" + ".txt");
                };
                console.log('there');
                  // Read in the image file as a data URL.
                console.log(files[0]);
            //    reader.readAsText(files[0]);
            }
            
              document.getElementById('reloaddata').addEventListener('change', saveFileSelect, false);*/

            function reloadFileSelect(evt) {
                var files = evt.target.files; // FileList object
                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = function () {
                    text = reader.result;
                    console.log(reader.result.substring(0, 200));
                    multipleLeaches = JSON.parse(text);
                };
                console.log('there');
                // Read in the image file as a data URL.
                console.log(files[0]);
                reader.readAsText(files[0]);
            }

            document.getElementById('reloaddata').addEventListener('change', reloadFileSelect, false);
        </script>
        <script src="./dist/jquery.min.js"></script>
        <!--script src="//cdnjs.cloudflare.com/ajax/libs/pixi.js/3.0.7/pixi.min.js"></script-->
        <script src="./dist/pixi.js"></script>
        <!--script src="./dist/run_prettify.js?skin=desert"></script-->
        <script src="./dist/jquery.canvaswrapper.js"></script>
        <script src="./dist/jquery.colorhelpers.js"></script>
        <script src="./dist/jquery.flot.js"></script>
<!--        <script language="javascript" type="text/javascript" src="../../source/jquery.flot.uiConstants.js"></script>
        <script language="javascript" type="text/javascript" src="../../source/jquery.flot.drawSeries.js"></script>
        <script src="./dist/jquery.flot.axislabels.js"></script>
-->        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.saturated.js"></script>
        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.browser.js"></script>
        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.drawseries.js"></script>
        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.uiConstants.js"></script>
        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.symbol.js"></script>
        <script language="javascript" type="text/javascript" src="./dist/jquery.flot.legend.js"></script>
        <script src="./dist/jquery.flot.axislabels.js"></script>
<!--        <script src="./dist/jquery.flot.canvas.js"></script>
        <script src="./dist/jquery.flot.dashes.js"></script>
        <script src="./dist/jquery.flot.curvedlines.js"></script> 
	<script language="javascript" type="text/javascript" src="../../source/jquery.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.canvaswrapper.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.colorhelpers.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.flot.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.flot.saturated.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.flot.browser.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.flot.drawSeries.js"></script>
	<script language="javascript" type="text/javascript" src="../../source/jquery.flot.uiConstants.js"></script>    -->
        <script src="./dist/cellauto.js"></script>
        <script src="./dist/download.js"></script>
        <script src="./dist/CCapture.min.js"></script>
        <script src="./dist/html2canvas.min.js"></script>
        <script src="./dist/webm-writer-0.3.0.js"></script>
        <script src="./dist/coatsimvis.js"></script>
        <script src="./dist/examples.js"></script>
        <script src="./dist/bootstrap.min.js"></script>
        <script src="./dist/FileSaver.js"></script>
        <!--<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script> -->
</body>

</html>