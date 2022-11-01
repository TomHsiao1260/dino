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
// find out a flexable way to query, connect, manipulate the grid

uniform vec2 mouse;
uniform sampler2D colorTexture;
uniform sampler2D mmTexture;

#define texture2D texture

float random (vec2 st) {
  vec2 t = vec2(12.9898,78.233);
  return fract(sin(dot(st.xy,t))*43758.5453123);
}

vec4 result (vec2 direction) {
  float number = 100.0;
  float aspect = resolution.y / resolution.x;
  float s = 1.0 / number;

  vec2 uuvv;
  vec2 s0, s1, s2, s3, s4, s5, s6, s7, s8;
  vec2 f0, f1, f2, f3;
  vec2 g0, g1, g2, g3;
  vec2 c0;

  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec2 grid = uuvv - mod(uuvv, s);
  vec2 cell = uuvv - mod(uuvv, s / 2.0);

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

  float e0 = length(cell - grid - f0);
  float e1 = length(cell - grid - f1);
  float e2 = length(cell - grid - f2);
  float e3 = length(cell - grid - f3);

  vec4 j0 = texture(colorTexture, g0 + direction);
  vec4 j1 = texture(colorTexture, g1 + direction);
  vec4 j2 = texture(colorTexture, g2 + direction);
  vec4 j3 = texture(colorTexture, g3 + direction);

  if (e0 < s * 0.1) { return j0; }
  if (e1 < s * 0.1) {
    if (j0.x > 0.7 && j0.x < 0.9) { return vec4(j1.xy, 0.0, 0.0); }
    return j1;
  }
  if (e2 < s * 0.1) {
    if (j0.x > 0.7 && j0.x < 0.9) { return vec4(0.0); }
    return j2;
  }
  if (e3 < s * 0.1) { return j3; }

  return vec4(1.0);
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

  vec4 ref0 = texture(colorTexture, g0);

  float e0 = length(cell - grid - f0);
  float e1 = length(cell - grid - f1);
  float e2 = length(cell - grid - f2);
  float e3 = length(cell - grid - f3);

  if (e0 < s * 0.1) { fragColor = texture(colorTexture, g0 + s0); }
  if (e1 < s * 0.1) { fragColor = texture(colorTexture, g1 + s0); }
  if (e2 < s * 0.1) { fragColor = texture(colorTexture, g2 + s0); }
  if (e3 < s * 0.1) { fragColor = texture(colorTexture, g3 + s0); }

  vec2 m = vec2(0.5) - mod(vec2(0.5), s);
  vec4 state = texture(colorTexture, m + c0 + f0);

  // vec4(color, pressure, density, opacity)
  // vec4(mid-top, mid-bot, left-mid, right-mid) freedom
  // vec4(left-top, right-bot, right-top, left-bot) freedom
  if (grid == target) {
    // creature
    if (sketchMode == 1 && state.y < 0.1) {
      if (e0 < s * 0.1) { fragColor = vec4(0.8, 0.0, 0.3, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.5, 0.5); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.5, 0.5); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // ground
    if (sketchMode == 2) {
      float seed = random(time + grid);
      if (e0 < s * 0.1) { fragColor = vec4(0.4, 0.0, 0.5, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.0, 0.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.5, 0.5); return; }
      // if (e2 < s * 0.1) { fragColor = vec4(seed); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // water
    if (sketchMode == 3) {
      if (e0 < s * 0.1) { fragColor = vec4(0.3, 0.0, 0.2, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.5, 0.5); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.5, 0.5, 0.5, 0.5); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // block
    if (sketchMode == 4) {
      if (e0 < s * 0.1) { fragColor = vec4(0.2, 0.0, 1.0, 1.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
    // sink
    if (sketchMode == 5) {
      if (e0 < s * 0.1) { fragColor = vec4(0.0); return; }
      if (e1 < s * 0.1) { fragColor = vec4(0.5); return; }
      if (e2 < s * 0.1) { fragColor = vec4(0.5); return; }
      if (e3 < s * 0.1) { fragColor = vec4(0.0); return; }
    }
  }

  // last creature record
  float el = length(cell - m - f0);
  float fl = length(cell - m - f1);
  float gl = length(cell - m - f2);
  if (el < s * 0.1) {
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
  if (fl < s * 0.1) { fragColor = vec4(1.0); return; }
  if (gl < s * 0.1) { fragColor = vec4(1.0); return; }

  // creature initial position record
  if (sketchMode == 1 && mouse.x > 0.0 && state.y < 0.1) {
    float e = length(cell - vec2(m.x + state.x, m.y) - f0);
    float f = length(cell - vec2(m.x + state.x, m.y) - f1);
    float g = length(cell - vec2(m.x + state.x, m.y) - f2);
    // w 0.5 means connected (temporarily used)
    if (e < 0.2 * s) { fragColor = vec4(target, 1.0, 0.5); return; }
    if (f < 0.2 * s) { fragColor = vec4(0.0); return; }
    if (g < 0.2 * s) { fragColor = vec4(0.0); return; }
  }

  // creature free fall position update
  vec2 next;
  bool connect = false;
  vec4 ce = texture(colorTexture, grid + c0 + f0);
  if (ce.w > 0.45 && ce.w < 0.55) { connect = true; g0 = ce.xy + c0; }

  // update creators freedom
  if (ref0.x > 0.7 && ref0.x < 0.9 && ref0.z < 0.9) {
    float amp = 0.02; float barrier = 0.4;
    // ref0.z < 0.9 exclude connected dot calculation
    if (e1 < s * 0.1) {
      fragColor.z += amp * (random(uv*1.0+time)-barrier);
      fragColor.w += amp * (random(uv*2.0+time)-barrier);
    }
    if (e2 < s * 0.1) {
      float a = amp * (random(uv*1.0+time)-barrier);
      float b = amp * (random(uv*2.0+time)-barrier);
      fragColor.xw -= vec2(a);
      fragColor.yz -= vec2(b);
    }
  }

  ref00 = texture(mmTexture, g0 + s0);
  ref11 = texture(mmTexture, g0 + s1);
  ref22 = texture(mmTexture, g0 + s2);
  ref33 = texture(mmTexture, g0 + s3);
  ref44 = texture(mmTexture, g0 + s4);
  ref55 = texture(mmTexture, g0 + s5);
  ref66 = texture(mmTexture, g0 + s6);
  ref77 = texture(mmTexture, g0 + s7);
  ref88 = texture(mmTexture, g0 + s8);

  if (ref00.x > 0.2 && ref00.x < 0.3 && ref11.x > 0.3 && ref11.x < 0.4) {
    next = ref0.xy + c0 + s1 - mod(ref0.xy + c0 + s1, s);
    if (!connect) { fragColor = result(s1); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }
  if (ref00.x > 0.3 && ref00.x < 0.4 && ref22.x > 0.2 && ref22.x < 0.3) {
    next = ref0.xy + c0 + s2 - mod(ref0.xy + c0 + s2, s);
    if (!connect) { fragColor = result(s2); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }

  if (ref00.x > 0.0 && ref00.x < 0.1 && ref33.x > 0.1 && ref33.x < 0.2) {
    next = ref0.xy + c0 + s3 - mod(ref0.xy + c0 + s3, s);
    if (!connect) { fragColor = result(s3); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }
  if (ref00.x > 0.1 && ref00.x < 0.2 && ref44.x > 0.0 && ref44.x < 0.1) {
    next = ref0.xy + c0 + s4 - mod(ref0.xy + c0 + s4, s);
    if (!connect) { fragColor = result(s4); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }

  if (ref00.x > 0.4 && ref00.x < 0.5 && ref55.x > 0.5 && ref55.x < 0.6) {
    next = ref0.xy + c0 + s5 - mod(ref0.xy + c0 + s5, s);
    if (!connect) { fragColor = result(s5); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }
  if (ref00.x > 0.5 && ref00.x < 0.6 && ref66.x > 0.4 && ref66.x < 0.5) {
    next = ref0.xy + c0 + s6 - mod(ref0.xy + c0 + s6, s);
    if (!connect) { fragColor = result(s6); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }

  if (ref00.x > 0.6 && ref00.x < 0.7 && ref77.x > 0.7 && ref77.x < 0.8) {
    next = ref0.xy + c0 + s7 - mod(ref0.xy + c0 + s7, s) + f0;
    if (!connect) { fragColor = result(s7); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }
  if (ref00.x > 0.7 && ref00.x < 0.8 && ref88.x > 0.6 && ref88.x < 0.7) {
    next = ref0.xy + c0 + s8 - mod(ref0.xy + c0 + s8, s) + f0;
    if (!connect) { fragColor = result(s8); return; }
    if (connect && e0 < s * 0.1) { fragColor = vec4(next, 1.0, 0.5); return; }
  }
}
