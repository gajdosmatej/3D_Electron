class Cube{
  x;
  y;
  z;
  side_len = 20;

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
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
  distance;

  constructor(w,h,d){

    this.width = w;
    this.height = h;
    this.distance = d;

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
