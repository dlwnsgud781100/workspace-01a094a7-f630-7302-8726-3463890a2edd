// Monster.js - Mobs, AI state machine, Boss Gorgar with telegraphs, training dummies, and loot drops
import * as THREE from 'three';

export class Monster {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.type = config.type; // 'dummy', 'slime', 'goblin', 'skeleton', 'golem', 'boss'
    this.name = config.name;
    this.level = config.level || 1;
    this.maxHp = config.hp || 100;
    this.currentHp = this.maxHp;
    this.atk = config.atk || 10;
    this.expReward = config.exp || 20;
    this.goldReward = config.gold || 15;
    this.spawnPos = new THREE.Vector3(...config.pos);

    this.position = this.spawnPos.clone();
    this.velocity = new THREE.Vector3();
    this.rotation = Math.random() * Math.PI * 2;

    // AI States: 'idle', 'patrol', 'chase', 'attack_windup', 'attack', 'hurt', 'dead'
    this.state = 'idle';
    this.stateTimer = Math.random() * 2.0;
    this.aggroRadius = config.aggroRadius || (this.type === 'boss' ? 35 : 16);
    this.attackRange = config.attackRange || (this.type === 'boss' ? 6.5 : 2.8);
    this.attackCooldown = 0;
    this.respawnTimer = 0;
    this.isDead = false;

    // Boss special
    this.isBoss = this.type === 'boss';
    this.isEnraged = false;
    this.telegraphCircle = null;
    this.isTelegraphing = false;
    this.telegraphTimer = 0;

