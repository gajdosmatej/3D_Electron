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

}


class GraphicsControl{

  canvas;
  ctx;

  constructor(canvas){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

  }

  drawSquare(x,y,side){

    this.ctx.beginPath();
    this.ctx.rect(x, y, x+side, y+side);
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
