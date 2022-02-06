<!DOCTYPE html>
<head>
<meta charset="utf-8">

<script src="classes.js"></script>
<script src="math_classes.js"></script>
<script language="javascript">

  const ANGULAR_VELOCITY = 0.5*Math.PI;
  const VELOCITY = 500;
  const MOVE_FPS = 100;

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

    document.getElementById("fps").innerHTML = "FPS: " + String(MOVE_FPS);
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
    console.log([camera.x,camera.z]);
    graphics.clear();
    project();
    //console.log(camera.x);
    //console.log(camera.phi);

  }


  var pressed_directions = [false, false, false, false, false, false];
  var timers = [null, null, null, null, null, null];

  function getIndexFromKey(key){

      if(key == 'w' || key == 'ArrowUp'){   index = 0;   }
      else if(key == 's' || key == 'ArrowDown'){   index = 1;   }
      else if(key == 'a' || key == 'ArrowLeft'){   index = 2;   }
      else if(key == 'd' || key == 'ArrowRight'){   index = 3;   }

      else if(key == 'q'){   index = 4;   }
      else if(key == 'e'){   index = 5;   }
      else{ index = -1; }

      return index;
  }

  function keyPressed(ev){

      var key = ev.key;
      var index = getIndexFromKey(key);

      if(index != -1){
          if(!pressed_directions[index]){
              pressed_directions[index] = true;

              if(timers[index] == null){
                  timers[index] = setInterval(function(){move(index);}, 1000 / MOVE_FPS);
              }
          }
      }
  }

  function keyUnpressed(ev){

      var key = ev.key;
      var index = getIndexFromKey(key);
      if(index != -1){
          pressed_directions[index] = false;

          if(timers[index] != null){
              clearInterval(timers[index]);
              timers[index] = null;
          }
      }
  }

  function move(index){
      switch(index){
          case 0:
            camera.move(VELOCITY/MOVE_FPS*Math.cos(camera.phi),0,VELOCITY/MOVE_FPS*Math.sin(camera.phi));
            break;
          case 1:
            camera.move(-VELOCITY/MOVE_FPS*Math.cos(camera.phi),0,-VELOCITY/MOVE_FPS*Math.sin(camera.phi));
            break;
          case 2:
            camera.move(VELOCITY/MOVE_FPS*Math.sin(camera.phi),0,-VELOCITY/MOVE_FPS*Math.cos(camera.phi));
            break;
          case 3:
            camera.move(-VELOCITY/MOVE_FPS*Math.sin(camera.phi),0,VELOCITY/MOVE_FPS*Math.cos(camera.phi));
            break;
          case 4:
            camera.rotate(-ANGULAR_VELOCITY/MOVE_FPS);
            break;
          case 5:
            camera.rotate(ANGULAR_VELOCITY/MOVE_FPS);
      }
      redraw();
  }
</script>

</head>
<body onload="load();" onkeydown="keyPressed(event);" onkeyup="keyUnpressed(event);">
<input type="button" value="<-" onclick="camera.rotate(-0.005*Math.PI); redraw();">
<input type="button" value="->" onclick="camera.rotate(0.005*Math.PI); redraw();">
<input type="button" value="^" onclick="camera.move(10*Math.cos(camera.phi),0,10*Math.sin(camera.phi)); redraw();">
<input type="button" value="<" onclick="camera.move(10*Math.sin(camera.phi),0,-10*Math.cos(camera.phi)); redraw();">
<input type="button" value=">" onclick="camera.move(-10*Math.sin(camera.phi),0,10*Math.cos(camera.phi)); redraw();">
<input type="button" value="v" onclick="camera.move(-10*Math.cos(camera.phi),0,-10*Math.sin(camera.phi)); redraw();">
<div id="fps"></div>
<div>
<canvas id="cnv" style="border: solid 1px;"></canvas>
<div style="height: 15px; position:absolute; top: 50%; left: 50%; width: 15px; background-color: #000;"></div>
</div>
</body>
</html>