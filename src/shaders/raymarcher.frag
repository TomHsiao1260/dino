precision highp float;
precision highp int;

uniform float number;

struct SDF {
  float distance;
  vec3 color;
};

out vec4 fragColor;
in vec3 ray;
in vec2 uv;
uniform sampler2D colorTexture;
uniform vec2 resolution;
uniform mat4 viewMatrix;

uniform float time;
uniform vec3 cameraDirection;
uniform float cameraFar;
uniform float cameraFov;
uniform float cameraNear;
uniform vec3 cameraPosition;

#define saturate(a) clamp(a, 0.0, 1.0)
#define texture2D texture
#include <encodings_pars_fragment>
#include <lighting>

float smin( float a, float b, float k ) {
  float h = max(k-abs(a-b),0.0);
  return min(a, b) - h*h*0.25/k;
}

float sdSphere(const in vec3 p, const in vec3 c, const in float r) {
  return length(p-c)-r;
}

SDF map(const in vec3 p, const in vec3 c, const in vec3 color, const in vec3 gX, const in vec3 gY, const in vec3 gX_, const in vec3 gY_) {
  float s = 1.0 / number;
  float k = 0.1;
  float r = 0.05 * s;
  float distance = 100.0;
  distance = smin(distance, sdSphere(p, c, r), k);
  distance = smin(distance, sdSphere(p, c + gX, r), k);
  distance = smin(distance, sdSphere(p, c + gX_, r), k);
  distance = smin(distance, sdSphere(p, c + gY, r), k);
  distance = smin(distance, sdSphere(p, c + gY_, r), k);
  return SDF(distance, color);
}

vec3 getNormal(const in vec3 p, const in float d, const in vec3 c, const in vec3 color, const in vec3 gX, const in vec3 gY, const in vec3 gX_, const in vec3 gY_) {
  const vec2 o = vec2(0.001, 0);
  return normalize(
    d - vec3(
      map(p - o.xyy, c, color, gX, gY, gX_, gY_).distance,
      map(p - o.yxy, c, color, gX, gY, gX_, gY_).distance,
      map(p - o.yyx, c, color, gX, gY, gX_, gY_).distance
    )
  );
}

void march(inout vec4 color, inout float distance) {
  float aspect = resolution.y / resolution.x;
  vec2 uuvv = uv;
  float s = 1.0 / number;
  uuvv.x = (uv.x + 1.0) / 2.0;
  uuvv.y = (uv.y / aspect + 1.0) / 2.0;

  vec2 gridC = uuvv - mod(uuvv, s) + vec2(s, s) / 2.0;
  vec4 cellular = texture(colorTexture, gridC);
  vec3 col = vec3(0.0);

  if (cellular.y > 0.2) {
    gridC.x = 2.0 * gridC.x - 1.0;
    gridC.y = (2.0 * gridC.y - 1.0) * aspect;
    col = vec3(0.0, 0.3, 0.6);
    if (cellular.y > 0.5) { col = vec3(0.0, 0.6, 0.1); }
  } else {
    gridC = vec2(2.0); // dont show
  }

  float deltaRay = 1.0;
  float cameraDistance = (1.0 / tan(cameraFov / 2.0)) * aspect;
  vec3 gridray = normalize(vec3(gridC, -cameraDistance) * mat3(viewMatrix));
  vec3 gX = normalize(vec3(gridC + vec2(2.0*s, 0.0), -cameraDistance) * mat3(viewMatrix)) - gridray;
  vec3 gY = normalize(vec3(gridC + vec2(0.0, 2.0*s*aspect), -cameraDistance) * mat3(viewMatrix)) - gridray;
  vec3 gX_ = normalize(vec3(gridC - vec2(2.0*s, 0.0), -cameraDistance) * mat3(viewMatrix)) - gridray;
  vec3 gY_ = normalize(vec3(gridC - vec2(0.0, 2.0*s*aspect), -cameraDistance) * mat3(viewMatrix)) - gridray;

  vec3 sdfPos = cameraPosition + gridray * deltaRay;
  gX *= deltaRay;
  gY *= deltaRay;

  for (int i = 0; i < MAX_ITERATIONS && distance < MAX_DISTANCE; i++) {
    vec3 position = cameraPosition + ray * distance;

    SDF step = map(position, sdfPos, col, gX, gY, gX_, gY_);
    if (step.distance <= MIN_DISTANCE) {
      color = vec4(getLight(position, getNormal(position, step.distance, sdfPos, col, gX, gY, gX_, gY_), step.color), 1.0);
      break;
    }
    distance += step.distance;
  }
}

void main() {
  vec4 color = vec4(0.0);
  float distance = cameraNear;
  march(color, distance);

  vec4 sdfColor = saturate(LinearTosRGB(color));

  fragColor = sdfColor;
  // fragColor = (sdfColor.w > 0.0) ? sdfColor : cellular;

  float z = (distance >= MAX_DISTANCE) ? cameraFar : (distance * dot(cameraDirection, ray));
  float ndcDepth = -((cameraFar + cameraNear) / (cameraNear - cameraFar)) + ((2.0 * cameraFar * cameraNear) / (cameraNear - cameraFar)) / z;
  gl_FragDepth = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
}
