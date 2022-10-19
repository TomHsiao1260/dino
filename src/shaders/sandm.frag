precision highp float;
precision highp int;

uniform vec2 resolution;
uniform float time;
out vec4 fragColor;
in vec2 uv;
uniform sampler2D colorTexture;

#define texture2D texture

void main() {
  float aspect = resolution.y / resolution.x;
  vec2 uuvv;
  float number = 100.0;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  float s = 1.0 / number;
  vec2 grid = uuvv - mod(uuvv, s);

  vec4 ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  vec4 ref0a, ref1a, ref2a, ref3a, ref4a, ref5a, ref6a, ref7a, ref8a;

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

  ref0a = texture(colorTexture, g1 + s0);
  ref1a = texture(colorTexture, g1 + s1);
  ref2a = texture(colorTexture, g1 + s2);
  ref3a = texture(colorTexture, g1 + s3);
  ref4a = texture(colorTexture, g1 + s4);
  ref5a = texture(colorTexture, g1 + s5);
  ref6a = texture(colorTexture, g1 + s6);
  ref7a = texture(colorTexture, g1 + s7);
  ref8a = texture(colorTexture, g1 + s8);

  vec2 helper = vec2(0.0);
  float maxIndex = 0.0;
  float maxDiff = 0.0;

  if (abs(ref0.z - ref7.z) > 0.01 && ref0a.y < 0.5 && ref7a.y < 0.5) { maxIndex = 0.65; }
  if (abs(ref0.z - ref8.z) > 0.01 && ref0a.y < 0.5 && ref8a.y < 0.5) { maxIndex = 0.75; }

  if ((ref0.z - ref4.z) > maxDiff && ref0a.x < 0.5 && ref4a.x < 0.5) { maxDiff = ref0.z - ref4.z; maxIndex = 0.05; helper.x = 0.5; }
  if ((ref1.z - ref0.z) > maxDiff && ref0a.x < 0.5 && ref1a.x < 0.5) { maxDiff = ref1.z - ref0.z; maxIndex = 0.15; helper.x = 0.5; }

  if ((ref0.z - ref5.z) * 0.9 > maxDiff && ref0a.z < 0.5 && ref5a.z < 0.5) { maxDiff = (ref0.z - ref5.z) * 0.9; maxIndex = 0.25; helper.y = 0.5; }
  if ((ref3.z - ref0.z) * 0.9 > maxDiff && ref0a.z < 0.5 && ref3a.z < 0.5) { maxDiff = (ref3.z - ref0.z) * 0.9; maxIndex = 0.35; helper.y = 0.5; }

  if ((ref0.z - ref6.z) * 0.9 > maxDiff && ref0a.z < 0.5 && ref6a.z < 0.5) { maxDiff = (ref0.z - ref6.z) * 0.9; maxIndex = 0.45; }
  if ((ref2.z - ref0.z) * 0.9 > maxDiff && ref0a.z < 0.5 && ref2a.z < 0.5) { maxDiff = (ref2.z - ref0.z) * 0.9; maxIndex = 0.55; }

  fragColor = vec4(maxIndex, 0.0, 0.0, 1.0);
  fragColor.yz = helper;
}
