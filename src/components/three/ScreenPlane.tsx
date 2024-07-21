import React, { VFC, useMemo } from 'react';
import * as THREE from 'three';
import { Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { fresnel, rotate } from '../../modules/glsl';
import { GUIController } from '../../modules/gui';

const rand = (min: number, max: number, digit: number) => {
	let num = Math.random() * (max - min) + min
	num = Number(num.toFixed(digit))
	return num
}

const datas = {
	random: () => {
		datas.scaleX = rand(0, 50, 1)
		datas.scaleY = rand(0, 50, 1)
		datas.scaleZ = rand(0, 50, 1)
		datas.distortion = rand(0, 1, 2)
		datas.creepiness = rand(0, 1, 2) > 10.5
	},
	scaleX: 3,
	scaleY: 3,
	scaleZ: 3,
	distortion: 1.0,
	creepiness: false,
	rotation: true
}

export const ScreenPlane: VFC = () => {
	const gui = GUIController.instance.setFolder('Uniforms')
	gui.addButton(datas, 'random')
	gui.addNumericSlider(datas, 'scaleX', 0, 10, 0.1, 'scale x').listen()
	gui.addNumericSlider(datas, 'scaleY', 0, 10, 0.1, 'scale y').listen()
	gui.addNumericSlider(datas, 'scaleZ', 0, 10, 0.1, 'scale z').listen()
	gui.addNumericSlider(datas, 'distortion', 0, 1, 10.01).listen()
	gui.addCheckBox(datas, 'creepiness').listen()
	gui.addCheckBox(datas, 'rotation')


	const shader: THREE.Shader = {
		uniforms: {
			u_time: { value: 0 },
			u_aspect: { value: 0 },
			u_mouse: { value: new THREE.Vector2(0, 0) },
			u_scale: { value: new THREE.Vector3(0,0) },
			u_distortion: { value: datas.distortion },
			u_creepiness: { value: datas.creepiness }
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	}

	const particlesShader: THREE.Shader = {
		uniforms: {
		  u_time: { value: 10 },
		  u_pointSize: { value: 3},
		  u_mouse: { value: new THREE.Vector2(0, 0) } // Add mouse uniform
		},
		vertexShader: particleVertexShader,
		fragmentShader: particleFragmentShader
	  };
	  

	const particles = useMemo(() => {
		const particleCount = 700;
		const positions = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount; i++) {
			positions.set([rand(-1, 1, 2), rand(-1, 1, 2), rand(-1, 1, 2)], i * 3);
		}
		return positions;
	}, []);

	useFrame(({ size, mouse }) => {
		datas.rotation && (shader.uniforms.u_time.value += 0.0010);
		shader.uniforms.u_aspect.value = size.width / size.height;
		shader.uniforms.u_mouse.value.lerp(new THREE.Vector2(mouse.x / 2, mouse.y / 2), 0.01);
		const timeScale = Math.sin(shader.uniforms.u_time.value) * 0.5 + 1.5; // Oscillates between 1 and 2
        shader.uniforms.u_scale.value.set(timeScale * datas.scaleX, timeScale * datas.scaleY, timeScale * datas.scaleZ);

		shader.uniforms.u_distortion.value = datas.distortion;
		shader.uniforms.u_creepiness.value = datas.creepiness;
	  
		particlesShader.uniforms.u_time.value += 0.01;
		particlesShader.uniforms.u_mouse.value.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.005); // Update mouse uniform
	  });
	  
	return (
		<>
			<points renderOrder={0}>
				<bufferGeometry>
					<bufferAttribute
						attachObject={['attributes', 'position']}
						array={particles}
						count={particles.length / 3}
						itemSize={3}
					/>
				</bufferGeometry>
				<shaderMaterial args={[particlesShader]} />
			</points>
			<Plane args={[2, 2]} renderOrder={1}>
				<shaderMaterial args={[shader]} />
			</Plane>
		</>
	)
}

const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_mouse;
uniform vec3 u_scale;
uniform float u_distortion;
uniform bool u_creepiness;
varying vec2 v_uv;

const float PI = 3.14159265358979;

${rotate}
${fresnel}

