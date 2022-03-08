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

          var rot_Y_matrix = new Tensor(    [[cos_phi, 0, -sin_phi],
                                            [0, 1, 0],
                                            [sin_phi, 0, cos_phi]] );

          var rot_centre_vertex_vector = rot_Y_matrix.multiply(centre_vertex_vector);
          var vertex_vector = rot_centre_vertex_vector.add( new Vector(this.x, this.y, this.z) );
          yield vertex_vector;
    }
  }

  getVerticesList(){
      var list = [];
      for(let vertex of this.getVerticesCoordinates()){
          list.push(vertex);
      }
      return list;
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

getSidesFromVertex(vertex_indices){
    var sides = [[0,1,3,2], [4,5,7,6], [0,1,4,5], [2,3,6,7], [0,2,6,4], [1,3,7,5]];
    var selected_sides = sides.filter(side => vertex_indices.every(i => side.includes(i)));
    return selected_sides;
}


getSidePointsFromPosition(camera_vector){
    var relative_vector = new Vector(this.x, this.y, this.z).add(camera_vector.opposite());
    var points = this.getVerticesList();

    var filterFunc = value => {return value.y > 0;  };
    var mapFuncZero = value => {value.y = 0; return value;  }
    //var mapFuncNorm = value => {return value.getNorm(); }
    function mapFuncNorm(relative_vector) {
    return function(value){
        return value.add(camera_vector.opposite()).getNorm();
    }}

    var points = points.filter(filterFunc).map(mapFuncZero);
    var point_norms = points.map(mapFuncNorm(camera_vector) );
    //console.log(point_norms);
    var point1_index = Mathematics.getSmallestValueIndex(point_norms);
    var point1 = points[point1_index];

    point_norms.splice(point1_index, 1);
    points.splice(point1_index, 1);

    var point2_index = Mathematics.getSmallestValueIndex(point_norms);
    var point2 = points[point2_index];

    return [point1, point2];
}


getSideNormalVector(camera_vector){
    var side_points = this.getSidePointsFromPosition(camera_vector);

    var normal_vector = new Vector(side_points[1].z - side_points[0].z, 0, side_points[0].x - side_points[1].x);
    normal_vector = normal_vector.multiply(1 / normal_vector.getNorm());

    var relat_vector = camera_vector.add(new Vector(-this.x, -this.y, -this.z));

    if(relat_vector.getNorm() < relat_vector.add(normal_vector).getNorm()){
        normal_vector = normal_vector.multiply(-1);
    }

    return normal_vector;
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
/*
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
}*/

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


  projectPoint(point, camera){

    point = point.add(new Vector(-camera.x,-camera.y,-camera.z));
    var cos = Math.cos(-camera.phi);
    var sin = Math.sin(-camera.phi);
    var rotation_matrix = new Tensor(   [[cos, 0, -sin],
                                          [0, 1, 0],
                                      [sin, 0, cos]]);
    point = rotation_matrix.multiply(point);
    point = point.multiply(this.distance / point.x);
    point.x -= this.distance;

    return [point.z, point.y];
  }

projectCube(cube, camera, graphics){
    var points = [];
    cube.getSideNormalVector(new Vector(camera.x, camera.y, camera.z));
    if(camera.isCubeInFieldOfView(cube)){

        var nearest_indices = [];
        var nearest_distance = null;
        for(  let vertex_vector of cube.getVerticesCoordinates() ){

            var intersect_point_plane = this.projectPoint(vertex_vector, camera);
            graphics.drawPoint(intersect_point_plane[0], intersect_point_plane[1]);
            points.push(intersect_point_plane);
            //nejblizsi hrana
            {
              var displacement =
                (vertex_vector.x - camera.x)**2 + (vertex_vector.y - camera.y)**2 + (vertex_vector.z - camera.z)**2;

              if(nearest_distance == null || nearest_distance == displacement){
                nearest_indices.push(points.length - 1);
                nearest_distance = displacement;
              }
              else if(nearest_distance > displacement){
                nearest_indices = [points.length - 1];
                nearest_distance = displacement;
              }
            }

        }

        for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
        }

        var sides_indices = cube.getSidesFromVertex(nearest_indices);
        this.colorCubeFromSides(graphics, points, sides_indices);
    }
}


colorCubeFromSides(graphics, points, sides_indices){
  var col_index = 0;
  var colors = ["#800", "#080", "#008"];
  //console.log(sides_indices);
  for(var side of sides_indices){

    var tetragon_points = [];
    for(let i=0; i<4; ++i){ tetragon_points.push(points[side[i]]); }

    //tetragon_points = graphics.rearangeTetragonCoords(tetragon_points);
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

move(delta_x,delta_y,delta_z, cubes){

    var translation_vector = new Vector(delta_x, delta_y, delta_z);
    var collision_cube = this.colliding(cubes, translation_vector)

    if(collision_cube == null){
        this.x += delta_x;
        this.y += delta_y;
        this.z += delta_z;
    }
    else{

        var side_normal_vector = collision_cube.getSideNormalVector(new Vector(this.x, this.y, this.z));
        var normal_projection = side_normal_vector.multiply( side_normal_vector.dotProduct(translation_vector) );
        var tangent_projection = translation_vector.add( normal_projection.opposite() );

        this.x += tangent_projection.x;
        this.y += tangent_projection.y;
        this.z += tangent_projection.z;
        console.log(this.x + " " + this.z);
    }
}

rotate(delta_phi){

    this.phi += delta_phi;
    while(this.phi >= 2 * Math.PI){ this.phi -= 2*Math.PI;  }
    while(this.phi < 0){ this.phi += 2*Math.PI;  }

  }


//neni dokonale - funguje pro nenatocene krychle a zamezi veskeremu pohybu
colliding(cubes, translation_vector){
    for(let cube of cubes){
        var z_diff = Math.abs(cube.z - this.z - translation_vector.z);
        var x_diff = Math.abs(cube.x - this.x - translation_vector.x);

        if(z_diff <= 5/8*cube.side_len && x_diff <= 5/8*cube.side_len){ return cube;    }
    }
    return null;
}

isInFieldOfView(point){

    var point_translated = point.add(new Vector(-camera.x, -camera.y, -camera.z));
    var cos_phi = Math.cos(-camera.phi);
    var sin_phi = Math.sin(-camera.phi);
    var rot_Y_matrix = new Tensor(    [[cos_phi, 0, -sin_phi],
                                          [0, 1, 0],
                                          [sin_phi, 0, cos_phi]] );

    var point_rotated = rot_Y_matrix.multiply(point_translated);

    var logic_0 = point_rotated.x >= 0;
    var logic_1 = point_rotated.z < point_rotated.x * Math.tan(this.field_of_view / 2);
    var logic_2 = point_rotated.z > - point_rotated.x * Math.tan(this.field_of_view / 2);

    return (logic_0 && logic_1 && logic_2);
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
