precision highp float;
precision highp int;

uniform vec2 resolution;
uniform int sketchMode;

out vec4 fragColor;
in vec2 uv;

// To Do
// need to design a flow which can simply apply customized physics rule
// Can pixel movement speed exceed the speed of framerate?
// It's buggy when canvas width & height is small or number is large (e.g. using texel instead?)
// find a better query method for texture (e.g. using matrix?)
// pressure define is still not that great (& need to support liquid mode)

uniform vec2 mouse;
uniform sampler2D colorTexture;
uniform sampler2D mmTexture;

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
  vec2 target = mouse - mod(mouse, s) + shift;

  vec4 ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  vec4 ref00, ref11, ref22, ref33, ref44, ref55, ref66, ref77, ref88;

  ref0 = texture(colorTexture, vec2(grid.x + 0.0 * s, grid.y + 0.0 * s));
  ref1 = texture(colorTexture, vec2(grid.x + 0.0 * s, grid.y + 1.0 * s));
  ref2 = texture(colorTexture, vec2(grid.x + 1.0 * s, grid.y + 1.0 * s));
  ref3 = texture(colorTexture, vec2(grid.x - 1.0 * s, grid.y + 1.0 * s));
  ref4 = texture(colorTexture, vec2(grid.x + 0.0 * s, grid.y - 1.0 * s));
  ref5 = texture(colorTexture, vec2(grid.x + 1.0 * s, grid.y - 1.0 * s));
  ref6 = texture(colorTexture, vec2(grid.x - 1.0 * s, grid.y - 1.0 * s));
  ref7 = texture(colorTexture, vec2(grid.x + 1.0 * s, grid.y + 0.0 * s));
  ref8 = texture(colorTexture, vec2(grid.x - 1.0 * s, grid.y + 0.0 * s));

  fragColor = ref0;
  
  if (uuvv.y < s) { fragColor = vec4(0.0, 0.0, 1.0, 0.0); return; }

  vec2 m = vec2(0.5) - mod(vec2(0.5), s) + shift;
  vec4 state = texture(colorTexture, m);

  // vec4(color, pressure, density, opacity)
  if (target == grid) {
    // creature
    if (sketchMode == 1 && state.y < 0.1) { fragColor = vec4(0.5, 0.0, 0.3, 1.0); return; }
    // ground
    if (sketchMode == 2) { fragColor = vec4(0.6, 0.0, 0.5, 1.0); return; }
    // water
    if (sketchMode == 3) { fragColor = vec4(0.9, 0.0, 0.1, 1.0); return; }
    // block
    if (sketchMode == 4) { fragColor = vec4(0.3, 0.0, 1.0, 1.0); return; }
    // sink
    if (sketchMode == 5) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); return; }
  }

  // last creature record
  if (m == grid) {
    fragColor.w = 1.0;
    if (fragColor.x < 0.5 * s) { fragColor.x += s; }
    if (sketchMode == 1) {
      if (mouse.x > 0.0) { fragColor.y = 0.2; }
      if (mouse.x < 0.0 && ref0.y > 0.1) {
        fragColor.y = 0.0;
        fragColor.x = (fragColor.x + 1.2 * s) - mod((fragColor.x + 1.2 * s), s);
      }
    }
    return;
  }

  // creature initial position record
  float sc = texture(colorTexture, m).x;
  if (sketchMode == 1 && mouse.x > 0.0 && state.y < 0.1 && m.y == grid.y) {
    float e = (grid.x - m.x) - sc;
    if (e < 0.5 * s && e > -0.5 * s) { fragColor = vec4(target, 1.0, 1.0); return; }
  }

  // creature free fall position update
  vec2 next;
  bool connect = false;
  float ee = grid.x - m.x;
  if (m.y == grid.y && ee < (0.5 * s + sc) && ee > 0.0) { connect = true; grid = ref0.xy; }

  ref00 = texture(mmTexture, vec2(grid.x + 0.0 * s, grid.y + 0.0 * s));
  ref11 = texture(mmTexture, vec2(grid.x + 0.0 * s, grid.y + 1.0 * s));
  ref22 = texture(mmTexture, vec2(grid.x + 1.0 * s, grid.y + 1.0 * s));
  ref33 = texture(mmTexture, vec2(grid.x - 1.0 * s, grid.y + 1.0 * s));
  ref44 = texture(mmTexture, vec2(grid.x + 0.0 * s, grid.y - 1.0 * s));
  ref55 = texture(mmTexture, vec2(grid.x + 1.0 * s, grid.y - 1.0 * s));
  ref66 = texture(mmTexture, vec2(grid.x - 1.0 * s, grid.y - 1.0 * s));
  ref77 = texture(mmTexture, vec2(grid.x + 1.0 * s, grid.y + 0.0 * s));
  ref88 = texture(mmTexture, vec2(grid.x - 1.0 * s, grid.y + 0.0 * s));

  float pressure = ref1.y;
  float density = ref1.z;
  if (density > 0.0) { pressure += s; }
  if (uuvv.y < 0.4) { fragColor.y = pressure; }

  if (ref00.x > 0.1 && ref00.x < 0.2 && ref11.x > 0.0 && ref11.x < 0.1) {
    next = vec2(ref0.x, ref0.y + s) - mod(vec2(ref0.x, ref0.y + s), s) + shift;
    if (!connect) { fragColor = ref1; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.0 && ref00.x < 0.1 && ref44.x > 0.1 && ref44.x < 0.2) {
    next = vec2(ref0.x, ref0.y - s) - mod(vec2(ref0.x, ref0.y - s), s) + shift;
    if (!connect) { fragColor = ref4; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.3 && ref00.x < 0.4 && ref33.x > 0.2 && ref33.x < 0.3) {
    next = vec2(ref0.x - s, ref0.y + s) - mod(vec2(ref0.x - s, ref0.y + s), s) + shift;
    if (!connect) { fragColor = ref3; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.2 && ref00.x < 0.3 && ref55.x > 0.3 && ref55.x < 0.4) {
    next = vec2(ref0.x + s, ref0.y - s) - mod(vec2(ref0.x + s, ref0.y - s), s) + shift;
    if (!connect) { fragColor = ref5; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.5 && ref00.x < 0.6 && ref22.x > 0.4 && ref22.x < 0.5) {
    next = vec2(ref0.x + s, ref0.y + s) - mod(vec2(ref0.x + s, ref0.y + s), s) + shift;
    if (!connect) { fragColor = ref2; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.4 && ref00.x < 0.5 && ref66.x > 0.5 && ref66.x < 0.6) {
    next = vec2(ref0.x - s, ref0.y - s) - mod(vec2(ref0.x - s, ref0.y - s), s) + shift;
    if (!connect) { fragColor = ref6; fragColor.y = ref0.y; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
}
