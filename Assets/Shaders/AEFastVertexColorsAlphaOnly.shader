Shader "AE/Fast Vertex Alpha as RGB" {
	
	Properties {
		_Intensity ("Intensity", Range(0, 1)) = 1.0
		_Power ("Power", Range(1, 10)) = 1.0
	}
	
	
	Subshader {
		
		Tags {
			"Queue" = "Geometry"
			"RenderType" = "Opaque"
		}
		
		ZWrite On
		Fog { Mode Off }
		
		
		Pass {
			
			Lighting Off
			
			CGPROGRAM
			// Upgrade NOTE: excluded shader from OpenGL ES 2.0 because it does not contain a surface program or both vertex and fragment programs.
			#pragma exclude_renderers gles
			#pragma vertex vert
			
			float _Intensity;
			float _Power;
			
			struct appdata_color {
			    float4 vertex    : POSITION;
			    fixed4 color     : COLOR;
			};
			
			struct v2f {
				float4 pos       : SV_POSITION;
				float4 color     : COLOR;
			};
			
			v2f vert(appdata_color v)
			{
				v2f o;
				o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
				o.color.rgb = 1-( pow((1-v.color.a)*_Intensity, _Power ) );
				o.color.a = 1;
				return o;
			}
			
			
			ENDCG
			
		} // Pass
	
	} // SubShader

}