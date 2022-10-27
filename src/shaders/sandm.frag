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
  vec4 ref0b, ref1b, ref2b, ref3b, ref4b, ref5b, ref6b, ref7b, ref8b;

  vec2 s0, s1, s2, s3, s4, s5, s6, s7, s8;
  vec2 f0, f1, f2, f3;
  vec2 g0, g1, g2, g3;
  vec2 c0;

  s0 = vec2(+0.0, +0.0) * s;
  s1 = vec2(+0.0, +1.0) * s;
  s2 = vec2(+0.0, -1.0) * s;
  s3 = vec2(-1.0, +0.0) * s;
  s4 = vec2(+1.0, +0.0) * s;
  s5 = vec2(-1.0, +1.0) * s;
  s6 = vec2(+1.0, -1.0) * s;
  s7 = vec2(+1.0, +1.0) * s;
  s8 = vec2(-1.0, -1.0) * s;

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

  ref0b = texture(colorTexture, g2 + s0);
  ref1b = texture(colorTexture, g2 + s1);
  ref2b = texture(colorTexture, g2 + s2);
  ref3b = texture(colorTexture, g2 + s3);
  ref4b = texture(colorTexture, g2 + s4);
  ref5b = texture(colorTexture, g2 + s5);
  ref6b = texture(colorTexture, g2 + s6);
  ref7b = texture(colorTexture, g2 + s7);
  ref8b = texture(colorTexture, g2 + s8);

  vec2 helper = vec2(0.0);
  float maxIndex = 0.0;
  float maxDiff = 0.0;

  if (abs(ref0.z - ref3.z) * (1.0 - ref0a.z) * (1.0 - ref3a.w) > 0.01) { maxIndex = 0.05; }
  if (abs(ref0.z - ref4.z) * (1.0 - ref0a.w) * (1.0 - ref4a.z) > 0.01) { maxIndex = 0.15; }

  if ((ref1.z - ref0.z) * (1.0 - ref0a.x) * (1.0 - ref1a.y) > maxDiff) { maxDiff = (ref1.z - ref0.z) * (1.0 - ref0a.x) * (1.0 - ref1a.y); maxIndex = 0.25; helper.x = 0.5; }
  if ((ref0.z - ref2.z) * (1.0 - ref0a.y) * (1.0 - ref2a.x) > maxDiff) { maxDiff = (ref0.z - ref2.z) * (1.0 - ref0a.y) * (1.0 - ref2a.x); maxIndex = 0.35; helper.x = 0.5; }

  if ((ref5.z - ref0.z) * 0.9 * (1.0 - ref0b.x) * (1.0 - ref5b.y) > maxDiff) { maxDiff = (ref5.z - ref0.z) * 0.9 * (1.0 - ref0b.x) * (1.0 - ref5b.y); maxIndex = 0.45; helper.y = 0.5; }
  if ((ref0.z - ref6.z) * 0.9 * (1.0 - ref0b.y) * (1.0 - ref6b.x) > maxDiff) { maxDiff = (ref0.z - ref6.z) * 0.9 * (1.0 - ref0b.y) * (1.0 - ref6b.x); maxIndex = 0.55; helper.y = 0.5; }

  if ((ref7.z - ref0.z) * 0.9 * (1.0 - ref0b.z) * (1.0 - ref7b.w) > maxDiff) { maxDiff = (ref7.z - ref0.z) * 0.9 * (1.0 - ref0b.z) * (1.0 - ref7b.w); maxIndex = 0.65; }
  if ((ref0.z - ref8.z) * 0.9 * (1.0 - ref0b.w) * (1.0 - ref8b.z) > maxDiff) { maxDiff = (ref0.z - ref8.z) * 0.9 * (1.0 - ref0b.w) * (1.0 - ref8b.z); maxIndex = 0.75; }

  fragColor = vec4(maxIndex, 0.0, 0.0, 1.0);
  fragColor.yz = helper;
}
