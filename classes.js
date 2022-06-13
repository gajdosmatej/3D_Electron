class Level{
    array;
    rows;
    columns;

    constructor(object_list){
        var xs = object_list.map(cube => cube.x);
        var zs = object_list.map(cube => cube.z);

        var min_x_index = Mathematics.getSmallestValueIndex(xs);
        var max_x_index = Mathematics.getSmallestValueIndex(xs.map(obj => -obj));
        var min_z_index = Mathematics.getSmallestValueIndex(zs);
        var max_z_index = Mathematics.getSmallestValueIndex(zs.map(obj => -obj));
        
        var min_x = object_list[min_x_index].x;
        var min_z = object_list[min_z_index].z;
        var max_x = object_list[max_x_index].x;
        var max_z = object_list[max_z_index].z;

        var L = object_list[0].side_len;

        var size_row = (max_z - min_z) / L;
        var size_col = (max_x - min_x) / L;

        this.rows = size_row + 1;
        this.columns = size_col + 1;

        this.array = Array(size_row+1).fill(null).map(obj => Array(size_col+1).fill(null));

        for(var cube of object_list){
            var row = (cube.z - min_z) / L;
            var column = (cube.x - min_x) / L;
            this.array[row][column] = cube;
            cube.map_coord = [row, column];
        }
    }

    getNeighbours(coord){

        var row = coord[0];
        var col = coord[1];

        var neigh = [];
        if(row == 0){   neigh[0] = null;    }   else{   neigh[0] = this.array[row-1][col];  }
        if(col == 0){   neigh[1] = null;    }   else{   neigh[1] = this.array[row][col-1];  }
        if(row == this.rows-1){ neigh[2] = null;    }   else{   neigh[2] = this.array[row+1][col];  }
        if(col == this.columns-1){  neigh[3] = null;    }   else{   neigh[3] = this.array[row][col+1];  }
        return neigh;

    }

    get(coord){
        return array[coord[0]][coord[1]];
    }
}


class Character{
    x;
    y;
    z;
    position_vector;
    side_len;
    phi;
    map_coord;
    texturePath = "character/forward1.png";
    animation_number = 1;
    path;
    timer;
    direction = [0,1];
    direction_increment = 1;
    velocity = 5;

    constructor(x, y, z, len, path, phi=0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.path = path;
        this.side_len = len;
        this.phi = phi;
        this.position_vector = new Vector(x,y,z);
        this.timer = setInterval(this.move.bind(this), 100);
      }

    move(){
          var i = this.direction[0];
          var j = this.direction[1];
          var direction_vector = new Vector(this.path[j][0] - this.path[i][0], 0, this.path[j][1] - this.path[i][1]);
          direction_vector = direction_vector.multiply(this.velocity / direction_vector.getNorm());

          this.position_vector = this.position_vector.add(direction_vector);
          this.x = this.position_vector.x;
          this.z = this.position_vector.z;

          if(this.x == this.path[j][0] && this.z == this.path[j][1]){

                if(this.path.length == this.direction[1] + 1){
                    this.direction_increment = -1;
                    this.direction.reverse();
                }else if(this.direction[1] == 0){
                    this.direction_increment = 1;
                    this.direction.reverse();
                }else{
                    this.direction[0] += this.direction_increment;
                    this.direction[1] += this.direction_increment;
                }
            }

            if(this.animation_number < 3){  this.animation_number++; }
            else{   this.animation_number = 1;  }
            this.texturePath = "character/forward" + this.animation_number + ".png";

          redraw();

      }

