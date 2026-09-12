// main.js - Master Game Initializer, Render Loop, and Interaction Handler
import * as THREE from 'three';
import { audio } from './audio/AudioEngine.js';
import { StatsSystem } from './systems/StatsSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { PetSystem } from './entities/Pet.js';
import { QuestSystem, QUEST_DATABASE, BOUNTY_LIST } from './systems/QuestSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { Player } from './entities/Player.js';
import { NPCManager } from './entities/NPC.js';
import { MonsterManager } from './entities/Monster.js';
import { World } from './world/World.js';
import { UIManager } from './ui/UIManager.js';
import { DevMode } from './dev/DevMode.js';

export class BlockQuestGame {
  constructor() {
    this.time = 0;
    this.clock = new THREE.Clock();

    this.initThree();
    this.initSystems();
    this.setupResize();
    this.startLoop();
  }

  initThree() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      console.error('Canvas #gameCanvas not found!');
      return;
    }

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  initSystems() {
    this.audio = audio;
    this.stats = new StatsSystem(this);
    this.inventory = new InventorySystem(this);
    this.petSystem = new PetSystem(this);
    this.questSystem = new QuestSystem(this);
    this.combat = new CombatSystem(this);

    // Build World & Entities
    this.world = new World(this);
    this.player = new Player(this);
    this.npcManager = new NPCManager(this);
    this.monsterManager = new MonsterManager(this);

    // Build UI & Dev Tools
    this.ui = new UIManager(this);
    this.devMode = new DevMode(this);

    // Initial Appearance Sync
    this.player.updateAppearance();
    this.stats.recalculate();
  }

  getQuestData(qId) {
    return QUEST_DATABASE[qId] || BOUNTY_LIST.find(b => b.id === qId);
  }

  interact() {
    if (!this.player) return;
    const playerPos = this.player.getPosition();

    // 1. Check NPC interaction
    const nearestNpc = this.npcManager.getNearestNPC(playerPos, 5.0);
    if (nearestNpc) {
      this.ui.openNpcDialogue(nearestNpc);
      return;
    }

    // 2. Check Mushroom Gathering
    const gathered = this.world.gatherMushroomNear(playerPos);
    if (gathered) return;
  }

  checkProximityPrompts() {
    if (!this.player || !this.ui) return;
    const playerPos = this.player.getPosition();

    // NPC Check
    const nearestNpc = this.npcManager.getNearestNPC(playerPos, 4.5);
    if (nearestNpc) {
      this.ui.showInteractPrompt(`[E] ${nearestNpc.name}와 대화하기`);
      return;
    }

    // Mushroom Check
    for (const m of this.world.mushrooms) {
      if (!m.isGathered && m.pos.distanceTo(playerPos) < 3.5) {
        this.ui.showInteractPrompt(`[E] 마법 버섯 채집하기`);
        return;
      }
    }

    this.ui.hideInteractPrompt();
  }

  setupResize() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.time += delta;

      // Update Subsystems
      if (this.player) this.player.update(delta);
      if (this.petSystem) this.petSystem.update(delta);
      if (this.npcManager) this.npcManager.update(delta);
      if (this.monsterManager) this.monsterManager.update(delta);
      if (this.combat) this.combat.update(delta);
      if (this.world) this.world.update(delta);
      if (this.devMode) this.devMode.update(delta);

      this.checkProximityPrompts();
      if (this.ui) this.ui.updateHud();

      // Render Scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    loop();
  }
}

// Immediate execution or on DOM ready
function bootstrap() {
  if (!window.game) {
    window.game = new BlockQuestGame();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
