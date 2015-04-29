using UnityEditor;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class WizardBakeVertAO : ScriptableWizard
{
	
	
	public int   samples = 512;
	public float maxRange = 1.5f;
	public float minRange = 0.0000000001f;
	public float intensity = 2.0f;
	public bool  resetExistingAlpha = true;
	public bool  averageColors = false;
	public bool  averageNormals = false;
	
	
	
	[MenuItem ("GameObject/Bake AO to Vertex Alpha")]
	static void CreateWizard ()
	{
		ScriptableWizard.DisplayWizard<WizardBakeVertAO>("Bake AO to Vertex Alpha", "Create");
		
		// Clear progress bar
		EditorUtility.ClearProgressBar();
	}
	
	
	
	void OnWizardCreate ()
	{
		
		GameObject subject = Selection.activeGameObject;
		
		// Utility
		RaycastHit hit = new RaycastHit();
		
		
		
		// Debug hemisphere display setup
		// Get a reference to the debug sphere
		GameObject debugSphere = GameObject.Find("p_pointsample");
		
		// Set the debug flag (initial pass)
		bool isDebug = ( debugSphere == null ) ? false : true;
		
		
		// Declarations for later use
		GameObject points       = null;
		GameObject psphere      = null;
		GameObject psphere_miss = null;
		GameObject psphere_hit  = null;
		
		// If the sphere is present, clear the old point cloud and prepare a new one
		// Get references to the other debug sphere prefabs
		if (isDebug) {
			
			points = GameObject.Find("points");
			
			if (points != null)
				GameObject.DestroyImmediate( points );
			
			points = new GameObject("points");
			
			psphere      = (GameObject) AssetDatabase.LoadAssetAtPath( "Assets/Prefabs/p_pointsample.prefab",      typeof(GameObject) );
			psphere_miss = (GameObject) AssetDatabase.LoadAssetAtPath( "Assets/Prefabs/p_pointsample_miss.prefab", typeof(GameObject) );
			psphere_hit  = (GameObject) AssetDatabase.LoadAssetAtPath( "Assets/Prefabs/p_pointsample_hit.prefab",  typeof(GameObject) );
		}
		
		
		
		// Retrieve all mesh filters in the GO's children
		MeshFilter[] mfs = subject.GetComponentsInChildren<MeshFilter>();
		
		
		// Quick sample tally for progress bar
		int sample = 0;
		int numVerts = 0;
		foreach (MeshFilter mf in mfs)
			numVerts += mf.sharedMesh.vertices.Length;
		int numSamples = numVerts * samples;
		
		
		// Iterate over all meshes
		foreach (MeshFilter mf in mfs) {
			
			Mesh mesh = mf.sharedMesh;
			
			// Store vertices
			Vector3[] verts = mesh.vertices;
			
			// Store colors
			Color[] colors = mesh.colors;
			if (colors.Length==0) {
				Debug.Log("Mesh is missing color data.  Supplying...");
				colors = new Color[ verts.Length ];
			}
			
			// Initialize alpha values, necessary unless going for complex effect or some kind of manual multipass use
			if (resetExistingAlpha) {
				for( int ic=0; ic<colors.Length; ic++ )
					colors[ ic ].a = 1;
			}
			
			// Store normals
			Vector3[] normals = new Vector3[ mesh.normals.Length ];
			if (normals.Length==0)
				mesh.RecalculateNormals();
			
			if (averageNormals) {
				
				// If we're using averaged normals, a proxy mesh is used to calculate these so the original normals stay unchanged
				Mesh clonemesh = new Mesh();
				clonemesh.vertices = mesh.vertices;
				clonemesh.normals = mesh.normals;
				clonemesh.tangents = mesh.tangents;
				clonemesh.triangles = mesh.triangles;
				clonemesh.RecalculateBounds();
				clonemesh.RecalculateNormals();
				normals = clonemesh.normals;
				Object.DestroyImmediate(clonemesh);
				
			} else {
				
				// Otherwise, just use the originals
				normals = mesh.normals;
				
			}
			
			
			// Loop over the verts and perform basic, slow, horrible AO based on Physics.Raycast
			int i,j,l = 0;
			l = verts.Length;
			
			for (i=0; i<l; i++) {
				
				// Store object-space normal
				Vector3 nrm = normals[ i ];
				
				// Store vert in world space
				Vector3 v = subject.transform.TransformPoint( verts [ i ] );
				
				// Store normal offset in world space (displacement from vertex position)
				Vector3 n = subject.transform.TransformPoint( verts [ i ] + nrm );
				
				// Store world-space normal
				Vector3 wnrm = (n-v);
				wnrm.Normalize();
				
				// Total occlusion at this vertex
				float occ = 0;
				
				
				// Debug spheres - verts
				bool debugSample = false;
				// This drawa a little sphere over a vertex which is in a debug region to help visualize what's happening
				if (debugSphere != null) {
					Vector3 testPos  = debugSphere.transform.position;
					float   testDist = debugSphere.GetComponent<MeshRenderer>().bounds.extents.x;
					Vector3 testNrm  = debugSphere.transform.forward;
					
					// If the current vertex is inside the debugSphere and its normal is aligned with the local Z of the sphere, set debugSample to true
					debugSample = ( Mathf.Abs( (testPos - v).magnitude ) <  testDist && Vector3.Dot( wnrm, testNrm ) > 0.6f ) ? true : false;
				}
				
				
				// Main loop, take samples up to the limit
				for (j=0; j<samples; j++) {
				
					// Generate some random rotation in a hemisphere
					float rot = 180.0f;
					float rot2 = rot / 2.0f;
					float rotx = (( rot * Random.value ) - rot2);
					float roty = (( rot * Random.value ) - rot2);
					float rotz = (( rot * Random.value ) - rot2);
					
					// Apply that rotation to 0,1,0
					Vector3 dir = Quaternion.Euler( rotx, roty, rotz ) * Vector3.up;
					
					// Get the displacement between a random, upward-facing ray, and the world-space surface normal
					Quaternion dirq = Quaternion.FromToRotation(Vector3.up, wnrm);
					
					// Apply the rotation to the random/hemisphere ray, hopefully transforming the hemisphere to the vert position and normal orientation
					Vector3 ray = dirq * dir;
					
					// Move a bit in the reflected direction from ray, to give a little bit of space against a shared wall or something
					Vector3 offset = Vector3.Reflect( ray, wnrm );
					
					// TEST
					bool isHit = false;
					
					
					// Perform raycast
					
					// For whatever reason, raycast and linecast behave very differently here.  I prefer the linecast outcome.
					//if ( Physics.Raycast( v-(offset), ray, out hit, maxRange ) ) {
					
					// Linecast version
					ray = ray * (maxRange/ray.magnitude);
					if ( Physics.Linecast( v-(offset*0.1f), v + ray, out hit ) ) {
						
						/*
						 * You'd add a dot product test here or after the distance test, if you wanted one
						 * This would only be for special effects or unusual cases
						 */
						// float dot = Vector3.Dot(nrm, hit.normal);
						
						// Reject any degenerate tests
						if ( hit.distance > minRange ) {
							
							// Occlusion Value depends on collision distance relative to max range
							// If you want a simpler AO effect, just use occ++
							occ += Mathf.Clamp01( 1 - ( hit.distance / maxRange ) );
							isHit = true;
							
						} // dist
						
					}
					
					
					// Display the ray start and end points if debugging
					if (debugSample) {
						GameObject sphere = null;
						
						if (isHit)
							sphere = (GameObject) EditorUtility.InstantiatePrefab( psphere_hit );
						else
							sphere = (GameObject) EditorUtility.InstantiatePrefab( psphere_miss );
						sphere.name += "_"+sample;
						Vector3 sp = ray;
						sp *= (maxRange / ray.magnitude);
						sphere.transform.position = v + sp;
						sphere.transform.parent = points.transform;
						
						sphere = (GameObject) EditorUtility.InstantiatePrefab( psphere );
						sphere.name += "_"+sample;
						sp = offset;
						sp *= (0.1f / offset.magnitude);
						sphere.transform.position = v - sp;
						sphere.transform.parent = points.transform;
					}
					
					// Update the progress bar periodically
					if (++sample % 500 == 0) {
						EditorUtility.DisplayProgressBar(
							"VERTEX AO",
							"Calculating...",
							(float)sample / (float)numSamples
						);
					}
					
					
				} // samples
				
				// Modulate occlusion by sample count and intensity, and flip
				occ = Mathf.Clamp01( 1 - ((occ*intensity)/samples) );
				
				// Any given color entry should only be processed once.
				// If alpha values were reset, you can just copy occ (since it's just overwriting 1)
				// Otherwise, multiply the values to allow for multi-pass use, although that would take some doing on the user's part
				//if (resetExistingAlpha)
				//	colors[ i ].a = occ;
				//else
					colors[ i ].a = colors[ i ].a * occ;
				
			} // verts
			
			
			
			// TEST
			// Optional averaging pass
			if (averageColors) {
				int[] tris = mesh.triangles;
				l = tris.Length;
				
				for (i=0; i<l; i+=3) {
					
					int vi0 = tris[ i+0 ];
					int vi1 = tris[ i+1 ];
					int vi2 = tris[ i+2 ];
					
					Color c0 = colors[ vi0 ];
					Color c1 = colors[ vi1 ];
					Color c2 = colors[ vi2 ];
					
					Color avg = new Color();
					avg.a = (c0.a + c1.a + c2.a) / 3;
					
					c0.a = c0.a + (avg.a - c0.a) / 2;
					c1.a = c1.a + (avg.a - c1.a) / 2;
					c2.a = c2.a + (avg.a - c2.a) / 2;
					
					colors[ vi0 ] = c0;
					colors[ vi1 ] = c1;
					colors[ vi2 ] = c2;
				}
			}
			
			
			mesh.colors = colors;
			
			
		} // meshfilters
		
		
		EditorUtility.ClearProgressBar();
		
	}
	
	
	
	void OnWizardUpdate ()
	{
		helpString = "\nSelect an object, and bake away\n";
	} 
	
	
	
	/*
	 * When the user pressed the "Apply" button OnWizardOtherButton is called.
	 */
	void OnWizardOtherButton ()
	{
		//
	}
	
}
