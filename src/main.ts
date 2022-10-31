import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Scene, TorusGeometry } from "three";

const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = (url) => {
  console.log('[LOADER] Starting to load resource:', url);
}

loadingManager.onProgress = (url, loaded, total) => {
  console.log(`[LOADER] Progress: ${url} (${loaded} of ${total} queued)`)
}

loadingManager.onLoad = () => {
  console.log('[LOADER] All resources loaded');
}

loadingManager.onError = (url) => {
  console.log('[LOADER] Error loading resource:', url);
}

const fontLoader = new FontLoader(loadingManager);
const loader = new THREE.TextureLoader(loadingManager);
const cubeLoader = new THREE.CubeTextureLoader(loadingManager);

const ASPECT_RATIO = window.innerWidth / window.innerHeight;

const textGroup = new THREE.Group();

function baseSpeed(fps: number, speed: number) {
  return speed / fps;
}

main();

async function main() {
  const scene = createScene();

  const camera = createCamera()
  const controls = useMouseCameraControls(camera);
  const lights = createLights();
  createText(scene);

  scene.add(...lights);
  scene.add(camera);

  const renderer = createRenderer();


  let lastFrameDrawnAt = performance.now();

  loop();

  function loop() {
    const now = performance.now();
    const fps = 1000 / (now - lastFrameDrawnAt);

    textGroup.rotation.y += baseSpeed(fps, 0.3);

    renderer.render(scene, camera);

    lastFrameDrawnAt = now;
    requestAnimationFrame(loop);
  }
}

function makeAtom(environmentMap) {
  const alpha = loader.load('/textures/Helium Logo Alpha.png');
  const geometry = new THREE.PlaneGeometry(1.25, 1.25)

  const material = new THREE.MeshStandardMaterial({
    color: '#7833ff',
    metalness: 1,
    roughness: 0,
    transparent: true,
    alphaMap: alpha,
    side: THREE.DoubleSide,
    envMap: environmentMap
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.y = 1.5;

  return mesh;
}

async function createText(scene: Scene) {

  fontLoader.load('/fonts/Quitador-Italic.json', (font) => {
    const environmentMap = cubeLoader.load([
      '/textures/donuts.png',
      '/textures/donuts.png',
      '/textures/donuts.png',
      '/textures/donuts.png',
      '/textures/donuts.png',
      '/textures/donuts.png',
    ]);
    const geometry = new TextGeometry('Helium', {
      font: font,
      size: 1,
      height: 0.05,
      curveSegments: 20,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 20,
    });

    const material = new THREE.MeshStandardMaterial({
      color: '#7833ff',
      metalness: 1,
      roughness: 0,
      envMap: environmentMap,
      envMapIntensity: 1
    });

    const atom = makeAtom(environmentMap);

    const mesh = new THREE.Mesh(geometry, material);

    geometry.center();

    textGroup.add(mesh);
    textGroup.add(atom);

    // DONUTS
    const torusGeometry = new TorusGeometry(
      0.1,
      0.05,
      10,
      20
    );

    const normalMaterial = new THREE.MeshNormalMaterial();

    for (let i = 0; i < 200; i++) {
      const mesh = new THREE.Mesh(torusGeometry, normalMaterial);

      mesh.position.x = Math.random() * 10 - 5;
      mesh.position.y = Math.random() * 10 - 5;
      mesh.position.z = Math.random() * 10 - 5;

      mesh.rotation.x = Math.random() * 5 - 2.5;
      mesh.rotation.y = Math.random() * 5 - 2.5;
      mesh.rotation.z = Math.random() * 5 - 2.5;

      textGroup.add(mesh);
    }

    scene.add(textGroup);
  });
}

function createScene() {
  const scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(3);

  // scene.add(axesHelper);

  return scene;
}

function createLights() {
  const ambientLight = new THREE.AmbientLight('#FFFFFF', 1);
  const pointLight = new THREE.SpotLight('#FFFFFF', 10000, 8, 0.5, 1, 2);

  pointLight.position.x = 0;
  pointLight.position.y = 0;
  pointLight.position.z = 5;

  const lightHelper = new THREE.SpotLightHelper( pointLight );

  return [ambientLight, pointLight];
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );

  camera.position.z = 4;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  return camera;
}

function createRenderer() {
  const canvas = document.querySelector('#root');

  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas not found');
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  });


  return renderer;
}

function useMouseCameraControls(camera: THREE.Camera) {
  const controls = new OrbitControls(camera, document.body);

  controls.enableDamping = true;

  return controls;
}
function createTexture(url: string) {
  return loader.load(
    url
  );
}