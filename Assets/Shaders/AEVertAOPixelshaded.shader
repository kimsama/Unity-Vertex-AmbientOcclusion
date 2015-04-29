Shader "AE/AEVertAO (Pixel shaded)" {
	
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_AOColor ("AO Color", Color) = (0,0,0,1)
		_AOIntensity ("AO Intensity", Range(0, 1)) = 1.0
		_AOPower ("AO Power", Range(1, 10)) = 1.0
	}
	
	SubShader {
		
		Tags {
			"RenderType" = "Opaque"
		}
		
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert
		
		sampler2D _MainTex;
		half4 _AOColor;
		float _AOIntensity;
		float _AOPower;
		
		struct Input {
			float2 uv_MainTex : TEXCOORD0;
			float4 color      : COLOR;
		};
		
		
		void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			half ao = pow((1-IN.color.a)*_AOIntensity, _AOPower );
			o.Albedo = lerp(c.rgb, _AOColor, ao);
			o.Alpha = c.a;
		}
		
		ENDCG
	}
	
	FallBack "Diffuse"
	
}
