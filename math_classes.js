class Vector{
    x;
    y;
    z;

    constructor(x,y,z){

        this.x = x;
        this.y = y;
        this.z = z;

    }

    add(v){
        try{
            if(v.constructor != Vector){    throw "Can only add vector to vector"}
            else{
                this.x += v.x;
                this.y += v.y;
                this.z += v.z;
            }
        }
        catch(err){
            console.error(err);
        }
        finally{
            return this;
        }
    }
}

class Tensor{
    a11;
    a12;
    a13;
    a21;
    a22;
    a23;
    a31;
    a32;
    a33;

    constructor(arr){

        this.a11 = arr[0][0];
        this.a12 = arr[0][1];
        this.a13 = arr[0][2];

        this.a21 = arr[1][0];
        this.a22 = arr[1][1];
        this.a23 = arr[1][2];

        this.a31 = arr[2][0];
        this.a32 = arr[2][1];
        this.a33 = arr[2][2];

    }

    multiply(vector){

        try{
            if(vector.constructor == Vector){

                var v1 = this.a11 * vector.x + this.a12 * vector.y + this.a13 * vector.z;
                var v2 = this.a21 * vector.x + this.a22 * vector.y + this.a23 * vector.z;
                var v3 = this.a31 * vector.x + this.a32 * vector.y + this.a33 * vector.z;

                return new Vector(v1, v2, v3);
            }
            else{   throw "Can only multiply matrix and vector";    }
        }
        catch(err){
            console.error(err);
        }
    }

}

/*class Angle{
  value;

  constructor(angle){

    this.value = angle;

  }

  IsLessThan(angle2){

    return this.value < angle2.value

  }

}*/
