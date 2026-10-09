// Procedural low-poly meshes for the closing scene. No external models or textures,
// so there is nothing to fail to download and no third-party asset license to track.
import {
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';

const flat = (color) => new MeshStandardMaterial({ color, flatShading: true, roughness: 1, metalness: 0 });

export const HORIZON_COLOR = '#f1dfb8';

/** Sky gradient used as the scene background. Cream at the horizon so distant fog blends into it. */
export function makeSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#3f7089');
  gradient.addColorStop(0.35, '#7fa9b0');
  gradient.addColorStop(0.58, HORIZON_COLOR);
  gradient.addColorStop(1, HORIZON_COLOR);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Gently rolling ground made from a displaced plane. */
export function makeGround() {
  const geometry = new PlaneGeometry(240, 240, 48, 48);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, Math.sin(x * 0.13) * 0.55 + Math.cos(y * 0.11) * 0.45);
  }
  geometry.computeVertexNormals();
  const ground = new Mesh(geometry, flat('#5e8a4e'));
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

/** Shared geometries and materials, so dozens of trees stay cheap. */
export function createTreeKit() {
  const trunkGeometry = new CylinderGeometry(0.2, 0.3, 2.2, 6);
  const trunkMaterial = flat('#6b4a2e');
  const pineGeometries = [
    new ConeGeometry(1.9, 3.0, 7),
    new ConeGeometry(1.5, 2.6, 7),
    new ConeGeometry(1.0, 2.2, 7),
  ];
  const pineMaterials = [flat('#2f5d3a'), flat('#356b41'), flat('#3d7a4a')];
  const canopyGeometry = new IcosahedronGeometry(1.6, 0);
  const canopyMaterials = [flat('#4f8a4b'), flat('#5b9a53')];

  const part = (geometry, material, x, y, z) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    return mesh;
  };

  return {
    makePine(scale) {
      const tree = new Group();
      tree.add(part(trunkGeometry, trunkMaterial, 0, 1.1, 0));
      tree.add(part(pineGeometries[0], pineMaterials[0], 0, 3.2, 0));
      tree.add(part(pineGeometries[1], pineMaterials[1], 0, 4.7, 0));
      tree.add(part(pineGeometries[2], pineMaterials[2], 0, 6.0, 0));
      tree.scale.setScalar(scale);
      return tree;
    },
    makeRound(scale) {
      const tree = new Group();
      tree.add(part(trunkGeometry, trunkMaterial, 0, 1.1, 0));
      const canopy = part(canopyGeometry, canopyMaterials[0], 0, 3.6, 0);
      canopy.scale.set(1, 0.9, 1);
      tree.add(canopy);
      const blob = part(canopyGeometry, canopyMaterials[1], 0.9, 3.0, 0.5);
      blob.scale.setScalar(0.6);
      tree.add(blob);
      tree.scale.setScalar(scale);
      return tree;
    },
  };
}

/** The big foreground tree the bird perches on, with a visible branch. */
export function makePerchTree(kit, x, z) {
  const tree = kit.makeRound(1.7);
  tree.position.set(x, 0, z);
  const branch = new Mesh(new CylinderGeometry(0.12, 0.17, 2.8, 6), flat('#6b4a2e'));
  branch.rotation.z = Math.PI / 2; // lay the cylinder along the x axis
  branch.position.set(x - 1.5, 2.98, z + 0.1);
  const group = new Group();
  group.add(tree);
  group.add(branch);
  return { group, tree };
}

/** A stylized bird built from simple shapes. Faces +z. Wings hinge at the shoulders. */
export function makeBird() {
  const bird = new Group();
  const bodyColor = flat('#7a5a43');
  const bellyColor = flat('#d9733a');
  const wingColor = flat('#5a4332');
  const beakColor = flat('#f2b134');
  const eyeColor = flat('#111111');

  const body = new Mesh(new SphereGeometry(0.5, 12, 10), bodyColor);
  body.scale.set(0.8, 0.75, 1.3);
  bird.add(body);

  const belly = new Mesh(new SphereGeometry(0.4, 10, 8), bellyColor);
  belly.scale.set(0.8, 0.7, 1.1);
  belly.position.set(0, -0.12, 0.2);
  bird.add(belly);

  const head = new Mesh(new SphereGeometry(0.28, 10, 8), bodyColor);
  head.position.set(0, 0.3, 0.62);
  bird.add(head);

  const beak = new Mesh(new ConeGeometry(0.07, 0.26, 6), beakColor);
  beak.rotation.x = Math.PI / 2; // point the cone's tip along +z
  beak.position.set(0, 0.27, 0.92);
  bird.add(beak);

  for (const side of [-1, 1]) {
    const eye = new Mesh(new SphereGeometry(0.04, 6, 6), eyeColor);
    eye.position.set(side * 0.15, 0.36, 0.82);
    bird.add(eye);
  }

  const tail = new Mesh(new BoxGeometry(0.28, 0.05, 0.75), wingColor);
  tail.position.set(0, 0.02, -0.9);
  tail.rotation.x = -0.15;
  bird.add(tail);

  const wingGeometry = new BoxGeometry(1.0, 0.05, 0.6);
  const makeWing = (side) => {
    const pivot = new Group();
    pivot.position.set(side * 0.32, 0.22, 0.05);
    const wing = new Mesh(wingGeometry, wingColor);
    wing.position.x = side * 0.5;
    pivot.add(wing);
    return pivot;
  };
  const rightWing = makeWing(1);
  const leftWing = makeWing(-1);
  bird.add(rightWing, leftWing);

  const legs = new Group();
  for (const side of [-1, 1]) {
    const leg = new Mesh(new CylinderGeometry(0.02, 0.02, 0.3, 4), beakColor);
    leg.position.set(side * 0.12, -0.5, 0.1);
    legs.add(leg);
  }
  bird.add(legs);

  bird.scale.setScalar(0.9);
  return { group: bird, rightWing, leftWing, legs };
}