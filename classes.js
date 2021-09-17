class Cube{
  x;
  y;
  z;
  side_len;

  constructor(x, y, z, len) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.side_len = len;
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
