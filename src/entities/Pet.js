// PetSystem.js - Pet companion gacha, stats multipliers, and 3D visual companion
import * as THREE from 'three';

export const PET_DATABASE = {
  baby_dog: {
    id: 'baby_dog',
    name: '아기 댕댕이',
    rarity: 'common',
    color: '#d7ccc8',
    subColor: '#8d6e63',
    icon: '🐶',
    desc: '언제나 꼬리를 흔들며 골드 획득량을 늘려주는 충직한 강아지입니다.',
    atkMul: 0.05,
    goldMul: 0.20,
    expMul: 0.10,
    speedBonus: 1.0,
    defBonus: 5,
    critBonus: 0.02,
    modelType: 'dog'
  },
  ninja_cat: {
    id: 'ninja_cat',
    name: '닌자 냥이',
    rarity: 'rare',
    color: '#37474f',
    subColor: '#e53935',
    icon: '🐱',
    desc: '재빠른 몸놀림으로 공격력과 치명타 확률을 올려주는 닌자 고양이입니다.',
    atkMul: 0.22,
    goldMul: 0.15,
    expMul: 0.15,
    speedBonus: 2.0,
    defBonus: 10,
    critBonus: 0.06,
    modelType: 'cat'
  },
  panda_monk: {
    id: 'panda_monk',
    name: '판다 수도승',
    rarity: 'rare',
    color: '#ffffff',
    subColor: '#212121',
    icon: '🐼',
    desc: '깊은 명상으로 주인의 생명력과 방어력을 대폭 강화합니다.',
    atkMul: 0.15,
    goldMul: 0.25,
    expMul: 0.25,
    speedBonus: 0.5,
    defBonus: 35,
    critBonus: 0.03,
    modelType: 'panda'
  },
  fire_drake: {
    id: 'fire_drake',
    name: '화염의 베이비 드래곤',
    rarity: 'epic',
    color: '#e53935',
    subColor: '#ffb300',
    icon: '🐲',
    desc: '작지만 뜨거운 불꽃의 숨결로 강력한 공격력을 부여합니다.',
    atkMul: 0.45,
    goldMul: 0.35,
    expMul: 0.35,
    speedBonus: 2.5,
    defBonus: 20,
    critBonus: 0.10,
    modelType: 'dragon'
  },
  thunder_phoenix: {
    id: 'thunder_phoenix',
    name: '뇌전의 썬더 피닉스',
    rarity: 'legendary',
    color: '#00e5ff',
    subColor: '#ffd600',
    icon: '🦅',
    desc: '번개의 속도로 적을 제압하며 모든 전투 능력을 극대화합니다.',
    atkMul: 0.80,
    goldMul: 0.60,
    expMul: 0.60,
    speedBonus: 4.5,
    defBonus: 40,
    critBonus: 0.18,
    modelType: 'phoenix'
  },
  cyber_mech: {
    id: 'cyber_mech',
    name: '사이버 메카 드론',
    rarity: 'mythic',
    color: '#7c4dff',
    subColor: '#00e676',
    icon: '🤖',
    desc: '최첨단 나노 입자로 전장을 지배하는 궁극의 메카닉 컴패니언입니다.',
    atkMul: 1.30,
    goldMul: 1.00,
    expMul: 1.00,
    speedBonus: 6.0,
    defBonus: 80,
    critBonus: 0.25,
    modelType: 'mech'
  }
};

export class PetSystem {
  constructor(game) {
    this.game = game;
    this.ownedPets = []; // list of pet ids
    this.activePetId = null;
    this.petMesh = null;
    this.petWings = [];
    this.hoverTime = 0;

    // Grant starter dog
    this.addPet('baby_dog');
    this.equipPet('baby_dog');
  }

  addPet(petId) {
    if (!PET_DATABASE[petId]) return false;
    this.ownedPets.push(petId);
    if (!this.activePetId) {
      this.equipPet(petId);
    }
    if (this.game?.ui) this.game.ui.renderPetModal();
    return true;
  }

  equipPet(petId) {
    if (!this.ownedPets.includes(petId)) return false;
    this.activePetId = petId;
    this.spawn3DPet();
    if (this.game?.stats) this.game.stats.recalculate();
    if (this.game?.ui) {
      this.game.ui.updateHud();
      this.game.ui.renderPetModal();
    }
    return true;
  }

  unequipPet() {
    this.activePetId = null;
    if (this.petMesh && this.game?.scene) {
      this.game.scene.remove(this.petMesh);
      this.petMesh = null;
    }
    if (this.game?.stats) this.game.stats.recalculate();
    if (this.game?.ui) {
      this.game.ui.updateHud();
      this.game.ui.renderPetModal();
    }
  }

