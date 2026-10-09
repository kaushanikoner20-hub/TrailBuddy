import { useEffect, useRef } from 'react';
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  HORIZON_COLOR,
  createTreeKit,
  makeBird,
  makeGround,
  makePerchTree,
  makeSkyTexture,
} from './sceneBuilders.js';
import { DURATION, PERCH_TREE, birdPose, cameraPose, phaseAt, treeLayout } from './sceneTimeline.js';

const cameraFov = (aspect) => (aspect >= 1 ? 48 : Math.min(75, 48 + (1 - aspect) * 55));

/**
 * The 3D closing scene (Three.js). Procedural trees, ground, sky and bird.
 * Loaded lazily; reports phases upward so the text can fade in as the bird leaves.
 */
export default function OutdoorScene({ playKey, skipKey, reducedMotion, onPhase, onReady, onError }) {
  const containerRef = useRef(null);
  const clockRef = useRef({ t: 0 });
  const callbacks = useRef({ onPhase, onReady, onError });

  useEffect(() => {
    callbacks.current = { onPhase, onReady, onError };
  }, [onPhase, onReady, onError]);

  // Replay and skip are commands from the parent; the render loop reads the shared clock.
  useEffect(() => {
    clockRef.current.t = reducedMotion ? DURATION : 0;
  }, [playKey, reducedMotion]);

  useEffect(() => {
    if (skipKey > 0) clockRef.current.t = DURATION;
  }, [skipKey]);

  useEffect(() => {
    const container = containerRef.current;
    let renderer;
    let resizeObserver;
    let disposed = false;
    let lastPhase = null;
    let scene;

    try {
      renderer = new WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const canvas = renderer.domElement;
      canvas.className = 'scene-canvas';
      container.appendChild(canvas);

      scene = new Scene();
      scene.background = makeSkyTexture();
      scene.fog = new Fog(new Color(HORIZON_COLOR), 25, 95);

      scene.add(new HemisphereLight(0xdfeaf2, 0x5e8a4e, 0.95));
      const sun = new DirectionalLight(0xffe2b0, 1.4);
      sun.position.set(6, 12, 8);
      scene.add(sun);

      const sunDisc = new Mesh(new SphereGeometry(4, 16, 12), new MeshBasicMaterial({ color: '#fff3cf', fog: false }));
      sunDisc.position.set(-22, 20, -95);
      scene.add(sunDisc);

      scene.add(makeGround());

      const kit = createTreeKit();
      const swayers = [];
      for (const spec of treeLayout()) {
        const tree = spec.kind === 'pine' ? kit.makePine(spec.scale) : kit.makeRound(spec.scale);
        tree.position.set(spec.x, 0, spec.z);
        scene.add(tree);
        swayers.push({ tree, phase: spec.phase });
      }
      const perch = makePerchTree(kit, PERCH_TREE.x, PERCH_TREE.z);
      scene.add(perch.group);
      swayers.push({ tree: perch.tree, phase: 0.5 });

      const bird = makeBird();
      bird.group.rotation.set(0, -Math.PI / 3, 0); // perched, facing left and a little toward the viewer
      const perchedRotation = new Quaternion().copy(bird.group.quaternion);
      scene.add(bird.group);

      const camera = new PerspectiveCamera(48, 1, 0.1, 220);
      const aim = new Object3D();
      const lookTarget = new Vector3();

      const resize = () => {
        const width = container.clientWidth || 1;
        const height = container.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = cameraFov(camera.aspect);
        camera.updateProjectionMatrix();
      };

      const apply = (t, windTime) => {
        const pose = birdPose(t);
        bird.group.position.set(...pose.position);
        if (pose.airborne) {
          aim.position.set(...pose.position);
          lookTarget.set(
            pose.position[0] + pose.tangent[0],
            pose.position[1] + pose.tangent[1],
            pose.position[2] + pose.tangent[2],
          );
          aim.lookAt(lookTarget);
          bird.group.quaternion.copy(perchedRotation).slerp(aim.quaternion, pose.turn);
        } else {
          bird.group.quaternion.copy(perchedRotation);
        }
        bird.rightWing.rotation.z = pose.wingAngle;
        bird.leftWing.rotation.z = -pose.wingAngle;
        bird.legs.visible = !pose.airborne;

        for (const { tree, phase } of swayers) {
          tree.rotation.z = Math.sin(windTime * 0.9 + phase) * 0.025;
          tree.rotation.x = Math.cos(windTime * 0.7 + phase) * 0.012;
        }

        const cam = cameraPose(t);
        camera.position.set(...cam.position);
        camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);
      };

      const emitPhase = (t) => {
        const phase = phaseAt(t);
        if (phase !== lastPhase) {
          lastPhase = phase;
          callbacks.current.onPhase?.(phase);
        }
      };

      resize();
      resizeObserver = new ResizeObserver(() => {
        resize();
        if (reducedMotion) {
          apply(DURATION, 0);
          renderer.render(scene, camera);
        }
      });
      resizeObserver.observe(container);

      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        callbacks.current.onError?.(new Error('WebGL context lost'));
      });

      if (reducedMotion) {
        // No motion: draw the calm final frame once.
        apply(DURATION, 0);
        renderer.render(scene, camera);
        emitPhase(DURATION);
        callbacks.current.onReady?.();
      } else {
        let previous = performance.now();
        let windTime = 0;
        let readySent = false;
        renderer.setAnimationLoop((now) => {
          if (disposed) return;
          const dt = Math.min(0.05, (now - previous) / 1000);
          previous = now;
          windTime += dt;
          clockRef.current.t = Math.min(DURATION + 1, clockRef.current.t + dt);
          apply(clockRef.current.t, windTime);
          renderer.render(scene, camera);
          emitPhase(clockRef.current.t);
          if (!readySent) {
            readySent = true;
            callbacks.current.onReady?.();
          }
        });
      }
    } catch (error) {
      callbacks.current.onError?.(error);
    }

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (renderer) renderer.setAnimationLoop(null);
      if (scene) {
        scene.traverse((object) => {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose());
        });
        scene.background?.dispose?.();
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="scene-container" />;
}