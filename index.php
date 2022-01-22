<html>
<head>
<meta charset="utf-8">

<script src="classes.js"></script>
<script src="math_classes.js"></script>
<script language="javascript">

  var camera;
  <?php

  $import_json = file_get_contents("export.json");
  $list = json_decode($import_json, true);

  echo "var objects = [";

  for ($i = 1; $i < count($list); $i++) {
    echo "new Cube(";
    echo strval($list[$i]["x"]);
    echo ", 0, ";
    echo strval($list[$i]["y"]);
    echo ", ";
    echo strval($list[$i]["size"]);
    echo ", 0), ";
  }
  echo "new Cube(";
  echo strval($list[0]["x"]);
  echo ", 0, ";
  echo strval($list[0]["y"]);
  echo ", ";
  echo strval($list[0]["size"]);
  echo ", 0)];";

   ?>
  var graphics;
  var plane;

  function load(){

    var can = document.getElementById("cnv");
    can.width = 0.96*window.innerWidth;
    can.height = 0.96*window.innerHeight;

    graphics = new GraphicsControl(can);
    camera = new Camera();
    var distance = can.width / (2 * Math.tan(camera.field_of_view / 2));
    var r = can.width / camera.field_of_view;
    plane = new ProjectionPlane(can.width, can.height, distance, r);

    //objects.push(new Cube(400,0,30,20, Math.PI / 1));

    project();

  }

  function project(){

    for(obj of objects){  plane.projectCube(obj, camera, graphics); }

  }

  function redraw(){

    graphics.clear();
    project();
    //console.log(camera.x);
    //console.log(camera.phi);

  }

</script>

</head>
<body onload="load();">
<input type="button" value="<-" onclick="camera.rotate(0.005*Math.PI); redraw();">
<input type="button" value="->" onclick="camera.rotate(-0.005*Math.PI); redraw();">
<input type="button" value="^" onclick="camera.move(10*Math.cos(camera.phi),0,10*Math.sin(camera.phi)); redraw();">
<input type="button" value="<" onclick="camera.move(10*Math.sin(camera.phi),0,-10*Math.cos(camera.phi)); redraw();">
<input type="button" value=">" onclick="camera.move(-10*Math.sin(camera.phi),0,10*Math.cos(camera.phi)); redraw();">
<input type="button" value="v" onclick="camera.move(-10*Math.cos(camera.phi),0,-10*Math.sin(camera.phi)); redraw();">
<div>
<canvas id="cnv" style="border: solid 1px;"></canvas>
<div style="height: 15px; position:absolute; top: 50%; left: 50%; width: 15px; background-color: #000;"></div>
</div>
</body>
</html>
