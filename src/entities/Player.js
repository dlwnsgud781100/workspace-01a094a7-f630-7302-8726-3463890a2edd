// Player.js - Roblox-style 3D blocky avatar, animations, weapon attachment, and 3rd person camera
import * as THREE from 'three';
import { ITEM_DATABASE } from '../systems/InventorySystem.js';

export class Player {
  constructor(game) {
    this.game = game;

    // Movement state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.isGrounded = true;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDir = new THREE.Vector3();

    // Key inputs
    this.keys = {
      w: false, a: false, s: false, d: false,
      space: false, shift: false,
      f: false, '1': false, '2': false, '3': false, '4': false,
      q: false, e: false, i: false, c: false, j: false, b: false, p: false, u: false, r: false
    };

    // Camera orbit parameters
    this.cameraYaw = 0;
    this.cameraPitch = 0.35; // radians
    this.cameraDistance = 9.0;
    this.isPointerLocked = false;
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    // Animation state
    this.animTime = 0;
    this.actionState = 'idle'; // 'idle', 'walk', 'jump', 'attack1', 'attack2', 'attack3', 'whirlwind', 'cast'
    this.actionTimer = 0;
    this.comboIndex = 0;
    this.comboWindowTimer = 0;

    // 3D Model Hierarchy
    this.mesh = new THREE.Group();
    this.head = null;
    this.torso = null;
    this.leftArmPivot = null;
    this.rightArmPivot = null;
    this.leftLegPivot = null;
    this.rightLegPivot = null;
    this.weaponMesh = null;
    this.wingsMesh = null;
    this.helmetMesh = null;

    this.buildRobloxAvatar();
    this.setupControls();
    this.updateAppearance();
    this.updateCamera();
  }

  // Create canvas texture for cute Roblox classic smiling face
  createFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base skin color fill
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(0, 0, 256, 256);

    // Cute Anime / Roblox RPG Eyes
    ctx.fillStyle = '#212121';
    // Left eye
    ctx.beginPath();
    ctx.arc(80, 105, 26, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(176, 105, 26, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(74, 95, 10, 0, Math.PI * 2);
    ctx.arc(170, 95, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(88, 115, 5, 0, Math.PI * 2);
    ctx.arc(184, 115, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cute blush cheeks
    ctx.fillStyle = 'rgba(255, 100, 120, 0.45)';
    ctx.beginPath();
    ctx.arc(60, 135, 16, 0, Math.PI * 2);
    ctx.arc(196, 135, 16, 0, Math.PI * 2);
    ctx.fill();

    // Confident Happy Smile
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 140, 36, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  buildRobloxAvatar() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.6 });
    const faceTex = this.createFaceTexture();
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 });
    const headMats = [
      skinMat, skinMat, skinMat, skinMat, faceMat, skinMat // Front face has face texture
    ];

