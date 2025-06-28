using System.Collections;
using System.Collections.Generic;
using UnityEngine;

   
   public static class HexMetrics {
      // Para criar o hexagono criamo uma radius de 10
      // e um radius de 0.86 dele;
      public const float outerRadius = 10f;
      public const float innerRadius = outerRadius * 0.866025404f;      
   
   
   // Para cada aresta dessenhamos então utilizando o radius as areatsas em um vector

   public static Vector3[] corners = {
		new Vector3(0f, 0f, outerRadius),
		new Vector3(innerRadius, 0f, 0.5f * outerRadius),
		new Vector3(innerRadius, 0f, -0.5f * outerRadius),
		new Vector3(0f, 0f, -outerRadius),
		new Vector3(-innerRadius, 0f, -0.5f * outerRadius),
		new Vector3(-innerRadius, 0f, 0.5f * outerRadius),
      new Vector3(0f, 0f, outerRadius)
	};
}


