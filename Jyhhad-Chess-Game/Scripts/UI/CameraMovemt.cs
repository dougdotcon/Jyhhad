using UnityEngine;

public class CameraMovement : MonoBehaviour
{
   public float movementSpeed = 5f;

   void Update()
   {
      float horizontalInput = 0f;
      float verticalInput = 0f;

      if (Input.GetKey(KeyCode.LeftArrow))
        horizontalInput = -1f;
      else if (Input.GetKey(KeyCode.RightArrow))
        horizontalInput = 1f;

      if (Input.GetKey(KeyCode.DownArrow))
        verticalInput = -1f;
      else if (Input.GetKey(KeyCode.UpArrow))
        verticalInput = 1f;

      Vector3 movement = new Vector3(horizontalInput, 0f, verticalInput) * movementSpeed * Time.deltaTime;
      transform.Translate(movement, Space.World);
   }
}

