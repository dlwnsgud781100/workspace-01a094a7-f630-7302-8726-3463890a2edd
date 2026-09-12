// DevMode.js - Advanced In-Game Developer Tools, Real-Time Diagnostics, Cheats & Teleportation
import * as THREE from 'three';
import { ITEM_DATABASE } from '../systems/InventorySystem.js';
import { PET_DATABASE } from '../entities/Pet.js';
import { QUEST_DATABASE } from '../systems/QuestSystem.js';

export class DevMode {
  constructor(game) {
    this.game = game;
    this.enabled = false;
    this.godMode = false;
    this.speedHack = false;
    this.instaKill = false;
    this.wireframeMode = false;
    this.showHitboxes = false;

    // Performance tracking
    this.fps = 60;
    this.frames = 0;
    this.lastTime = performance.now();
    this.drawCalls = 0;
    this.triangles = 0;

    // Log history
    this.logs = [];

    this.initDevUI();
    this.setupKeybindings();
    this.log('🚀 개발자 모드(DevMode) 시스템이 초기화되었습니다. [F2] 또는 상단 [🛠️ 개발자 모드] 클릭!');
  }

  log(msg, category = 'system') {
    const timeStr = new Date().toLocaleTimeString();
    this.logs.unshift({ time: timeStr, msg, category });
    if (this.logs.length > 50) this.logs.pop();
    this.updateLogUI();
  }

  setupKeybindings() {
    window.addEventListener('keydown', (e) => {
      // Toggle Dev mode with F2 or ~ (` / tilde)
      if (e.key === 'F2' || e.key === '`' || e.key === '~') {
        e.preventDefault();
        this.toggleDevMode();
      }
    });
  }

  toggleDevMode() {
    this.enabled = !this.enabled;
    const panel = document.getElementById('devModePanel');
    const toggleBtn = document.getElementById('btnDevModeToggle');
    if (panel) {
      panel.style.display = this.enabled ? 'flex' : 'none';
      if (this.enabled) this.renderActiveTab();
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', this.enabled);
    }
    this.game?.ui?.showToast(
      this.enabled ? '🛠️ 개발자 모드 활성화됨 [F2]' : '🛠️ 개발자 모드 닫힘',
      this.enabled ? 'gold' : 'normal'
    );
  }

  initDevUI() {
    // 1. Top HUD Dev Toggle Button
    const topNav = document.querySelector('.hud-top-right');
    if (topNav) {
      const devBtn = document.createElement('button');
      devBtn.id = 'btnDevModeToggle';
      devBtn.className = 'hud-btn glass-panel dev-btn';
      devBtn.innerHTML = '🛠️ DEV 모드';
      devBtn.title = '개발자 모드 & 실시간 진단 [F2]';
      devBtn.onclick = () => this.toggleDevMode();
      topNav.appendChild(devBtn);
    }

    // 2. Dev Mode Master Window
    const devWindow = document.createElement('div');
    devWindow.id = 'devModePanel';
    devWindow.className = 'glass-panel dev-window';
    devWindow.style.display = 'none';

    devWindow.innerHTML = `
      <div class="dev-header">
        <div class="dev-title">
          <span class="dev-badge">DEV TOOL</span>
          <h3>개발자 모드 & 실시간 진단 콘솔</h3>
        </div>
        <div class="dev-quick-stats">
          <span class="stat-pill" id="devFpsText">FPS: 60</span>
          <span class="stat-pill" id="devDrawCallsText">Calls: 0</span>
        </div>
        <button class="modal-close-btn" id="btnCloseDev">✕</button>
      </div>

      <!-- Dev Tabs -->
      <div class="dev-tabs">
        <button class="dev-tab active" data-tab="tabDiagnostics">📊 실시간 진단</button>
        <button class="dev-tab" data-tab="tabCheats">⚡ 치트 & 테스트 툴</button>
        <button class="dev-tab" data-tab="tabTeleport">📍 맵 텔레포트</button>
        <button class="dev-tab" data-tab="tabQuests">📜 퀘스트 디버거</button>
        <button class="dev-tab" data-tab="tabMonsters">👾 몬스터 AI 모니터</button>
        <button class="dev-tab" data-tab="tabLogs">📋 시스템 콘솔 로그</button>
      </div>

      <!-- Dev Content Area -->
      <div class="dev-body" id="devContent">
        <!-- Tab contents rendered dynamically -->
      </div>
    `;

    document.body.appendChild(devWindow);

    document.getElementById('btnCloseDev').onclick = () => this.toggleDevMode();

    // Tab switching
    devWindow.querySelectorAll('.dev-tab').forEach(tab => {
      tab.onclick = () => {
        devWindow.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderActiveTab();
      };
    });
  }

