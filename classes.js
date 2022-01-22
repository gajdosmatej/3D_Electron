class Cube{
  x;
  y;
  z;
  position_vector;
  side_len;
  phi;

constructor(x, y, z, len, phi=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.side_len = len;
    this.phi = phi;
    this.position_vector = new Vector(x,y,z);
  }


*getVerticesCoordinates(){

      var cos_phi = Math.cos(this.phi);
      var sin_phi = Math.sin(this.phi);

      for(let centre_vertex_vector of this.getRelativeVerticesCoordinates()){;

          var rot_Y_matrix = new Tensor(    [[cos_phi, 0, sin_phi],
                                            [0, 1, 0],
                                            [-sin_phi, 0, cos_phi]] );

          var rot_centre_vertex_vector = rot_Y_matrix.multiply(centre_vertex_vector);
          var vertex_vector = rot_centre_vertex_vector.add( new Vector(this.x, this.y, this.z) );
          yield vertex_vector;
    }
  }

*getRelativeVerticesCoordinates(){
      for(let x_modifier of [-1, 1]){
          for(let y_modifier of [-1, 1]){
              for(let z_modifier of [-1, 1]){

                yield new Vector(x_modifier * this.side_len / 2,
                      y_modifier * this.side_len / 2,
                      z_modifier * this.side_len / 2);
      }}}
  }

getSidesFromVertex(vertex_index){

    var sides = [[0,1,2,3], [4,5,6,7], [0,1,4,5], [2,3,6,7], [0,2,4,6], [1,3,5,7]];
    var selected_sides = [];
    for(let i = 0; i < sides.length; ++i){
        if(sides[i].includes(vertex_index)){    selected_sides.push(sides[i]); }
    }
    return selected_sides;
}
}


class GraphicsControl{

  canvas;
  ctx;
  offset;

constructor(canvas){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.offset = [canvas.width / 2, canvas.height / 2];

  }

drawSquare(x,y,side){

    this.ctx.beginPath();
    this.ctx.rect(x+this.offset[0], y+this.offset[1], x+side+this.offset[0], y+side+this.offset[1]);
    this.ctx.stroke();

  }

drawPoint(x,y){

    this.ctx.beginPath();
    this.ctx.arc(x+this.offset[0], y+this.offset[1], 2, 0, 2 * Math.PI);
    this.ctx.fill();

  }

fillTetragon(coord1, coord2, coord3, coord4, color){

    this.ctx.beginPath();
    this.ctx.moveTo(coord1[0] + this.offset[0], coord1[1] + this.offset[1]);
    this.ctx.lineTo(coord2[0] + this.offset[0], coord2[1] + this.offset[1]);
    this.ctx.lineTo(coord3[0] + this.offset[0], coord3[1] + this.offset[1]);
    this.ctx.lineTo(coord4[0] + this.offset[0], coord4[1] + this.offset[1]);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();

  }

drawLine(coord_1, coord_2){

    this.ctx.beginPath();
    this.ctx.moveTo(coord_1[0] + this.offset[0], coord_1[1] + this.offset[1]);
    this.ctx.lineTo(coord_2[0] + this.offset[0], coord_2[1] + this.offset[1]);  //index 2 docasne
    this.ctx.stroke();

  }

clear(){

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

rearangeTetragonCoords(coords){
    var dist_quad = (coord1, coord2) => (coord1[0] - coord2[0])**2 + (coord1[1] - coord2[1])**2;
    var new_coords = [coords[0]];
    var remain_coords = [];

    if(dist_quad(new_coords[0], coords[1]) < dist_quad(new_coords[0], coords[2])){
      new_coords.push(coords[1]);
      remain_coords = [coords[2], coords[3]];
    }
    else{
      new_coords.push(coords[2]);
      remain_coords = [coords[1], coords[3]];
    }

    if(dist_quad(new_coords[1], remain_coords[0]) < dist_quad(new_coords[1], remain_coords[1])){
      new_coords.push(remain_coords[0], remain_coords[1]);
      return new_coords;
    }
    else{
      new_coords.push(remain_coords[1], remain_coords[0]);
      return new_coords;
    }
  }
}

class ProjectionPlane{

