import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js";

const video = document.getElementById("camera");
const log = (msg) => (document.getElementById("log").innerText = msg);
const addModelButton = document.getElementById("addModel");

let scene, camera, renderer, model;
let modelReady = false;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
    });
    video.srcObject = stream;
    log("✅ الكاميرا بدأت بنجاح");
    initThree();
  } catch (err) {
    log("❌ لا يمكن الوصول للكاميرا: " + (err.name || err.message));
    console.error(err);
  }
}

startCamera();

function initThree() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 0, 2);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(light);

  loadModel();
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadModel() {
  const loader = new GLTFLoader();
  log("⏳ جارٍ تحميل النموذج...");

  loader.load(
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    (gltf) => {
      model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.position.set(0, -1, -3);
      modelReady = true;
      addModelButton.disabled = false;
      log("✅ النموذج جاهز. اضغط لإضافته!");
    },
    (xhr) => {
      const percent = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : "??";
      log(`⏳ تحميل النموذج... ${percent}%`);
    },
    (err) => {
      console.error("خطأ في تحميل النموذج:", err);
      log("❌ خطأ في تحميل النموذج.");
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  if (model && model.parent === scene) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}

addModelButton.addEventListener("click", () => {
  if (!modelReady) return;
  if (model.parent === scene) {
    scene.remove(model);
    addModelButton.innerText = "إضافة نموذج";
    log("🗑️ تم إزالة النموذج");
  } else {
    scene.add(model);
    addModelButton.innerText = "إزالة النموذج";
    log("🚀 تم وضع النموذج في المشهد!");
  }
});
