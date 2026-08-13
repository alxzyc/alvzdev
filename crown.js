import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const clamp = THREE.MathUtils.clamp;

function mergeCompatible(geometries) {
  const normalized = geometries.map((geometry) => {
    const compatible = geometry.index ? geometry.toNonIndexed() : geometry;

    if (!compatible.getAttribute("uv")) {
      compatible.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(new Float32Array(compatible.attributes.position.count * 2), 2),
      );
    }

    Object.keys(compatible.attributes).forEach((attribute) => {
      if (!["position", "normal", "uv"].includes(attribute)) compatible.deleteAttribute(attribute);
    });
    return compatible;
  });

  const merged = mergeGeometries(normalized, false);
  if (!merged) throw new Error("Não foi possível consolidar as geometrias da coroa.");
  new Set([...geometries, ...normalized]).forEach((geometry) => geometry.dispose());
  return merged;
}

function makeSurgicalEnvironment(renderer) {
  const environmentScene = new THREE.Scene();
  environmentScene.background = new THREE.Color(0x000000);
  const panelMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setRGB(3.2, 3.2, 3.2),
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const panels = [
    { size: [0.14, 8.5], position: [-4.8, 0.4, 0.5], rotation: [0, Math.PI / 2, 0] },
    { size: [7, 0.18], position: [0, 4.5, 0], rotation: [Math.PI / 2, 0, 0] },
    { size: [0.62, 5], position: [1.6, 0.1, -4.6], rotation: [0, 0, 0] },
  ];

  panels.forEach(({ size, position, rotation }) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), panelMaterial);
    panel.position.set(...position);
    panel.rotation.set(...rotation);
    environmentScene.add(panel);
  });

  const softPanelMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setRGB(0.24, 0.27, 0.32),
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const softPanel = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4), softPanelMaterial);
  softPanel.position.set(0, 0.4, 5.2);
  environmentScene.add(softPanel);

  const generator = new THREE.PMREMGenerator(renderer);
  generator.compileEquirectangularShader();
  const renderTarget = generator.fromScene(environmentScene, 0.025);
  generator.dispose();
  environmentScene.traverse((object) => object.geometry?.dispose());
  panelMaterial.dispose();
  softPanelMaterial.dispose();
  return renderTarget;
}

function applyTransform(geometry, position, rotation, scale = [1, 1, 1]) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation));
  matrix.compose(
    new THREE.Vector3(...position),
    quaternion,
    new THREE.Vector3(...scale),
  );
  geometry.applyMatrix4(matrix);
  return geometry;
}

function distortBand(geometry, phase) {
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const angle = Math.atan2(z, x);
    const radius = Math.hypot(x, z);
    const radialNoise = Math.sin(angle * 7 + phase) * 0.025 + Math.sin(angle * 3 - phase) * 0.018;
    const topNoise = y > 0 ? Math.sin(angle * 5 + phase) * 0.055 : 0;
    const nextRadius = radius + radialNoise;
    positions.setXYZ(
      index,
      Math.cos(angle) * nextRadius,
      y + topNoise,
      Math.sin(angle) * nextRadius,
    );
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function makeArcTube(radius, start, length, y, thickness, phase) {
  const points = [];
  const steps = Math.max(8, Math.ceil(length * 12));

  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    const angle = start + length * ratio;
    const wobble = Math.sin(angle * 5 + phase) * 0.028;
    points.push(new THREE.Vector3(
      Math.cos(angle) * (radius + wobble),
      y + Math.sin(angle * 4 - phase) * 0.025,
      Math.sin(angle) * (radius + wobble),
    ));
  }

  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    steps * 2,
    thickness,
    6,
    false,
  );
}

function makeBlade(height, width, depth, lean, broken = false, notched = false) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.55, 0);
  shape.lineTo(width * 0.5, 0.02);
  shape.lineTo(width * 0.37, height * 0.27);

  if (notched) {
    shape.lineTo(width * 0.15 + lean * 0.45, height * 0.49);
    shape.lineTo(width * 0.29 + lean * 0.52, height * 0.57);
    shape.lineTo(width * 0.12 + lean * 0.68, height * 0.67);
  } else {
    shape.lineTo(width * 0.18 + lean * 0.5, height * 0.62);
  }

  if (broken) {
    shape.lineTo(lean + width * 0.17, height * 0.76);
    shape.lineTo(lean - width * 0.03, height * 0.83);
    shape.lineTo(lean - width * 0.24, height * 0.68);
  } else {
    shape.lineTo(lean, height);
    shape.lineTo(lean - width * 0.18, height * 0.64);
  }

  shape.lineTo(-width * 0.34, height * 0.3);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: Math.min(width * 0.045, 0.028),
    bevelThickness: Math.min(depth * 0.14, 0.025),
    curveSegments: 1,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function makeFractureMark(height, width, depth) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.17, height * 0.23);
  shape.lineTo(width * 0.16, height * 0.41);
  shape.lineTo(-width * 0.03, height * 0.54);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.translate(0, 0, depth / 2 + 0.014);
  return geometry;
}

