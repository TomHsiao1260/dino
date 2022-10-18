precision highp float;
precision highp int;

uniform vec2 resolution;
uniform float time;
out vec4 fragColor;
in vec2 uv;
uniform sampler2D colorTexture;

#define texture2D texture

float random (vec2 st) {
  vec2 t = vec2(12.9898,78.233);
  return fract(sin(dot(st.xy,t))*43758.5453123);
}

void main() {
  float aspect = resolution.y / resolution.x;
  vec2 uuvv;
  float number = 30.0;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  float s = 1.0 / number;
  vec2 grid = uuvv - mod(uuvv, s);

  vec4 ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  vec2 s0, s1, s2, s3, s4, s5, s6, s7, s8;
  vec2 f0, f1, f2, f3;
  vec2 g0, g1, g2, g3;
  vec2 c0;

  s0 = vec2(+0.0, +0.0) * s;
  s1 = vec2(+0.0, +1.0) * s;
  s2 = vec2(+1.0, +1.0) * s;
  s3 = vec2(-1.0, +1.0) * s;
  s4 = vec2(+0.0, -1.0) * s;
  s5 = vec2(+1.0, -1.0) * s;
  s6 = vec2(-1.0, -1.0) * s;
  s7 = vec2(+1.0, +0.0) * s;
  s8 = vec2(-1.0, +0.0) * s;

  f0 = vec2(0.0, 0.0) * s / 2.0;
  f1 = vec2(1.0, 0.0) * s / 2.0;
  f2 = vec2(0.0, 1.0) * s / 2.0;
  f3 = vec2(1.0, 1.0) * s / 2.0;

  c0 = vec2(1.0, 1.0) * s / 4.0;

  g0 = grid + c0 + f0;
  g1 = grid + c0 + f1;
  g2 = grid + c0 + f2;
  g3 = grid + c0 + f3;

  ref0 = texture(colorTexture, g0 + s0);
  ref1 = texture(colorTexture, g0 + s1);
  ref2 = texture(colorTexture, g0 + s2);
  ref3 = texture(colorTexture, g0 + s3);
  ref4 = texture(colorTexture, g0 + s4);
  ref5 = texture(colorTexture, g0 + s5);
  ref6 = texture(colorTexture, g0 + s6);
  ref7 = texture(colorTexture, g0 + s7);
  ref8 = texture(colorTexture, g0 + s8);

  vec2 helper = vec2(0.0);
  float maxIndex = 0.0;
  float maxDiff = 0.0;

  // block (element: 1.0)
  if (ref0.z > 0.9) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

  float rand0 = random(time + grid + vec2(0.0)) - ((ref0.x > 0.8) ? 1.1 : -0.1);
  if ((ref0.z - ref4.z) > maxDiff && rand0 > 0.0 && ref4.z < 0.9) { maxDiff = ref0.z - ref4.z; maxIndex = 0.05; helper.x = 0.5; }
  if ((ref1.z - ref0.z) > maxDiff && rand0 > 0.0 && ref1.z < 0.9) { maxDiff = ref1.z - ref0.z; maxIndex = 0.15; helper.x = 0.5; }

  float rand1 = random(time + grid + vec2(1.0)) - ((ref0.x > 0.6) ? 1.1 : -0.1);
  if ((ref0.z - ref5.z) * 0.9 > maxDiff && rand1 > 0.0 && ref5.z < 0.9) { maxDiff = (ref0.z - ref5.z) * 0.9; maxIndex = 0.25; helper.y = 0.5; }
  if ((ref3.z - ref0.z) * 0.9 > maxDiff && rand1 > 0.0 && ref3.z < 0.9) { maxDiff = (ref3.z - ref0.z) * 0.9; maxIndex = 0.35; helper.y = 0.5; }

  float rand2 = random(time + grid + vec2(2.0)) - ((ref0.x > 0.6) ? 1.1 : -0.1);
  if ((ref0.z - ref6.z) * 0.9 > maxDiff && rand2 > 0.0 && ref6.z < 0.9) { maxDiff = (ref0.z - ref6.z) * 0.9; maxIndex = 0.45; }
  if ((ref2.z - ref0.z) * 0.9 > maxDiff && rand2 > 0.0 && ref2.z < 0.9) { maxDiff = (ref2.z - ref0.z) * 0.9; maxIndex = 0.55; }

  // float rand3 = random(time + grid + vec2(3.0)) - 0.7;
  // if (rand3 > 0.0 && ref7.z < 0.9) { maxIndex = 0.65; }

  // float rand4 = random(time + grid + vec2(4.0)) - 0.7;
  // if (rand4 > 0.0 && ref8.z < 0.9) { maxIndex = 0.75; }

  fragColor = vec4(maxIndex, 0.0, 0.0, 1.0);
  fragColor.yz = helper;
}
