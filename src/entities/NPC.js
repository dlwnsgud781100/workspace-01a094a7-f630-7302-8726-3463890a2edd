// NPC.js - Interactive 3D NPCs with overhead tags, quest markers, and dialogue hooks
import * as THREE from 'three';

export const NPC_CONFIGS = {
  npc_elder: {
    id: 'npc_elder',
    name: '마을 촌장 기디온',
    title: '메인 퀘스트 & 초월 안내',
    pos: [0, 0, 12],
    rot: Math.PI,
    shirtColor: 0x5e35b1,
    skinColor: 0xffcc80,
    hasBeard: true,
    hatType: 'elder_crown'
  },
  npc_blacksmith: {
    id: 'npc_blacksmith',
    name: '대장장이 불칸',
    title: '무기 제련 & 장비 강화소 [U]',
    pos: [18, 0, 8],
    rot: -Math.PI / 2,
    shirtColor: 0xd84315,
    skinColor: 0xffb74d,
    hasApron: true,
    hasHammer: true
  },
  npc_alchemist: {
    id: 'npc_alchemist',
    name: '연금술사 릴리',
    title: '물약 상점 & 연금 비약 [B]',
    pos: [-18, 0, 8],
    rot: Math.PI / 2,
    shirtColor: 0x00897b,
    skinColor: 0xffe0b2,
    hatType: 'witch_hat'
  },
  npc_petmaster: {
    id: 'npc_petmaster',
    name: '펫 조련사 포치',
    title: '펫 부화소 & 알 교환 [P]',
    pos: [14, 0, -14],
    rot: -Math.PI * 0.75,
    shirtColor: 0xfbc02d,
    skinColor: 0xffcc80,
    hasAnimalEars: true
  },
  npc_bounty: {
    id: 'npc_bounty',
    name: '현상금 집행관 로날드',
    title: '현상금 수배 & 토벌 의뢰 [J]',
    pos: [-14, 0, -14],
    rot: Math.PI * 0.75,
    shirtColor: 0x37474f,
    skinColor: 0xffb74d,
    hasKnightHelm: true
  }
};

export class NPC {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.title = config.title;

    this.mesh = new THREE.Group();
    this.mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
    this.mesh.rotation.y = config.rot || 0;

    this.animTime = Math.random() * 5.0;
    this.questIcon = null;

