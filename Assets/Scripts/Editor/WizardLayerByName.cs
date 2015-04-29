using UnityEditor;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class WizardLayerByName : ScriptableWizard
{
	
	public string partOfName;
	public int layer;
	
	
	[MenuItem ("GameObject/Assign Layer By Name")]
	static void CreateWizard ()
	{
		ScriptableWizard.DisplayWizard<WizardLayerByName>("Assign Layer by Name", "Create");
		
		// Clear progress bar
		EditorUtility.ClearProgressBar();
	}
	
	
	
	void OnWizardCreate ()
	{
		
		partOfName = partOfName.ToLower();
		
		Transform[] items;
		
		EditorUtility.DisplayProgressBar(
			"ASSIGN LAYERS",
		    "Gathering Transforms...",
			0.01f
		);
		
		if (Selection.activeObject!=null) {
			GameObject parent = (GameObject) Selection.activeObject;
			items = parent.GetComponentsInChildren<Transform>();
		} else {
			items = FindObjectsOfType( typeof(Transform) ) as Transform[];
		}
		
		Debug.Log( "Looping over "+items.Length +" items" );
		
		int n=0;
		foreach (Transform t in items) {
			if (t.gameObject!=null && t.name.ToLower().IndexOf(partOfName)>-1) {
				t.gameObject.layer = layer;
			}
			
			// Update the progress bar periodically
			if (++n % 50 == 0) {
				EditorUtility.DisplayProgressBar(
					"ASSIGN LAYERS",
					"Looping through transforms...",
					(float)( n / items.Length )
				);
			}
		}
		
		
		EditorUtility.ClearProgressBar();
		
	}
	
	
	
	void OnWizardUpdate ()
	{
		helpString = "\nSelect an object, enter part of a name to search for within its children\n";
		helpString += "(ignore case), and enter a layer to set them to.\n";
	} 
	
	
	
	/*
	 * When the user pressed the "Apply" button OnWizardOtherButton is called.
	 */
	void OnWizardOtherButton ()
	{
		//
	}
}