using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class InputScript : MonoBehaviour
{
    // Start is called before the first frame update
   
    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButton(0)) {
            HandleInput();
        }     
    }

    void HandleInput () {
        Ray inputRay = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if(Physics.Raycast(inputRay, out hit)) {
           TouchCell(hit.point);
        }

        void TouchCell(Vector3 position) {
            position = transform.InverseTransformPoint(position);
            Debug.Log("touched at" + position);
        }

    }
}
