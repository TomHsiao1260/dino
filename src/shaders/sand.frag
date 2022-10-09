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

  ref00 = texture(mmTexture, grid + s0);
  ref11 = texture(mmTexture, grid + s1);
  ref22 = texture(mmTexture, grid + s2);
  ref33 = texture(mmTexture, grid + s3);
  ref44 = texture(mmTexture, grid + s4);
  ref55 = texture(mmTexture, grid + s5);
  ref66 = texture(mmTexture, grid + s6);
  ref77 = texture(mmTexture, grid + s7);
  ref88 = texture(mmTexture, grid + s8);

  if (ref00.x > 0.1 && ref00.x < 0.2 && ref11.x > 0.0 && ref11.x < 0.1) {
    next = ref0.xy + s1 - mod(ref0.xy + s1, s) + shift;
    if (!connect) { fragColor = ref1; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.0 && ref00.x < 0.1 && ref44.x > 0.1 && ref44.x < 0.2) {
    next = ref0.xy + s4 - mod(ref0.xy + s4, s) + shift;
    if (!connect) { fragColor = ref4; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.3 && ref00.x < 0.4 && ref33.x > 0.2 && ref33.x < 0.3) {
    next = ref0.xy + s3 - mod(ref0.xy + s3, s) + shift;
    if (!connect) { fragColor = ref3; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.2 && ref00.x < 0.3 && ref55.x > 0.3 && ref55.x < 0.4) {
    next = ref0.xy + s5 - mod(ref0.xy + s5, s) + shift;
    if (!connect) { fragColor = ref5; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.5 && ref00.x < 0.6 && ref22.x > 0.4 && ref22.x < 0.5) {
    next = ref0.xy + s2 - mod(ref0.xy + s2, s) + shift;
    if (!connect) { fragColor = ref2; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.4 && ref00.x < 0.5 && ref66.x > 0.5 && ref66.x < 0.6) {
    next = ref0.xy + s6 - mod(ref0.xy + s6, s) + shift;
    if (!connect) { fragColor = ref6; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.7 && ref00.x < 0.8 && ref88.x > 0.6 && ref88.x < 0.7) {
    next = ref0.xy + s8 - mod(ref0.xy + s8, s) + shift;
    if (!connect) { fragColor = ref8; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.6 && ref00.x < 0.7 && ref77.x > 0.7 && ref77.x < 0.8) {
    next = ref0.xy + s7 - mod(ref0.xy + s7, s) + shift;
    if (!connect) { fragColor = ref7; return; }
    if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
}
