class Cube{
  x;
  y;
  z;
  side_len;
  phi;

  constructor(x, y, z, len, phi=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.side_len = len;
    this.phi = phi;
  }

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
  }

  *getRelativeVerticesCoordinates(){
      for(let x_modifier of [-1, 1]){
          for(let y_modifier of [-1, 1]){
              for(let z_modifier of [-1, 1]){

                yield [x_modifier * this.side_len / 2,
                      y_modifier * this.side_len / 2,
                      z_modifier * this.side_len / 2];
      }}}
  }

  rotateY(x, z){
    var x_new = x * Math.cos(this.phi) - z * Math.sin(this.phi);
    var z_new = x * Math.sin(this.phi) + z* Math.cos(this.phi);
    return [x_new, z_new];
  }

  translate(x, y, translate_vector){

    return [x + translate_vector[0], y + translate_vector[1]];

  }

}


class GraphicsControl{

  canvas;
  ctx;
  offset = [40, 40];

  constructor(canvas){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

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

}

class ProjectionPlane{

  width;
  height;
  distance = 100;

  constructor(w,h){

    this.width = w;
    this.height = h;

  }

  projectPoint(coord, camera){

    var direct_vector = [coord[0] - camera.x, coord[1] - camera.y, coord[2] - camera.z];
    var line = t => [camera.x + t*direct_vector[0], camera.y + t*direct_vector[1], camera.z + t*direct_vector[2]];
    var T = this.distance / (coord[0] - camera.x);  //jen pro kameru mířící ve směru x
    var point_coord = line(T);
    return point_coord;

  }

  projectCube(cube, camera, graphics){
    /*for( let vert_coord of cube.getVerticesCoordinates() ){

      var point_coord = this.projectPoint(vert_coord, camera);
      graphics.drawPoint(point_coord[2], point_coord[1]); //rovina yz
    }*/

    for(  let obj of cube.getRelativeVerticesCoordinates() ){
      var after_rot = cube.rotateY(obj[0], obj[2]);
      var final = cube.translate(after_rot[0], after_rot[1], [cube.x, cube.z]);
      var vert_coord = [final[0], obj[1] + cube.y, final[1]];

      var point_coord = this.projectPoint(vert_coord, camera);
      graphics.drawPoint(point_coord[2], point_coord[1]); //rovina yz

    }
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