    this.mesh = new THREE.Group();
    this.buildModel();
    this.createHpBar();
    this.game.scene.add(this.mesh);
  }

  buildModel() {
    if (this.type === 'dummy') {
      this.buildDummyModel();
    } else if (this.type === 'slime') {
      this.buildSlimeModel();
    } else if (this.type === 'goblin') {
      this.buildGoblinModel();
    } else if (this.type === 'skeleton') {
      this.buildSkeletonModel();
    } else if (this.type === 'golem') {
      this.buildGolemModel();
    } else if (this.type === 'boss') {
      this.buildBossModel();
    }
  }

  buildDummyModel() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.9 });

    // Stand pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8);
    const pole = new THREE.Mesh(poleGeo, woodMat);
    pole.position.y = 1.4;
    pole.castShadow = true;
    this.mesh.add(pole);

    // Straw body
    const bodyGeo = new THREE.BoxGeometry(1.2, 1.4, 0.7);
    const body = new THREE.Mesh(bodyGeo, strawMat);
    body.position.y = 1.8;
    body.castShadow = true;
    this.mesh.add(body);
    this.dummyBody = body;

    // Target bullseye on chest
    const targetGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 12);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xe53935 });
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.rotation.x = Math.PI / 2;
    target.position.set(0, 0, 0.38);
    body.add(target);

    // Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const head = new THREE.Mesh(headGeo, strawMat);
    head.position.y = 1.1;
    body.add(head);

    // Cross arm
    const armGeo = new THREE.BoxGeometry(2.2, 0.2, 0.2);
    const arm = new THREE.Mesh(armGeo, woodMat);
    arm.position.y = 0.3;
    body.add(arm);
  }

  buildSlimeModel() {
    const slimeMat = new THREE.MeshStandardMaterial({
      color: 0x4caf50,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });

    const bodyGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
    bodyGeo.translate(0, 0.6, 0);
    this.slimeBody = new THREE.Mesh(bodyGeo, slimeMat);
    this.slimeBody.castShadow = true;
    this.mesh.add(this.slimeBody);

    // Cute eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeGeo = new THREE.BoxGeometry(0.16, 0.22, 0.08);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.35, 0.7, 0.72);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.35, 0.7, 0.72);
    this.slimeBody.add(eyeL, eyeR);

    // Mouth
    const mouthGeo = new THREE.BoxGeometry(0.24, 0.08, 0.08);
    const mouth = new THREE.Mesh(mouthGeo, eyeMat);
    mouth.position.set(0, 0.45, 0.72);
    this.slimeBody.add(mouth);
  }

  buildGoblinModel() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x689f38, roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });

    const torsoGeo = new THREE.BoxGeometry(1.2, 1.4, 0.7);
    this.torso = new THREE.Mesh(torsoGeo, clothMat);
    this.torso.position.y = 1.4;
    this.mesh.add(this.torso);

    const headGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.2;
    this.torso.add(head);

    // Pointy goblin ears
    const earGeo = new THREE.ConeGeometry(0.18, 0.6, 4);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(0.65, 0.2, 0);
    earL.rotation.z = -1.2;
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(-0.65, 0.2, 0);
    earR.rotation.z = 1.2;
    head.add(earL, earR);

    // Spiked Club in hand
    const clubMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
    const clubGeo = new THREE.CylinderGeometry(0.2, 0.08, 1.4, 6);
    this.club = new THREE.Mesh(clubGeo, clubMat);
    this.club.position.set(0.9, 0, 0.4);
    this.club.rotation.x = Math.PI / 4;
    this.torso.add(this.club);
  }

  buildSkeletonModel() {
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.5 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.8 });

    const torsoGeo = new THREE.BoxGeometry(1.1, 1.6, 0.6);
    this.torso = new THREE.Mesh(torsoGeo, boneMat);
    this.torso.position.y = 1.6;
    this.mesh.add(this.torso);

    const skullGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const skull = new THREE.Mesh(skullGeo, boneMat);
    skull.position.y = 1.25;
    this.torso.add(skull);

    // Glowing red eye sockets
    const redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.06);
    const eyeL = new THREE.Mesh(eyeGeo, redEyeMat);
    eyeL.position.set(0.2, 0.1, 0.46);
    const eyeR = new THREE.Mesh(eyeGeo, redEyeMat);
    eyeR.position.set(-0.2, 0.1, 0.46);
    skull.add(eyeL, eyeR);

    // Sword & Shield
    const swordGeo = new THREE.BoxGeometry(0.15, 1.5, 0.05);
    this.sword = new THREE.Mesh(swordGeo, metalMat);
    this.sword.position.set(0.8, -0.2, 0.5);
    this.sword.rotation.x = Math.PI / 3;
    this.torso.add(this.sword);
  }

  buildGolemModel() {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x263238,
      roughness: 0.9,
      metalness: 0.2
    });
    const magmaMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });

    const torsoGeo = new THREE.BoxGeometry(2.4, 2.2, 1.4);
    this.torso = new THREE.Mesh(torsoGeo, rockMat);
    this.torso.position.y = 2.4;
    this.mesh.add(this.torso);

    // Magma core glow
    const coreGeo = new THREE.BoxGeometry(1.0, 1.0, 1.45);
    const core = new THREE.Mesh(coreGeo, magmaMat);
    this.torso.add(core);

    const headGeo = new THREE.BoxGeometry(1.2, 1.0, 1.2);
    const head = new THREE.Mesh(headGeo, rockMat);
    head.position.y = 1.6;
    this.torso.add(head);

    // Massive fists
    const fistGeo = new THREE.BoxGeometry(0.9, 1.8, 0.9);
    const fistL = new THREE.Mesh(fistGeo, rockMat);
    fistL.position.set(1.7, -0.4, 0.2);
    const fistR = new THREE.Mesh(fistGeo, rockMat);
    fistR.position.set(-1.7, -0.4, 0.2);
    this.torso.add(fistL, fistR);
  }

  buildBossModel() {
    this.mesh.scale.set(2.8, 2.8, 2.8);
    const bossSkinMat = new THREE.MeshStandardMaterial({ color: 0x880e4f, roughness: 0.6 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9 });

    this.bossSkinMat = bossSkinMat;

    const torsoGeo = new THREE.BoxGeometry(1.8, 2.2, 1.0);
    this.torso = new THREE.Mesh(torsoGeo, armorMat);
    this.torso.position.y = 2.2;
    this.mesh.add(this.torso);

    const headGeo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const head = new THREE.Mesh(headGeo, bossSkinMat);
    head.position.y = 1.7;
    this.torso.add(head);

    // Horned Skull Crown
    const crownGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.position.y = 0.7;
    head.add(crown);

    const hornGeo = new THREE.ConeGeometry(0.2, 1.0, 4);
    const hornL = new THREE.Mesh(hornGeo, armorMat);
    hornL.position.set(0.7, 0.9, 0);
    hornL.rotation.z = -0.5;
    const hornR = new THREE.Mesh(hornGeo, armorMat);
    hornR.position.set(-0.7, 0.9, 0);
    hornR.rotation.z = 0.5;
    head.add(hornL, hornR);

    // Glowing fiery eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), eyeMat);
    eyeL.position.set(0.3, 0.15, 0.66);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), eyeMat);
    eyeR.position.set(-0.3, 0.15, 0.66);
    head.add(eyeL, eyeR);

    // Giant Battleaxes in both hands
    const axeMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.9 });
    const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8);
    const axeHandle = new THREE.Mesh(handleGeo, armorMat);
    axeHandle.position.set(1.4, 0, 0.6);
    axeHandle.rotation.x = Math.PI / 4;

    const bladeGeo = new THREE.BoxGeometry(0.8, 1.0, 0.1);
    bladeGeo.translate(0.35, 0.8, 0);
    const axeBlade = new THREE.Mesh(bladeGeo, axeMat);
    axeHandle.add(axeBlade);
    this.torso.add(axeHandle);

    // Ground Slam Telegraph Circle Mesh (Dynamic red ring)
    const ringGeo = new THREE.RingGeometry(0.1, 7.5, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    this.telegraphCircle = new THREE.Mesh(ringGeo, ringMat);
    this.telegraphCircle.position.y = 0.05;
    this.telegraphCircle.visible = false;
    this.game.scene.add(this.telegraphCircle);
  }

  createHpBar() {
    if (this.type === 'dummy') return;

    const barGroup = new THREE.Group();
    barGroup.position.set(0, this.isBoss ? 8.5 : 3.8, 0);

    const bgMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const bgGeo = new THREE.BoxGeometry(this.isBoss ? 4.0 : 1.8, 0.22, 0.05);
    const bg = new THREE.Mesh(bgGeo, bgMat);
    barGroup.add(bg);

    const fillMat = new THREE.MeshBasicMaterial({ color: this.isBoss ? 0xd50000 : 0x00e676 });
    const fillGeo = new THREE.BoxGeometry(this.isBoss ? 3.9 : 1.7, 0.18, 0.06);
    this.hpBarFill = new THREE.Mesh(fillGeo, fillMat);
    barGroup.add(this.hpBarFill);

    this.mesh.add(barGroup);
    this.hpBarGroup = barGroup;
  }

  takeDamage(amount, isCrit = false) {
    if (this.isDead) return;

    if (this.type === 'dummy') {
      // Training Dummy gives simulator training exp
      this.game.stats.trainOnDummy();
      this.game.questSystem.onDummyHit();
      if (this.game.audio) this.game.audio.playHit(isCrit);

      // Wobble animation
      if (this.dummyBody) {
        this.dummyBody.rotation.z = (Math.random() - 0.5) * 0.4;
        setTimeout(() => {
          if (this.dummyBody) this.dummyBody.rotation.z = 0;
        }, 150);
      }
      return;
    }

    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.game.audio) this.game.audio.playHit(isCrit);

    // Update HP bar
    if (this.hpBarFill) {
      const pct = this.currentHp / this.maxHp;
      this.hpBarFill.scale.x = Math.max(0.001, pct);
      this.hpBarFill.position.x = -((1.0 - pct) * (this.isBoss ? 3.9 : 1.7) / 2);
    }

    // Boss HUD bar update
    if (this.isBoss && this.game.ui) {
      this.game.ui.updateBossHealth(this.currentHp, this.maxHp, this.name);

      // Enrage phase trigger (< 50% HP)
      if (this.currentHp < this.maxHp * 0.5 && !this.isEnraged) {
        this.isEnraged = true;
        if (this.bossSkinMat) this.bossSkinMat.color.set(0xff1744);
        if (this.game.audio) this.game.audio.playBossRoar();
        this.game.ui.showToast('🔥 [보스 분노!] 고르가르의 공격력이 2배로 폭증합니다!', 'red');
      }
    }

    if (this.currentHp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.state = 'dead';
    this.mesh.visible = false;
    if (this.telegraphCircle) this.telegraphCircle.visible = false;
    if (this.isBoss && this.game.ui) this.game.ui.hideBossHealth();

    if (this.game.audio) this.game.audio.playKill();

    // Reward player
    this.game.stats.addExp(this.expReward);
    this.game.stats.addGold(this.goldReward);

    // Drop items
    this.dropLoot();

    // Notify quest system
    this.game.questSystem.onMonsterKilled(this.type);

    this.respawnTimer = this.isBoss ? 20.0 : 8.0;
  }

  dropLoot() {
    // 50% chance for enhance stone
    if (Math.random() < 0.55) {
      this.game.inventory.addItem('enhance_stone', 1);
      this.game.ui?.showToast('💎 신비한 강화석 획득!', 'gold');
    }

    // 40% chance for potion
    if (Math.random() < 0.40) {
      this.game.inventory.addItem('hp_potion_s', 2);
    }

    // Boss special drop
    if (this.isBoss) {
      this.game.stats.addGems(60);
      this.game.inventory.addItem('legendary_egg', 1);
      this.game.inventory.addItem('dragon_slayer', 1);
      this.game.ui?.showToast('🎉 보스 격파! 전설의 대검 [드래곤 슬레이어] & [용 알] 획득!', 'rainbow');
    }
  }

  respawn() {
    this.isDead = false;
    this.currentHp = this.maxHp;
    this.isEnraged = false;
    if (this.bossSkinMat) this.bossSkinMat.color.set(0x880e4f);
    this.position.copy(this.spawnPos);
    this.mesh.position.copy(this.position);
    this.mesh.visible = true;
    this.state = 'idle';
    if (this.hpBarFill) {
      this.hpBarFill.scale.x = 1.0;
      this.hpBarFill.position.x = 0;
    }
  }

  update(delta) {
    if (this.isDead) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    if (this.type === 'dummy') return;

    // AI Logic
    const player = this.game.player;
    if (!player) return;

    const playerPos = player.getPosition();
    const distToPlayer = this.position.distanceTo(playerPos);

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Boss telegraph update
    if (this.isTelegraphing) {
      this.telegraphTimer -= delta;
      if (this.telegraphCircle) {
        this.telegraphCircle.position.copy(this.position);
        this.telegraphCircle.visible = true;
      }
      if (this.telegraphTimer <= 0) {
        // Execute Ground Slam Shockwave!
        this.isTelegraphing = false;
        if (this.telegraphCircle) this.telegraphCircle.visible = false;
        if (this.game.combat) this.game.combat.createBossShockwave(this.position);

        // Check if player in radius
        if (this.position.distanceTo(playerPos) < 7.5) {
          const dmg = this.isEnraged ? 85 : 50;
          this.game.stats.takeDamage(dmg);
          this.game.ui?.showToast(`💥 보스의 지면 강타 피격! -${dmg} HP`, 'red');
        }
      }
      return;
    }

    // Aggro Check
    if (distToPlayer < this.aggroRadius) {
      if (this.isBoss && this.game.ui) {
        this.game.ui.updateBossHealth(this.currentHp, this.maxHp, this.name);
      }

      // Rotate toward player
      const targetAngle = Math.atan2(playerPos.x - this.position.x, playerPos.z - this.position.z);
      this.rotation = THREE.MathUtils.lerp(this.rotation, targetAngle, delta * 5.0);

      if (distToPlayer <= this.attackRange) {
        // Attack Range
        if (this.attackCooldown <= 0) {
          this.performAttack(distToPlayer, playerPos);
        }
      } else {
        // Chase Player
        const speed = (this.isBoss ? (this.isEnraged ? 9.5 : 7.0) : 5.5);
        const dir = new THREE.Vector3(playerPos.x - this.position.x, 0, playerPos.z - this.position.z).normalize();
        this.position.add(dir.multiplyScalar(speed * delta));
      }
    } else {
      // Idle / Patrol back to spawn
      if (this.position.distanceTo(this.spawnPos) > 2.0) {
        const dir = new THREE.Vector3().subVectors(this.spawnPos, this.position).normalize();
        this.position.add(dir.multiplyScalar(3.0 * delta));
      }
    }

    // Update Mesh Transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Slime bouncy animation
    if (this.type === 'slime' && this.slimeBody) {
      const hop = Math.abs(Math.sin(this.game.time * 6.0));
      this.slimeBody.position.y = hop * 0.4;
      this.slimeBody.scale.set(1.0 + hop * 0.1, 1.0 - hop * 0.2, 1.0 + hop * 0.1);
    }
  }

  performAttack(distToPlayer, playerPos) {
    if (this.isBoss) {
      // Boss has 50% chance for ground slam telegraph
      if (Math.random() < 0.5) {
        this.isTelegraphing = true;
        this.telegraphTimer = 1.3;
        this.attackCooldown = 3.5;
        this.game.ui?.showToast('⚠️ [보스 경고!] 붉은 지면 강타 장판을 피하세요!', 'red');
        return;
      }
    }

    // Normal strike
    this.attackCooldown = this.isBoss ? 1.8 : 2.2;
    const dmg = this.isBoss ? (this.isEnraged ? 60 : 35) : this.atk;
    this.game.stats.takeDamage(dmg);
    this.game.ui?.showToast(`⚔️ ${this.name}의 공격! -${dmg} 피해!`, 'red');
  }
}

