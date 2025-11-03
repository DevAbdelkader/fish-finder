import * as three from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


export default class ModelLoader {

    constructor(root = document.body) {
        this.root = root;
        this.renderer = this.rendererInit();

        this.scene = new three.Scene();
        this.camera = new three.PerspectiveCamera(75, root.clientWidth / root.clientHeight, 0.1, 1000);

        this.renderer.render(this.scene, this.camera);
    }

    rendererInit() {
        const renderer = new three.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(this.root.clientWidth, this.root.clientHeight)
        this.root.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
            renderer.setSize(this.root.clientWidth, this.root.clientHeight);
            this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.render(this.scene, this.camera);
        })

        return renderer;
    }

    setupOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(url, (gltf) => {
                this.scene.add(gltf.scene);
                this.fitCameraToObject(this.camera, gltf.scene, undefined, this.controls);
                this.renderer.render(this.scene, this.camera);
                resolve(gltf);
            }, undefined, (error) => {
                console.error('An error happened while loading the model:', error);
                reject(error);
            });
        });
    }

    fitCameraToObject(camera, object, offset, controls) {
        if (!object || !camera) return;

        // default offset multiplier
        const pad = (typeof offset === 'number') ? offset : 1;

        // compute bounding box and sphere
        const box = new three.Box3().setFromObject(object);
        const size = box.getSize(new three.Vector3());
        const center = box.getCenter(new three.Vector3());
        const sphere = new three.Sphere();
        box.getBoundingSphere(sphere);

        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize === 0) return;

        // camera fov in radians
        const fov = camera.fov * (Math.PI / 180);

        // distance for object to fit in view (use bounding sphere as primary)
        const radius = sphere.radius;
        let distance = Math.abs(radius / Math.sin(fov / 2));

        // fallback using size and aspect
        const sizeBasedDistance = (maxSize / 2) / Math.tan(fov / 2);
        distance = Math.max(distance, sizeBasedDistance);

        distance *= pad;

        // compute new camera position along current camera->center direction
        const direction = new three.Vector3().subVectors(camera.position, center).normalize();
        if (direction.length() === 0) direction.set(0, 0, 1);
        const newPos = center.clone().add(direction.multiplyScalar(distance));

        // apply position and update projection
        camera.position.copy(newPos);
        camera.near = Math.max(0.1, distance / 1000);
        camera.far = Math.max(camera.far, distance * 10);
        camera.updateProjectionMatrix();

        if (controls) {
            // if controls provided, update its target and refresh
            if (controls.target) controls.target.copy(center);
            controls.update();
        } else {
            camera.lookAt(center);
        }
        // render a frame to reflect the change
        this.renderer.render(this.scene, camera);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        this.camera = null;
        this.controls = null;
        this.scene = null;
        this.renderer = null;
        this.root = null;
    }
}