  renderActiveTab() {
    const activeTab = document.querySelector('.dev-tab.active')?.getAttribute('data-tab') || 'tabDiagnostics';
    const container = document.getElementById('devContent');
    if (!container) return;

    if (activeTab === 'tabDiagnostics') {
      this.renderDiagnosticsTab(container);
    } else if (activeTab === 'tabCheats') {
      this.renderCheatsTab(container);
    } else if (activeTab === 'tabTeleport') {
      this.renderTeleportTab(container);
    } else if (activeTab === 'tabQuests') {
      this.renderQuestDebuggerTab(container);
    } else if (activeTab === 'tabMonsters') {
      this.renderMonstersTab(container);
    } else if (activeTab === 'tabLogs') {
      this.renderLogsTab(container);
    }
  }

  // --- TAB 1: DIAGNOSTICS ---
  renderDiagnosticsTab(container) {
    const player = this.game.player;
    const pPos = player ? player.getPosition() : { x: 0, y: 0, z: 0 };
    const stats = this.game.stats;
    const renderer = this.game.renderer;
    const info = renderer ? renderer.info : { render: { calls: 0, triangles: 0 }, memory: { geometries: 0, textures: 0 } };

    container.innerHTML = `
      <div class="diag-grid">
        <div class="diag-card">
          <h4>🚀 렌더링 & 성능 지표</h4>
          <div class="diag-item"><span>실시간 FPS:</span><strong id="diagFpsVal" style="color:#00e676;">${this.fps} FPS</strong></div>
          <div class="diag-item"><span>Draw Calls:</span><strong>${info.render.calls} calls</strong></div>
          <div class="diag-item"><span>Triangles:</span><strong>${info.render.triangles.toLocaleString()}</strong></div>
          <div class="diag-item"><span>메모리 지오메트리:</span><strong>${info.memory.geometries} 개</strong></div>
          <div class="diag-item"><span>메모리 텍스처:</span><strong>${info.memory.textures} 개</strong></div>
        </div>

        <div class="diag-card">
          <h4>🧑‍🚀 플레이어 실시간 상태</h4>
          <div class="diag-item"><span>현재 위치 (X, Y, Z):</span><strong>(${pPos.x.toFixed(1)}, ${pPos.y.toFixed(1)}, ${pPos.z.toFixed(1)})</strong></div>
          <div class="diag-item"><span>동작 상태 (ActionState):</span><strong style="color:#00e5ff;">${player?.actionState || 'idle'}</strong></div>
          <div class="diag-item"><span>체력 / 최대 HP:</span><strong>${stats.currentHp} / ${stats.maxHp}</strong></div>
          <div class="diag-item"><span>마나 / 최대 MP:</span><strong>${stats.currentMp} / ${stats.maxMp}</strong></div>
          <div class="diag-item"><span>공격력 / 방어력:</span><strong>${stats.totalAtk} / ${stats.totalDef}</strong></div>
          <div class="diag-item"><span>이동 속도 / 치명타율:</span><strong>${stats.moveSpeed.toFixed(1)} / ${(stats.critRate * 100).toFixed(0)}%</strong></div>
        </div>

        <div class="diag-card">
          <h4>🌍 월드 & 오브젝트 통계</h4>
          <div class="diag-item"><span>스폰된 몬스터 수:</span><strong>${this.game.monsterManager?.monsters.length || 0} 마리</strong></div>
          <div class="diag-item"><span>마을 NPC 수:</span><strong>${this.game.npcManager?.npcs.length || 0} 명</strong></div>
          <div class="diag-item"><span>활성 투사체 (Projectiles):</span><strong>${this.game.combat?.projectiles.length || 0} 개</strong></div>
          <div class="diag-item"><span>활성 VFX 파티클:</span><strong>${this.game.combat?.particles.length || 0} 개</strong></div>
          <div class="diag-item"><span>채집 버섯 개수:</span><strong>${this.game.world?.mushrooms.length || 0} 개</strong></div>
        </div>
      </div>
    `;
  }

