#version 330 compatibility

uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

out vec3 vN;
out vec3 vL;
out vec3 vE;
out vec2 vST;

vec3 LIGHTPOS = vec3(uLightX, uLightY, uLightZ);

void main() {

	vec3 pos = gl_Vertex.xyz;									// Get the position from .obj file
	vST = gl_MultiTexCoord0.st;

	vec4 ECposition = gl_ModelViewMatrix * vec4(pos, 1.);

	vN = normalize(gl_NormalMatrix * gl_Normal);
	vL = LIGHTPOS - ECposition.xyz;
	vE = vec3(0., 0., 0.) - ECposition.xyz;

	gl_Position = gl_ModelViewProjectionMatrix * vec4(pos, 1.0);
}   