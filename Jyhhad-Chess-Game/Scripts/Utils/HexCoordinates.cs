using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class HexCoordinates : MonoBehaviour
{


	[SerializeField]
	private int x, z;
    public int X { get {
        return x;
        }
    }
    public int Z { get {
        return z;
        }
    }

    public int Y {
        get {
        return - X - Z;
        }
    }
    public HexCoordinates (int x, int z) {
        this.x = x;
        this.z = z;
    }

    public static HexCoordinates FromOffSetCoordinates (int x, int z) {
        return new HexCoordinates(x - z / 2, z);
    }
    
    public override string ToString () {
		return "(" +
			X.ToString() + ", " + Y.ToString() + ", " + Z.ToString() + ")";
	}

	public string ToStringOnSeparateLines () {
		return X.ToString() + "\n" + Y.ToString() + "\n" + Z.ToString();
	}
    
    
    // Start is called before the first frame update
    
}
