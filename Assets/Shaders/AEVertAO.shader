Shader "AE/AEVertAO" {
	
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_AOIntensity ("AO Intensity", Range(0, 1)) = 1.0
		_AOPower ("AO Power", Range(1, 10)) = 1.0
	}
	
	SubShader {
		
		Tags {
			"RenderType" = "Opaque"
		}
		
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert vertex:vert
		
		sampler2D _MainTex;
		float _AOIntensity;
		float _AOPower;
		
		struct Input {
			float2 uv_MainTex : TEXCOORD0;
			float4 color      : COLOR;
		};
		
		void vert(inout appdata_full v)
		{
			v.color.a = 1-( pow((1-v.color.a)*_AOIntensity, _AOPower ) );
		}
		
		
		void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			o.Albedo = c.rgb * IN.color.a;
			o.Alpha = c.a;
		}
		
		ENDCG
	}
	
	FallBack "Diffuse"
	
}
