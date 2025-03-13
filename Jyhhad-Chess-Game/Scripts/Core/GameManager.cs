using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{  

   // Start is called before the first frame update
   private int score;
   public GameState currentState;
   public HexGrid hexGrid;
     
   void Start()
   {
      currentState = GameState.MainMenu;
   }

   // Update is called once per frame
   void Update()
   {

   if(Input.GetKeyDown(KeyCode.Alpha1)) {
      MainMenuGame();
   };

   if(Input.GetKeyDown(KeyCode.Alpha2)) {
      StartGame();
   };
   
   if(Input.GetKeyDown(KeyCode.Alpha3)) {
      GameOver();
   }
   
      switch (currentState)
      {
        case GameState.MainMenu:
                  
           break;
        case GameState.Playing:

           break;
        case GameState.GameOver:
           
           break;
        default:
           break;
      }
   }

   public void StartGame() 
   {
      currentState = GameState.Playing;
      hexGrid = FindObjectOfType<HexGrid>();
      hexGrid.StartMap();
   }
   public void MainMenuGame() 
   {
      currentState = GameState.MainMenu;
   }
   public void GameOver() 
   {
      currentState = GameState.GameOver;
   }
}



public enum GameState {
   MainMenu, 
   Playing,
   GameOver
}