  width;
  height;
  distance;
  r = 100;

constructor(w,h,d,r){

    this.width = w;
    this.height = h;
    this.distance = d;
    this.r = r;

  }

projectPoint(point_vector, camera){

    if(camera.isInFieldOfView(point_vector)){

      var point = point_vector.add(new Vector(-camera.x,-camera.y,-camera.z));
      var k = this.distance / (point.x * Math.cos(camera.phi) + point.z * Math.sin(camera.phi));
      return point.multiply(k);
    }
  }
/*
projectPointOnSphere(point_vector, camera){

      point_vector = point_vector.add(new Vector(-camera.x, -camera.y, -camera.z)); //transformace do souradnic s pocatkem v kamere
    //if(camera.isInFieldOfView(point_vector)){
      return point_vector.multiply(this.r / point_vector.getNorm());
    //}
  }

transformCoordinateSystemSphere(point, camera){

      var cos_theta = (point.x * Math.cos(camera.phi) + point.z * Math.sin(camera.phi)) / Math.sqrt(point.x **2 + point.z **2);
      var sgn = 1;
      var cos_phi = Math.cos(camera.phi);
      var sin_phi = Math.sin(camera.phi);
      var rot_Y_matrix = new Tensor(    [[cos_phi, 0, sin_phi],
                                            [0, 1, 0],
                                            [-sin_phi, 0, cos_phi]] );

      var new_point = rot_Y_matrix.multiply(point);
      if(new_point.z < 0){  sgn = -1;   }
      var new_x = sgn * this.r * Math.acos(cos_theta);
      //console.log(camera.phi / Math.PI * 180);
      //console.log(new_x);
      return [new_x, point.y];

  }
*/
transformCoordinateSystem(point, camera){
  /* var cos = Math.cos(camera.phi);
    var sin = Math.sin(camera.phi);
    var translation = new Vector(-this.distance*cos, 0, -this.distance*sin);
    var rotation_matrix = new Tensor(   [[sin, 0, cos],
                                        [0, 1, 0],
                                        [-cos, 0, sin]]);*/

    var cos = Math.cos(-camera.phi);
    var sin = Math.sin(-camera.phi);
    var translation = new Vector(-this.distance*cos, 0, -this.distance*sin);
    var rotation_matrix = new Tensor(   [[cos, 0, sin],
                                          [0, 1, 0],
                                      [-sin, 0, cos]]);
    var transformed_point = rotation_matrix.multiply(point.add(translation));
    return [transformed_point.z, transformed_point.y];

  }

  NEWPROJECTION(point, camera){

    point = point.add(new Vector(-camera.x,-camera.y,-camera.z));
    var cos = Math.cos(-camera.phi);
    var sin = Math.sin(-camera.phi);
    var rotation_matrix = new Tensor(   [[cos, 0, sin],
                                          [0, 1, 0],
                                      [-sin, 0, cos]]);
    point = rotation_matrix.multiply(point);
    point = point.multiply(this.distance / point.x);
    point.x -= this.distance;
    //console.log(point);
    return [point.z, point.y];
  }

projectCube(cube, camera, graphics){

    Debug([{phi: camera.phi}]);
    //Debug([{},{isCubeInFieldOfView: camera.isCubeInFieldOfView(cube)}]);

    var points = [];

    if(camera.isCubeInFieldOfView(cube)){

        var nearest_index = null;
        var nearest_distance = null;
        for(  let vertex_vector of cube.getVerticesCoordinates() ){

          //nejblizsi hrana
          {
            var displacement =
              (vertex_vector.x - camera.x)**2 + (vertex_vector.y - camera.y)**2 + (vertex_vector.z - camera.z)**2;
            if(nearest_distance == null || nearest_distance > displacement){

              nearest_index = points.length;
              nearest_distance = displacement;

            }
          }

            /*var intersect_point = this.projectPoint(vertex_vector, camera);
            if(intersect_point == undefined){ continue; }
            var intersect_point_plane = this.transformCoordinateSystem(intersect_point, camera);*/
            var intersect_point_plane = this.NEWPROJECTION(vertex_vector, camera);
            graphics.drawPoint(intersect_point_plane[0], intersect_point_plane[1]);
            points.push(intersect_point_plane);

            /*
            var intersect_point = this.projectPointOnSphere(vertex_vector, camera);
            var intersect_point_sphere = this.transformCoordinateSystemSphere(intersect_point, camera);
            graphics.drawPoint(intersect_point_sphere[0], intersect_point_sphere[1]);
            points.push(intersect_point_sphere);*/
        }

        for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
        }

        for(let point of points){   Debug([{},{},{point: point}]); }
        //this.colorCubeFromSides(graphics, points, cube.getSidesFromVertex(nearest_index));
    //vybarvovaci fce?
    }
}

colorCubeFromSides(graphics, points, sides_indices){
  var col_index = 0;
  var colors = ["#0000FF", "#0000FF", "#0000FF"];
  for(var side_indices of sides_indices){

    var tetragon_points = [];
    for(let i=0; i<4; ++i){ tetragon_points.push(points[side_indices[i]]); }

    tetragon_points = graphics.rearangeTetragonCoords(tetragon_points);

    graphics.fillTetragon(tetragon_points[0], tetragon_points[1], tetragon_points[2], tetragon_points[3], colors[col_index]);
    //console.log(colors[col_index]);
    col_index += 1;
  }
}
}

