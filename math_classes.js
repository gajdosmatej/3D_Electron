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
        var u = new Vector(this.x, this.y, this.z);
        try{
            if(v.constructor != Vector){    throw "Can only add vector to vector"}
            else{
                u.x += v.x;
                u.y += v.y;
                u.z += v.z;
            }
        }
        catch(err){
            console.error(err);
        }
        finally{
            return u;
        }
    }

    getNorm(){
        return Math.sqrt(this.x **2 + this.y **2 + this.z **2);
    }

    multiply(scalar){
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dotProduct(vector){
        return (this.x * vector.x + this.y * vector.y + this.z * vector.z);
    }

    opposite(){
        return this.multiply(-1);
    }

    getAngleXZ(){

        if(this.x >= 0 && this.z >= 0){    return Math.atan(this.z / this.x);  }
        else if(this.x < 0 && this.z >= 0){   return (Math.PI + Math.atan(this.z / this.x));   }
        else if(this.x < 0 && this.z < 0){   return(Math.PI + Math.atan(this.z / this.x)); }
        else if(this.x >= 0 && this.z < 0){   return (2*Math.PI + Math.atan(this.z / this.x));    }

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

var Mathematics = {
    //nejdriv se vykresluji vzdalene objekty, aby je ty bliz prekryly
    sortRenderQueue(cubes, camera){

        var compare_func = function(A, B){
            var norm_A = (A.x - camera.x)**2 + (A.y - camera.y)**2 + (A.z - camera.z)**2;
            var norm_B = (B.x - camera.x)**2 + (B.y - camera.y)**2 + (B.z - camera.z)**2;
            return norm_B - norm_A;

        }
        return cubes.sort(compare_func);
    },

    getSmallestValueIndex(list){
        var smallest = Infinity;
        var index = -1;

        for(var i = 0; i < list.length; ++i){
            if(list[i] < smallest){ smallest = list[i]; index = i;  }
        }
        return index;
    },

    intersect(A, B){
        B = new Set(B);
        return new Set(A.filter(x => B.has(x)));
    }
}
