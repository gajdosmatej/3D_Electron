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

/*
  *getVerticesCoordinates(){
      console.log(this.phi);
      for(let y_modifier of [-1, 1]){
          for(let point_reflection of [-1, 1]){
              for(let goniometric_sign of [-1, 1]){

                var goniometric_x = Math.cos(this.phi) + goniometric_sign * Math.sin(this.phi);
                var goniometric_z = Math.cos(this.phi) - goniometric_sign * Math.sin(this.phi);

                var position_vector =
                [ this.x + point_reflection * this.side_len / 2 * goniometric_x,
                  this.y + y_modifier * this.side_len / 2,
                  this.z + goniometric_sign * point_reflection * this.side_len / 2 * goniometric_z];

                yield position_vector;
      }}}
  }*/

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
        if(sides[i].includes(vertex_index)){    sides.append(sides[i]); }
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

}

class ProjectionPlane{

  width;
  height;
  distance;
  r = 100;

  constructor(w,h, d,r){

    this.width = w;
    this.height = h;
    this.distance = d;
    this.r = r;

  }

  projectPoint(point_vector, camera){

    if(camera.isInFieldOfView(point_vector)){

      var direction_vector = point_vector.add(new Vector( -camera.x, -camera.y, -camera.z) );
      var line = t =>
      {return new Vector( camera.x + t*direction_vector.x,
                          camera.y + t*direction_vector.y,
                          camera.z + t*direction_vector.z);};

      //var T = this.distance / (point_vector.x - camera.x);  //jen pro kameru mířící ve směru x
      var T = (this.distance - camera.x * Math.cos(camera.phi) - camera.z * Math.cos(camera.phi)) /
              (direction_vector.x * Math.cos(camera.phi) + direction_vector.z * Math.sin(camera.phi));
      var intersect_vector = line(T);
      //console.log(intersect_vector);
      return intersect_vector;
    }
  }

  projectPointOnSphere(point_vector, camera){

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

  transformCoordinateSystem(point, camera){

    //var new_coord = [point.z, point.y];
    /*return [Math.sqrt(point.x * point.x + point.z * point.z - this.distance * this.distance),
            point.y];*/
    var sign = 1;
    if(point.z - point.x * Math.tan(camera.phi) > 0){ sign = -1;  } //zamezeni ztraty nekterych bodu vlivem odmocniny
    var new_coord = [sign * Math.sqrt( point.x ** 2 + point.z ** 2 + this.distance ** 2 -
            2 * this.distance * (point.x * Math.cos(camera.phi) + point.z * Math.sin(camera.phi)) ),
            point.y];
    //console.log(new_coord);
    return new_coord;

  }

  projectCube(cube, camera, graphics){

    var points = [];
    if(camera.isCubeInFieldOfView(cube)){

        for(  let vertex_vector of cube.getVerticesCoordinates() ){
    /*
            var intersect_point = this.projectPoint(vertex_vector, camera);
            if(intersect_point == undefined){ continue; }
            var intersect_point_plane = this.transformCoordinateSystem(intersect_point, camera);
            graphics.drawPoint(intersect_point_plane[0], intersect_point_plane[1]);
            points.push(intersect_point_plane);
            */

            var intersect_point = this.projectPointOnSphere(vertex_vector, camera);
            var intersect_point_sphere = this.transformCoordinateSystemSphere(intersect_point, camera);
            graphics.drawPoint(intersect_point_sphere[0], intersect_point_sphere[1]);
            points.push(intersect_point_sphere);
        }

        for(let i = 0; i < points.length; ++i){
          for(let j = i+1; j < points.length; ++j){
              graphics.drawLine(points[i], points[j]);
          }
        }

    //vybarvovaci fce?
    }
}
}

class Camera{

  x = 0;
  y = 0;
  z = 0;
  phi = 0*Math.PI;
  field_of_view = 5*Math.PI/6;

  move(delta_x,delta_y,delta_z){

      this.x += delta_x;
      this.y += delta_y;
      this.z += delta_z;

  }

  rotate(delta_phi){

    this.phi += delta_phi;
    while(this.phi >= 2 * Math.PI){ this.phi -= 2*Math.PI;  }
    while(this.phi < 0){ this.phi += 2*Math.PI;  }

  }

  isInFieldOfView(point){
/*
    console.log(point);
    var logic_1 = (point.z > point.x * Math.tan(this.phi - this.field_of_view / 2));
    var logic_2 = (point.z < point.x * Math.tan(this.phi + this.field_of_view / 2));
    var logic_3 =

    return (logic_1 && logic_2);*/

    var diff = this.phi - this.field_of_view / 2;
    var add = this.phi + this.field_of_view / 2;

    var psi = Math.atan(point.z / point.x);
    var logic_1 = Math.tan(0.5*psi) > Math.tan(0.5*diff); //tg(x/2) je rostouci fce periodicka na 2pi, zjednodusí porovnavani uhlu
    var logic_2 = Math.tan(0.5*psi) < Math.tan(0.5*add);

    return (logic_1 && logic_2);

  }

  isCubeInFieldOfView(cube){

      for(  let vertex_vector of cube.getVerticesCoordinates() ){
          if(this.isInFieldOfView(vertex_vector)){  return true;    }
      }
      return false;
  }
}