class Camera{

x = 0;
y = 0;
z = 0;
phi = 0*Math.PI;
field_of_view = 0.8*Math.PI/6;

move(delta_x,delta_y,delta_z){
    this.x += delta_x;
    this.y += delta_y;
    this.z += delta_z;
    console.log([delta_x, delta_z]);
}

rotate(delta_phi){

    this.phi += delta_phi;
    while(this.phi >= 2 * Math.PI){ this.phi -= 2*Math.PI;  }
    while(this.phi < 0){ this.phi += 2*Math.PI;  }

  }

isInFieldOfView(point){


    //Debug([{angle: point.getAngleXZ() / Math.PI *180}]);
    var point_translated = point.add(new Vector(-camera.x, -camera.y, -camera.z));
    var cos_phi = Math.cos(-camera.phi);
    var sin_phi = Math.sin(-camera.phi);
    var rot_Y_matrix = new Tensor(    [[cos_phi, 0, sin_phi],
                                          [0, 1, 0],
                                          [-sin_phi, 0, cos_phi]] );
    //Debug([{point: point_translated.x}]);
    var point_rotated = rot_Y_matrix.multiply(point_translated);
      //var theta = point_translated.getAngleXZ();
    //Debug({},{},{rotated_point_x : point.x, rotated_point_z: point.z});
    var logic_0 = point_rotated.x >= 0;
    var logic_1 = point_rotated.z < point_rotated.x * Math.tan(this.field_of_view / 2);
    var logic_2 = point_rotated.z > - point_rotated.x * Math.tan(this.field_of_view / 2);
  //console.log(point_rotated);
    return (logic_0 && logic_1 && logic_2);
    //Debug([{theta: theta, FOV: this.field_of_view, tan: Math.tan(0.5*theta)}]);
    //var logic_1 = Math.tan(0.5*theta) > Math.tan(-0.5*this.field_of_view/2);
    //var logic_2 = Math.tan(0.5*theta) < Math.tan(0.5*this.field_of_view/2);
    //return logic_1 && logic_2;

  }

isCubeInFieldOfView(cube){
      for(  let vertex_vector of cube.getVerticesCoordinates() ){
        //Debug([{},{isPointInFOV: this.isInFieldOfView(vertex_vector)}]);
    }
      for(  let vertex_vector of cube.getVerticesCoordinates() ){
          if(this.isInFieldOfView(vertex_vector)){ return true;    }
      }
      return false;
  }
}

function Debug(info){
    var DEBUG_LAYER = 1;    //-1 ... zadny debug, 0 ... zakladni debug, 1 ... rozsireny debug
    var names = ["BASIC", "DETAILED", "EXTRA_DETAILED"]
    for(let i = 0; i <= DEBUG_LAYER; ++i){
        var dict = info[i];
        for(property in dict){
            console.log(names[i] + " | " + property + ": " + dict[property]);
        }
    }
}
