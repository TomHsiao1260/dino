import {
  DepthTexture,
  GLSL3,
  MathUtils,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  UnsignedShortType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import lighting from './shaders/lighting.glsl';
import raymarcherFragment from './shaders/raymarcher.frag';
import raymarcherVertex from './shaders/raymarcher.vert';
import screenFragment from './shaders/screen.frag';
import screenVertex from './shaders/screen.vert';
import sketchFragment from './shaders/sketch.frag';
import sketchVertex from './shaders/sketch.vert';

const _size = new Vector2();

class Raymarcher extends Mesh {
  constructor({
    dino = null,
  } = {}) {
    const plane = new PlaneGeometry(2, 2, 1, 1);
    plane.deleteAttribute('normal');
    plane.deleteAttribute('uv');

    const target = new WebGLRenderTarget(1, 1);
    const sketchTarget = new WebGLRenderTarget(1, 1);
    const groundTarget = new WebGLRenderTarget(1, 1);

    const screen = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      uniforms: {
        colorTexture: { value: target.texture },
        depthTexture: { value: target.depthTexture },
      },
    });
    super(plane, screen);
    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: true,
      vertexShader: raymarcherVertex,
      fragmentShader: raymarcherFragment.replace('#include <lighting>', lighting),
      defines: {
        MAX_DISTANCE: '20.0',
        MAX_ITERATIONS: 200,
        MIN_COVERAGE: '0.02',
        MIN_DISTANCE: '0.005',
      },
      uniforms: {
        time: { value: 0 },
        size: { value: 0.2 },
        count: { value: 10 },
        dino: { value: dino },
        sketch: { value: sketchTarget.texture },
        ground: { value: groundTarget.texture },
        sketchMode: { value: 1 },
        center: { value: new Vector2(0.0, -0.55) },
        colorR: { value: 0.5 },
        colorG: { value: 0.5 },
        colorB: { value: 0.5 },
        delta: { value: 0.0 },
        cameraDirection: { value: new Vector3() },
        cameraFar: { value: 0 },
        cameraFov: { value: 0 },
        cameraNear: { value: 0 },
        resolution: { value: new Vector2() },
      },
    });
    const msketch = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: sketchVertex,
      fragmentShader: sketchFragment,
      uniforms: {
        mouse: { value: new Vector2() },
        number: { value: 10 },
      },
    });
    const { defines, uniforms } = material;
    this.userData = {
      get time() {
        return uniforms.time.value;
      },
      set time(value) {
        uniforms.time.value = value;
      },
      get size() {
        return uniforms.size.value;
      },
      set size(value) {
        uniforms.size.value = value;
      },
      get mouse() {
        return msketch.uniforms.mouse.value;
      },
      set mouse(value) {
        msketch.uniforms.mouse.value = value;
      },
      get count() {
        return uniforms.count.value;
      },
      set count(value) {
        uniforms.count.value = value;
      },
      get center() {
        return uniforms.center.value;
      },
      set center(value) {
        uniforms.center.value = value;
      },
      get colorR() {
        return uniforms.colorR.value;
      },
      set colorR(value) {
        uniforms.colorR.value = value;
      },
      get colorG() {
        return uniforms.colorG.value;
      },
      set colorG(value) {
        uniforms.colorG.value = value;
      },
      get colorB() {
        return uniforms.colorB.value;
      },
      set colorB(value) {
        uniforms.colorB.value = value;
      },
      get delta() {
        return uniforms.delta.value;
      },
      set delta(value) {
        uniforms.delta.value = value;
      },
      get sketchMode() {
        return Object.keys(Raymarcher.sketchMode)[uniforms.sketchMode.value];
      },
      set sketchMode(value) {
        uniforms.sketchMode.value = Raymarcher.sketchMode[value];
      },
      resolution: 1,
      reset: false,
      raymarcher: new Mesh(plane, material),
      sketch: new Mesh(plane, msketch),
      target,
      screen,
      sketchTarget,
      groundTarget,
    };
    this.matrixAutoUpdate = this.userData.raymarcher.matrixAutoUpdate = false;
    this.frustumCulled = this.userData.raymarcher.frustumCulled = false;
  }

  dispose() {
    const { material, geometry, userData: { raymarcher, target } } = this;
    material.dispose();
    geometry.dispose();
    raymarcher.material.dispose();
    target.dispose();
    target.depthTexture.dispose();
    target.texture.dispose();
  }

  onBeforeRender(renderer, scene, camera) {
    const { userData: { resolution, raymarcher, sketch, sketchMode } } = this;
    const { userData: { target, sketchTarget, groundTarget, reset } } = this;
    const { material: { defines, uniforms } } = raymarcher;

    camera.getWorldDirection(uniforms.cameraDirection.value);
    uniforms.cameraFar.value = camera.far;
    uniforms.cameraFov.value = MathUtils.degToRad(camera.fov);
    uniforms.cameraNear.value = camera.near;

    renderer.getDrawingBufferSize(_size).multiplyScalar(resolution).floor();
    if (target.width !== _size.x || target.height !== _size.y) {
      target.setSize(_size.x, _size.y);
      sketchTarget.setSize(_size.x, _size.y);
      groundTarget.setSize(_size.x, _size.y);
      uniforms.resolution.value.copy(_size);
    }

    const currentAutoClear = renderer.autoClear;
    const currentClearAlpha = renderer.getClearAlpha();
    const currentRenderTarget = renderer.getRenderTarget();
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    const currentXrEnabled = renderer.xr.enabled;
    renderer.autoClear = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.xr.enabled = false;
    renderer.setClearAlpha(0);
    renderer.state.buffers.depth.setMask(true);

    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(raymarcher, camera);

    switch (Raymarcher.sketchMode[sketchMode]) {
      case 0: // fullSketch
        renderer.setRenderTarget(sketchTarget);
        sketch.material.uniforms.number.value = 10.0;
        break;
      case 1: // ground
        renderer.setRenderTarget(groundTarget);
        sketch.material.uniforms.number.value = 30.0;
        break;
      default:
        break;
    }

    if (reset) { renderer.clear(); this.userData.reset = false; }
    renderer.render(sketch, camera);

    renderer.autoClear = currentAutoClear;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.xr.enabled = currentXrEnabled;
    renderer.setClearAlpha(currentClearAlpha);
    renderer.setRenderTarget(currentRenderTarget);
    if (camera.viewport) renderer.state.viewport(camera.viewport);
  }
}

Raymarcher.sketchMode = {
  fullSketch: 0,
  ground: 1,
  light: 2,
};

export default Raymarcher;
