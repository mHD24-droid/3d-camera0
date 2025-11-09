const log = msg => document.getElementById("log").innerText;
const video = document.getElementById("camera");

let scene, camera, renderer, model;
let raycaster, mouse = new THREE.Vector2();

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });
    video.srcObject = stream;
    log("✅ الكاميرا تعمل");
    initThree();
  } catch(err) {
    log("❌ لا يمكن الوصول للكاميرا: " + (err.name || err.message));
    console.error(err);
  }
}

startCamera();

// Setup Three.js
function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
  camera.position.set(0,0,2);

  renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(light);

  // Invisible plane for placement
  const planeGeometry = new THREE.PlaneGeometry(10,10);
  const planeMaterial = new THREE.MeshBasicMaterial({ visible:false });
  const placementPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  placementPlane.position.z = -3;
  scene.add(placementPlane);
  scene.placementPlane = placementPlane;

  raycaster = new THREE.Raycaster();

  loadModel();
  animate();

  renderer.domElement.addEventListener("click", onTap, false);
  window.addEventListener("resize", onResize, false);
}

// Load 3D model
function loadModel() {
  const loader = new THREE.GLTFLoader();
  log("⏳ Loading model...");
  loader.load(
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    gltf => {
      model = gltf.scene;
      model.scale.set(0.4,0.4,0.4);
      model.position.set(0,-1,-3);
      log("✅ النموذج جاهز. انقر على الشاشة لوضعه!");
    },
    xhr => {
      const pct = xhr.total ? Math.round(xhr.loaded/xhr.total*100) : "?";
      log(`Loading model... ${pct}%`);
    },
    err => {
      log("❌ Failed to load model");
      console.error(err);
    }
  );
}

// Tap to place
function onTap(event) {
  if(!model) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(scene.placementPlane);
  if(intersects.length > 0) {
    const point = intersects[0].point;
    if(!model.parent) scene.add(model);
    model.position.copy(point);
    log(`📍 Model placed at X:${point.x.toFixed(2)}, Y:${point.y.toFixed(2)}`);
  }
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  if(model && model.parent) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