  // --- TAB 2: CHEATS & TESTING ---
  renderCheatsTab(container) {
    container.innerHTML = `
      <div class="cheats-container">
        <div class="cheat-toggles-row">
          <button class="cheat-toggle-btn ${this.godMode ? 'active' : ''}" id="btnToggleGod">
            🛡️ 무적 모드 (God Mode): <strong>${this.godMode ? 'ON' : 'OFF'}</strong>
          </button>
          <button class="cheat-toggle-btn ${this.speedHack ? 'active' : ''}" id="btnToggleSpeed">
            ⚡ 이속 2.5배 부스트: <strong>${this.speedHack ? 'ON' : 'OFF'}</strong>
          </button>
          <button class="cheat-toggle-btn ${this.instaKill ? 'active' : ''}" id="btnToggleInstaKill">
            💥 원펀맨 (Insta-Kill): <strong>${this.instaKill ? 'ON' : 'OFF'}</strong>
          </button>
          <button class="cheat-toggle-btn ${this.wireframeMode ? 'active' : ''}" id="btnToggleWireframe">
            🌐 와이어프레임 렌더링: <strong>${this.wireframeMode ? 'ON' : 'OFF'}</strong>
          </button>
        </div>

        <div class="cheat-action-groups">
          <div class="cheat-group">
            <h4>💰 재화 및 재료 주입 (Currency / Item Grants)</h4>
            <div class="cheat-btn-grid">
              <button class="btn-dev-action" id="devAddGold">+10,000 골드 (🪙)</button>
              <button class="btn-dev-action" id="devAddGems">+1,000 보석 (💎)</button>
              <button class="btn-dev-action" id="devAddStones">+50 강화석 (💎)</button>
              <button class="btn-dev-action" id="devAddPotions">물약 50개 세트</button>
            </div>
          </div>

          <div class="cheat-group">
            <h4>📈 레벨 & 환생 고속 테스트 (Level / Rebirth Fast-Track)</h4>
            <div class="cheat-btn-grid">
              <button class="btn-dev-action" id="devLevelUp1">+1 레벨업</button>
              <button class="btn-dev-action" id="devLevelUp10">+10 레벨업</button>
              <button class="btn-dev-action highlight" id="devSetLv20">즉시 20레벨 달성 (환생 테스트)</button>
              <button class="btn-dev-action" id="devAddStatPts">+50 스탯 포인트</button>
            </div>
          </div>

          <div class="cheat-group">
            <h4>🗡️ 전설/신화 세트 즉시 장착 & 펫 해금</h4>
            <div class="cheat-btn-grid">
              <button class="btn-dev-action mythic" id="devEquipExcalibur">성검 엑스칼리버(+10) 지급</button>
              <button class="btn-dev-action mythic" id="devEquipCelestial">천상의 신성 성갑(+10) 지급</button>
              <button class="btn-dev-action mythic" id="devEquipPhoenixWings">불사조 날개 지급</button>
              <button class="btn-dev-action mythic" id="devUnlockAllPets">모든 펫 6종 즉시 해금</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Cheat actions
    document.getElementById('btnToggleGod').onclick = () => {
      this.godMode = !this.godMode;
      this.log(`무적 모드: ${this.godMode ? '활성화' : '비활성화'}`);
      this.renderCheatsTab(container);
    };

    document.getElementById('btnToggleSpeed').onclick = () => {
      this.speedHack = !this.speedHack;
      this.log(`이속 부스트: ${this.speedHack ? '활성화' : '비활성화'}`);
      this.renderCheatsTab(container);
    };

    document.getElementById('btnToggleInstaKill').onclick = () => {
      this.instaKill = !this.instaKill;
      this.log(`원펀맨 즉사 모드: ${this.instaKill ? '활성화' : '비활성화'}`);
      this.renderCheatsTab(container);
    };

    document.getElementById('btnToggleWireframe').onclick = () => {
      this.wireframeMode = !this.wireframeMode;
      this.game.scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.wireframe = this.wireframeMode);
          } else {
            obj.material.wireframe = this.wireframeMode;
          }
        }
      });
      this.log(`와이어프레임 렌더링: ${this.wireframeMode ? 'ON' : 'OFF'}`);
      this.renderCheatsTab(container);
    };

    // Currency grants
    document.getElementById('devAddGold').onclick = () => {
      this.game.stats.addGold(10000);
      this.log('🪙 10,000 골드 지급 완료');
    };
    document.getElementById('devAddGems').onclick = () => {
      this.game.stats.addGems(1000);
      this.log('💎 1,000 보석 지급 완료');
    };
    document.getElementById('devAddStones').onclick = () => {
      this.game.inventory.addItem('enhance_stone', 50);
      this.log('💎 강화석 50개 지급 완료');
    };
    document.getElementById('devAddPotions').onclick = () => {
      this.game.inventory.addItem('hp_potion_l', 50);
      this.game.inventory.addItem('mp_potion', 50);
      this.log('🧪 상급 HP/MP 물약 50개씩 지급 완료');
    };

    // Level jumps
    document.getElementById('devLevelUp1').onclick = () => {
      this.game.stats.addExp(this.game.stats.maxExp);
      this.log(`레벨업! 현재 Lv.${this.game.stats.level}`);
    };
    document.getElementById('devLevelUp10').onclick = () => {
      for (let i = 0; i < 10; i++) {
        this.game.stats.addExp(this.game.stats.maxExp);
      }
      this.log(`10레벨 점프! 현재 Lv.${this.game.stats.level}`);
    };
    document.getElementById('devSetLv20').onclick = () => {
      while (this.game.stats.level < 20) {
        this.game.stats.addExp(this.game.stats.maxExp);
      }
      this.log('✨ 환생 테스트용 20레벨 달성 완료!');
    };
    document.getElementById('devAddStatPts').onclick = () => {
      this.game.stats.statPoints += 50;
      this.game.ui.updateHud();
      this.log('스탯 포인트 +50 지급');
    };

    // Mythic gear
    document.getElementById('devEquipExcalibur').onclick = () => {
      this.game.inventory.addItem('excalibur', 1, 10);
      this.log('✨ [+10 성검 엑스칼리버] 지급 완료!');
    };
    document.getElementById('devEquipCelestial').onclick = () => {
      this.game.inventory.addItem('celestial_robe', 1, 10);
      this.log('👑 [+10 천상의 신성 성갑] 지급 완료!');
    };
    document.getElementById('devEquipPhoenixWings').onclick = () => {
      this.game.inventory.addItem('phoenix_wings', 1, 10);
      this.log('🔥 [불사조 날개] 지급 완료!');
    };
    document.getElementById('devUnlockAllPets').onclick = () => {
      Object.keys(PET_DATABASE).forEach(pId => {
        if (!this.game.petSystem.ownedPets.includes(pId)) {
          this.game.petSystem.addPet(pId);
        }
      });
      this.game.petSystem.equipPet('cyber_mech');
      this.log('🤖 모든 펫 해금 & 사이버 메카 드론 장착 완료!');
    };
  }

  // --- TAB 3: TELEPORT ---
  renderTeleportTab(container) {
    const waypoints = [
      { name: '🏰 마을 광장 분수대 (Spawn)', pos: [0, 0, 0] },
      { name: '👴 마을 촌장 기디온 저택 앞', pos: [0, 0, 12] },
      { name: '🔨 대장장이 불칸 제련소 앞', pos: [18, 0, 8] },
      { name: '🌲 속삭이는 숲 / 초록 슬라임 초원', pos: [35, 0, 10] },
      { name: '🧌 고블린 도적단 은신처', pos: [60, 0, 45] },
      { name: '💀 고대 지하묘지 / 해골 가디언', pos: [-60, 0, 45] },
      { name: '🌋 화산 분화구 / 파이어 마그마 골렘', pos: [-60, 0, -55] },
      { name: '🔥 월드 보스 [오크 제왕 고르가르] 제단', pos: [0, 0, -85] }
    ];

    let wpButtons = '';
    waypoints.forEach((wp, idx) => {
      wpButtons += `
        <button class="btn-teleport" data-idx="${idx}">
          <span class="tp-name">${wp.name}</span>
          <span class="tp-coords">(${wp.pos[0]}, ${wp.pos[1]}, ${wp.pos[2]})</span>
        </button>
      `;
    });

    container.innerHTML = `
      <div class="teleport-container">
        <h4>📍 원하는 구역으로 즉시 순간이동 (Teleport)</h4>
        <div class="teleport-grid">
          ${wpButtons}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-teleport').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
        const wp = waypoints[idx];
        if (wp && this.game.player) {
          this.game.player.position.set(wp.pos[0], wp.pos[1], wp.pos[2]);
          this.game.player.velocity.set(0, 0, 0);
          this.log(`📍 순간이동: [${wp.name}] (${wp.pos[0]}, ${wp.pos[2]})`);
          this.game.ui?.showToast(`📍 [${wp.name}] 구역으로 순간이동했습니다!`, 'blue');
        }
      };
    });
  }

  // --- TAB 4: QUEST DEBUGGER ---
  renderQuestDebuggerTab(container) {
    const qSys = this.game.questSystem;
    const active = qSys.activeQuests;

    let activeListHtml = '';
    for (const [qId, prog] of Object.entries(active)) {
      const qData = this.game.getQuestData(qId);
      activeListHtml += `
        <div class="dev-quest-item">
          <div>
            <strong>[${qId}] ${qData.title}</strong>
            <div class="dev-q-meta">진행도: ${prog.currentCount} / ${prog.targetCount} (${prog.isComplete ? '완료 대기' : '진행 중'})</div>
          </div>
          <div class="dev-q-actions">
            <button class="btn-dev-mini complete" data-qid="${qId}">즉시 목표 달성</button>
            <button class="btn-dev-mini claim" data-qid="${qId}">보상 즉시 지급</button>
          </div>
        </div>
      `;
    }

    if (!activeListHtml) {
      activeListHtml = '<div class="empty-txt">진행 중인 퀘스트가 없습니다.</div>';
    }

    let allStoryHtml = '';
    for (const [qId, qData] of Object.entries(QUEST_DATABASE)) {
      const isDone = qSys.isQuestCompleted(qId);
      const isActive = qSys.isQuestActive(qId);
      allStoryHtml += `
        <div class="dev-story-row ${isDone ? 'done' : (isActive ? 'active' : '')}">
          <span>[${qId}] ${qData.title}</span>
          <span class="status-badge">${isDone ? '완료됨' : (isActive ? '진행 중' : '미수락')}</span>
          <button class="btn-dev-mini force-accept" data-qid="${qId}">강제 수락</button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="quest-debug-container">
        <div class="q-debug-section">
          <h4>📜 현재 진행 중인 퀘스트 디버거</h4>
          <div class="dev-quest-list">${activeListHtml}</div>
        </div>

        <div class="q-debug-section">
          <h4>📖 메인 스토리 퀘스트 강제 수락/해금</h4>
          <div class="dev-story-list">${allStoryHtml}</div>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-dev-mini.complete').forEach(btn => {
      btn.onclick = (e) => {
        const qId = e.target.getAttribute('data-qid');
        const prog = qSys.activeQuests[qId];
        if (prog) {
          prog.currentCount = prog.targetCount;
          prog.isComplete = true;
          this.log(`퀘스트 [${qId}] 목표 즉시 달성`);
          this.renderQuestDebuggerTab(container);
          this.game.ui.updateQuestTracker();
        }
      };
    });

    container.querySelectorAll('.btn-dev-mini.claim').forEach(btn => {
      btn.onclick = (e) => {
        const qId = e.target.getAttribute('data-qid');
        const prog = qSys.activeQuests[qId];
        if (prog) prog.isComplete = true;
        qSys.completeQuest(qId);
        this.log(`퀘스트 [${qId}] 완료 & 보상 수령 처리`);
        this.renderQuestDebuggerTab(container);
      };
    });

    container.querySelectorAll('.btn-dev-mini.force-accept').forEach(btn => {
      btn.onclick = (e) => {
        const qId = e.target.getAttribute('data-qid');
        qSys.acceptQuest(qId);
        this.log(`퀘스트 [${qId}] 강제 수락`);
        this.renderQuestDebuggerTab(container);
      };
    });
  }

  // --- TAB 5: MONSTERS MONITOR ---
  renderMonstersTab(container) {
    const playerPos = this.game.player ? this.game.player.getPosition() : new THREE.Vector3();
    const monsters = this.game.monsterManager?.monsters || [];

    let rowsHtml = '';
    monsters.forEach((mob, i) => {
      const dist = mob.position.distanceTo(playerPos).toFixed(1);
      const hpPct = Math.round((mob.currentHp / mob.maxHp) * 100);
      const stateColor = mob.isDead ? '#757575' : (mob.state === 'chase' ? '#ff5252' : (mob.state === 'attack' ? '#ff1744' : '#69f0ae'));

      rowsHtml += `
        <tr class="${mob.isBoss ? 'boss-row' : ''}">
          <td>${i + 1}</td>
          <td><strong>${mob.name}</strong></td>
          <td>Lv.${mob.level}</td>
          <td>${mob.currentHp} / ${mob.maxHp} (${hpPct}%)</td>
          <td><span style="color:${stateColor}; font-weight:700;">${mob.isDead ? '사망(리스폰 대기)' : mob.state}</span></td>
          <td>${dist}m</td>
          <td>
            <button class="btn-dev-mini mob-kill" data-idx="${i}">즉사</button>
            <button class="btn-dev-mini mob-tp" data-idx="${i}">워프</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="mob-monitor-container">
        <h4>👾 월드 몬스터 실시간 AI & 상태 테이블 (${monsters.length}개체)</h4>
        <div class="table-wrapper">
          <table class="dev-table">
            <thead>
              <tr>
                <th>#</th>
                <th>몬스터 이름</th>
                <th>레벨</th>
                <th>체력 (HP)</th>
                <th>AI 상태</th>
                <th>거리</th>
                <th>디버그 명령</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-dev-mini.mob-kill').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        const mob = monsters[idx];
        if (mob && !mob.isDead) {
          mob.takeDamage(999999, true);
          this.log(`👾 ${mob.name} 강제 처치`);
          this.renderMonstersTab(container);
        }
      };
    });

    container.querySelectorAll('.btn-dev-mini.mob-tp').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        const mob = monsters[idx];
        if (mob && this.game.player) {
          this.game.player.position.set(mob.position.x + 2, mob.position.y, mob.position.z + 2);
          this.log(`📍 ${mob.name} 앞으로 워프`);
          this.game.ui?.showToast(`📍 ${mob.name} 위치로 이동했습니다!`, 'blue');
        }
      };
    });
  }

  // --- TAB 6: LOGS ---
  renderLogsTab(container) {
    let logRows = '';
    this.logs.forEach(item => {
      logRows += `
        <div class="log-row ${item.category}">
          <span class="log-time">[${item.time}]</span>
          <span class="log-text">${item.msg}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="logs-container">
        <div class="logs-header">
          <h4>📋 실시간 시스템 이벤트 & 오류 로그</h4>
          <button class="btn-dev-mini" id="btnClearLogs">로그 지우기</button>
        </div>
        <div class="logs-box" id="devLogsBox">
          ${logRows || '<div class="empty-txt">로그 기록이 없습니다.</div>'}
        </div>
      </div>
    `;

    document.getElementById('btnClearLogs').onclick = () => {
      this.logs = [];
      this.renderLogsTab(container);
    };
  }

  updateLogUI() {
    const box = document.getElementById('devLogsBox');
    if (!box) return;
    let logRows = '';
    this.logs.forEach(item => {
      logRows += `
        <div class="log-row ${item.category}">
          <span class="log-time">[${item.time}]</span>
          <span class="log-text">${item.msg}</span>
        </div>
      `;
    });
    box.innerHTML = logRows;
  }

  update(delta) {
    this.frames++;
    const now = performance.now();
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;

      // Update top mini stats in dev window
      const fpsEl = document.getElementById('devFpsText');
      if (fpsEl) fpsEl.textContent = `FPS: ${this.fps}`;
      const callsEl = document.getElementById('devDrawCallsText');
      if (callsEl && this.game.renderer) {
        callsEl.textContent = `Calls: ${this.game.renderer.info.render.calls}`;
      }

      // Live update diagnostics if open
      const activeTab = document.querySelector('.dev-tab.active')?.getAttribute('data-tab');
      if (this.enabled && activeTab === 'tabDiagnostics') {
        const diagVal = document.getElementById('diagFpsVal');
        if (diagVal) diagVal.textContent = `${this.fps} FPS`;
      }
    }
  }
}