  getActivePetBonus() {
    if (!this.activePetId) {
      return { atkMul: 0, goldMul: 0, expMul: 0, speedBonus: 0, defBonus: 0, critBonus: 0 };
    }
    const pet = PET_DATABASE[this.activePetId];
    if (!pet) return { atkMul: 0, goldMul: 0, expMul: 0, speedBonus: 0, defBonus: 0, critBonus: 0 };

    return {
      atkMul: pet.atkMul || 0,
      goldMul: pet.goldMul || 0,
      expMul: pet.expMul || 0,
      speedBonus: pet.speedBonus || 0,
      defBonus: pet.defBonus || 0,
      critBonus: pet.critBonus || 0
    };
  }

  hatchEgg(tier) {
    let pool = [];
    if (tier === 'basic') {
      pool = [
        { id: 'baby_dog', weight: 65 },
        { id: 'ninja_cat', weight: 35 }
      ];
    } else if (tier === 'forest') {
      pool = [
        { id: 'ninja_cat', weight: 40 },
        { id: 'panda_monk', weight: 40 },
        { id: 'fire_drake', weight: 20 }
      ];
    } else if (tier === 'legendary') {
      pool = [
        { id: 'fire_drake', weight: 45 },
        { id: 'thunder_phoenix', weight: 40 },
        { id: 'cyber_mech', weight: 15 }
      ];
    }

    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedPetId = pool[0].id;

    for (const item of pool) {
      if (rand < item.weight) {
        selectedPetId = item.id;
        break;
      }
      rand -= item.weight;
    }

    this.addPet(selectedPetId);
    if (this.game?.audio) this.game.audio.playEggHatch();

    const petData = PET_DATABASE[selectedPetId];
    if (this.game?.ui) {
      this.game.ui.showHatchAnimation(petData);
    }
    if (this.game?.questSystem) {
      this.game.questSystem.onEggHatched();
    }
    return petData;
  }

