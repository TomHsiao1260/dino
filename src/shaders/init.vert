out vec2 uv;
in vec3 position;
uniform vec2 resolution;

void main() {
  // position (-1, -1) -> (1, 1)
  gl_Position = vec4(position.xy, 0, 1);
  // uv (-1, ~-1) -> (1, ~1)
  float aspect = resolution.y / resolution.x;
  uv = vec2(position.x, position.y * aspect);
}