    this.build3DModel();
    this.createQuestMarker();
    this.game.scene.add(this.mesh);
  }

  build3DModel() {
    const skinMat = new THREE.MeshStandardMaterial({ color: this.config.skinColor || 0xffcc80, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: this.config.shirtColor || 0x1976d2, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.7 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.5, 1.9, 0.8);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.9;
    torso.castShadow = true;
    this.mesh.add(torso);
    this.torso = torso;

    // Head
    const headGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.5;
    head.castShadow = true;
    torso.add(head);

    // Cute NPC Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.16, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.25, 0.08, 0.56);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.25, 0.08, 0.56);
    head.add(eyeL, eyeR);

    // Custom NPC decorations
    if (this.config.hasBeard) {
      // Wise white beard
      const beardMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
      const beardGeo = new THREE.BoxGeometry(0.9, 0.7, 0.3);
      const beard = new THREE.Mesh(beardGeo, beardMat);
      beard.position.set(0, -0.35, 0.5);
      head.add(beard);
    }

    if (this.config.hatType === 'elder_crown') {
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.8 });
      const crownGeo = new THREE.CylinderGeometry(0.65, 0.6, 0.35, 6);
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 0.65;
      head.add(crown);
    } else if (this.config.hatType === 'witch_hat') {
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x4a148c });
      const brimGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 12);
      const brim = new THREE.Mesh(brimGeo, hatMat);
      brim.position.y = 0.55;
      const coneGeo = new THREE.ConeGeometry(0.55, 1.1, 8);
      const cone = new THREE.Mesh(coneGeo, hatMat);
      cone.position.y = 0.55;
      brim.add(cone);
      head.add(brim);
    } else if (this.config.hasAnimalEars) {
      const earMat = new THREE.MeshStandardMaterial({ color: 0xffd54f });
      const earGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
      const earL = new THREE.Mesh(earGeo, earMat);
      earL.position.set(0.4, 0.65, 0);
      const earR = new THREE.Mesh(earGeo, earMat);
      earR.position.set(-0.4, 0.65, 0);
      head.add(earL, earR);
    }

    // Arms
    const armGeo = new THREE.BoxGeometry(0.65, 1.7, 0.65);
    armGeo.translate(0, -0.7, 0);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(1.1, 0.8, 0);
    torso.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(-1.1, 0.8, 0);
    torso.add(rightArm);
    this.rightArm = rightArm;

    if (this.config.hasHammer) {
      const hammerMat = new THREE.MeshStandardMaterial({ color: 0x757575, metalness: 0.8 });
      const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
      const handle = new THREE.Mesh(handleGeo, hammerMat);
      handle.position.set(0, -0.8, 0.3);
      const headG = new THREE.BoxGeometry(0.4, 0.3, 0.6);
      const hMesh = new THREE.Mesh(headG, hammerMat);
      hMesh.position.y = 0.5;
      handle.add(hMesh);
      rightArm.add(handle);
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.65, 1.7, 0.65);
    legGeo.translate(0, -0.8, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(0.4, -0.9, 0);
    torso.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(-0.4, -0.9, 0);
    torso.add(rightLeg);
  }

  createQuestMarker() {
    const markerGroup = new THREE.Group();
    markerGroup.position.set(0, 4.3, 0);

    // Glowing Exclamation / Question Icon 3D
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const barGeo = new THREE.BoxGeometry(0.24, 0.7, 0.24);
    const bar = new THREE.Mesh(barGeo, mat);
    bar.position.y = 0.3;

    const dotGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const dot = new THREE.Mesh(dotGeo, mat);
    dot.position.y = -0.3;

    markerGroup.add(bar, dot);
    this.mesh.add(markerGroup);
    this.questIcon = markerGroup;
    this.questIconMat = mat;
  }

  update(delta) {
    this.animTime += delta;

    // Gentle breathing & idle
    if (this.torso) {
      this.torso.position.y = 1.9 + Math.sin(this.animTime * 2.0) * 0.04;
    }

    // Bobbing & Rotating Quest Icon
    if (this.questIcon) {
      this.questIcon.position.y = 4.3 + Math.sin(this.animTime * 3.5) * 0.18;
      this.questIcon.rotation.y += delta * 2.0;

      // Check if player has ready/active quest with this NPC
      const questSystem = this.game.questSystem;
      let hasTurnIn = false;
      let hasAvailable = false;

      if (questSystem) {
        for (const [qId, prog] of Object.entries(questSystem.activeQuests)) {
          const qData = this.game.getQuestData(qId);
          if (qData && qData.giverId === this.id && prog.isComplete) {
            hasTurnIn = true;
            break;
          }
        }
      }

      if (hasTurnIn) {
        this.questIconMat.color.set(0x00e676); // Green for turn-in!
        this.questIcon.visible = true;
      } else {
        this.questIconMat.color.set(0xffd700); // Yellow for story/talk
        this.questIcon.visible = true;
      }
    }

    // Look slightly towards player when close
    if (this.game.player) {
      const pPos = this.game.player.getPosition();
      const distSq = this.mesh.position.distanceToSquared(pPos);
      if (distSq < 64) { // within 8 meters
        const targetAngle = Math.atan2(pPos.x - this.mesh.position.x, pPos.z - this.mesh.position.z);
        this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetAngle, delta * 3.0);
      }
    }
  }
}

export class NPCManager {
  constructor(game) {
    this.game = game;
    this.npcs = [];
    this.initNPCs();
  }

  initNPCs() {
    for (const config of Object.values(NPC_CONFIGS)) {
      const npc = new NPC(this.game, config);
      this.npcs.push(npc);
    }
  }

  getNearestNPC(playerPos, maxDist = 4.5) {
    let nearest = null;
    let minDist = maxDist;

    for (const npc of this.npcs) {
      const dist = npc.mesh.position.distanceTo(playerPos);
      if (dist < minDist) {
        minDist = dist;
        nearest = npc;
      }
    }
    return nearest;
  }

  update(delta) {
    for (const npc of this.npcs) {
      npc.update(delta);
    }
  }
}
