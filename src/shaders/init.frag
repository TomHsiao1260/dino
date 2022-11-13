precision highp float;
precision highp int;

out vec4 fragColor;
in vec2 uv;

uniform float number;
uniform vec2 resolution;

#define texture2D texture

void main() {
  float aspect = resolution.y / resolution.x;
  vec2 uuvv;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  float s = 1.0 / number;
  vec2 grid = uuvv - mod(uuvv, s);
  vec2 cell = uuvv - mod(uuvv, s / 2.0);

  vec2 f0 = vec2(0.0, 0.0) * s / 2.0;
  vec2 f1 = vec2(1.0, 0.0) * s / 2.0;
  vec2 f2 = vec2(0.0, 1.0) * s / 2.0;
  vec2 f3 = vec2(1.0, 1.0) * s / 2.0;

  float e0 = length(cell - grid - f0);
  float e1 = length(cell - grid - f1);
  float e2 = length(cell - grid - f2);
  float e3 = length(cell - grid - f3);

  // boundary wall
  if (uuvv.y < s || uuvv.x < s || uuvv.x > (1.0 - s)) {
    if (e0 < s * 0.1) { fragColor = vec4(0.0); return; }
    if (e1 < s * 0.1) { fragColor = vec4(0.0); return; }
    if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
    if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
  }

  // if (mod(uuvv.x, 2.0*s) < 1.0*s && mod(uuvv.y, 2.0*s) < 1.0*s) {
  //   if (e0 < s * 0.1) { fragColor = vec4(0.2, 0.0, 1.0, 1.0); return; }
  //   if (e1 < s * 0.1) { fragColor = vec4(0.0); return; }
  //   if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
  //   if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
  // }

  // empty
  if (e0 < s * 0.1) { fragColor = vec4(0.0); return; }
  if (e1 < s * 0.1) { fragColor = vec4(0.5); return; }
  if (e2 < s * 0.1) { fragColor = vec4(0.5); return; }
  if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }

  discard;
}
