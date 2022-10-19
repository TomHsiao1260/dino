precision highp float;
precision highp int;

uniform vec2 resolution;
uniform int sketchMode;

out vec4 fragColor;
uniform float time;
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

float random (vec2 st) {
  vec2 t = vec2(12.9898,78.233);
  return fract(sin(dot(st.xy,t))*43758.5453123);
}

void main() {
  float number = 100.0;
  float aspect = resolution.y / resolution.x;
  float s = 1.0 / number;

  vec2 uuvv;
  vec4 ref00, ref11, ref22, ref33, ref44, ref55, ref66, ref77, ref88;
  vec2 s0, s1, s2, s3, s4, s5, s6, s7, s8;
  vec2 f0, f1, f2, f3;
  vec2 g0, g1, g2, g3;
  vec2 c0;

  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec2 grid = uuvv - mod(uuvv, s);
  vec2 cell = uuvv - mod(uuvv, s / 2.0);
  vec2 target = mouse - mod(mouse, s);

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

  float e0 = length(cell - grid - f0);
  float e1 = length(cell - grid - f1);
  float e2 = length(cell - grid - f2);
  float e3 = length(cell - grid - f3);

  if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s0); }
  if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s0); }
  if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s0); }
  if (e3 < s * 0.1) { fragColor = texture(colorTexture, g3 + s0); }

  if (uuvv.y < s) { fragColor = vec4(1.0, 1.0, 1.0, 0.0); return; }

  vec2 m = vec2(0.5) - mod(vec2(0.5), s);
  vec4 state = texture(colorTexture, m + c0 + f0);

  // vec4(constraint, pressure, density, opacity)
  if (grid == target) {
    // creature
    if (sketchMode == 1 && state.y < 0.1) {
      if (e0 < s * 0.1) { fragColor = vec4(0.5, 0.0, 0.3, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // ground
    if (sketchMode == 2) {
      float seed = random(time + grid);
      if (e0 < s * 0.1) { fragColor = vec4(0.7, 0.0, 0.5, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.0, 1.0, 0.0, 1.0); return; }
      // if (e1 < s * 0.1) { fragColor = vec4(0.0, 1.0, seed, 1.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // water
    if (sketchMode == 3) {
      if (e0 < s * 0.1) { fragColor = vec4(0.5, 0.0, 0.1, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // block
    if (sketchMode == 4) {
      if (e0 < s * 0.1) { fragColor = vec4(1.0, 0.0, 1.0, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(1.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // sink
    if (sketchMode == 5) {
      if (e0 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
  }

  // last creature record
  // if (m == cell) {
  //   fragColor.w = 1.0;
  //   if (fragColor.x < 0.5 * s) { fragColor.x += s; }
  //   if (sketchMode == 1) {
  //     if (mouse.x > 0.0) { fragColor.y = 0.2; }
  //     if (mouse.x < 0.0 && ref0.y > 0.1) {
  //       fragColor.y = 0.0;
  //       fragColor.x = (fragColor.x + 1.2 * s) - mod((fragColor.x + 1.2 * s), s);
  //     }
  //   }
  //   return;
  // }

  // creature initial position record
  // float sc = texture(colorTexture, m).x;
  // if (sketchMode == 1 && mouse.x > 0.0 && state.y < 0.1 && m.y == grid.y) {
  //   float e = (grid.x - m.x) - sc;
  //   if (e < 0.5 * s && e > -0.5 * s) { fragColor = vec4(target, 1.0, 1.0); return; }
  // }

  // creature free fall position update
  // vec2 next;
  bool connect = false;
  // float ee = grid.x - m.x;
  // if (m.y == grid.y && ee < (0.5 * s + sc) && ee > 0.0) { connect = true; grid = ref0.xy; }

  ref00 = texture(mmTexture, g0 + s0);
  ref11 = texture(mmTexture, g0 + s1);
  ref22 = texture(mmTexture, g0 + s2);
  ref33 = texture(mmTexture, g0 + s3);
  ref44 = texture(mmTexture, g0 + s4);
  ref55 = texture(mmTexture, g0 + s5);
  ref66 = texture(mmTexture, g0 + s6);
  ref77 = texture(mmTexture, g0 + s7);
  ref88 = texture(mmTexture, g0 + s8);

  if (ref00.x > 0.1 && ref00.x < 0.2 && ref11.x > 0.0 && ref11.x < 0.1) {
    // next = ref0.xy + s1 - mod(ref0.xy + s1, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s1); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s1); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s1); return; }
      if (e3 < s * 0.1) { fragColor = texture(colorTexture, g3 + s1); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.0 && ref00.x < 0.1 && ref44.x > 0.1 && ref44.x < 0.2) {
    // next = ref0.xy + s4 - mod(ref0.xy + s4, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s4); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s4); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s4); return; }
      if (e3 < s * 0.1) { fragColor = texture(colorTexture, g3 + s4); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.3 && ref00.x < 0.4 && ref33.x > 0.2 && ref33.x < 0.3) {
    // next = ref0.xy + s3 - mod(ref0.xy + s3, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s3); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s3); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s3); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.2 && ref00.x < 0.3 && ref55.x > 0.3 && ref55.x < 0.4) {
    // next = ref0.xy + s5 - mod(ref0.xy + s5, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s5); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s5); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s5); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.5 && ref00.x < 0.6 && ref22.x > 0.4 && ref22.x < 0.5) {
    // next = ref0.xy + s2 - mod(ref0.xy + s2, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s2); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s2); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s2); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.4 && ref00.x < 0.5 && ref66.x > 0.5 && ref66.x < 0.6) {
    // next = ref0.xy + s6 - mod(ref0.xy + s6, s) + c0 + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s6); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s6); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s6); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }

  if (ref00.x > 0.7 && ref00.x < 0.8 && ref88.x > 0.6 && ref88.x < 0.7) {
    // next = ref0.xy + s8 - mod(ref0.xy + s8, s) + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s8); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s8); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s8); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
  if (ref00.x > 0.6 && ref00.x < 0.7 && ref77.x > 0.7 && ref77.x < 0.8) {
    // next = ref0.xy + s7 - mod(ref0.xy + s7, s) + f0;
    if (!connect) {
      if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s7); return; }
      if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s7); return; }
      if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s7); return; }
    }
    // if (connect) { fragColor = vec4(next, 1.0, 1.0); return; }
  }
}
