@script ExecuteInEditMode
@script RequireComponent (Camera)
@script AddComponentMenu ("Image Effects/Antialiasing (Image based)")

enum AAMode {
	FXAA2 = 0,
	FXAA1PresetA = 1,
	FXAA1PresetB = 2,
	NFAA = 3,
	SSAA = 4,
	DLAA = 5,	
}

class AntialiasingAsPostEffect extends PostEffectsBase  {
	public var mode : AAMode = AAMode.FXAA2;

	public var showGeneratedNormals : boolean = false;
	public var offsetScale : float = 0.2;
	public var blurRadius : float = 18.0;
	
	public var dlaaSharp : boolean = false;

	public var ssaaShader : Shader;
	private var ssaa : Material;
	public var dlaaShader : Shader;
	private var dlaa : Material;
	public var nfaaShader : Shader;
	private var nfaa : Material;	
	public var shaderFXAAPreset2 : Shader;
	private var materialFXAAPreset2 : Material;
	public var shaderFXAAPreset3 : Shader;
	private var materialFXAAPreset3 : Material;
	public var shaderFXAAII : Shader;
	private var materialFXAAII : Material;

	function CreateMaterials () {
		materialFXAAPreset2 = CheckShaderAndCreateMaterial (shaderFXAAPreset2, materialFXAAPreset2);
		materialFXAAPreset3 = CheckShaderAndCreateMaterial (shaderFXAAPreset3, materialFXAAPreset3);
		materialFXAAII = CheckShaderAndCreateMaterial (shaderFXAAII, materialFXAAII);
		nfaa = CheckShaderAndCreateMaterial (nfaaShader, nfaa);
		ssaa = CheckShaderAndCreateMaterial (ssaaShader, ssaa); 
		dlaa = CheckShaderAndCreateMaterial (dlaaShader, dlaa); 
	}
	
	function Start () {
		CreateMaterials ();
		CheckSupport (false);
	}

	function OnRenderImage (source : RenderTexture, destination : RenderTexture) {	
		CreateMaterials ();
		
		if (mode < AAMode.NFAA) {
			
		// .............................................................................
		// FXAA antialiasing modes .....................................................			
			
			var mat : Material;
			if (mode == 2)
				mat = materialFXAAPreset3;
			else if (mode == 1)
				mat = materialFXAAPreset2;
			else
				mat = materialFXAAII;
				
			if (mode == 1)
				source.anisoLevel = 4;
			Graphics.Blit (source, destination, mat);
			if (mode == 1)
				source.anisoLevel = 0;
		} 
		else if (mode == AAMode.SSAA) {

		// .............................................................................
		// SSAA antialiasing ...........................................................
			
			Graphics.Blit (source, destination, ssaa);								
		}
		else if (mode == AAMode.DLAA) {

		// .............................................................................
		// DLAA antialiasing ...........................................................
		
			source.anisoLevel = 0;	
			var interim : RenderTexture = RenderTexture.GetTemporary (source.width, source.height);
			Graphics.Blit (source, interim, dlaa, 0);			
			Graphics.Blit (interim, destination, dlaa, dlaaSharp ? 2 : 1);
			RenderTexture.ReleaseTemporary (interim);					
		}
		else if (mode == AAMode.NFAA) {

		// .............................................................................
		// nfaa antialiasing ..............................................
			
			source.anisoLevel = 0;	
		
			nfaa.SetFloat("_OffsetScale", offsetScale);
			nfaa.SetFloat("_BlurRadius", blurRadius);
				
			Graphics.Blit (source, destination, nfaa, showGeneratedNormals ? 1 : 0);					
		}
		else {
			
			Graphics.Blit (source, destination);								
		}
	}
}
