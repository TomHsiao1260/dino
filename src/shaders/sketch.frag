precision highp float;
precision highp int;

out vec4 fragColor;
in vec2 uv;

uniform float number;
uniform vec2 mouse;

#define texture2D texture

void main() {
  vec2 uuvv;

  vec2 grid = uv - mod(uv, 1.0 / number);
  vec2 target = mouse - mod(mouse, 1.0 / number);

  if (target != grid) discard;

  fragColor = vec4(1.0);
}