function buildCrown() {
  const crown = new THREE.Group();
  crown.name = "dark-chrome-crown";

  const bandGeometries = [];
  const bladeGeometries = [];
  const obsidianGeometries = [];
  const fractureGeometries = [];
  const arcSegments = [
    [0.08, 1.38],
    [1.51, 1.46],
    [3.11, 1.33],
    [4.58, 1.5],
  ];

  arcSegments.forEach(([start, length], index) => {
    const band = new THREE.CylinderGeometry(
      1.62,
      1.72,
      0.46,
      Math.max(10, Math.ceil(length * 12)),
      2,
      true,
      start,
      length,
    );
    distortBand(band, index * 1.7);
    bandGeometries.push(band);
    bandGeometries.push(makeArcTube(1.66, start, length, 0.24, 0.075, index));
    bandGeometries.push(makeArcTube(1.72, start, length, -0.24, 0.095, index + 1.2));
  });

  const heights = [1.55, 2.85, 1.28, 3.34, 0.92, 2.42, 1.68, 3.02, 1.92];
  const leans = [-0.12, 0.05, -0.18, 0.08, -0.22, 0.14, -0.04, -0.1, 0.16];
  const widths = [0.6, 0.5, 0.67, 0.52, 0.74, 0.56, 0.63, 0.49, 0.61];
  const bladeTransforms = [];

  heights.forEach((height, index) => {
    const angle = index / heights.length * Math.PI * 2 + 0.04;
    const depth = index % 2 ? 0.22 : 0.28;
    const geometry = makeBlade(
      height,
      widths[index],
      depth,
      leans[index],
      index === 4,
      index === 2 || index === 7,
    );
    const position = [Math.sin(angle) * 1.58, 0.18, Math.cos(angle) * 1.58];
    const rotation = [-(0.035 + (index % 3) * 0.018), angle, leans[index] * 0.08];
    applyTransform(geometry, position, rotation);
    bladeTransforms.push({ position, rotation, height, width: widths[index], depth });

    if ([2, 5, 8].includes(index)) obsidianGeometries.push(geometry);
    else bladeGeometries.push(geometry);

    if ([0, 1, 8].includes(index)) {
      const fracture = makeFractureMark(height, widths[index], depth);
      applyTransform(fracture, position, rotation);
      fractureGeometries.push(fracture);
    }
  });

  const fragments = [
    { position: [1.78, -0.08, 0.28], rotation: [0.2, 0.6, -0.3], scale: [0.13, 0.34, 0.09] },
    { position: [-1.53, 0.5, 0.82], rotation: [-0.1, -0.8, 0.5], scale: [0.09, 0.23, 0.08] },
  ];

  fragments.forEach(({ position, rotation, scale }) => {
    const fragment = new THREE.TetrahedronGeometry(1, 0);
    applyTransform(fragment, position, rotation, scale);
    fractureGeometries.push(fragment);
  });

  const bandMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x30343a,
    metalness: 0.94,
    roughness: 0.16,
    envMapIntensity: 1.75,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
  });
  const bladeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3b4048,
    metalness: 0.92,
    roughness: 0.115,
    envMapIntensity: 2.05,
    clearcoat: 0.25,
    clearcoatRoughness: 0.08,
    flatShading: true,
  });
  const obsidianMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x020204,
    metalness: 0.38,
    roughness: 0.055,
    ior: 1.52,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
    specularIntensity: 1,
    envMapIntensity: 2.7,
    flatShading: true,
  });
  const fractureMaterial = new THREE.MeshStandardMaterial({
    color: 0x050608,
    metalness: 0.75,
    roughness: 0.38,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  const meshes = [
    new THREE.Mesh(mergeCompatible(bandGeometries), bandMaterial),
    new THREE.Mesh(mergeCompatible(bladeGeometries), bladeMaterial),
    new THREE.Mesh(mergeCompatible(obsidianGeometries), obsidianMaterial),
    new THREE.Mesh(mergeCompatible(fractureGeometries), fractureMaterial),
  ];

  meshes.forEach((mesh) => crown.add(mesh));
  crown.userData.disposables = {
    geometries: meshes.map((mesh) => mesh.geometry),
    materials: [bandMaterial, bladeMaterial, obsidianMaterial, fractureMaterial],
  };
  return crown;
}

export function initCrown(canvas, { reducedMotion = false } = {}) {
  if (!canvas) throw new Error("Canvas da coroa não encontrado.");

  const stage = canvas.parentElement;
  const hero = canvas.closest(".hero");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 50);
  camera.position.set(0, 0.65, 9.2);

  const environmentTarget = makeSurgicalEnvironment(renderer);
  scene.environment = environmentTarget.texture;

  const crown = buildCrown();
  crown.position.set(0, -0.45, 0);
  crown.rotation.set(0.06, -0.24, -0.055);
  scene.add(crown);

  const edgeLight = new THREE.SpotLight(0xffffff, 64, 20, 0.2, 0.42, 1.1);
  edgeLight.position.set(-4.5, 5.2, 5.8);
  edgeLight.target.position.set(0.4, 0.7, 0);
  scene.add(edgeLight, edgeLight.target);

  const rimLight = new THREE.PointLight(0xdce5ff, 48, 16, 1.4);
  rimLight.position.set(4.2, 1.8, -3.2);
  scene.add(rimLight);

  const cutLight = new THREE.DirectionalLight(0xffffff, 1.8);
  cutLight.position.set(0.2, 4, 3);
  scene.add(cutLight);

  const faceLight = new THREE.DirectionalLight(0x9ea8b8, 1.25);
  faceLight.position.set(0, 0.5, 7);
  scene.add(faceLight);

  let targetProgress = 0;
  let progress = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetScale = 0.88;
  let currentScale = 0.88;
  let visible = true;
  let disposed = false;
  let frame = 0;
  let lastTime = performance.now();

  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const isMobile = window.innerWidth <= 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    targetScale = isMobile ? 0.74 : 0.88;
    currentScale = targetScale;
    crown.scale.setScalar(currentScale);
    invalidate();
  }

  function updateScrollTarget() {
    if (reducedMotion) return;
    const rect = hero.getBoundingClientRect();
    targetProgress = clamp(-rect.top / Math.max(rect.height, window.innerHeight), 0, 1);
    invalidate();
  }

  function updatePointer(event) {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = stage.getBoundingClientRect();
    pointerTargetX = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    pointerTargetY = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
    invalidate();
  }

  function resetPointer() {
    pointerTargetX = 0;
    pointerTargetY = 0;
    invalidate();
  }

  function invalidate() {
    if (!disposed && visible && !document.hidden && !frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    }
  }

  function render(time) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;

    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const motionSpeed = reducedMotion ? 100 : 6;
    progress = THREE.MathUtils.damp(progress, targetProgress, motionSpeed, delta);
    pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, motionSpeed, delta);
    pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, motionSpeed, delta);
    currentScale = THREE.MathUtils.damp(currentScale, targetScale, motionSpeed, delta);

    const targetYaw = -0.24 + progress * 0.44 + pointerX * 0.14;
    const targetPitch = 0.06 - progress * 0.05 + pointerY * 0.075;
    const targetRoll = -0.055 + progress * 0.045;
    crown.rotation.y = THREE.MathUtils.damp(crown.rotation.y, targetYaw, motionSpeed, delta);
    crown.rotation.x = THREE.MathUtils.damp(crown.rotation.x, targetPitch, motionSpeed, delta);
    crown.rotation.z = THREE.MathUtils.damp(crown.rotation.z, targetRoll, motionSpeed, delta);
    crown.position.y = THREE.MathUtils.damp(crown.position.y, -0.45 - progress * 0.13, motionSpeed, delta);
    crown.position.z = THREE.MathUtils.damp(crown.position.z, -progress * 0.08, motionSpeed, delta);
    crown.scale.setScalar(currentScale);

    renderer.render(scene, camera);

    const difference = Math.max(
      Math.abs(progress - targetProgress),
      Math.abs(pointerX - pointerTargetX),
      Math.abs(pointerY - pointerTargetY),
      Math.abs(crown.rotation.y - targetYaw),
      Math.abs(crown.rotation.x - targetPitch),
      Math.abs(crown.rotation.z - targetRoll),
      Math.abs(currentScale - targetScale),
    );

    if (!reducedMotion && difference > 0.00035) invalidate();
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (visible) {
      invalidate();
    }
  });
  visibilityObserver.observe(hero);

  window.addEventListener("resize", resize, { passive: true });
  if (!reducedMotion) {
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    stage.addEventListener("pointermove", updatePointer, { passive: true });
    stage.addEventListener("pointerleave", resetPointer, { passive: true });
  }
  document.addEventListener("visibilitychange", invalidate);

  resize();
  updateScrollTarget();
  invalidate();

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", updateScrollTarget);
    stage.removeEventListener("pointermove", updatePointer);
    stage.removeEventListener("pointerleave", resetPointer);
    document.removeEventListener("visibilitychange", invalidate);
    crown.userData.disposables.geometries.forEach((geometry) => geometry.dispose());
    crown.userData.disposables.materials.forEach((material) => material.dispose());
    environmentTarget.dispose();
    renderer.dispose();
  }

  return { dispose };
}