export class MonsterManager {
  constructor(game) {
    this.game = game;
    this.monsters = [];
    this.spawnAllMonsters();
  }

  spawnAllMonsters() {
    // 1. Training Dummies in town square
    this.monsters.push(new Monster(this.game, {
      type: 'dummy',
      name: '훈련용 허수아비',
      pos: [6, 0, 4]
    }));
    this.monsters.push(new Monster(this.game, {
      type: 'dummy',
      name: '훈련용 허수아비',
      pos: [-6, 0, 4]
    }));

    // 2. Slimes in Green Plains (x: 25~55, z: -25~25)
    const slimeSpawns = [
      [28, 0, 10], [35, 0, 18], [42, 0, 5], [30, 0, -15], [45, 0, -20], [52, 0, -5]
    ];
    slimeSpawns.forEach((pos, i) => {
      this.monsters.push(new Monster(this.game, {
        type: 'slime',
        name: `초록 슬라임 Lv.${1 + (i % 3)}`,
        level: 1 + (i % 3),
        hp: 90 + i * 20,
        atk: 10 + i * 2,
        exp: 40 + i * 10,
        gold: 35 + i * 5,
        pos: pos
      }));
    });

    // 3. Goblins in Whispering Forest (x: 45~80, z: 30~75)
    const goblinSpawns = [
      [50, 0, 35], [62, 0, 48], [75, 0, 40], [58, 0, 65], [72, 0, 70]
    ];
    goblinSpawns.forEach((pos, i) => {
      this.monsters.push(new Monster(this.game, {
        type: 'goblin',
        name: `고블린 도적 Lv.${5 + i}`,
        level: 5 + i,
        hp: 280 + i * 40,
        atk: 26 + i * 4,
        exp: 95 + i * 15,
        gold: 80 + i * 10,
        pos: pos
      }));
    });

    // 4. Skeletons in Crypt Ruins (x: -45~-75, z: 25~70)
    const skelSpawns = [
      [-48, 0, 32], [-60, 0, 45], [-72, 0, 38], [-55, 0, 62], [-68, 0, 68]
    ];
    skelSpawns.forEach((pos, i) => {
      this.monsters.push(new Monster(this.game, {
        type: 'skeleton',
        name: `해골 가디언 Lv.${9 + i}`,
        level: 9 + i,
        hp: 680 + i * 60,
        atk: 52 + i * 6,
        exp: 210 + i * 25,
        gold: 190 + i * 15,
        pos: pos
      }));
    });

    // 5. Golems in Volcanic Crags (x: -45~-75, z: -40~-75)
    const golemSpawns = [
      [-50, 0, -42], [-65, 0, -55], [-75, 0, -45], [-58, 0, -70]
    ];
    golemSpawns.forEach((pos, i) => {
      this.monsters.push(new Monster(this.game, {
        type: 'golem',
        name: `마그마 골렘 Lv.${15 + i}`,
        level: 15 + i,
        hp: 1700 + i * 150,
        atk: 105 + i * 10,
        exp: 520 + i * 40,
        gold: 420 + i * 30,
        pos: pos
      }));
    });

    // 6. World Boss Gorgar in Volcanic Altar (x: 0, z: -85)
    this.monsters.push(new Monster(this.game, {
      type: 'boss',
      name: '오크 제왕 고르가르 [WORLD BOSS]',
      level: 20,
      hp: 8500,
      atk: 180,
      exp: 7000,
      gold: 9000,
      pos: [0, 0, -85]
    }));
  }

  update(delta) {
    for (const mob of this.monsters) {
      mob.update(delta);
    }
  }
}
