precision highp float;
precision highp int;

uniform vec2 resolution;
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
  vec2 shift = vec2(0.5 * s);
  vec2 grid = uuvv - mod(uuvv, s) + shift;

  vec4 ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  vec2 s0, s1, s2, s3, s4, s5, s6, s7, s8;

  s0 = vec2(0.0, 0.0) * s;
  s1 = vec2(0.0, 1.0) * s;
  s2 = vec2(1.0, 1.0) * s;
  s3 = vec2(-1.0, 1.0) * s;
  s4 = vec2(0.0, -1.0) * s;
  s5 = vec2(1.0, -1.0) * s;
  s6 = vec2(-1.0, -1.0) * s;
  s7 = vec2(1.0, 0.0) * s;
  s8 = vec2(-1.0, 0.0) * s;

  ref0 = texture(colorTexture, grid + s0);
  ref1 = texture(colorTexture, grid + s1);
  ref2 = texture(colorTexture, grid + s2);
  ref3 = texture(colorTexture, grid + s3);
  ref4 = texture(colorTexture, grid + s4);
  ref5 = texture(colorTexture, grid + s5);
  ref6 = texture(colorTexture, grid + s6);
  ref7 = texture(colorTexture, grid + s7);
  ref8 = texture(colorTexture, grid + s8);

  vec2 helper = vec2(0.0);
  float maxIndex = 0.0;
  float maxDiff = 0.0;

  // block (element: 1.0)
  if (ref0.z > 0.9) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

  if ((ref0.z - ref4.z) > maxDiff && ref4.z < 0.9) { maxDiff = ref0.z - ref4.z; maxIndex = 0.05; helper.x = 0.5; }
  if ((ref1.z - ref0.z) > maxDiff && ref1.z < 0.9) { maxDiff = ref1.z - ref0.z; maxIndex = 0.15; helper.x = 0.5; }

  if ((ref0.z - ref5.z) * 0.9 > maxDiff && ref5.z < 0.9) { maxDiff = (ref0.z - ref5.z) * 0.9; maxIndex = 0.25; helper.y = 0.5; }
  if ((ref3.z - ref0.z) * 0.9 > maxDiff && ref3.z < 0.9) { maxDiff = (ref3.z - ref0.z) * 0.9; maxIndex = 0.35; helper.y = 0.5; }

  if ((ref0.z - ref6.z) * 0.9 > maxDiff && ref6.z < 0.9) { maxDiff = (ref0.z - ref6.z) * 0.9; maxIndex = 0.45; }
  if ((ref2.z - ref0.z) * 0.9 > maxDiff && ref2.z < 0.9) { maxDiff = (ref2.z - ref0.z) * 0.9; maxIndex = 0.55; }

  fragColor = vec4(maxIndex, 0.0, 0.0, 1.0);
  fragColor.yz = helper;
}
