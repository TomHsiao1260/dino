precision highp float;
precision highp int;

#define M_PI 3.1415926535897932384626433832795

struct SDF {
  float distance;
  vec3 color;
};

struct Material {
  vec3 color;
  bool calc;
};

out vec4 fragColor;
in vec3 ray;
in vec2 uv;

uniform float time;
uniform vec3 cameraDirection;
uniform float cameraFar;
uniform float cameraFov;
uniform float cameraNear;
uniform vec3 cameraPosition;

uniform sampler2D colorTexture;
uniform float number;
uniform vec2 resolution;

#define saturate(a) clamp(a, 0.0, 1.0)
#define texture2D texture
#include <encodings_pars_fragment>
#include <lighting>

float sdSphere(const in vec3 p, const in float r, inout Material m) {
  float dis = length(p) - r;

  if (dis > 0.2*r) { return dis; }

  // float aspect = resolution.y / resolution.x;
  vec2 uuvv = uv;
  float s = 1.0 / number;
  // uuvv.x = (uv.x + 1.0) / 2.0;
  // uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec3 d = normalize(p);
  uuvv.x = 0.5 + atan(d.x, d.z) / (2.0 * M_PI);
  uuvv.y = 0.5 + asin(d.y) / M_PI;

  vec2 gridC = uuvv - mod(uuvv, s) + vec2(s, s) / 2.0;
  vec4 cellular = texture(colorTexture, gridC);

  vec3 point;
  float y = sin((gridC.y - 0.5) * M_PI);
  float xz = tan((gridC.x - 0.5) * 2.0 * M_PI);
  point.y = y;
  point.z = sign(0.25 - abs(gridC.x - 0.5)) * sqrt((1.0 - y*y) / (1.0 + xz*xz));
  point.x = sign(gridC.x - 0.5) / sign(gridC.x - 0.5) * xz * point.z;

  m.color = cellular.xyz;
  return min(length(p)-r, length(p-point)-0.05*r);
}

// float sdEllipsoid( vec3 p, vec3 r )
float sdSphere_(const in vec3 p, const in float rr, inout Material m)
{
  vec3 r = vec3(0.5*rr, 2.0*rr, 0.5*rr);
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  float dis = k0*(k0-1.0)/k1;

  if (dis > 0.2*r.x) { return dis; }

  vec2 uuvv = uv;
  float s = 1.0 / number;
  // uuvv.x = (uv.x + 1.0) / 2.0;
  // uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec3 d = normalize(p);
  uuvv.x = 0.5 + atan(d.x, d.z) / (2.0 * M_PI);
  uuvv.y = 0.5 + asin(d.y) / M_PI;

  vec2 gridC = uuvv - mod(uuvv, s) + vec2(s, s) / 2.0;
  vec4 cellular = texture(colorTexture, gridC);

  vec3 point;
  float y = sin((gridC.y - 0.5) * M_PI);
  float xz = tan((gridC.x - 0.5) * 2.0 * M_PI);
  point.y = y;
  point.z = sign(0.25 - abs(gridC.x - 0.5)) * sqrt((1.0 - y*y) / (1.0 + xz*xz));
  point.x = sign(gridC.x - 0.5) / sign(gridC.x - 0.5) * xz * point.z;

  m.color = cellular.xyz;

  return min(length(p)-r.x, length(p-point)-0.05*r.x);
}

SDF map(const in vec3 p, inout Material m) {
  float distance = sdSphere(p, 1.0, m);

  return SDF(distance, m.color);
}

vec3 getNormal(const in vec3 p, const in float d, inout Material m) {
  const vec2 o = vec2(0.001, 0);
  return normalize(
    d - vec3(
      map(p - o.xyy, m).distance,
      map(p - o.yxy, m).distance,
      map(p - o.yyx, m).distance
    )
  );
}

void march(inout vec4 color, inout float distance) {
  Material m;
  m.calc = false;
  m.color = vec3(0.0);

  for (int i = 0; i < MAX_ITERATIONS && distance < MAX_DISTANCE; i++) {
    vec3 position = cameraPosition + ray * distance;

    SDF step = map(position, m);
    if (step.distance <= MIN_DISTANCE) {
      m.calc = true;
      step = map(position, m);
      color = vec4(getLight(position, getNormal(position, step.distance, m), step.color), 1.0);
      break;
    }
    distance += step.distance;
  }
}

void main() {
  vec4 color = vec4(0.0);
  float distance = cameraNear;
  march(color, distance);
  fragColor = saturate(LinearTosRGB(color));

  float z = (distance >= MAX_DISTANCE) ? cameraFar : (distance * dot(cameraDirection, ray));
  float ndcDepth = -((cameraFar + cameraNear) / (cameraNear - cameraFar)) + ((2.0 * cameraFar * cameraNear) / (cameraNear - cameraFar)) / z;
  gl_FragDepth = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
}