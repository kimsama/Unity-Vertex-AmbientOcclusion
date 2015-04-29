
#pragma strict

@script ExecuteInEditMode
@script RequireComponent (Camera)
@script AddComponentMenu ("Image Effects/Bloom and Lens Flares (3.4)")

enum LensflareStyle34 {
	Ghosting = 0,
	Anamorphic = 1,
	Combined = 2,
}

enum TweakMode34 {
	Basic = 0,
	Complex = 1,
}

enum BloomScreenBlendMode {
	Screen = 0,
	Add = 1,	
}
				
class BloomAndLensFlares extends PostEffectsBase {
	public var tweakMode : TweakMode34 = 0;
	public var screenBlendMode : BloomScreenBlendMode = BloomScreenBlendMode.Screen;
	
	public var sepBlurSpread : float = 1.5f;
	public var useSrcAlphaAsMask : float = 0.5f;
	
	public var bloomIntensity : float = 1.0f;
	public var bloomThreshhold : float = 0.5f;
	public var bloomBlurIterations : int = 2;	
		
	public var lensflares : boolean = false;
	
	public var hollywoodFlareBlurIterations : int = 2;
	public var lensflareMode : LensflareStyle34 = 1;
	public var hollyStretchWidth : float = 3.5f;
	public var lensflareIntensity : float = 1.0f;
	public var lensflareThreshhold : float = 0.3f;
	public var flareColorA : Color = Color (0.4f, 0.4f, 0.8f, 0.75f);
	public var flareColorB : Color = Color (0.4f, 0.8f, 0.8f, 0.75f);
	public var flareColorC : Color = Color (0.8f, 0.4f, 0.8f, 0.75f);
	public var flareColorD : Color = Color (0.8f, 0.4f, 0.0f, 0.75f);
	public var blurWidth : float = 1.0f;	
				
	public var lensFlareShader : Shader; 
	private var lensFlareMaterial : Material;
	
	public var vignetteShader : Shader;
	private var vignetteMaterial : Material;
	
	public var separableBlurShader : Shader;
	private var separableBlurMaterial : Material;
	
	public var addBrightStuffOneOneShader: Shader;
	private var addBrightStuffBlendOneOneMaterial : Material;

	public var screenBlendShader : Shader;
	private var screenBlend : Material;
	
	public var hollywoodFlaresShader: Shader;
	private var hollywoodFlaresMaterial : Material;
	
	public var brightPassFilterShader : Shader;
	private var brightPassFilterMaterial : Material;
	
	
	function Start () {
		CreateMaterials ();	
		CheckSupport (false);
	}
	
	function CreateMaterials () {
		screenBlend = CheckShaderAndCreateMaterial (screenBlendShader, screenBlend);
		lensFlareMaterial = CheckShaderAndCreateMaterial(lensFlareShader,lensFlareMaterial);
		vignetteMaterial = CheckShaderAndCreateMaterial(vignetteShader,vignetteMaterial);
		separableBlurMaterial = CheckShaderAndCreateMaterial(separableBlurShader,separableBlurMaterial);
		addBrightStuffBlendOneOneMaterial = CheckShaderAndCreateMaterial(addBrightStuffOneOneShader,addBrightStuffBlendOneOneMaterial);
		hollywoodFlaresMaterial = CheckShaderAndCreateMaterial (hollywoodFlaresShader, hollywoodFlaresMaterial);
		brightPassFilterMaterial = CheckShaderAndCreateMaterial(brightPassFilterShader, brightPassFilterMaterial);
	}
	
