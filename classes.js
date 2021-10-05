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
    this.ctx.moveTo(coord_1[2] + this.offset[0], coord_1[1] + this.offset[1]);
    this.ctx.lineTo(coord_2[2] + this.offset[0], coord_2[1] + this.offset[1]);  //index 2 docasne
    this.ctx.stroke();

  }

}

class ProjectionPlane{

  width;
  height;
  distance = 100;

  constructor(w,h){

    this.width = w;
    this.height = h;

  }

  projectPoint(point_vector, camera){

    var direction_vector = point_vector.add(new Vector( -camera.x, -camera.y, -camera.z) );
    var line = t => [camera.x + t*direction_vector.x, camera.y + t*direction_vector.y, camera.z + t*direction_vector.z];
    var T = this.distance / (point_vector.x - camera.x);  //jen pro kameru mířící ve směru x
    var intersect_coord = line(T);
    return intersect_coord;

  }

  projectCube(cube, camera, graphics){

    var points = [];

    for(  let vertex_vector of cube.getVerticesCoordinates() ){

        var point_coord = this.projectPoint(vertex_vector, camera);
        graphics.drawPoint(point_coord[2], point_coord[1]); //rovina yz
        points.push(point_coord);
    }

    for(let i = 0; i < points.length; ++i){
      for(let j = i+1; j < points.length; ++j){
          graphics.drawLine(points[i], points[j]);
      }
    }

    //vybarvovaci fce?
  }

}

class Camera{

  x = 0;
  y = 0;
  z = 0;
  phi = 0;

  move(delta_x,delta_y,delta_z){

      this.x += delta_x;
      this.y += delta_y;
      this.z += delta_z;

  }

  rotate(delta_phi){

    this.phi += delta_phi;

  }
}