    // 1. Torso (1.6 x 2.0 x 0.8)
    const torsoGeo = new THREE.BoxGeometry(1.6, 2.0, 0.8);
    this.torsoMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.5 });
    this.torso = new THREE.Mesh(torsoGeo, this.torsoMat);
    this.torso.position.y = 2.0;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // 2. Head (1.2 x 1.2 x 1.2)
    const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    this.head = new THREE.Mesh(headGeo, headMats);
    this.head.position.y = 1.6;
    this.head.castShadow = true;
    this.torso.add(this.head);

    // Cool Hair
    const hairGeo = new THREE.BoxGeometry(1.3, 0.4, 1.3);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.55;
    this.head.add(hair);

    // 3. Left Arm Pivot & Mesh
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(1.15, 0.85, 0);
    this.torso.add(this.leftArmPivot);

    const armGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
    armGeo.translate(0, -0.75, 0);
    this.armMat = new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.6 });
    this.leftArm = new THREE.Mesh(armGeo, this.armMat);
    this.leftArm.castShadow = true;
    this.leftArmPivot.add(this.leftArm);

    // 4. Right Arm Pivot & Mesh
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(-1.15, 0.85, 0);
    this.torso.add(this.rightArmPivot);

    this.rightArm = new THREE.Mesh(armGeo, this.armMat);
    this.rightArm.castShadow = true;
    this.rightArmPivot.add(this.rightArm);

    // Weapon mount node at hand
    this.weaponMount = new THREE.Group();
    this.weaponMount.position.set(0, -1.45, 0.3);
    this.rightArmPivot.add(this.weaponMount);

    // 5. Left Leg Pivot & Mesh
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(0.45, -1.0, 0);
    this.torso.add(this.leftLegPivot);

    const legGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
    legGeo.translate(0, -0.85, 0);
    this.legMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 });
    this.leftLeg = new THREE.Mesh(legGeo, this.legMat);
    this.leftLeg.castShadow = true;
    this.leftLegPivot.add(this.leftLeg);

    // 6. Right Leg Pivot & Mesh
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(-0.45, -1.0, 0);
    this.torso.add(this.rightLegPivot);

    this.rightLeg = new THREE.Mesh(legGeo, this.legMat);
    this.rightLeg.castShadow = true;
    this.rightLegPivot.add(this.rightLeg);

    // Wings mount at back of torso
    this.wingsMount = new THREE.Group();
    this.wingsMount.position.set(0, 0.2, -0.45);
    this.torso.add(this.wingsMount);

    // Add player avatar to scene
    this.game.scene.add(this.mesh);
  }

  updateAppearance() {
    const equipped = this.game.inventory.equipped;

    // 1. Update Armor Colors
    if (equipped.armor) {
      const armDb = ITEM_DATABASE[equipped.armor.id];
      if (armDb) {
        this.torsoMat.color.set(armDb.color || '#1976d2');
      }
    } else {
      this.torsoMat.color.set(0x1976d2);
    }

    // 2. Update Weapon Mesh
    while (this.weaponMount.children.length > 0) {
      this.weaponMount.remove(this.weaponMount.children[0]);
    }

    if (equipped.weapon) {
      const wpnDb = ITEM_DATABASE[equipped.weapon.id];
      const upgradeLvl = equipped.weapon.upgradeLevel || 0;
      const wpnMesh = this.createWeaponModel(wpnDb, upgradeLvl);
      this.weaponMount.add(wpnMesh);
      this.weaponMesh = wpnMesh;
    } else {
      this.weaponMesh = null;
    }

    // 3. Update Wings Mesh
    while (this.wingsMount.children.length > 0) {
      this.wingsMount.remove(this.wingsMount.children[0]);
    }

    if (equipped.wings) {
      const wingDb = ITEM_DATABASE[equipped.wings.id];
      const wingsMesh = this.createWingsModel(wingDb);
      this.wingsMount.add(wingsMesh);
      this.wingsMesh = wingsMesh;
    } else {
      this.wingsMesh = null;
    }

    // 4. Update Helmet Mesh
    if (this.helmetMesh) {
      this.head.remove(this.helmetMesh);
      this.helmetMesh = null;
    }

    if (equipped.helmet) {
      const helmDb = ITEM_DATABASE[equipped.helmet.id];
      const helm = this.createHelmetModel(helmDb);
      this.head.add(helm);
      this.helmetMesh = helm;
    }
  }

  createWeaponModel(wpnDb, upgradeLvl) {
    const group = new THREE.Group();
    const bladeColor = new THREE.Color(wpnDb.color || 0xcccccc);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: bladeColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: bladeColor,
      emissiveIntensity: upgradeLvl >= 7 ? 0.6 : (upgradeLvl >= 4 ? 0.3 : 0.05)
    });

    const hiltMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.9, roughness: 0.2 });

    // Hilt
    const hiltGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = -0.2;
    group.add(hilt);

    // Crossguard
    const guardGeo = new THREE.BoxGeometry(0.55, 0.1, 0.16);
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 0.1;
    group.add(guard);

    // Blade
    let bladeLength = 1.6;
    let bladeWidth = 0.22;
    if (wpnDb.id === 'dragon_slayer' || wpnDb.id === 'frost_claymore') {
      bladeLength = 2.2;
      bladeWidth = 0.35;
    }

    const bladeGeo = new THREE.BoxGeometry(bladeWidth, bladeLength, 0.06);
    bladeGeo.translate(0, bladeLength / 2 + 0.1, 0);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    group.add(blade);

    // Tip point
    const tipGeo = new THREE.ConeGeometry(bladeWidth * 0.7, 0.4, 4);
    tipGeo.translate(0, bladeLength + 0.3, 0);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    group.add(tip);

    // Upgrade particle aura glow
    if (upgradeLvl >= 4) {
      const glowGeo = new THREE.CylinderGeometry(bladeWidth * 0.9, bladeWidth * 0.9, bladeLength, 8);
      glowGeo.translate(0, bladeLength / 2 + 0.1, 0);
      const glowColor = upgradeLvl >= 10 ? 0xff00ff : (upgradeLvl >= 7 ? 0x00e5ff : 0x76ff03);
      const glowMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.35,
        wireframe: true
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      group.add(glow);
    }

    group.rotation.x = Math.PI / 2;
    return group;
  }

  createWingsModel(wingDb) {
    const group = new THREE.Group();
    const wingColor = new THREE.Color(wingDb?.color || 0xffffff);
    const wingMat = new THREE.MeshStandardMaterial({
      color: wingColor,
      emissive: wingColor,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.8, 1.2);
    shape.lineTo(2.4, 0.6);
    shape.lineTo(1.6, -0.4);
    shape.lineTo(0, 0);

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.3, 0, 0);
    leftWing.rotation.y = -0.3;

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(-0.3, 0, 0);
    rightWing.scale.set(-1, 1, 1);
    rightWing.rotation.y = 0.3;

    group.add(leftWing, rightWing);
    this.wingMeshes = [leftWing, rightWing];
    return group;
  }

  createHelmetModel(helmDb) {
    const group = new THREE.Group();
    if (helmDb.id === 'viking_helm') {
      const helmMat = new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.8 });
      const capGeo = new THREE.CylinderGeometry(0.65, 0.68, 0.4, 8);
      const cap = new THREE.Mesh(capGeo, helmMat);
      cap.position.y = 0.6;
      group.add(cap);

      // Horns
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xfff9c4 });
      const hornGeo = new THREE.ConeGeometry(0.12, 0.6, 6);
      const hornL = new THREE.Mesh(hornGeo, hornMat);
      hornL.position.set(0.7, 0.7, 0);
      hornL.rotation.z = -0.7;
      const hornR = new THREE.Mesh(hornGeo, hornMat);
      hornR.position.set(-0.7, 0.7, 0);
      hornR.rotation.z = 0.7;
      group.add(hornL, hornR);
    } else if (helmDb.id === 'golden_crown') {
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
      const crownGeo = new THREE.CylinderGeometry(0.68, 0.64, 0.35, 8);
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 0.7;
      group.add(crown);
    } else {
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
      const capGeo = new THREE.BoxGeometry(1.28, 0.25, 1.28);
      const cap = new THREE.Mesh(capGeo, hatMat);
      cap.position.y = 0.65;
      group.add(cap);
    }
    return group;
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = true;
      }

      // Hotkeys for action / modals
      if (key === ' ' || key === 'space') {
        this.keys.space = true;
        this.jump();
      }
      if (key === 'f') {
        this.performAttack();
      }
      if (key === '1') {
        this.game?.combat?.castWhirlwind();
      }
      if (key === '2') {
        this.game?.combat?.castFireball();
      }
      if (key === '3') {
        this.game?.combat?.castHolyBeam();
      }
      if (key === '4') {
        this.dash();
      }
      if (key === 'q') {
        this.game?.inventory?.quickUseHpPotion();
      }
      if (key === 'e') {
        // Interact with nearest NPC or gather mushroom
        this.game?.interact();
      }
      if (key === 'i') {
        this.game?.ui?.toggleModal('inventoryModal');
      }
      if (key === 'c') {
        this.game?.ui?.toggleModal('statsModal');
      }
      if (key === 'j') {
        this.game?.ui?.toggleModal('questModal');
      }
      if (key === 'b') {
        this.game?.ui?.toggleModal('shopModal');
      }
      if (key === 'p') {
        this.game?.ui?.toggleModal('petModal');
      }
      if (key === 'u') {
        this.game?.ui?.toggleModal('upgradeModal');
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = false;
      }
      if (key === ' ' || key === 'space') {
        this.keys.space = false;
      }
    });

    let mouseDownX = 0;
    let mouseDownY = 0;
    let mouseMoved = false;

    // Mouse drag for smooth 3rd person orbit
    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'CANVAS' || e.target.id === 'gameContainer') {
        if (e.button === 0) { // Left click
          this.isMouseDown = true;
          mouseDownX = e.clientX;
          mouseDownY = e.clientY;
          mouseMoved = false;
          this.prevMouseX = e.clientX;
          this.prevMouseY = e.clientY;
        } else if (e.button === 2) { // Right click drag
          this.isRightMouseDown = true;
          this.prevMouseX = e.clientX;
          this.prevMouseY = e.clientY;
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isMouseDown && e.button === 0) {
        if (!mouseMoved) {
          this.performAttack();
        }
      }
      this.isMouseDown = false;
      this.isRightMouseDown = false;
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown || this.isRightMouseDown) {
        const deltaX = e.clientX - this.prevMouseX;
        const deltaY = e.clientY - this.prevMouseY;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;

        if (Math.abs(e.clientX - mouseDownX) > 4 || Math.abs(e.clientY - mouseDownY) > 4) {
          mouseMoved = true;
        }

        this.cameraYaw -= deltaX * 0.005;
        this.cameraPitch = Math.max(-0.2, Math.min(1.2, this.cameraPitch + deltaY * 0.005));
      }
    });

    window.addEventListener('blur', () => {
      for (const k of Object.keys(this.keys)) {
        this.keys[k] = false;
      }
      this.isMouseDown = false;
      this.isRightMouseDown = false;
    });

    // Zoom
    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(3.5, Math.min(18.0, this.cameraDistance + e.deltaY * 0.006));
    });
  }

  jump() {
    if (this.isGrounded && this.actionState !== 'whirlwind') {
      this.velocity.y = 12.0;
      this.isGrounded = false;
      this.actionState = 'jump';
      if (this.game?.audio) this.game.audio.playAttack();
    }
  }

  dash() {
    if (this.isDashing) return;
    if (this.game.stats.currentMp < 15) {
      this.game?.ui?.showToast('마나가 부족합니다! (필요 MP: 15)', 'blue');
      return;
    }
    this.game.stats.spendMp(15);
    this.isDashing = true;
    this.dashTimer = 0.28;

    // Dash forward in looking direction
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    this.dashDir.copy(forward).normalize();

    if (this.game?.audio) this.game.audio.playSkillDash();
    if (this.game?.combat) this.game.combat.createDashTrail(this.position);
    this.actionState = 'dash';
  }

  performAttack() {
    if (this.actionState === 'attack1' || this.actionState === 'attack2' || this.actionState === 'attack3' || this.actionState === 'whirlwind') {
      return;
    }

    if (this.comboWindowTimer > 0) {
      this.comboIndex = (this.comboIndex + 1) % 3;
    } else {
      this.comboIndex = 0;
    }

    this.comboWindowTimer = 1.2;
    this.actionState = `attack${this.comboIndex + 1}`;
    this.actionTimer = 0.35;

    // Trigger Combat System Hit Check
    if (this.game?.combat) {
      this.game.combat.playerAttackCombo(this.comboIndex + 1);
    }
  }

  teleportToTown() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
  }

  getPosition() {
    return this.position;
  }

  update(delta) {
    this.animTime += delta;

    // Combo timer
    if (this.comboWindowTimer > 0) {
      this.comboWindowTimer -= delta;
      if (this.comboWindowTimer <= 0) {
        this.comboIndex = 0;
      }
    }

    // Action timer
    if (this.actionTimer > 0) {
      this.actionTimer -= delta;
      if (this.actionTimer <= 0) {
        if (['attack1', 'attack2', 'attack3', 'whirlwind', 'cast', 'dash'].includes(this.actionState)) {
          this.actionState = 'idle';
        }
      }
    }

    // Dashing
    if (this.isDashing) {
      this.dashTimer -= delta;
      const dashSpeed = 32.0;
      this.position.x += this.dashDir.x * dashSpeed * delta;
      this.position.z += this.dashDir.z * dashSpeed * delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.actionState = 'idle';
      }
    } else {
      // Movement Calculation
      const moveVec = new THREE.Vector3();
      if (this.keys.w) moveVec.z += 1;
      if (this.keys.s) moveVec.z -= 1;
      if (this.keys.a) moveVec.x += 1;
      if (this.keys.d) moveVec.x -= 1;

      const isMoving = moveVec.lengthSq() > 0.01;

      if (isMoving && this.actionState !== 'whirlwind') {
        moveVec.normalize();
        // Rotate movement vector according to camera yaw
        moveVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

        const sprintMultiplier = this.keys.shift ? 1.45 : 1.0;
        let currentSpeed = (this.game.stats.moveSpeed || 14) * sprintMultiplier;
        if (this.game?.devMode?.speedHack) {
          currentSpeed *= 2.5;
        }

        this.position.x += moveVec.x * currentSpeed * delta;
        this.position.z += moveVec.z * currentSpeed * delta;

        // Smoothly rotate player toward movement direction
        const targetAngle = Math.atan2(moveVec.x, moveVec.z);
        // Angle interpolation
        let diff = targetAngle - this.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.rotation += diff * Math.min(1.0, delta * 14.0);

        if (this.isGrounded && !this.actionState.startsWith('attack')) {
          this.actionState = 'walk';
        }
      } else if (this.isGrounded && !this.actionState.startsWith('attack') && this.actionState !== 'whirlwind' && this.actionState !== 'cast') {
        this.actionState = 'idle';
      }
    }

    // Gravity & Ground Collision
    const gravity = -32.0;
    this.velocity.y += gravity * delta;
    this.position.y += this.velocity.y * delta;

    // Simple terrain height check (or world collision)
    const groundHeight = 0;
    if (this.position.y <= groundHeight) {
      this.position.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.actionState === 'jump') {
        this.actionState = 'idle';
      }
    }

    // World Boundary Clamp
    const worldRadius = 140;
    const distSq = this.position.x * this.position.x + this.position.z * this.position.z;
    if (distSq > worldRadius * worldRadius) {
      const angle = Math.atan2(this.position.z, this.position.x);
      this.position.x = Math.cos(angle) * worldRadius;
      this.position.z = Math.sin(angle) * worldRadius;
    }

    // Update Avatar Mesh Transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Animate Limbs & Avatar Parts
    this.updateAnimations(delta);

    // Update 3rd Person Camera
    this.updateCamera();
  }

  updateAnimations(delta) {
    const sprintSpeed = this.keys.shift ? 14.0 : 10.0;
    const t = this.animTime * sprintSpeed;

    // Reset default pivots
    let leftArmRotX = 0;
    let rightArmRotX = 0;
    let leftArmRotZ = 0;
    let rightArmRotZ = 0;
    let leftLegRotX = 0;
    let rightLegRotX = 0;
    let torsoBobY = 2.0;

    if (this.actionState === 'idle') {
      const breath = Math.sin(this.animTime * 2.5);
      torsoBobY = 2.0 + breath * 0.04;
      leftArmRotX = breath * 0.05;
      rightArmRotX = -breath * 0.05;
      this.head.rotation.y = Math.sin(this.animTime * 0.8) * 0.08;
    } else if (this.actionState === 'walk') {
      const swing = Math.sin(t);
      leftArmRotX = -swing * 0.85;
      rightArmRotX = swing * 0.85;
      leftLegRotX = swing * 0.95;
      rightLegRotX = -swing * 0.95;
      torsoBobY = 2.0 + Math.abs(Math.sin(t * 2)) * 0.12;
      this.head.rotation.y = -swing * 0.1;
    } else if (this.actionState === 'jump') {
      leftArmRotX = -1.2;
      rightArmRotX = -1.2;
      leftArmRotZ = 0.4;
      rightArmRotZ = -0.4;
      leftLegRotX = 0.5;
      rightLegRotX = -0.3;
    } else if (this.actionState === 'attack1') {
      // Slash 1: downward slash
      const progress = 1.0 - (this.actionTimer / 0.35);
      rightArmRotX = THREE.MathUtils.lerp(-1.8, 1.2, progress);
      rightArmRotZ = THREE.MathUtils.lerp(0.5, -0.6, progress);
      this.torso.rotation.y = THREE.MathUtils.lerp(-0.4, 0.4, progress);
    } else if (this.actionState === 'attack2') {
      // Slash 2: horizontal swipe
      const progress = 1.0 - (this.actionTimer / 0.35);
      rightArmRotX = THREE.MathUtils.lerp(0.8, -0.8, progress);
      rightArmRotZ = THREE.MathUtils.lerp(-1.2, 0.8, progress);
      this.torso.rotation.y = THREE.MathUtils.lerp(0.5, -0.5, progress);
    } else if (this.actionState === 'attack3') {
      // Slash 3: heavy jump slam
      const progress = 1.0 - (this.actionTimer / 0.4);
      rightArmRotX = THREE.MathUtils.lerp(-2.2, 1.5, progress);
      leftArmRotX = THREE.MathUtils.lerp(-2.2, 1.5, progress);
    } else if (this.actionState === 'whirlwind') {
      this.mesh.rotation.y += delta * 25.0; // spin fast!
      rightArmRotZ = 1.4;
      leftArmRotZ = -1.4;
    }

    // Apply limb rotations smoothly
    this.torso.position.y = torsoBobY;
    if (this.actionState !== 'attack1' && this.actionState !== 'attack2') {
      this.torso.rotation.y = 0;
    }

    this.leftArmPivot.rotation.set(leftArmRotX, 0, leftArmRotZ);
    this.rightArmPivot.rotation.set(rightArmRotX, 0, rightArmRotZ);
    this.leftLegPivot.rotation.set(leftLegRotX, 0, 0);
    this.rightLegPivot.rotation.set(rightLegRotX, 0, 0);

    // Flap wings gently if equipped
    if (this.wingMeshes && this.wingMeshes.length === 2) {
      const flap = Math.sin(this.animTime * 6.0) * 0.25;
      this.wingMeshes[0].rotation.y = -0.3 + flap;
      this.wingMeshes[1].rotation.y = 0.3 - flap;
    }
  }

  updateCamera() {
    const cam = this.game.camera;
    if (!cam) return;

    // Calculate camera position based on yaw, pitch, and distance
    const lookTarget = this.position.clone().add(new THREE.Vector3(0, 2.2, 0));

    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const camX = lookTarget.x - Math.sin(this.cameraYaw) * horizontalDist;
    const camZ = lookTarget.z - Math.cos(this.cameraYaw) * horizontalDist;
    const camY = Math.max(0.5, lookTarget.y + verticalDist);

    cam.position.set(camX, camY, camZ);
    cam.lookAt(lookTarget);
  }
}
