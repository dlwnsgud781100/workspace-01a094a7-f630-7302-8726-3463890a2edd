// CombatSystem.js - Skills, projectiles, hitboxes, particle VFX, and floating damage numbers
import * as THREE from 'three';

export class CombatSystem {
  constructor(game) {
    this.game = game;

    // Cooldowns
    this.cooldowns = {
      whirlwind: 0,
      fireball: 0,
      holyBeam: 0,
      dash: 0
    };
    this.maxCooldowns = {
      whirlwind: 4.0,
      fireball: 5.0,
      holyBeam: 8.0,
      dash: 1.5
    };

    // Active projectiles
    this.projectiles = [];
    // Active particles
    this.particles = [];

    // Floating text container in DOM
    this.createDamageTextContainer();
  }

  createDamageTextContainer() {
    let container = document.getElementById('damageContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'damageContainer';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.overflow = 'hidden';
      container.style.zIndex = '50';
      document.body.appendChild(container);
    }
    this.damageContainer = container;
  }

  spawnDamageNumber(worldPos, damage, isCrit = false, isHeal = false) {
    if (!this.damageContainer || !this.game.camera) return;

    // Project 3D position to 2D screen coordinate
    const pos = worldPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 2.2, (Math.random() - 0.5) * 0.8));
    const elem = document.createElement('div');
    elem.className = `floating-dmg ${isCrit ? 'crit' : ''} ${isHeal ? 'heal' : ''}`;
    elem.textContent = isHeal ? `+${damage}` : `${damage}${isCrit ? '!' : ''}`;

    this.damageContainer.appendChild(elem);

    const updateScreenPos = () => {
      const p = pos.clone().project(this.game.camera);
      const x = (p.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(p.y * 0.5) + 0.5) * window.innerHeight;
      elem.style.left = `${x}px`;
      elem.style.top = `${y}px`;
    };
    updateScreenPos();

    let start = performance.now();
    const duration = isCrit ? 1000 : 800;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = elapsed / duration;
      if (progress >= 1.0) {
        elem.remove();
      } else {
        pos.y += 0.04;
        updateScreenPos();
        elem.style.opacity = `${1.0 - Math.pow(progress, 2)}`;
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  // Player Basic Combo Attack
  playerAttackCombo(comboStep) {
    const player = this.game.player;
    if (!player) return;

    const stats = this.game.stats;
    const playerPos = player.getPosition();
    const playerRot = player.rotation;

    if (this.game.audio) this.game.audio.playAttack();

    // Damage multiplier per combo step (100%, 120%, 160%)
    const comboMult = comboStep === 1 ? 1.0 : (comboStep === 2 ? 1.25 : 1.6);
    const isCrit = Math.random() < stats.critRate;
    let baseDamage = Math.round(stats.totalAtk * comboMult * (isCrit ? stats.critDmg : 1.0));
    if (this.game?.devMode?.instaKill) {
      baseDamage = 999999;
    }

    // Hit check in frontal cone (range 3.8m, angle 120 deg)
    const attackRange = comboStep === 3 ? 4.5 : 3.8;
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRot);

    let hitCount = 0;
    for (const mob of this.game.monsterManager.monsters) {
      if (mob.isDead) continue;
      const toMob = new THREE.Vector3().subVectors(mob.position, playerPos);
      toMob.y = 0;
      const dist = toMob.length();

      if (dist <= attackRange) {
        toMob.normalize();
        const dot = forward.dot(toMob);
        if (dot > 0.35 || dist < 1.8) { // Frontal arc
          const finalDmg = Math.max(1, baseDamage + Math.floor((Math.random() - 0.5) * 6));
          mob.takeDamage(finalDmg, isCrit);
          this.spawnDamageNumber(mob.position, finalDmg, isCrit);
          this.createHitSpark(mob.position, isCrit ? 0xffd700 : 0xffffff);
          hitCount++;
        }
      }
    }

    // Camera micro-shake on impact
    if (hitCount > 0) {
      this.triggerCameraShake(isCrit ? 0.25 : 0.12);
    }
  }

  // Skill 1: Whirlwind Slash [1]
  castWhirlwind() {
    if (this.cooldowns.whirlwind > 0) return;
    const stats = this.game.stats;
    if (stats.currentMp < 20) {
      this.game.ui?.showToast('마나가 부족합니다! (필요 MP: 20)', 'blue');
      return;
    }

    stats.spendMp(20);
    const cdReduction = stats.cooldownReduction || 0;
    this.cooldowns.whirlwind = this.maxCooldowns.whirlwind * (1.0 - cdReduction);

    const player = this.game.player;
    player.actionState = 'whirlwind';
    player.actionTimer = 0.55;

    if (this.game.audio) this.game.audio.playSkillWhirlwind();

    // Spawn Whirlwind Tornado Particle Ring
    this.createWhirlwindVFX(player.getPosition());

    // Hit all enemies in 6.0m radius
    setTimeout(() => {
      const playerPos = player.getPosition();
      for (const mob of this.game.monsterManager.monsters) {
        if (mob.isDead) continue;
        const dist = mob.position.distanceTo(playerPos);
        if (dist <= 6.2) {
          const isCrit = Math.random() < stats.critRate;
          let dmg = Math.round(stats.totalAtk * 2.2 * (isCrit ? stats.critDmg : 1.0));
          if (this.game?.devMode?.instaKill) dmg = 999999;
          mob.takeDamage(dmg, isCrit);
          this.spawnDamageNumber(mob.position, dmg, isCrit);
          this.createHitSpark(mob.position, 0x00e5ff);
        }
      }
    }, 150);

    this.game.ui?.updateHud();
  }

  // Skill 2: Fireball Burst [2]
  castFireball() {
    if (this.cooldowns.fireball > 0) return;
    const stats = this.game.stats;
    if (stats.currentMp < 30) {
      this.game.ui?.showToast('마나가 부족합니다! (필요 MP: 30)', 'blue');
      return;
    }

    stats.spendMp(30);
    const cdReduction = stats.cooldownReduction || 0;
    this.cooldowns.fireball = this.maxCooldowns.fireball * (1.0 - cdReduction);

    const player = this.game.player;
    player.actionState = 'cast';
    player.actionTimer = 0.3;

    if (this.game.audio) this.game.audio.playSkillFireball();

    // Spawn flying 3D Fireball
    const playerPos = player.getPosition();
    const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation).normalize();
    const spawnPos = playerPos.clone().add(new THREE.Vector3(0, 1.8, 0)).add(dir.clone().multiplyScalar(1.2));

    const fbGeo = new THREE.SphereGeometry(0.5, 12, 12);
    const fbMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
    const fbMesh = new THREE.Mesh(fbGeo, fbMat);
    fbMesh.position.copy(spawnPos);
    this.game.scene.add(fbMesh);

    this.projectiles.push({
      mesh: fbMesh,
      velocity: dir.clone().multiplyScalar(28.0),
      lifetime: 1.8,
      damage: Math.round(stats.totalAtk * 3.2),
      radius: 4.8
    });

    this.game.ui?.updateHud();
  }

  // Skill 3: Holy Beam / Meteor Strike [3]
  castHolyBeam() {
    if (this.cooldowns.holyBeam > 0) return;
    const stats = this.game.stats;
    if (stats.currentMp < 45) {
      this.game.ui?.showToast('마나가 부족합니다! (필요 MP: 45)', 'blue');
      return;
    }

    stats.spendMp(45);
    const cdReduction = stats.cooldownReduction || 0;
    this.cooldowns.holyBeam = this.maxCooldowns.holyBeam * (1.0 - cdReduction);

    const player = this.game.player;
    player.actionState = 'cast';
    player.actionTimer = 0.4;

    if (this.game.audio) this.game.audio.playSkillHoly();

    const playerPos = player.getPosition();

    // Spawn Golden Divine Light Pillar
    const pillarGeo = new THREE.CylinderGeometry(4.0, 4.0, 30.0, 16);
    pillarGeo.translate(0, 15.0, 0);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.copy(playerPos);
    this.game.scene.add(pillar);

    // Fade out light pillar
    this.particles.push({
      mesh: pillar,
      type: 'fade_pillar',
      lifetime: 0.7,
      maxLifetime: 0.7
    });

    // Heal player for 35% max HP
    const healVal = Math.round(stats.maxHp * 0.35);
    stats.heal(healVal);
    this.spawnDamageNumber(playerPos, healVal, false, true);

    // Hit all enemies in 8.5m radius
    for (const mob of this.game.monsterManager.monsters) {
      if (mob.isDead) continue;
      const dist = mob.position.distanceTo(playerPos);
      if (dist <= 8.5) {
        const isCrit = true;
        const dmg = Math.round(stats.totalAtk * 4.5 * stats.critDmg);
        mob.takeDamage(dmg, isCrit);
        this.spawnDamageNumber(mob.position, dmg, isCrit);
        this.createHitSpark(mob.position, 0xffeb3b);
      }
    }

    this.triggerCameraShake(0.35);
    this.game.ui?.updateHud();
  }

  // Visual Effects Helpers
  createHitSpark(pos, colorHex = 0xffeb3b) {
    for (let i = 0; i < 6; i++) {
      const sparkGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const sparkMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.copy(pos).add(new THREE.Vector3(0, 1.5, 0));
      this.game.scene.add(spark);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 10
      );

      this.particles.push({
        mesh: spark,
        velocity: vel,
        type: 'spark',
        lifetime: 0.35,
        maxLifetime: 0.35
      });
    }
  }

  createWhirlwindVFX(pos) {
    const ringGeo = new THREE.TorusGeometry(3.5, 0.2, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos).add(new THREE.Vector3(0, 1.2, 0));
    this.game.scene.add(ring);

    this.particles.push({
      mesh: ring,
      type: 'whirlwind_ring',
      lifetime: 0.5,
      maxLifetime: 0.5
    });
  }

  createDashTrail(pos) {
    const ghostGeo = new THREE.BoxGeometry(1.6, 2.0, 0.8);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5 });
    const ghost = new THREE.Mesh(ghostGeo, ghostMat);
    ghost.position.copy(pos).add(new THREE.Vector3(0, 2.0, 0));
    this.game.scene.add(ghost);

    this.particles.push({
      mesh: ghost,
      type: 'fade',
      lifetime: 0.25,
      maxLifetime: 0.25
    });
  }

  createBossShockwave(pos) {
    const ringGeo = new THREE.RingGeometry(0.5, 8.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos).add(new THREE.Vector3(0, 0.1, 0));
    this.game.scene.add(ring);

    this.particles.push({
      mesh: ring,
      type: 'shockwave',
      lifetime: 0.6,
      maxLifetime: 0.6
    });

    this.triggerCameraShake(0.4);
  }

  triggerCameraShake(intensity = 0.2) {
    if (!this.game.camera) return;
    const origY = this.game.camera.position.y;
    this.game.camera.position.y += (Math.random() - 0.5) * intensity;
  }

  update(delta) {
    // Cooldown updates
    for (const k of Object.keys(this.cooldowns)) {
      if (this.cooldowns[k] > 0) {
        this.cooldowns[k] = Math.max(0, this.cooldowns[k] - delta);
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime -= delta;
      proj.mesh.position.add(proj.velocity.clone().multiplyScalar(delta));

      // Check mob collision
      let exploded = false;
      for (const mob of this.game.monsterManager.monsters) {
        if (mob.isDead) continue;
        if (proj.mesh.position.distanceTo(mob.position) < 2.0) {
          exploded = true;
          break;
        }
      }

      if (exploded || proj.lifetime <= 0) {
        // AoE Explosion
        const expPos = proj.mesh.position;
        for (const mob of this.game.monsterManager.monsters) {
          if (mob.isDead) continue;
          const d = mob.position.distanceTo(expPos);
          if (d <= proj.radius) {
            mob.takeDamage(proj.damage);
            this.spawnDamageNumber(mob.position, proj.damage);
            this.createHitSpark(mob.position, 0xff5722);
          }
        }

        this.game.scene.remove(proj.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.lifetime -= delta;
      const prog = part.lifetime / part.maxLifetime;

      if (part.type === 'spark') {
        part.velocity.y -= 25.0 * delta; // gravity
        part.mesh.position.add(part.velocity.clone().multiplyScalar(delta));
      } else if (part.type === 'whirlwind_ring') {
        part.mesh.rotation.z += delta * 15.0;
        part.mesh.scale.multiplyScalar(1.0 + delta * 3.0);
        part.mesh.material.opacity = prog * 0.8;
      } else if (part.type === 'fade_pillar' || part.type === 'fade' || part.type === 'shockwave') {
        part.mesh.material.opacity = prog * 0.8;
        if (part.type === 'shockwave') {
          part.mesh.scale.multiplyScalar(1.0 + delta * 2.5);
        }
      }

      if (part.lifetime <= 0) {
        this.game.scene.remove(part.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}
