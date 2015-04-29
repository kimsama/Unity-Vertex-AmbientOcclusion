Shader "AE/Rimlit Vertex AO" {
	
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_RimFalloff ("Rimlight Falloff", Range(0.1, 10)) = 4.0
		_RimStrength ("Rimlight Strength", Range(0, 1)) = 1.0
	}
	
	SubShader {
		
		Tags {
			"RenderType"="Opaque"
		}
		
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert vertex:vert
		
		
		sampler2D _MainTex;
		float _RimFalloff;
		float _RimStrength;
		
		struct Input {
			float2 uv_MainTex : TEXCOORD0;
			float4 color      : COLOR;
		};
		
		
		void vert(inout appdata_full v)
		{
			v.color.rgb = 1;
			half rim = 1 - saturate( dot( normalize( ObjSpaceViewDir(v.vertex) ), v.normal ) );
			v.color.rgb *= pow(rim, _RimFalloff);
		}
		
		
		
		void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			o.Albedo = c.rgb * IN.color.a;
			o.Emission = IN.color.rgb * _RimStrength;
			o.Alpha = c.a;
		}
		
		ENDCG
	}
	
	FallBack "Diffuse"
	
}
