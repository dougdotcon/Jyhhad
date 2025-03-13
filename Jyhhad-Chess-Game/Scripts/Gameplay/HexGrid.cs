using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;



public class HexGrid : MonoBehaviour
{
    // Start is called before the first frame update
   public int width = 6;
   public int height = 6;

   public HexCell callLabelPrefab;
   HexMesh hexMesh;
   HexCell[] cells;

   public void  StartMap() {
    hexMesh = GetComponentInChildren<HexMesh>();
    cells = new HexCell[height * width];
        for (int z = 0, i = 0; z < height; z++) {
            for(int x = 0; x < width; x++) {
                CreateCell(x, z, i++);
            }
        }
        GenerateMesh();
   }


   void GenerateMesh()
    {
        hexMesh.Triangulate(cells);
    }

   void CreateCell (int x, int z, int i) {
        Vector3 position;
        position.x = (x + z *  0.5f - z / 2) * (HexMetrics.innerRadius * 2f);
        position.y = 0f;
        position.z = z * (HexMetrics.outerRadius * 1.5f);
        HexCell cell =  cells[i] = Instantiate<HexCell>(callLabelPrefab);

        cell.transform.SetParent(transform, false);
        cell.transform.localPosition = position;
        cell.coordinates = HexCoordinates.FromOffSetCoordinates(x, z);
        

   }

}
