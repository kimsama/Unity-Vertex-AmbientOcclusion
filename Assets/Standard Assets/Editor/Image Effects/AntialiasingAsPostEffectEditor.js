
#pragma strict

@CustomEditor (AntialiasingAsPostEffect)

class AntialiasingAsPostEffectEditor extends Editor 
{	
	var serObj : SerializedObject;	
		
	var mode : SerializedProperty;
	
	var showGeneratedNormals : SerializedProperty;
	var offsetScale : SerializedProperty;
	var blurRadius : SerializedProperty;
	var dlaaSharp : SerializedProperty;

	function OnEnable () {
		serObj = new SerializedObject (target);
		
		mode = serObj.FindProperty ("mode");
		
		showGeneratedNormals = serObj.FindProperty ("showGeneratedNormals");
		offsetScale = serObj.FindProperty ("offsetScale");
		blurRadius = serObj.FindProperty ("blurRadius");
		dlaaSharp = serObj.FindProperty ("dlaaSharp");
	}
    		
    function OnInspectorGUI () {        
    	serObj.Update ();
    	
		GUILayout.Label("Various luminance based fullscreen Antialiasing techniques", EditorStyles.miniBoldLabel);
    	
    	EditorGUILayout.PropertyField (mode, new GUIContent ("AA Technique"));

		if (mode.enumValueIndex == AAMode.NFAA) {
			EditorGUILayout.Separator ();  	
    		EditorGUILayout.PropertyField (offsetScale, new GUIContent ("Edge Detect Ofs"));
    		EditorGUILayout.PropertyField (blurRadius, new GUIContent ("Blur Radius"));
    		EditorGUILayout.PropertyField (showGeneratedNormals, new GUIContent ("Show Normals"));	
		} else if (mode.enumValueIndex == AAMode.DLAA) {
			EditorGUILayout.Separator ();  	
    		EditorGUILayout.PropertyField (dlaaSharp, new GUIContent ("Sharp"));			
		}
    	
    	serObj.ApplyModifiedProperties();
    }
}
