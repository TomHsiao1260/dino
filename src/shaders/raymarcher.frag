precision highp float;
precision highp int;

out vec4 fragColor;
in vec2 uv;
uniform vec2 resolution;

uniform float time;
uniform float size;
uniform int count;
uniform vec2 center;
uniform int sketchMode;
uniform int bufferRead;
uniform sampler2D dino;
uniform sampler2D sketch;
uniform sampler2D sand;

uniform float colorR;
uniform float colorG;
uniform float colorB;
uniform float delta;

#define texture2D texture

// TODO
// uv coordinate redefine, it's a mess
// size ratio is not correct (currently always 1)
// simpler way to write getter & setter
// accelerate the parameters generate & control process (abstraction)

void draw(inout vec4 color, in vec3 color_, in float phase, in vec2 center, in float size) {
  float intensity = 1.0;
  float speed = 5.0;
  float frame = 6.0;
  float range = 0.1;
  float mode = floor(mod((time + phase) * speed, frame));
  bool flip = step(frame, mod((time + phase) * speed, frame * 2.0)) == 0.0;
  //float mode = 0.0;
  //bool flip = false;

  float dispacement = mode * range / frame - range;
  // center.x += flip ? -dispacement : dispacement;

  vec2 a = center - size / 2.0;
  vec2 b = center + size / 2.0;

  intensity = min(intensity, step(a.x, uv.x));
  intensity = min(intensity, step(a.y, uv.y));
  intensity = min(intensity, 1.0 - step(b.x, uv.x));
  intensity = min(intensity, 1.0 - step(b.y, uv.y));

  float aspect = resolution.y / resolution.x;
  vec2 uuvv = uv;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec2 aa = a;
  aa.x = (a.x + 1.0) / 2.0;
  aa.y = (a.y / aspect + 1.0) / 2.0;
  vec2 bb = b;
  bb.x = (b.x + 1.0) / 2.0;
  bb.y = (b.y / aspect + 1.0) / 2.0;

  // 1233 100 "x": 848, "y": 0, "w": 176, "h": 52, "piece": 4,
  // lb 0.688 0.480 tr 0.830 1.000

  // vec2 lb = vec2(0.688 + mode / 4.0 * (0.830 - 0.688), 0.480);
  // vec2 tr = vec2(0.688 + (mode + 1.0) / 4.0 * (0.830 - 0.688), 1.000);
  vec2 lb = vec2(0.0);
  vec2 tr = vec2(1.0);

  vec2 llbb = lb;
  vec2 ttrr = tr;
  lb.x = flip ? ttrr.x : llbb.x;
  tr.x = flip ? llbb.x : ttrr.x;

  vec2 uu = uuvv;
  uu.x = uuvv.x * (tr.x-lb.x)/(bb.x-aa.x) + lb.x - aa.x * (tr.x-lb.x)/(bb.x-aa.x);
  uu.y = uuvv.y * (tr.y-lb.y)/(bb.y-aa.y) + lb.y - aa.y * (tr.y-lb.y)/(bb.y-aa.y);

  // vec4 tt = texture(dino, uu);
  vec4 tt = texture(sketch, uu);

  vec3 cc = (tt.x > 0.5) ? color_ : vec3(0.0);
  // vec3 cc = (tt.x > 0.5) ? vec3(1.0) : color_;
  vec4 pre_c = color;
  vec4 cur_c = vec4(cc, tt.w * intensity);
  color.xyz = (cur_c.w > 0.0) ? cur_c.xyz : pre_c.xyz;
  color.w = max(pre_c.w, cur_c.w);
}

void main() {
  vec4 color = vec4(0.0);

  float aspect = resolution.y / resolution.x;
  vec2 uuvv = uv;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  switch (sketchMode) {
    default:
    case 0: // fullSketch
      fragColor = texture(sketch, uuvv);
      break;
    case 1: case 2: case 3: case 4: case 5: // sand
      float number = 100.0;
      float s = 1.0 / number;
      vec2 memory = vec2(0.5) - mod(vec2(0.5), s);
      vec2 shift = vec2(0.5 * s);

      for(int i=0; i<50; ++i)
      {
        // float r_position = fract(sin(float(i))*1235.0) - 0.5;
        // float r_size = fract(sin(float(i))*348.0) - 0.5;
        float r_phase = fract(sin(float(i))*869.0) - 0.5;

        vec3 r_color;
        r_color.r = fract(sin(float(i))*687.0) - 0.5;
        r_color.g = fract(sin(float(i))*99.0) - 0.5;
        r_color.b = fract(sin(float(i))*761.0) - 0.5;

        // float s = size - r_size * 0.2;
        // vec2 p = center + vec2(r_position * 1.5, s/2.0);
        float ph = r_phase;
        vec3 c = vec3(colorR, colorG, colorB) - r_color * delta;

        vec2 state;
        state.x = (memory.x + float(i+1)* s) - mod((memory.x + float(i+1) * s), s);
        state.y = memory.y;
        state += shift;

        vec4 pos = texture(sand, state).xyzw;
        vec2 p;
        p.x = pos.x * 2.0 - 1.0;
        p.y = (pos.y * 2.0 - 1.0) * aspect + size / 2.0;

        if (pos.w < 0.1) { break; }
        draw(color, c, ph, p, size);
      }

      vec4 sceneColor = vec4(0.0);

      switch (bufferRead) {
        default:
        case 0: // normal
          vec2 cell = uuvv - mod(uuvv, s) + vec2(s, s) / 4.0;
          vec4 ref0 = texture(sand, cell);

          // block
          if (ref0.x > 0.15) { sceneColor = vec4(0.3, 0.3, 0.3, 1.0); }
          // water
          if (ref0.x > 0.25) { sceneColor = vec4(0.0, 0.3, 0.6, 1.0); }
          // ground
          if (ref0.x > 0.35) { sceneColor = vec4(0.0, 0.6, 0.3, 1.0); }
        break;
        case 1: case 2: case 3: // pure data
          sceneColor = texture(sand, uuvv);
        break;
      }

      fragColor = (color.x > 0.0) ? color : sceneColor;
      break;
  }
}
