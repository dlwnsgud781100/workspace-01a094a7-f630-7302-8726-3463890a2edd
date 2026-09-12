// World.js - 3D Roblox style open-world map, town, forest, dungeon ruins, volcano, and props
import * as THREE from 'three';

export class World {
  constructor(game) {
    this.game = game;
    this.mushrooms = [];
    this.clouds = [];
    this.waterParticles = [];
    this.time = 0;

    this.createLighting();
    this.createSkyAndGround();
    this.createTown();
    this.createForest();
    this.createCryptRuins();
    this.createVolcanoBossArena();
    this.createGatherables();
  }

  createLighting() {
    // Soft ambient / hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x388e3c, 0.65);
    hemiLight.position.set(0, 50, 0);
    this.game.scene.add(hemiLight);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff8e1, 1.2);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    const d = 110;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.game.scene.add(sunLight);

    // Subtle atmospheric fog
    this.game.scene.fog = new THREE.FogExp2(0xd7f0fd, 0.007);
    this.game.renderer.setClearColor(0xd7f0fd, 1);
  }

  createSkyAndGround() {
    // 1. Huge Ground Plane
    const groundGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x558b2f,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.game.scene.add(ground);

    // 2. Distant Low-Poly Mountain Ring
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.9 });
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 135 + Math.random() * 20;
      const height = 35 + Math.random() * 30;
      const width = 25 + Math.random() * 20;

      const mGeo = new THREE.ConeGeometry(width, height, 5);
      const mountain = new THREE.Mesh(mGeo, mountainMat);
      mountain.position.set(Math.cos(angle) * radius, height / 2 - 2, Math.sin(angle) * radius);
      mountain.rotation.y = Math.random() * Math.PI;
      this.game.scene.add(mountain);
    }

    // 3. Floating Roblox Voxel Clouds
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 18; i++) {
      const cloudGroup = new THREE.Group();
      const numBlocks = 4 + Math.floor(Math.random() * 5);
      for (let b = 0; b < numBlocks; b++) {
        const cGeo = new THREE.BoxGeometry(8 + Math.random() * 8, 3, 6 + Math.random() * 6);
        const cMesh = new THREE.Mesh(cGeo, cloudMat);
        cMesh.position.set((b - numBlocks / 2) * 5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 4);
        cloudGroup.add(cMesh);
      }
      cloudGroup.position.set((Math.random() - 0.5) * 260, 45 + Math.random() * 20, (Math.random() - 0.5) * 260);
      this.game.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }
  }

  createTown() {
    // Town Center Plaza (Cobblestone Circle)
    const plazaGeo = new THREE.CylinderGeometry(24, 24, 0.2, 32);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.7 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.1;
    plaza.receiveShadow = true;
    this.game.scene.add(plaza);

    // Inner Plaza Decorative Ring
    const ringGeo = new THREE.CylinderGeometry(10, 10, 0.25, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.12;
    ring.receiveShadow = true;
    this.game.scene.add(ring);

    // Central Fountain
    this.createFountain(0, 0);

    // Town Buildings
    // 1. Elder's Hall (North)
    this.createHouse(0, 22, 0x1565c0, 0xb71c1c, '촌장의 저택');
    // 2. Blacksmith Forge (East)
    this.createHouse(24, 6, 0x4e342e, 0xd84315, '대장간');
    this.createAnvil(19, 6);
    // 3. Alchemy Shop (West)
    this.createHouse(-24, 6, 0x00695c, 0x6a1b9a, '연금술 공방');
    // 4. Pet Sanctuary (South East)
    this.createHouse(18, -20, 0xf57f17, 0x2e7d32, '펫 부화소');
    // 5. Bounty Guild Post (South West)
    this.createHouse(-18, -20, 0x37474f, 0x455a64, '현상금 길드');

    // Town Lampposts
    const lampPositions = [
      [8, 8], [-8, 8], [8, -8], [-8, -8], [16, 0], [-16, 0], [0, 16], [0, -16]
    ];
    lampPositions.forEach(([lx, lz]) => {
      this.createLamppost(lx, lz);
    });

    // Town Trees & Flowerbeds
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tx = Math.cos(angle) * 22;
      const tz = Math.sin(angle) * 22;
      this.createTree(tx, tz, 'oak');
    }
  }

  createFountain(x, z) {
    const fGroup = new THREE.Group();
    fGroup.position.set(x, 0.2, z);

    // Base Pool
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.5 });
    const poolGeo = new THREE.CylinderGeometry(4.5, 4.8, 1.0, 16);
    const pool = new THREE.Mesh(poolGeo, stoneMat);
    pool.position.y = 0.5;
    pool.castShadow = true;
    fGroup.add(pool);

    // Water Surface
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00b0ff,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const waterGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.1, 16);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.95;
    fGroup.add(water);

    // Center Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.0, 2.5, 12);
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.y = 1.6;
    fGroup.add(pillar);

    // Top Basin
    const topBasinGeo = new THREE.CylinderGeometry(2.0, 1.2, 0.6, 12);
    const topBasin = new THREE.Mesh(topBasinGeo, stoneMat);
    topBasin.position.y = 2.8;
    fGroup.add(topBasin);

    // Floating Crystal on top
    const crystalGeo = new THREE.OctahedronGeometry(0.6, 0);
    const crystalMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 3.6;
    fGroup.add(crystal);
    this.fountainCrystal = crystal;

    this.game.scene.add(fGroup);
  }

  createHouse(x, z, wallColor, roofColor, label) {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, 0, z);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.6 });
    const wallGeo = new THREE.BoxGeometry(8, 6, 8);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 3;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Roof (Pyramid / Gable)
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5 });
    const roofGeo = new THREE.ConeGeometry(7, 3.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 7.7;
    roof.castShadow = true;
    houseGroup.add(roof);

    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
    const doorGeo = new THREE.BoxGeometry(2, 3.5, 0.2);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.75, 4.05);
    houseGroup.add(door);

    // Windows
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const winGeo = new THREE.BoxGeometry(1.6, 1.6, 0.1);
    const winL = new THREE.Mesh(winGeo, winMat);
    winL.position.set(2.4, 3.5, 4.05);
    const winR = new THREE.Mesh(winGeo, winMat);
    winR.position.set(-2.4, 3.5, 4.05);
    houseGroup.add(winL, winR);

    // Chimney
    const chimMat = new THREE.MeshStandardMaterial({ color: 0x757575 });
    const chimGeo = new THREE.BoxGeometry(1.2, 3, 1.2);
    const chim = new THREE.Mesh(chimGeo, chimMat);
    chim.position.set(2.4, 7.5, 2.0);
    houseGroup.add(chim);

    this.game.scene.add(houseGroup);
  }

  createAnvil(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.9, roughness: 0.2 });
    const baseGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.4;
    group.add(base);

    const topGeo = new THREE.BoxGeometry(2.0, 0.5, 0.8);
    const top = new THREE.Mesh(topGeo, metalMat);
    top.position.y = 1.0;
    group.add(top);

    this.game.scene.add(group);
  }

  createLamppost(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.7 });
    const postGeo = new THREE.CylinderGeometry(0.12, 0.16, 4.5, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 2.25;
    group.add(post);

    const lampGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.y = 4.4;
    group.add(lamp);

    // Warm local light
    const pointLight = new THREE.PointLight(0xffd54f, 1.2, 12);
    pointLight.position.y = 4.4;
    group.add(pointLight);

    this.game.scene.add(group);
  }

  createTree(x, z, type = 'pine') {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: type === 'pine' ? 0x2e7d32 : 0x43a047, roughness: 0.6 });

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 4.0, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.0;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    if (type === 'pine') {
      for (let i = 0; i < 3; i++) {
        const coneGeo = new THREE.ConeGeometry(3.2 - i * 0.7, 3.2, 6);
        const cone = new THREE.Mesh(coneGeo, leavesMat);
        cone.position.y = 3.5 + i * 1.8;
        cone.castShadow = true;
        treeGroup.add(cone);
      }
    } else {
      const foliageGeo = new THREE.BoxGeometry(4.2, 4.2, 4.2);
      const foliage = new THREE.Mesh(foliageGeo, leavesMat);
      foliage.position.y = 5.0;
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }

    this.game.scene.add(treeGroup);
  }

  createForest() {
    // Whispering Forest (East side x: 30 ~ 95, z: -30 ~ 80)
    for (let i = 0; i < 35; i++) {
      const x = 32 + Math.random() * 60;
      const z = -25 + Math.random() * 105;
      const treeType = Math.random() < 0.6 ? 'pine' : 'oak';
      this.createTree(x, z, treeType);
    }

    // Mossy stone pillars in forest
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const x = 45 + Math.random() * 40;
      const z = 20 + Math.random() * 50;
      const pGeo = new THREE.BoxGeometry(1.6, 5 + Math.random() * 4, 1.6);
      const pillar = new THREE.Mesh(pGeo, stoneMat);
      pillar.position.set(x, 2.5, z);
      pillar.rotation.y = Math.random() * Math.PI;
      pillar.castShadow = true;
      this.game.scene.add(pillar);
    }
  }

  createCryptRuins() {
    // Crypt Ruins (West side x: -35 ~ -90, z: 20 ~ 80)
    // Dark floor patch
    const cryptFloorGeo = new THREE.PlaneGeometry(65, 65);
    const cryptMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.95 });
    const cryptFloor = new THREE.Mesh(cryptFloorGeo, cryptMat);
    cryptFloor.rotation.x = -Math.PI / 2;
    cryptFloor.position.set(-60, 0.05, 50);
    this.game.scene.add(cryptFloor);

    // Ruined Archways and Tomb Pillars
    const ruinMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.8 });
    for (let i = 0; i < 12; i++) {
      const x = -40 - Math.random() * 45;
      const z = 25 + Math.random() * 50;
      const archGeo = new THREE.BoxGeometry(2, 7, 2);
      const arch = new THREE.Mesh(archGeo, ruinMat);
      arch.position.set(x, 3.5, z);
      arch.castShadow = true;
      this.game.scene.add(arch);
    }
  }

  createVolcanoBossArena() {
    // Volcano Floor (North side z: -40 ~ -110, x: -60 ~ 60)
    const lavaFloorGeo = new THREE.PlaneGeometry(120, 90);
    const lavaFloorMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.95 });
    const lavaFloor = new THREE.Mesh(lavaFloorGeo, lavaFloorMat);
    lavaFloor.rotation.x = -Math.PI / 2;
    lavaFloor.position.set(0, 0.05, -75);
    this.game.scene.add(lavaFloor);

    // Glowing Lava Cracks
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
    for (let i = 0; i < 8; i++) {
      const crackGeo = new THREE.BoxGeometry(18, 0.08, 2.0);
      const crack = new THREE.Mesh(crackGeo, crackMat);
      crack.position.set((Math.random() - 0.5) * 60, 0.08, -60 - Math.random() * 35);
      crack.rotation.y = Math.random() * Math.PI;
      this.game.scene.add(crack);
    }

    // World Boss Arena Altar at (0, 0, -85)
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0, -85);

    // Altar Platform
    const altarGeo = new THREE.CylinderGeometry(18, 20, 1.2, 16);
    const altarMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.8 });
    const altar = new THREE.Mesh(altarGeo, altarMat);
    altar.position.y = 0.6;
    altar.receiveShadow = true;
    altarGroup.add(altar);

    // 4 Flaming Colossal Pillars
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const pilMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 });
    const pOffsets = [
      [14, 14], [-14, 14], [14, -14], [-14, -14]
    ];
    pOffsets.forEach(([px, pz]) => {
      const pGeo = new THREE.BoxGeometry(3.0, 12.0, 3.0);
      const pMesh = new THREE.Mesh(pGeo, pilMat);
      pMesh.position.set(px, 6.0, pz);
      altarGroup.add(pMesh);

      // Flame Bowl on top
      const fGeo = new THREE.BoxGeometry(3.4, 1.2, 3.4);
      const fMesh = new THREE.Mesh(fGeo, flameMat);
      fMesh.position.set(px, 12.5, pz);
      altarGroup.add(fMesh);
    });

    this.game.scene.add(altarGroup);
  }

  createGatherables() {
    // 3 Glowing Blue Mushrooms in forest for Quest 4!
    const mPositions = [
      [38, 0, 22], [52, 0, 42], [66, 0, 28]
    ];

    mPositions.forEach((pos, i) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(pos[0], 0, pos[2]);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.4;
      mGroup.add(stem);

      // Cap (Glowing Blue)
      const capGeo = new THREE.SphereGeometry(0.65, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.75;
      mGroup.add(cap);

      // Light
      const pLight = new THREE.PointLight(0x00e5ff, 1.0, 6);
      pLight.position.y = 1.0;
      mGroup.add(pLight);

      this.game.scene.add(mGroup);
      this.mushrooms.push({
        id: `mushroom_${i}`,
        mesh: mGroup,
        pos: new THREE.Vector3(pos[0], 0, pos[2]),
        isGathered: false,
        respawnTime: 0
      });
    });
  }

  gatherMushroomNear(playerPos) {
    for (const m of this.mushrooms) {
      if (m.isGathered) continue;
      if (m.pos.distanceTo(playerPos) < 3.5) {
        m.isGathered = true;
        m.mesh.visible = false;
        m.respawnTime = 12.0;

        if (this.game.questSystem) {
          this.game.questSystem.onMushroomGathered();
        }
        if (this.game.audio) this.game.audio.playCoin();
        if (this.game.ui) this.game.ui.showToast('🍄 푸른 마법 버섯 채집 완료!', 'blue');
        return true;
      }
    }
    return false;
  }

  update(delta) {
    this.time += delta;

    // Rotate Fountain Crystal
    if (this.fountainCrystal) {
      this.fountainCrystal.rotation.y += delta * 1.5;
      this.fountainCrystal.position.y = 3.6 + Math.sin(this.time * 2.5) * 0.12;
    }

    // Move Clouds slowly
    for (const cloud of this.clouds) {
      cloud.position.x += delta * 2.2;
      if (cloud.position.x > 140) {
        cloud.position.x = -140;
      }
    }

    // Respawn gathered mushrooms
    for (const m of this.mushrooms) {
      if (m.isGathered) {
        m.respawnTime -= delta;
        if (m.respawnTime <= 0) {
          m.isGathered = false;
          m.mesh.visible = true;
        }
      }
    }
  }
}