  // Build Roblox-style 3D blocky companion pet
  spawn3DPet() {
    if (this.petMesh && this.game?.scene) {
      this.game.scene.remove(this.petMesh);
      this.petMesh = null;
    }
    if (!this.activePetId || !this.game?.scene) return;

    const petData = PET_DATABASE[this.activePetId];
    if (!petData) return;

    const petGroup = new THREE.Group();
    const mainColor = new THREE.Color(petData.color);
    const subColor = new THREE.Color(petData.subColor);

    const mainMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.4,
      metalness: petData.modelType === 'mech' ? 0.7 : 0.1
    });

    const subMat = new THREE.MeshStandardMaterial({
      color: subColor,
      roughness: 0.3,
      metalness: petData.modelType === 'mech' ? 0.8 : 0.1
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.petWings = [];

    // Body block
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const body = new THREE.Mesh(bodyGeo, mainMat);
    body.castShadow = true;
    petGroup.add(body);

    // Cute Eyes
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.14, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.18, 0.08, 0.36);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.18, 0.08, 0.36);
    body.add(eyeL, eyeR);

    // Eye shines
    const shineGeo = new THREE.BoxGeometry(0.04, 0.04, 0.06);
    const shineL = new THREE.Mesh(shineGeo, whiteMat);
    shineL.position.set(0.20, 0.12, 0.37);
    const shineR = new THREE.Mesh(shineGeo, whiteMat);
    shineR.position.set(-0.16, 0.12, 0.37);
    body.add(shineL, shineR);

    // Accessories depending on model type
    if (petData.modelType === 'dog') {
      // Floppy ears
      const earGeo = new THREE.BoxGeometry(0.18, 0.35, 0.15);
      const earL = new THREE.Mesh(earGeo, subMat);
      earL.position.set(0.42, 0.2, 0);
      earL.rotation.z = -0.3;
      const earR = new THREE.Mesh(earGeo, subMat);
      earR.position.set(-0.42, 0.2, 0);
      earR.rotation.z = 0.3;
      body.add(earL, earR);

      // Cute snout
      const snoutGeo = new THREE.BoxGeometry(0.25, 0.16, 0.15);
      const snout = new THREE.Mesh(snoutGeo, subMat);
      snout.position.set(0, -0.1, 0.4);
      const noseGeo = new THREE.BoxGeometry(0.08, 0.06, 0.06);
      const nose = new THREE.Mesh(noseGeo, eyeMat);
      nose.position.set(0, 0.04, 0.08);
      snout.add(nose);
      body.add(snout);

    } else if (petData.modelType === 'cat') {
      // Pointy ears
      const earGeo = new THREE.ConeGeometry(0.18, 0.28, 4);
      const earL = new THREE.Mesh(earGeo, mainMat);
      earL.position.set(0.26, 0.48, 0);
      earL.rotation.y = Math.PI / 4;
      const earR = new THREE.Mesh(earGeo, mainMat);
      earR.position.set(-0.26, 0.48, 0);
      earR.rotation.y = Math.PI / 4;
      body.add(earL, earR);

      // Red Ninja Headband
      const bandGeo = new THREE.BoxGeometry(0.72, 0.12, 0.72);
      const band = new THREE.Mesh(bandGeo, subMat);
      band.position.set(0, 0.22, 0);
      body.add(band);

    } else if (petData.modelType === 'panda') {
      // Round ears
      const earGeo = new THREE.SphereGeometry(0.14, 8, 8);
      const earL = new THREE.Mesh(earGeo, subMat);
      earL.position.set(0.3, 0.38, 0);
      const earR = new THREE.Mesh(earGeo, subMat);
      earR.position.set(-0.3, 0.38, 0);
      body.add(earL, earR);

      // Bamboo straw hat
      const hatGeo = new THREE.ConeGeometry(0.55, 0.22, 8);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.set(0, 0.48, 0);
      body.add(hat);

    } else if (petData.modelType === 'dragon') {
      // Glowing horns
      const hornGeo = new THREE.ConeGeometry(0.12, 0.4, 4);
      const hornL = new THREE.Mesh(hornGeo, subMat);
      hornL.position.set(0.26, 0.48, -0.1);
      hornL.rotation.x = -0.3;
      hornL.rotation.z = -0.2;
      const hornR = new THREE.Mesh(hornGeo, subMat);
      hornR.position.set(-0.26, 0.48, -0.1);
      hornR.rotation.x = -0.3;
      hornR.rotation.z = 0.2;
      body.add(hornL, hornR);

      // Wings
      const wingGeo = new THREE.BoxGeometry(0.5, 0.25, 0.05);
      const wingL = new THREE.Mesh(wingGeo, subMat);
      wingL.position.set(0.45, 0.1, -0.35);
      wingL.rotation.y = -0.4;
      const wingR = new THREE.Mesh(wingGeo, subMat);
      wingR.position.set(-0.45, 0.1, -0.35);
      wingR.rotation.y = 0.4;
      body.add(wingL, wingR);
      this.petWings = [wingL, wingR];

    } else if (petData.modelType === 'phoenix') {
      // Golden crest
      const crestGeo = new THREE.BoxGeometry(0.08, 0.4, 0.3);
      const crest = new THREE.Mesh(crestGeo, subMat);
      crest.position.set(0, 0.45, 0);
      body.add(crest);

      // Phoenix Wings
      const wingGeo = new THREE.BoxGeometry(0.65, 0.28, 0.05);
      const wingL = new THREE.Mesh(wingGeo, mainMat);
      wingL.position.set(0.55, 0.1, -0.3);
      const wingR = new THREE.Mesh(wingGeo, mainMat);
      wingR.position.set(-0.55, 0.1, -0.3);
      body.add(wingL, wingR);
      this.petWings = [wingL, wingR];

    } else if (petData.modelType === 'mech') {
      // Futuristic spinning ring
      const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00e676,
        emissive: 0x00e676,
        emissiveIntensity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      body.add(ring);
      this.mechRing = ring;

      // Glowing visor
      const visorGeo = new THREE.BoxGeometry(0.5, 0.12, 0.1);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.08, 0.36);
      body.add(visor);
    }

    this.petMesh = petGroup;
    this.game.scene.add(this.petMesh);
  }

  update(delta) {
    if (!this.petMesh || !this.game?.player) return;

    this.hoverTime += delta * 4.0;
    const playerPos = this.game.player.getPosition();
    const playerRot = this.game.player.mesh.rotation.y;

    // Target offset: slightly to the right/left and floating above player shoulder
    const offset = new THREE.Vector3(1.4, 1.8 + Math.sin(this.hoverTime) * 0.18, -0.8);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRot);

    const targetPos = playerPos.clone().add(offset);
    this.petMesh.position.lerp(targetPos, delta * 5.0);

    // Look in player direction
    this.petMesh.rotation.y = THREE.MathUtils.lerp(this.petMesh.rotation.y, playerRot, delta * 6.0);

    // Flap wings
    if (this.petWings.length === 2) {
      const flap = Math.sin(this.hoverTime * 2.5) * 0.35;
      this.petWings[0].rotation.z = flap;
      this.petWings[1].rotation.z = -flap;
    }

    if (this.mechRing) {
      this.mechRing.rotation.z += delta * 3.0;
    }
  }
}