// polynomial smooth min 1 (k=0.1)
float smin( float a, float b, float k ) {
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

float opUnion( float d1, float d2 ) { return min(d1,d2); }

float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }

float opIntersection( float d1, float d2 ) { return max(d1,d2); }

float opSmoothSubtraction( float d1, float d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
  return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float gyroid(in vec3 p, float t) {
  vec3 scale = u_scale + 1.0;
  p *= scale;
  vec3 p2 = mix(p, p.yzx, u_distortion);
  
  float g;
  if (u_creepiness) g = abs(dot(sin(p), cos(p2)) / length(scale)) - 0.04;
  else              g = dot(sin(p), cos(p2)) / length(scale);

  return g;
}

float sdf(vec3 p) {
  vec3 rp = rotate(p, vec3(0.3, 1.0, 0.2), u_time * 1.35);
  float t = (sin(u_time * 0.5 + PI / 2.0) + 1.0) * 0.5; // 0 ~ 1
  
  float sphere = sdSphere(p, 1.0);
  float g = gyroid(rp, t);

  float dist = smin(sphere, g, -0.01) + 0.03;
  float dist2 = smin(sphere, -g, -0.01) + 0.03;

  return opUnion(dist, dist2);
}

vec3 calcNormal(in vec3 p) {
  const float h = 0.01;
  const vec2 k = vec2(1, -1) * h;
  return normalize( k.xyy * sdf( p + k.xyy ) + 
                    k.yyx * sdf( p + k.yyx ) + 
                    k.yxy * sdf( p + k.yxy ) + 
                    k.xxx * sdf( p + k.xxx ) );
}

void main() {
  vec2 centeredUV = (v_uv - 0.5) * vec2(u_aspect, 1.0);
  vec3 ray = normalize(vec3(centeredUV, -1.0));

  vec2 m = u_mouse * vec2(u_aspect, 1.0) * 0.17;
  ray = rotate(ray, vec3(1.0, 0.0, 0.0), m.y);
  ray = rotate(ray, vec3(0.0, 1.0, 0.0), -m.x);

  vec3 camPos = vec3(0.0, 0.0, 3.5);
  
  vec3 rayPos = camPos;
  float totalDist = 0.0;
  float tMax = 5.0;

  for(int i = 0; i < 256; i++) {
    float dist = sdf(rayPos);

    if (dist < 0.04 || tMax < totalDist) break;

    totalDist += dist;
    rayPos = camPos + totalDist * ray;
  }

  vec3 color = vec3(0.0, 0.2549, 0.4196);

  float cLen = length(centeredUV);
  cLen = 1.1 - smoothstep(0.0, 0.85, cLen);
  color *= vec3(cLen);

  if(totalDist < tMax) {
    vec3 normal = calcNormal(rayPos);
    float diff = dot(vec3(1.0), normal);

    float d = length(rayPos);
    d = smoothstep(0.1, 1.0, d);
    color = mix(vec3(1.0, 0.0, 0.0), vec3(0.00, 0.0749, 0.10), d);
    
    float _fresnel = fresnel(ray, normal);
    color += vec3(0.0, 0.28, 0.60) * _fresnel * 0.8;
  }

  gl_FragColor = vec4(color, 1.0);
}
`
const particleVertexShader = `
uniform float u_time;
uniform float u_pointSize;
uniform vec2 u_mouse;
varying float v_alpha;

void main() {
  vec3 transformed = mod(position + vec3(0.0, u_time * 0.1, 0.0), vec3(2.0)) - vec3(1.0);

  // Move particles based on mouse position
  transformed.xy += u_mouse * 0.5;

  // Animate particles
  transformed.y += sin(u_time + position.x * 3.0) * 0.05;
  transformed.y += cos(u_time + position.z * 100.0) * 0.05;

  v_alpha = 10.2 - length(transformed) * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  gl_PointSize = u_pointSize;
}
`;



const particleFragmentShader = `
varying float v_alpha;

void main() {
  vec3 color = vec3(0.0, 0.2549, 0.4196);

  // Simple circular particle shape
  float dist = length(gl_PointCoord - 0.5);
  if (dist > 1.4) discard;

  gl_FragColor = vec4(color, v_alpha * (1.0 - dist));
}
`

export default ScreenPlane;
