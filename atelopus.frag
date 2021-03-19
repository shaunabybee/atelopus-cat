#version 330 compatibility

uniform float uSBox;
uniform float uTBox;
uniform float uRadius;
uniform float uBand;
uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform float uShininess;
uniform float uNoiseFreq;
uniform float uTexFreq;
uniform float uNoiseAmp;

uniform sampler2D Noise2;
uniform sampler2D uTexUnit;

in vec3 vN;
in vec3 vL;
in vec3 vE;
in vec2 vST;

vec3 BLACK = vec3(0., 0., 0.);
vec3 WHITE = vec3(1., 1., 1.);
vec3 PURPLE = vec3(0.63f, 0.11f, 0.71f);


vec3 ToXYZ(vec3 BTNx, vec3 BTNy, vec3 BTNz, vec3 sth) {
	// Transforms bump map normal into surface local normal
	sth = normalize(sth);

	vec3 xyz;
	xyz.x = dot(BTNx, sth);
	xyz.y = dot(BTNy, sth);
	xyz.z = dot(BTNz, sth);

	return normalize(xyz);
}

void main() {

	vec3 Normal = normalize(vN);
	vec3 Light = normalize (vL);
	vec3 Eye = normalize(vE);

	// Get the normal from the bump map texture
	vec3 TexNormal = normalize(gl_NormalMatrix * (2. * texture(uTexUnit, uTexFreq * vST).xyz - vec3(1., 1., 1.)));
	
	// Transform bump map normal into surface local normal
	vec3 N = Normal;
	vec3 T;				// Tangent
	vec3 B;				// Bitangent

	// Calculate BTN using Gram Schmidt Method
	T = vec3(0., 1., 0.);
	float dotTN = dot(T, N);
	T = normalize(T - dotTN * N);
	B = normalize(cross(T, N));

	vec3 BTNx = vec3(B.x, T.x, N.x);
	vec3 BTNy = vec3(B.y, T.y, N.y);
	vec3 BTNz = vec3(B.z, T.z, N.z);

	Normal = ToXYZ(BTNx, BTNy, BTNz, TexNormal);

	// Base color
	vec3 color = BLACK;

	// Get noise from texture
	vec4 nv = texture(Noise2, uNoiseFreq * vST);
	float n = nv.r + nv.g + nv.b + nv.a;
	n = n - 2.;
	n *= uNoiseAmp;

	// Generate noisy rings
	int numInS = int(vST.s / uSBox);						// Find out which "box" we're in
	int numInT = int(vST.t / uTBox);

	float sC = numInS * uSBox + (uSBox / 2.);				// Center of the box
	float sT = numInT * uTBox + (uTBox / 2.);

	float sDist = vST.s - sC;						
	float tDist = vST.t - sT;

	float dist = sqrt(sDist * sDist + tDist * tDist);		// Distance from the center

	dist += n;												// Add noise

	if (dist < uRadius && dist > uRadius - uBand) {			// See if we're in the color band
		color = PURPLE;
	}

	// Lighting
	vec3 ambient = uAmbient * color;
	
	float d = max(dot(Normal, Light), 0.);
	vec3 diffuse = uDiffuse * d * color;

	float s = 0.;
	if (dot(Normal, Light) > 0.) {
		vec3 ref = normalize(2. * Normal * dot(Normal, Light) - Light);
		s = pow(max(dot(Eye, ref), 0.), uShininess);
	}

	vec3 specular = uSpecular * s * vec3(1., 1., 1.);

	color = ambient + diffuse + specular;
	gl_FragColor = vec4(color, 1.0);

}