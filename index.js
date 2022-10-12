import {
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
  DirectionalLight,
  AmbientLight,
  MOUSE,
  Clock,
  Color,
  HemisphereLight,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PCFSoftShadowMap,
  CameraHelper,
} from "three";

import CameraControls from "camera-controls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

const canvas = document.getElementById("three-canvas");

// The scene
const scene = new Scene();

scene.background = new Color(0xeeeeee);

// The Camera

const camera = new PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight
);
scene.add(camera);

// The Renderer

const renderer = new WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;
renderer.outputEncoding = sRGBEncoding;

window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});

// Lights

const northLight = new DirectionalLight(0xffffff, 0.3);
northLight.position.set(0, 3, 15);
northLight.castShadow = true;
scene.add(northLight);

const helper = new CameraHelper( northLight.shadow.camera );
//scene.add( helper );

const southLight = new DirectionalLight(0xffffff, 0.5);
southLight.position.set(5, 3, -15);
southLight.castShadow = true;
scene.add(southLight);

const northHelper = new CameraHelper( southLight.shadow.camera );
//scene.add( northHelper );

const hemisphereLight = new HemisphereLight( 0xffffff, 0x000000, 0.5 );
scene.add( hemisphereLight );

const baseLight = new AmbientLight(0xffffff, 0.2);
scene.add(baseLight);

// Controls

CameraControls.install({ THREE: subsetOfTHREE });
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);
cameraControls.dollyToCursor = true;

cameraControls.setLookAt(1, 1.6, -3.5, 1, 1.6, 0);

function animate() {
  const delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Load 3D scan

const loader = new GLTFLoader();

const loadingElem = document.querySelector("#loader-container");
const loadingText = loadingElem.querySelector("p");

loader.load(
  // resource URL
  "./models/gltf/Room Divider.glb",
  // called when the resource is loaded
  (gltf) => {
    loadingElem.style.display = "none";

    gltf.scene.traverse(function (object) {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    scene.add(gltf.scene);
  },
  // called while loading is progressing
  (progress) => {
    const current = (progress.loaded / progress.total) * 100;
    const result = Math.min(current, 100);
    const formatted = Math.trunc(result * 100) / 100;
    loadingText.textContent = `Loading: ${formatted}%`;
  },
  // called when loading has errors
  (error) => {
    console.log("An error happened: ", error);
  }
);
