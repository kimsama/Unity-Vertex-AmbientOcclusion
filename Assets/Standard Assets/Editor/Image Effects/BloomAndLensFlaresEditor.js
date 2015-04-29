
#pragma strict

@CustomEditor (BloomAndLensFlares)
		
class BloomAndLensFlaresEditor extends Editor 
{	
	var tweakMode : SerializedProperty;
	var screenBlendMode : SerializedProperty;
	
	var serObj : SerializedObject;
	
	var sepBlurSpread : SerializedProperty;
	var useSrcAlphaAsMask : SerializedProperty;

	var bloomIntensity : SerializedProperty;
	var bloomThreshhold : SerializedProperty;
	var bloomBlurIterations : SerializedProperty;
	
	var lensflares : SerializedProperty;
	
	var hollywoodFlareBlurIterations : SerializedProperty;
	
	var lensflareMode : SerializedProperty;
	var hollyStretchWidth : SerializedProperty;
	var lensflareIntensity : SerializedProperty;
	var lensflareThreshhold : SerializedProperty;
	var flareColorA : SerializedProperty;
	var flareColorB : SerializedProperty;
	var flareColorC : SerializedProperty;
	var flareColorD : SerializedProperty;	
	
	var blurWidth : SerializedProperty;

	function OnEnable () {
		serObj = new SerializedObject (target);
				
		screenBlendMode = serObj.FindProperty("screenBlendMode");
		
		sepBlurSpread = serObj.FindProperty("sepBlurSpread");
		useSrcAlphaAsMask = serObj.FindProperty("useSrcAlphaAsMask");
		
		bloomIntensity = serObj.FindProperty("bloomIntensity");
		bloomThreshhold = serObj.FindProperty("bloomThreshhold");
		bloomBlurIterations = serObj.FindProperty("bloomBlurIterations");
		
		lensflares = serObj.FindProperty("lensflares"); 
		
		lensflareMode = serObj.FindProperty("lensflareMode");
		hollywoodFlareBlurIterations = serObj.FindProperty("hollywoodFlareBlurIterations");
		hollyStretchWidth = serObj.FindProperty("hollyStretchWidth");
		lensflareIntensity = serObj.FindProperty("lensflareIntensity");
		lensflareThreshhold = serObj.FindProperty("lensflareThreshhold");
		flareColorA = serObj.FindProperty("flareColorA");
		flareColorB = serObj.FindProperty("flareColorB");
		flareColorC = serObj.FindProperty("flareColorC");
		flareColorD = serObj.FindProperty("flareColorD");		
		
		blurWidth = serObj.FindProperty("blurWidth");
		
		tweakMode = serObj.FindProperty("tweakMode");
	}
    		
    function OnInspectorGUI () {        
		serObj.Update();

		GUILayout.Label((useSrcAlphaAsMask.floatValue < 0.1f ? "Current settings ignore color buffer alpha" : "Current settings use color buffer alpha as a glow mask"), EditorStyles.miniBoldLabel);
		
		EditorGUILayout.PropertyField (tweakMode, new GUIContent("Mode"));	
    	EditorGUILayout.PropertyField (screenBlendMode, new GUIContent("Blend mode"));
    	EditorGUILayout.Separator ();

    	// some genral tweak needs
    	EditorGUILayout.PropertyField (bloomIntensity, new GUIContent("Intensity"));	
    	bloomThreshhold.floatValue = EditorGUILayout.Slider ("Threshhold", bloomThreshhold.floatValue, -0.05, 1.0);
    	
    	if (1 == tweakMode.intValue)
    		bloomBlurIterations.intValue = EditorGUILayout.IntSlider ("Blur iterations", bloomBlurIterations.intValue, 1, 4);
    	else
    		bloomBlurIterations.intValue = 1;
		sepBlurSpread.floatValue = EditorGUILayout.Slider ("Blur spread", sepBlurSpread.floatValue, 0.1, 10.0);
    	
    	if (1 == tweakMode.intValue)
    		useSrcAlphaAsMask.floatValue = EditorGUILayout.Slider (new  GUIContent("Use alpha mask","How much should the image alpha values (deifned by all materials, colors and textures alpha values define the bright (blooming/glowing) areas of the image"), useSrcAlphaAsMask.floatValue, 0.0, 1.0);
    	else
    		useSrcAlphaAsMask.floatValue = 0.0;
    	    	
    	if (1 == tweakMode.intValue) {
    		EditorGUILayout.Separator ();
	    
	    	EditorGUILayout.PropertyField (lensflares, new GUIContent("Cast lens flares"));
	    	if (lensflares.boolValue) {
	    		// further lens flare tweakings
	    		if (0 != tweakMode.intValue)
	    			EditorGUILayout.PropertyField (lensflareMode, new GUIContent(" Mode"));
	    		else
	    			lensflareMode.enumValueIndex = 0;	    		
	    		
	    		EditorGUILayout.PropertyField (lensflareIntensity, new GUIContent("Local intensity"));
	    		lensflareThreshhold.floatValue = EditorGUILayout.Slider ("Local threshhold", lensflareThreshhold.floatValue, 0.0, 1.0);
	    		
	    		EditorGUILayout.Separator ();
	    		
	    		if (lensflareMode.intValue == 0) {
	    			// ghosting	
	    			EditorGUILayout.BeginHorizontal ();
	    			EditorGUILayout.PropertyField (flareColorA, new GUIContent(" 1st Color"));
	    			EditorGUILayout.PropertyField (flareColorB, new GUIContent(" 2nd Color"));
	   				EditorGUILayout.EndHorizontal ();
	   				
	     			EditorGUILayout.BeginHorizontal ();
	    			EditorGUILayout.PropertyField (flareColorC, new GUIContent(" 3rd Color"));
	    			EditorGUILayout.PropertyField (flareColorD, new GUIContent(" 4th Color"));
	   				EditorGUILayout.EndHorizontal ();	
	    		} 
	    		else if (lensflareMode.intValue == 1) {
	    			// hollywood
	    			EditorGUILayout.PropertyField (hollyStretchWidth, new GUIContent(" Stretch width"));
	    			hollywoodFlareBlurIterations.intValue = EditorGUILayout.IntSlider (" Blur iterations", hollywoodFlareBlurIterations.intValue, 1, 4);
	    			    			
	    			EditorGUILayout.PropertyField (flareColorA, new GUIContent(" Tint Color"));	
	    		} 
	    		else if (lensflareMode.intValue == 2) {
	    			// both
	    			EditorGUILayout.PropertyField (hollyStretchWidth, new GUIContent(" Stretch width"));
	    			hollywoodFlareBlurIterations.intValue = EditorGUILayout.IntSlider (" Blur iterations", hollywoodFlareBlurIterations.intValue, 1, 4);
	    			    			
	    			EditorGUILayout.BeginHorizontal ();
	    			EditorGUILayout.PropertyField (flareColorA, new GUIContent(" 1st Color"));
	    			EditorGUILayout.PropertyField (flareColorB, new GUIContent(" 2nd Color"));
	   				EditorGUILayout.EndHorizontal ();
	   				
	     			EditorGUILayout.BeginHorizontal ();
	    			EditorGUILayout.PropertyField (flareColorC, new GUIContent(" 3rd Color"));
	    			EditorGUILayout.PropertyField (flareColorD, new GUIContent(" 4th Color"));
	   				EditorGUILayout.EndHorizontal ();  			
				} 		
	    	}
    	} else
    		lensflares.boolValue = false;    	
    	
    	serObj.ApplyModifiedProperties();
    }
}