      getDirectionArray(){
          var i = this.direction[0];
          var j = this.direction[1];
          var direction_vector = new Vector(this.path[j][0] - this.path[i][0], 0, this.path[j][1] - this.path[i][1]);
          direction_vector = direction_vector.multiply(1 / direction_vector.getNorm());

          return [direction_vector.x, direction_vector.z];
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

    getNearestSide(camera_vector){
        var sides = [[0,1,3,2], [4,5,7,6], [0,1,4,5], [2,3,6,7], [0,2,6,4], [1,3,7,5]];
        var points = this.getVerticesList();
        var totalDistance = indices => {
                            var d = 0;
                            for(var i=0; i<4; ++i){
                                var point = points[indices[i]];
                                d += (point.x - camera.x)**2 + (point.z - camera.z)**2;
                            }
                            return d;
                        }
        var distances = sides.map(totalDistance);
        var closest_side = sides[Mathematics.getSmallestValueIndex(distances)];
        return closest_side;
      }
}

class Cube{
  x;
  y;
  z;
  position_vector;
  side_len;
  phi;
  texturePath;
  map_coord;

constructor(x, y, z, len, texturePath, phi=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.side_len = len;
    this.texturePath = texturePath;
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

class Door extends Cube{
    focus = false;
    opened = false;

    changeState(){
        if(this.opened){
            this.opened = false;
        }
        else{
            this.opened = true;
        }
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


paintCharacter(coord, character){
    var texture = new Image();
    texture.src = character.texturePath;
    this.ctx.drawImage(texture, coord[0] + this.offset[0], coord[1] + this.offset[1], character.side_len, character.side_len);
}

//RU -> RD -> LU -> LD ale U a D zamenene (y roste dolu)
fillTetragon(coord1, coord2, coord3, coord4, color, texturePath, alpha){
/*
    this.ctx.beginPath();
    this.ctx.moveTo(coord1[0] + this.offset[0], coord1[1] + this.offset[1]);
    this.ctx.lineTo(coord2[0] + this.offset[0], coord2[1] + this.offset[1]);
    this.ctx.lineTo(coord4[0] + this.offset[0], coord4[1] + this.offset[1]);
    this.ctx.lineTo(coord3[0] + this.offset[0], coord3[1] + this.offset[1]);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();*/

    var texture = new Image();
    texture.src = texturePath;
/*
    var tan = (coord3[1] - coord1[1]) / (coord3[0] - coord1[0]);
    //var tan_up = (coord4[1] - coord2[1]) / (coord4[0] - coord2[0]);
    var size = Math.abs(coord3[0] - coord1[0]);
    var size_y = Math.abs(coord1[1] - coord2[1]);

    //this.ctx.setTransform(1, tan, 0, 1, 0, 0);
    var n_clips = 50;
    var funcUp = (x) => {  return -tan*x + tan*coord4[0] + coord4[1];  };
    var funcDown = (x) => {  return tan*x - tan*coord4[0] + coord4[1];  };
    var funcImgUp = (x) => { return tan*x;  }
    var funcImgDown = (x) =>{return tan*x + size_y;  }
    for(let i = 0; i < n_clips; ++i){

      var start_x = i/n_clips * size;
      var start_y = funcImgUp(start_x);
      var x = coord3[0] + i/n_clips * size;
      var y = funcUp(x);
      var w_x = 1/n_clips * size;
      var w_y = Math.abs(funcImgDown(start_x) - funcImgUp(start_x));
      this.ctx.drawImage(texture, start_x, start_y, w_x, w_y, x + this.offset[0], y + this.offset[1], w_x, w_y); */

      var L0 = 200;
      var Lx = Math.abs(coord3[0] - coord1[0]);
      var Ly = Math.abs(coord4[1] - coord3[1]);
      var n_clips = 20;
      var dx0 = L0 / n_clips;
      var dx = Lx / n_clips;
      var tg0 = Math.abs(coord3[1] - coord1[1]) / L0;   //budou znamenka jmenovatelu ok?
      var tg = (coord3[1] - coord1[1]) / (coord3[0] - coord1[0]);

      this.ctx.globalAlpha = alpha;
      for(let i = 0; i < n_clips; ++i){

          var x0 = i*dx0;
          var w0 = dx0;
          //var y0 = x0 * tg0;
          var y0 = 0;
          var h0 = L0;
          //var h0 = L0 - 2*y0;
          var x = i*dx;
          var w = dx;
          var y = -x*tg;
          var h = Ly - 2*y; //console.log(h);

          this.ctx.drawImage(texture, x0, y0, w0, h0, coord4[0] + x + this.offset[0] + 1, y + coord4[1] + this.offset[1], w, h);
      }
      this.ctx.globalAlpha = 1;

    //this.ctx.drawImage(texture, coord4[0] + this.offset[0], coord4[1] + this.offset[1], size, size);
    //this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  }

fillFloor(coord1, coord2, coord3, coord4, texturePath){

  
  this.ctx.beginPath();
  this.ctx.fillStyle = "#AAA";
  this.ctx.moveTo(coord1[0]+this.offset[0], coord1[1]+this.offset[1]);
  this.ctx.lineTo(coord2[0]+this.offset[0], coord2[1]+this.offset[1]);
  this.ctx.lineTo(coord4[0]+this.offset[0], coord4[1]+this.offset[1]);
  this.ctx.lineTo(coord3[0]+this.offset[0], coord3[1]+this.offset[1]);
  this.ctx.lineTo(coord1[0]+this.offset[0], coord1[1]+this.offset[1]); 
  this.ctx.fill();
  this.ctx.closePath();
/*
  var texture = new Image();
  texture.src = texturePath;

    var L0 = 200;
    var Lx = Math.abs(coord3[0] - coord1[0]);
    var Ly = Math.abs(coord4[1] - coord3[1]);
    var n_clips = 20;
    var dx0 = L0 / n_clips;
    var dx = Lx / n_clips;
    var tg0 = Math.abs(coord3[1] - coord1[1]) / L0;   //budou znamenka jmenovatelu ok?
    var tg = (coord3[1] - coord1[1]) / (coord3[0] - coord1[0]);

    for(let i = 0; i < n_clips; ++i){

        var x0 = i*dx0;
        var w0 = dx0;
        //var y0 = x0 * tg0;
        var y0 = 0;
        var h0 = L0;
        //var h0 = L0 - 2*y0;
        var x = i*dx;
        var w = dx;
        var y = -x*tg;
        var h = Ly - 2*y; //console.log(h);

        //this.ctx.drawImage(texture, x0, y0, w0, h0, coord4[0] + x + this.offset[0] + 1, y + coord4[1] + this.offset[1], w, h);
    }*/

}

drawLine(coord_1, coord_2){

    this.ctx.beginPath();
    this.ctx.lineWidth = 10;
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

        /*for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
      }*/

        for(var v of [[0,1], [0,2], [1,3], [2,3], [0,4], [1,5], [2,6], [3,7], [4,5], [5,7], [6,7], [4,6]]){
            graphics.drawLine(points[v[0]], points[v[1]]);
        }

        var alpha = 1;
        if(cube.constructor.name == "Door"){
            if(cube.focus){ alpha = 0.9;    }
        }
        var sides_indices = cube.getSidesFromVertex(nearest_indices);

        this.colorCubeFromSides(graphics, points, sides_indices, cube.texturePath, alpha);
    }
}

projectFloor(cube, camera, graphics){
  var points = [];

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

        /*for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
      }*/

        /*for(var v of [[0,1], [0,2], [1,3], [2,3], [0,4], [1,5], [2,6], [3,7], [4,5], [5,7], [6,7], [4,6]]){
            graphics.drawLine(points[v[0]], points[v[1]]);
        }*/

        if(cube.y > 0){ var sortFunc = (a, b) => a[1] - b[1]; }else{  var sortFunc = (a, b) => b[1] - a[1]; }
        points = points.sort(sortFunc).slice(0,4);

        for(var v of [[0,1], [0,2], [1,3], [2,3]]){
          graphics.drawLine(points[v[0]], points[v[1]]);
        }

        var sides_indices = cube.getSidesFromVertex(nearest_indices);
        var sorted_coord = this.getTetragonPoints(points, [0,1,2,3]);
        graphics.fillFloor(sorted_coord[0], sorted_coord[1], sorted_coord[2], sorted_coord[3], cube.texturePath);
    }
}

chooseCharacterTexture(cube, camera){

    //console.log(cube.getSideNormalVector( new Vector(camera.x, camera.y, camera.z)));
    var nearest_normal = cube.getSideNormalVector( new Vector(camera.x, camera.y, camera.z));
    var normal_arr = [nearest_normal.x, nearest_normal.z];

    var direction = cube.getDirectionArray();

    var whole_matrix = [[1,0], [0,1], [-1,0], [0,-1], [1,0], [0,1], [-1,0], [0,-1]];
    var whole_index = Mathematics.getIndex(whole_matrix, direction);
    var matrix = whole_matrix.slice(whole_index, whole_index + 4);

    var side_index = Mathematics.getIndex(matrix, normal_arr);
    var sides = ["back", "left", "forward", "right"];

    return "character/" + sides[side_index];

}

projectCharacter(cube, camera, graphics){
    var points = [];
    //console.log(cube.getNearestSide(new Vector(camera.x, camera.y, camera.z)));
    if(camera.isCubeInFieldOfView(cube)){

        var nearest_indices = [];
        var nearest_distance = null;

        cube.texturePath = this.chooseCharacterTexture(cube, camera) + cube.animation_number + ".png";

        for(  let vertex_vector of cube.getVerticesCoordinates() ){

            var intersect_point_plane = this.projectPoint(vertex_vector, camera);
            //graphics.drawPoint(intersect_point_plane[0], intersect_point_plane[1]);
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

        /*for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
      }*/

        /*for(var v of [[0,1], [0,2], [1,3], [2,3], [0,4], [1,5], [2,6], [3,7], [4,5], [5,7], [6,7], [4,6]]){
            graphics.drawLine(points[v[0]], points[v[1]]);
        }*/

        var alpha = 1;
        if(cube.constructor.name == "Door"){
            if(cube.focus){ alpha = 0.9;    }
        }
        //var sides_indices = cube.getSidesFromVertex(nearest_indices);
        var side = cube.getNearestSide(new Vector(camera.x, camera.y, camera.z));
        /*if(cube.constructor.name == "Character"){
            graphics.paintCharacter(points[0], cube);
        }else{*/
        this.colorCharacterFromSides(graphics, points, side, cube.texturePath, alpha);
        //}
    }
}

getTetragonPoints(points, side){

    var tetragon_points = []; //RU -> RD -> LU -> LD
    for(let i=0; i<4; ++i){ tetragon_points.push(points[side[i]]); }

    var sortFunc = (a,b) => {
      if(a[0] == b[0]){ return b[1] - a[1]; }
      else{  return b[0] - a[0]; }
    }
    return tetragon_points.sort(sortFunc);

}

colorCubeFromSides(graphics, points, sides_indices, texturePath, alpha){
  var col_index = 0;
  var colors = ["#800", "#080", "#008"];
  //console.log(sides_indices);
  for(var side of sides_indices){

    var tetragon_points = this.getTetragonPoints(points, side);
    //for(let i=0; i<4; ++i){ tetragon_points.push(points[side[i]]); }

    //tetragon_points = graphics.rearangeTetragonCoords(tetragon_points);
    graphics.fillTetragon(tetragon_points[0], tetragon_points[1], tetragon_points[2], tetragon_points[3], colors[col_index], texturePath, alpha);
    //console.log(colors[col_index]);
    col_index += 1;
  }
}

colorCharacterFromSides(graphics, points, side, texturePath, alpha){
    var tetragon_points = this.getTetragonPoints(points, side);

    var all_sides = [[0,1,3,2], [4,5,7,6], [0,1,4,5], [2,3,6,7], [0,2,6,4], [1,3,7,5]];
    var other_side = all_sides.filter(arr => Mathematics.intersect(arr, side).size == 0)[0];
    var other_points = this.getTetragonPoints(points, other_side);

    /*var middle_points = [];
    for(var i=0; i<4; ++i){
        middle_points.push( [(other_points[i][0] + tetragon_points[i][0]) / 2, (other_points[i][1] + tetragon_points[i][1]) / 2] );
    }*/
    var middle_points = Mathematics.zip(tetragon_points, other_points);
    middle_points = middle_points.map(couple => [ (couple[0][0] + couple[1][0])/2, (couple[0][1] + couple[1][1])/2 ]);

    graphics.fillTetragon(middle_points[0], middle_points[1], middle_points[2], middle_points[3], "#FF0000", texturePath, alpha);
}
}

class Camera{

x = 0;
y = 0;
z = 0;
phi = 0*Math.PI;
field_of_view = 0.8*Math.PI/6;

isDoorNearby(door){

    var delta_x = door.x - this.x;
    var delta_z = door.z - this.z;
    var delta_phi = Math.abs( Math.tan(this.phi) - delta_z / delta_x);
    var R = Math.sqrt(delta_x * delta_x + delta_z * delta_z);
    //console.log(door.texturePath);
    if(R < 300 && delta_phi < 0.1 && Math.sign(Math.cos(this.phi)) == Math.sign(delta_z) ){
        return true;
    }
    return false;
}


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

getFloorCubes(){
  var cubes = [];
  var size = 150;
  var y = 100;
  var i_arr;
  var j_arr;

  if(Math.cos(this.phi) >= 0){  i_arr = [-1,0,1,2,3,4,5,6,7]; }  else{ i_arr = [-7,-6,-5,-4,-3,-2,-1,0,1];  }
  if(Math.sin(this.phi) >= 0){  j_arr = [-1,0,1,2,3,4,5,6,7];  }else{  j_arr = [-7,-6,-5,-4,-3,-2,-1,0,1];  }

  var x_multiplier = Math.floor(this.x / size);
  var z_multiplier = Math.floor(this.z / size);

  for(let i of i_arr){
    for(let j of j_arr){
        cubes.push( new Cube(x_multiplier*size + i*size, y, z_multiplier*size + j*size, size, "textures/StoneWall.jpg") );
        cubes.push( new Cube(x_multiplier*size + i*size, -y, z_multiplier*size + j*size, size, "textures/StoneWall.jpg") );
    }
  }
  return cubes;
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
