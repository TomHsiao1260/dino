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

  vec2 grid = uuvv - mod(uuvv, 1.0 / number);
  vec2 target = mouse - mod(mouse, 1.0 / number);

  vec2 shift = vec2(0.5 / number);
  vec4 ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
  vec4 ref00, ref11, ref22, ref33, ref44, ref55, ref66, ref77, ref88;

  ref0 = texture(colorTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y + 0.0 / number));
  ref1 = texture(colorTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y + 1.0 / number));
  ref2 = texture(colorTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y + 1.0 / number));
  ref3 = texture(colorTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y + 1.0 / number));
  ref4 = texture(colorTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y - 1.0 / number));
  ref5 = texture(colorTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y - 1.0 / number));
  ref6 = texture(colorTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y - 1.0 / number));
  ref7 = texture(colorTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y + 0.0 / number));
  ref8 = texture(colorTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y + 0.0 / number));

  ref00 = texture(mmTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y + 0.0 / number));
  ref11 = texture(mmTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y + 1.0 / number));
  ref22 = texture(mmTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y + 1.0 / number));
  ref33 = texture(mmTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y + 1.0 / number));
  ref44 = texture(mmTexture, vec2(grid.x + shift.x + 0.0 / number, grid.y + shift.y - 1.0 / number));
  ref55 = texture(mmTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y - 1.0 / number));
  ref66 = texture(mmTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y - 1.0 / number));
  ref77 = texture(mmTexture, vec2(grid.x + shift.x + 1.0 / number, grid.y + shift.y + 0.0 / number));
  ref88 = texture(mmTexture, vec2(grid.x + shift.x - 1.0 / number, grid.y + shift.y + 0.0 / number));

  fragColor = ref0;
  
  if (uuvv.y < 1.0 / number) { fragColor = vec4(0.0, 0.0, 1.0, 0.0); return; }

  if (target == grid) {
    // ground
    if (sketchMode == 1) { fragColor = vec4(0.6, 0.0, 0.5, 1.0); return; }
    // water
    if (sketchMode == 2) { fragColor = vec4(0.9, 0.0, 0.1, 1.0); return; }
    // block
    if (sketchMode == 3) { fragColor = vec4(0.3, 0.0, 1.0, 1.0); return; }
    // sink
    if (sketchMode == 4) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); return; }
  }

  float pressure = ref1.y;
  float density = ref1.z;
  if (density > 0.0) { pressure += 1.0 / number; }
  fragColor.y = pressure;

  if (ref00.x > 0.1 && ref00.x < 0.2 && ref11.x > 0.0 && ref11.x < 0.1) { fragColor = ref1; fragColor.y = ref0.y; return; }
  if (ref00.x > 0.0 && ref00.x < 0.1 && ref44.x > 0.1 && ref44.x < 0.2) { fragColor = ref4; fragColor.y = ref0.y; return; }

  if (ref00.x > 0.3 && ref00.x < 0.4 && ref33.x > 0.2 && ref33.x < 0.3) { fragColor = ref3; fragColor.y = ref0.y; return; }
  if (ref00.x > 0.2 && ref00.x < 0.3 && ref55.x > 0.3 && ref55.x < 0.4) { fragColor = ref5; fragColor.y = ref0.y; return; }

  if (ref00.x > 0.5 && ref00.x < 0.6 && ref22.x > 0.4 && ref22.x < 0.5) { fragColor = ref2; fragColor.y = ref0.y; return; }
  if (ref00.x > 0.4 && ref00.x < 0.5 && ref66.x > 0.5 && ref66.x < 0.6) { fragColor = ref6; fragColor.y = ref0.y; return; }
}
