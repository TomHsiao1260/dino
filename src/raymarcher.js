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
import sandFragment from './shaders/sand.frag';
import sandVertex from './shaders/sand.vert';
import sandmFragment from './shaders/sandm.frag';
import sandmVertex from './shaders/sandm.vert';
import sketchFragment from './shaders/sketch.frag';
import sketchVertex from './shaders/sketch.vert';
import initFragment from './shaders/init.frag';
import initVertex from './shaders/init.vert';

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

    const sandTarget0 = new WebGLRenderTarget(1, 1);
    const sandTarget1 = new WebGLRenderTarget(1, 1);
    const sandTargetm = new WebGLRenderTarget(1, 1);

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
        size: { value: 0.1 },
        count: { value: 10 },
        dino: { value: dino },
        sketch: { value: sketchTarget.texture },
        sand: { value: sandTarget0.texture },
        sketchMode: { value: 2 },
        bufferRead: { value: 0 },
        center: { value: new Vector2(0.0, -0.55) },
        colorR: { value: 0.5 },
        colorG: { value: 0.5 },
        colorB: { value: 0.5 },
        delta: { value: 1.0 },
        cameraDirection: { value: new Vector3() },
        cameraFar: { value: 0 },
        cameraFov: { value: 0 },
        cameraNear: { value: 0 },
        resolution: { value: new Vector2() },
      },
    });
    const msand = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: sandVertex,
      fragmentShader: sandFragment,
      uniforms: {
        time: { value: 0 },
        bufferRead: { value: 0 },
        sketchMode: { value: 2 },
        resolution: { value: new Vector2() },
        mouse: { value: new Vector2(-1, -1) },
        colorTexture: { value: sandTarget0.texture },
        mmTexture: { value: sandTargetm.texture },
      },
    });
    const msandm = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: sandmVertex,
      fragmentShader: sandmFragment,
      uniforms: {
        time: { value: 0 },
        colorTexture: { value: sandTarget0.texture },
        resolution: { value: new Vector2() },
      },
    });

    const msketch = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: sketchVertex,
      fragmentShader: sketchFragment,
      uniforms: {
        mouse: { value: new Vector2(-1, -1) },
        number: { value: 10 },
      },
    });

    const minit = new RawShaderMaterial({
      glslVersion: GLSL3,
      transparent: false,
      vertexShader: initVertex,
      fragmentShader: initFragment,
      uniforms: {
        number: { value: 100 },
        resolution: { value: new Vector2() },
      },
    });

    const { defines, uniforms } = material;
    this.userData = {
      get time() {
        return uniforms.time.value;
      },
      set time(value) {
        uniforms.time.value = value;
        msand.uniforms.time.value = value;
        msandm.uniforms.time.value = value;
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
        msand.uniforms.mouse.value = value;
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
        msand.uniforms.sketchMode.value = Raymarcher.sketchMode[value];
      },
      get bufferRead() {
        return Object.keys(Raymarcher.bufferRead)[msand.uniforms.bufferRead.value];
      },
      set bufferRead(value) {
        material.uniforms.bufferRead.value = Raymarcher.bufferRead[value];
        msand.uniforms.bufferRead.value = Raymarcher.bufferRead[value];
      },
      resolution: 1,
      reset: false,
      raymarcher: new Mesh(plane, material),
      sketch: new Mesh(plane, msketch),
      sandmesh: new Mesh(plane, msand),
      sandmmesh: new Mesh(plane, msandm),
      initmesh: new Mesh(plane, minit),
      target,
      screen,
      sketchTarget,
      sandTarget0,
      sandTarget1,
      sandTargetm,
      renderScreenOnly: false,
    };
    this.matrixAutoUpdate = this.userData.raymarcher.matrixAutoUpdate = false;
    this.frustumCulled = this.userData.raymarcher.frustumCulled = false;
    this.clock = 0;
    this.init = true;
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
    const { userData: { resolution, raymarcher, sketch, sandmesh, sandmmesh, initmesh, sketchMode, renderScreenOnly } } = this;
    const { userData: { target, sketchTarget, sandTarget0, sandTarget1, sandTargetm, reset } } = this;
    const { material: { defines, uniforms } } = raymarcher;

    camera.getWorldDirection(uniforms.cameraDirection.value);
    uniforms.cameraFar.value = camera.far;
    uniforms.cameraFov.value = MathUtils.degToRad(camera.fov);
    uniforms.cameraNear.value = camera.near;

    renderer.getDrawingBufferSize(_size).multiplyScalar(resolution).floor();
    if (target.width !== _size.x || target.height !== _size.y) {
      target.setSize(_size.x, _size.y);
      sketchTarget.setSize(_size.x, _size.y);
      sandTarget0.setSize(_size.x, _size.y);
      sandTarget1.setSize(_size.x, _size.y);
      sandTargetm.setSize(_size.x, _size.y);
      uniforms.resolution.value.copy(_size);
      sandmesh.material.uniforms.resolution.value.copy(_size);
      sandmmesh.material.uniforms.resolution.value.copy(_size);
      initmesh.material.uniforms.resolution.value.copy(_size);
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

    if (this.init) {
      renderer.setRenderTarget(sandTarget0);
      renderer.render(initmesh, camera);
      renderer.setRenderTarget(sandTarget1);
      renderer.render(initmesh, camera);
      this.init = false;
    }

    switch (Raymarcher.sketchMode[sketchMode]) {
      case 0: // fullSketch
        renderer.setRenderTarget(sketchTarget);
        sketch.material.uniforms.number.value = 10.0;

        if (reset) { renderer.clear(); this.userData.reset = false; }
        renderer.render(sketch, camera);
        break;
      case 1: case 2: case 3: case 4: case 5: // sand
        if (!renderScreenOnly) this.clock = 1.0 - this.clock;

        const t0 = (this.clock) ? sandTarget0 : sandTarget1;
        const t1 = (this.clock) ? sandTarget1 : sandTarget0;

        if (!renderScreenOnly) {
          renderer.setRenderTarget(sandTargetm);
          sandmmesh.material.uniforms.colorTexture.value = t0.texture;
          if (reset) { renderer.clear(); this.userData.reset = false; }
          if (!reset) renderer.render(sandmmesh, camera);

          renderer.setRenderTarget(t1);
          sandmesh.material.uniforms.colorTexture.value = t0.texture;
          if (reset) { renderer.clear(); renderer.setRenderTarget(t0); renderer.clear(); this.userData.reset = false; }
          if (!reset) renderer.render(sandmesh, camera);
        }

        if (sandmesh.material.uniforms.bufferRead.value === 0) raymarcher.material.uniforms.sand.value = t1.texture;
        if (sandmesh.material.uniforms.bufferRead.value === 1) raymarcher.material.uniforms.sand.value = t1.texture;
        if (sandmesh.material.uniforms.bufferRead.value === 2) raymarcher.material.uniforms.sand.value = t0.texture;
        if (sandmesh.material.uniforms.bufferRead.value === 3) raymarcher.material.uniforms.sand.value = sandTargetm.texture;

        break;
      default:
        break;
    }

    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(raymarcher, camera);

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
  creature: 1,
  ground: 2,
  water: 3,
  block: 4,
  sink: 5,
};

Raymarcher.bufferRead = {
  normal: 0,
  current: 1,
  previous: 2,
  targetm: 3,
};

export default Raymarcher;
