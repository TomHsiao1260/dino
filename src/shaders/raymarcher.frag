precision highp float;
precision highp int;

out vec4 fragColor;
in vec2 uv;

uniform float time;
uniform vec2 size;
uniform vec2 center;

#define texture2D texture

void draw(inout vec4 color, in vec2 center, in vec2 size) {
  float intensity = 1.0;

  intensity = min(intensity, step(center.x - size.x / 2.0, uv.x));
  intensity = min(intensity, step(center.y - size.y / 2.0, uv.y));
  intensity = min(intensity, 1.0 - step(center.x + size.x / 2.0, uv.x));
  intensity = min(intensity, 1.0 - step(center.y + size.y / 2.0, uv.y));

  color = vec4(vec3(intensity), 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  draw(color, center, size);
  fragColor = color;
}
