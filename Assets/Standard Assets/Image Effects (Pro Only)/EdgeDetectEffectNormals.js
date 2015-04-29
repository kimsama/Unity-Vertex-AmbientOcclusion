
#pragma strict

@script ExecuteInEditMode
@script RequireComponent (Camera)
@script AddComponentMenu ("Image Effects/Edge Detection (Geometry)")

enum EdgeDetectMode {
	Thin = 0,
	Thick = 1,	
}

class EdgeDetectEffectNormals extends PostEffectsBase {	

	public var mode : EdgeDetectMode = EdgeDetectMode.Thin;
	public var sensitivityDepth : float = 1.0;
	public var sensitivityNormals : float = 1.0;
	
	public var edgesOnly : float = 0.0;
	public var edgesOnlyBgColor : Color = Color.white;
	
	public var edgeDetectShader : Shader;
	private var edgeDetectMaterial : Material = null;

	function CreateMaterials () {
		edgeDetectMaterial = CheckShaderAndCreateMaterial (edgeDetectShader,edgeDetectMaterial);
	}
	
	function Start () { 
		CreateMaterials ();
		CheckSupport (true);
	}
	
	function OnEnable () {
		camera.depthTextureMode |= DepthTextureMode.DepthNormals;	
	}
	
	function OnRenderImage (source : RenderTexture, destination : RenderTexture) {	
		CreateMaterials ();
		
		var sensitivity : Vector2 = Vector2 (sensitivityDepth, sensitivityNormals);
	
		source.filterMode = FilterMode.Point;
		
		edgeDetectMaterial.SetVector ("sensitivity", Vector4 (sensitivity.x, sensitivity.y, 1.0, sensitivity.y));		
		edgeDetectMaterial.SetFloat ("_BgFade", edgesOnly);	
		
		var vecCol : Vector4 = edgesOnlyBgColor;
		edgeDetectMaterial.SetVector ("_BgColor", vecCol);		
		
		if (mode == EdgeDetectMode.Thin) {
			Graphics.Blit (source, destination, edgeDetectMaterial, 0);				
		}
		else {
			Graphics.Blit (source, destination, edgeDetectMaterial, 1);
		}
	}
}

