using UnityEditor;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class WizardClearVertexColors : ScriptableWizard
{
	
	public bool clearRed   = true;
	public bool clearBlue  = true;
	public bool clearGreen = true;
	public bool clearAlpha = true;
	
	
	[MenuItem ("GameObject/Clear Vertex Colors")]
	static void CreateWizard ()
	{
		ScriptableWizard.DisplayWizard<WizardClearVertexColors>("Clear selected vertex channels", "Create");
		
		// Clear progress bar
		EditorUtility.ClearProgressBar();
	}
	
	
	
	void OnWizardCreate ()
	{
		
		GameObject subject = Selection.activeGameObject;
		
		// Retrieve all mesh filters in the GO's children
		MeshFilter[] mfs = subject.GetComponentsInChildren<MeshFilter>();
		
		// Iterate over all meshes
		foreach (MeshFilter mf in mfs) {
			
			Mesh mesh = mf.sharedMesh;
			
			Color[] colors = mesh.colors;
			int l = colors.Length;
			
			for( int i=0; i<l; i++ ) {
				
				Color c = colors[i];
				if (clearRed)
					c.r = 1;
				if (clearGreen)
					c.g = 1;
				if (clearBlue)
					c.b = 1;
				if (clearAlpha)
					c.a = 1;
				
				colors[i] = c;
			}
			
			mesh.colors = colors;
		} // meshfilters
		
		
		EditorUtility.ClearProgressBar();
		
	}
	
	
	
	void OnWizardUpdate ()
	{
		helpString = "\nSelect an object, and destroy everything\n";
	} 
	
	
	
	/*
	 * When the user pressed the "Apply" button OnWizardOtherButton is called.
	 */
	void OnWizardOtherButton ()
	{
		//
	}
	
}