	function OnRenderImage (source : RenderTexture, destination : RenderTexture) {			
		CreateMaterials ();		
		
		var halfRezColor : RenderTexture = RenderTexture.GetTemporary (source.width / 2, source.height / 2, 0);			
		var quarterRezColor : RenderTexture = RenderTexture.GetTemporary (source.width / 4, source.height / 4, 0);	
		var secondQuarterRezColor : RenderTexture = RenderTexture.GetTemporary (source.width / 4, source.height / 4, 0);	
		var thirdQuarterRezColor : RenderTexture = RenderTexture.GetTemporary (source.width / 4, source.height / 4, 0);	
		
		var widthOverHeight : float = (1.0f * source.width) / (1.0f * source.height);
		var oneOverBaseSize : float = 1.0f / 512.0f;
		
		// downsample
		 
		Graphics.Blit (source, halfRezColor, screenBlend, 2); // <- stable downsample
		Graphics.Blit (halfRezColor, quarterRezColor, screenBlend, 2); // <- stable downsample	
		
		RenderTexture.ReleaseTemporary (halfRezColor);			

		// cut colors (threshholding)			
		
		BrightFilter (bloomThreshhold, useSrcAlphaAsMask, quarterRezColor, secondQuarterRezColor);		
				
		// blurring
		
		if (bloomBlurIterations < 1)
			bloomBlurIterations = 1;	
				        
		for (var iter : int = 0; iter < bloomBlurIterations; iter++ ) {
			var spreadForPass = (bloomBlurIterations * 1.0f) * sepBlurSpread;
			separableBlurMaterial.SetVector ("offsets", Vector4 (0.0, spreadForPass * oneOverBaseSize, 0.0, 0.0));	
			Graphics.Blit (iter == 0 ? secondQuarterRezColor : quarterRezColor, thirdQuarterRezColor, separableBlurMaterial); 
			separableBlurMaterial.SetVector ("offsets", Vector4 ((spreadForPass / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
			Graphics.Blit (thirdQuarterRezColor, quarterRezColor, separableBlurMaterial);		
		}

		if (lensflares) {							
			
			// this effect supports different kind of lens flares: ghosting, anamorphic and combined
			
			// (a) ghosting?
			 
			if (lensflareMode == 0) {
				
				// cut off some more dark colors
			
				BrightFilter (lensflareThreshhold, 0.0f, secondQuarterRezColor, thirdQuarterRezColor);				
				
				// smooth a little, this needs to be resolution dependent
				
				separableBlurMaterial.SetVector ("offsets", Vector4 (0.0f, (2.0f) / (1.0f * quarterRezColor.height), 0.0f, 0.0f));	
				Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, separableBlurMaterial);				
				separableBlurMaterial.SetVector ("offsets", Vector4 ((2.0f) / (1.0f * quarterRezColor.width), 0.0f, 0.0f, 0.0f));	
				Graphics.Blit (secondQuarterRezColor, thirdQuarterRezColor, separableBlurMaterial); 
				
				// no ugly edges!
				
				Vignette (0.975, thirdQuarterRezColor, secondQuarterRezColor);
								
				BlendFlares (secondQuarterRezColor, quarterRezColor);
			} 
			
			// (b) hollywood/anamorphic flares?
			
			else {
				
				// thirdQuarter has the brightcut unblurred colors
				// quarterRezColor is the blurred, brightcut buffer that will end up as bloom
				
				hollywoodFlaresMaterial.SetVector ("_Threshhold", Vector4 (lensflareThreshhold, 1.0f / (1.0f - lensflareThreshhold), 0.0f, 0.0f));
				hollywoodFlaresMaterial.SetVector ("tintColor", Vector4 (flareColorA.r, flareColorA.g, flareColorA.b, flareColorA.a) * flareColorA.a * lensflareIntensity);
				Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, hollywoodFlaresMaterial, 2); 	
				Graphics.Blit (secondQuarterRezColor, thirdQuarterRezColor, hollywoodFlaresMaterial, 3); 	
				
				hollywoodFlaresMaterial.SetVector ("offsets", Vector4 ((sepBlurSpread * 1.0f / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
				hollywoodFlaresMaterial.SetFloat ("stretchWidth", hollyStretchWidth);
				Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, hollywoodFlaresMaterial, 1);	
				hollywoodFlaresMaterial.SetFloat ("stretchWidth", hollyStretchWidth * 2.0f);
				Graphics.Blit (secondQuarterRezColor, thirdQuarterRezColor, hollywoodFlaresMaterial, 1);	
				hollywoodFlaresMaterial.SetFloat ("stretchWidth", hollyStretchWidth * 4.0f);
				Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, hollywoodFlaresMaterial, 1);	
												
				if (lensflareMode == 1) {															
					for (var itera : int = 0; itera < hollywoodFlareBlurIterations; itera++ ) {
						separableBlurMaterial.SetVector ("offsets", Vector4 ((hollyStretchWidth * 2.0f / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
						Graphics.Blit (secondQuarterRezColor, thirdQuarterRezColor, separableBlurMaterial);
						separableBlurMaterial.SetVector ("offsets", Vector4 ((hollyStretchWidth * 2.0f / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
						Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, separableBlurMaterial); 						
					}		
								
					AddTo (1.0, secondQuarterRezColor, quarterRezColor);
				}  
				else {		
					
					// (c) combined?
																
					for (var ix : int = 0; ix < hollywoodFlareBlurIterations; ix++ ) {
						separableBlurMaterial.SetVector ("offsets", Vector4 ((hollyStretchWidth * 2.0f / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
						Graphics.Blit (secondQuarterRezColor, thirdQuarterRezColor, separableBlurMaterial); 
						separableBlurMaterial.SetVector ("offsets", Vector4 ((hollyStretchWidth * 2.0f / widthOverHeight) * oneOverBaseSize, 0.0, 0.0, 0.0));	
						Graphics.Blit (thirdQuarterRezColor, secondQuarterRezColor, separableBlurMaterial); 							
					}		
				
					Vignette (1.0, secondQuarterRezColor, thirdQuarterRezColor);
				
					BlendFlares (thirdQuarterRezColor, secondQuarterRezColor);
				
					AddTo (1.0, secondQuarterRezColor, quarterRezColor);
				}																						
			}
		}		
		
		// screen blend bloom results to color buffer
		
		screenBlend.SetFloat ("_Intensity", bloomIntensity);
		screenBlend.SetTexture ("_ColorBuffer", source);
		Graphics.Blit (quarterRezColor, destination, screenBlend, screenBlendMode);		
		
		RenderTexture.ReleaseTemporary (quarterRezColor);	
		RenderTexture.ReleaseTemporary (secondQuarterRezColor);	
		RenderTexture.ReleaseTemporary (thirdQuarterRezColor);		
	}
	
	private function AddTo (intensity : float, from : RenderTexture, to : RenderTexture) {
		addBrightStuffBlendOneOneMaterial.SetFloat ("intensity", intensity);
		Graphics.Blit (from, to, addBrightStuffBlendOneOneMaterial); 		
	}
	
	private function BlendFlares (from : RenderTexture, to : RenderTexture) {
		lensFlareMaterial.SetVector ("colorA", Vector4 (flareColorA.r, flareColorA.g, flareColorA.b, flareColorA.a) * lensflareIntensity);
		lensFlareMaterial.SetVector ("colorB", Vector4 (flareColorB.r, flareColorB.g, flareColorB.b, flareColorB.a) * lensflareIntensity);
		lensFlareMaterial.SetVector ("colorC", Vector4 (flareColorC.r, flareColorC.g, flareColorC.b, flareColorC.a) * lensflareIntensity);
		lensFlareMaterial.SetVector ("colorD", Vector4 (flareColorD.r, flareColorD.g, flareColorD.b, flareColorD.a) * lensflareIntensity);
		Graphics.Blit (from, to, lensFlareMaterial);			
	}

	private function BrightFilter (thresh : float, useAlphaAsMask : float, from : RenderTexture, to : RenderTexture) {
		brightPassFilterMaterial.SetVector ("threshhold", Vector4 (thresh, 1.0 / (1.0-thresh), 0.0, 0.0));
		brightPassFilterMaterial.SetFloat ("useSrcAlphaAsMask", useAlphaAsMask);
		Graphics.Blit (from, to, brightPassFilterMaterial);			
	}
	
	private function Vignette (amount : float, from : RenderTexture, to : RenderTexture) {
		vignetteMaterial.SetFloat ("vignetteIntensity", amount);
		Graphics.Blit (from, to, vignetteMaterial); 		
	}

}