// UIManager.js - Roblox-style Glassmorphic HUD, NPC Dialogue, Modals, Hotbar, and Interactive Menus
import { ITEM_DATABASE } from '../systems/InventorySystem.js';
import { PET_DATABASE } from '../entities/Pet.js';
import { QUEST_DATABASE, BOUNTY_LIST } from '../systems/QuestSystem.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.activeModal = null;
    this.selectedInventorySlot = null;
    this.selectedUpgradeItem = null;
    this.currentDialogueNpc = null;

    this.initDOM();
  }

  initDOM() {
    this.createHUD();
    this.createModals();
    this.createToasts();
    this.updateHud();
    this.updateQuestTracker();
  }

  createHUD() {
    const hud = document.createElement('div');
    hud.id = 'gameHud';
    hud.innerHTML = `
      <!-- TOP LEFT PLAYER STATS -->
      <div class="hud-top-left glass-panel">
        <div class="player-avatar-box">
          <div class="avatar-icon">🧑‍🚀</div>
          <div class="player-lvl-badge" id="hudPlayerLvl">Lv.1</div>
        </div>
        <div class="player-bars">
          <div class="player-name-row">
            <span class="player-name">용사 블록키</span>
            <span class="rebirth-badge" id="hudRebirthBadge">0차 환생</span>
          </div>
          <!-- HP Bar -->
          <div class="stat-bar-container hp-bar">
            <div class="bar-fill" id="hudHpFill"></div>
            <span class="bar-text" id="hudHpText">150 / 150</span>
          </div>
          <!-- MP Bar -->
          <div class="stat-bar-container mp-bar">
            <div class="bar-fill" id="hudMpFill"></div>
            <span class="bar-text" id="hudMpText">80 / 80</span>
          </div>
          <!-- EXP Bar -->
          <div class="stat-bar-container exp-bar">
            <div class="bar-fill" id="hudExpFill"></div>
            <span class="bar-text" id="hudExpText">0%</span>
          </div>
        </div>
      </div>

      <!-- TOP RIGHT CURRENCY & UTILITY -->
      <div class="hud-top-right">
        <div class="currency-card glass-panel">
          <span class="curr-icon">🪙</span>
          <span class="curr-val" id="hudGold">0</span>
        </div>
        <div class="currency-card glass-panel">
          <span class="curr-icon">💎</span>
          <span class="curr-val" id="hudGems">0</span>
        </div>
        <button class="hud-btn glass-panel" id="btnBgmToggle" title="배경음악 ON/OFF">🎵 BGM</button>
        <button class="hud-btn glass-panel" id="btnSfxToggle" title="음소거">🔊 SFX</button>
        <button class="hud-btn glass-panel" id="btnHelp" title="조작법 및 도움말">❓ 도움말</button>
      </div>

      <!-- TOP CENTER BOSS HEALTH BAR -->
      <div class="hud-boss-container" id="bossHud" style="display: none;">
        <div class="boss-name" id="bossName">오크 제왕 고르가르 [WORLD BOSS]</div>
        <div class="boss-hp-bar">
          <div class="boss-hp-fill" id="bossHpFill"></div>
          <span class="boss-hp-text" id="bossHpText">8500 / 8500 (100%)</span>
        </div>
      </div>

      <!-- RIGHT QUEST TRACKER -->
      <div class="hud-quest-tracker glass-panel" id="questTracker">
        <div class="tracker-header">
          <span>📜 진행 중인 퀘스트</span>
          <span class="tracker-hint">[J] 퀘스트창</span>
        </div>
        <div class="tracker-list" id="trackerList">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- PROXIMITY INTERACT PROMPT -->
      <div class="interact-prompt glass-panel" id="interactPrompt" style="display: none;">
        <span class="key-badge">E</span> <span id="interactText">대화하기</span>
      </div>

      <!-- BOTTOM ACTION HOTBAR -->
      <div class="hud-bottom">
        <div class="skills-hotbar glass-panel">
          <!-- Basic Attack -->
          <div class="hotbar-slot" id="slotAttack" title="기본 연속 베기 [좌클릭/F]">
            <span class="slot-icon">⚔️</span>
            <span class="slot-key">F</span>
            <span class="slot-name">기본타격</span>
          </div>
          <!-- Skill 1 -->
          <div class="hotbar-slot" id="slotSkill1" title="휠윈드 회오리 베기 [1]">
            <span class="slot-icon">🌀</span>
            <span class="slot-key">1</span>
            <span class="slot-name">휠윈드</span>
            <div class="cooldown-overlay" id="cdSkill1"></div>
          </div>
          <!-- Skill 2 -->
          <div class="hotbar-slot" id="slotSkill2" title="화염구 발사 [2]">
            <span class="slot-icon">🔥</span>
            <span class="slot-key">2</span>
            <span class="slot-name">파이어볼</span>
            <div class="cooldown-overlay" id="cdSkill2"></div>
          </div>
          <!-- Skill 3 -->
          <div class="hotbar-slot" id="slotSkill3" title="신성한 빛의 기둥 & 치유 [3]">
            <span class="slot-icon">✨</span>
            <span class="slot-key">3</span>
            <span class="slot-name">홀리빔</span>
            <div class="cooldown-overlay" id="cdSkill3"></div>
          </div>
          <!-- Skill 4 -->
          <div class="hotbar-slot" id="slotSkill4" title="그림자 대시 [4]">
            <span class="slot-icon">💨</span>
            <span class="slot-key">4</span>
            <span class="slot-name">대시</span>
            <div class="cooldown-overlay" id="cdSkill4"></div>
          </div>
          <!-- Quick Potion HP -->
          <div class="hotbar-slot potion-slot" id="slotPotionHp" title="체력 물약 사용 [Q]">
            <span class="slot-icon">🧪</span>
            <span class="slot-key">Q</span>
            <span class="slot-name">HP물약</span>
            <span class="slot-count" id="hotbarHpCount">0</span>
          </div>
        </div>

        <!-- MENU SHORTCUT BUTTONS -->
        <div class="menu-bar glass-panel">
          <button class="menu-tab-btn" id="btnOpenInv"><span class="btn-icon">🎒</span> 인벤토리 (I)</button>
          <button class="menu-tab-btn" id="btnOpenStats"><span class="btn-icon">📊</span> 스탯/환생 (C)</button>
          <button class="menu-tab-btn" id="btnOpenQuests"><span class="btn-icon">📜</span> 퀘스트 (J)</button>
          <button class="menu-tab-btn" id="btnOpenShop"><span class="btn-icon">🏪</span> 상점 (B)</button>
          <button class="menu-tab-btn" id="btnOpenPets"><span class="btn-icon">🐾</span> 펫 부화 (P)</button>
          <button class="menu-tab-btn" id="btnOpenUpgrade"><span class="btn-icon">🔨</span> 대장간 강화 (U)</button>
        </div>
      </div>
    `;
    document.body.appendChild(hud);
    this.setupHudEventListeners();
  }

  createModals() {
    const modals = document.createElement('div');
    modals.id = 'gameModals';
    modals.innerHTML = `
      <!-- NPC DIALOGUE MODAL -->
      <div class="modal-backdrop" id="dialogueModal" style="display: none;">
        <div class="dialogue-card glass-panel">
          <div class="dialogue-header">
            <div class="dialogue-npc-avatar" id="dialogueAvatar">🧙‍♂️</div>
            <div class="dialogue-npc-meta">
              <h3 id="dialogueNpcName">NPC 이름</h3>
              <span class="npc-sub" id="dialogueNpcTitle">칭호</span>
            </div>
            <button class="modal-close-btn" id="btnCloseDialogue">✕</button>
          </div>
          <div class="dialogue-body" id="dialogueText">
            대화 내용이 여기에 표시됩니다.
          </div>
          <div class="dialogue-actions" id="dialogueActions">
            <!-- Dynamic Action Buttons -->
          </div>
        </div>
      </div>

      <!-- INVENTORY MODAL -->
      <div class="modal-backdrop" id="inventoryModal" style="display: none;">
        <div class="modal-window glass-panel inventory-window">
          <div class="modal-header">
            <h2>🎒 모험가 인벤토리</h2>
            <button class="modal-close-btn" id="btnCloseInv">✕</button>
          </div>
          <div class="inventory-layout">
            <!-- Equipped Gear Area -->
            <div class="equipped-gear-box">
              <h3>장착 장비</h3>
              <div class="equipped-slots">
                <div class="equip-slot" id="equipSlotWeapon" data-slot="weapon">
                  <span class="slot-label">무기</span>
                  <div class="slot-item-content" id="eqWeaponContent">비어있음</div>
                </div>
                <div class="equip-slot" id="equipSlotArmor" data-slot="armor">
                  <span class="slot-label">갑옷</span>
                  <div class="slot-item-content" id="eqArmorContent">비어있음</div>
                </div>
                <div class="equip-slot" id="equipSlotHelmet" data-slot="helmet">
                  <span class="slot-label">투구</span>
                  <div class="slot-item-content" id="eqHelmetContent">비어있음</div>
                </div>
                <div class="equip-slot" id="equipSlotWings" data-slot="wings">
                  <span class="slot-label">날개</span>
                  <div class="slot-item-content" id="eqWingsContent">비어있음</div>
                </div>
              </div>
            </div>

            <!-- Inventory Grid Area -->
            <div class="inventory-grid-box">
              <div class="inv-grid-header">
                <h3>보유 아이템 (<span id="invCapacity">0/28</span>)</h3>
              </div>
              <div class="inventory-grid" id="invGrid">
                <!-- 28 Slots -->
              </div>
            </div>

            <!-- Item Details & Action Box -->
            <div class="item-detail-panel" id="itemDetailPanel">
              <div class="detail-empty">아이템을 선택하면 상세 정보가 표시됩니다.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATS & REBIRTH MODAL -->
      <div class="modal-backdrop" id="statsModal" style="display: none;">
        <div class="modal-window glass-panel stats-window">
          <div class="modal-header">
            <h2>📊 캐릭터 능력치 & 환생 (Rebirth)</h2>
            <button class="modal-close-btn" id="btnCloseStats">✕</button>
          </div>
          <div class="stats-layout">
            <div class="stat-allocate-box">
              <div class="stat-points-banner">
                <span>보유 스탯 포인트:</span>
                <span class="points-val" id="statAvailablePoints">0</span>
              </div>
              <div class="stat-rows">
                <div class="stat-row">
                  <div class="stat-info">
                    <span class="stat-name">💪 근력 (STR)</span>
                    <span class="stat-desc">물리 공격력 증가</span>
                  </div>
                  <span class="stat-val" id="statValStr">5</span>
                  <button class="btn-stat-add" data-stat="str">+</button>
                </div>
                <div class="stat-row">
                  <div class="stat-info">
                    <span class="stat-name">⚡ 민첩 (DEX)</span>
                    <span class="stat-desc">치명타 확률 & 이동속도 증가</span>
                  </div>
                  <span class="stat-val" id="statValDex">5</span>
                  <button class="btn-stat-add" data-stat="dex">+</button>
                </div>
                <div class="stat-row">
                  <div class="stat-info">
                    <span class="stat-name">🛡️ 체력 (VIT)</span>
                    <span class="stat-desc">최대 HP & 방어력 증가</span>
                  </div>
                  <span class="stat-val" id="statValVit">5</span>
                  <button class="btn-stat-add" data-stat="vit">+</button>
                </div>
                <div class="stat-row">
                  <div class="stat-info">
                    <span class="stat-name">🔮 지능 (INT)</span>
                    <span class="stat-desc">최대 MP & 스킬 쿨타임 감소</span>
                  </div>
                  <span class="stat-val" id="statValInt">5</span>
                  <button class="btn-stat-add" data-stat="int">+</button>
                </div>
              </div>
            </div>

            <!-- Total Combat Stats & Rebirth Panel -->
            <div class="combat-stats-box">
              <h3>전투 능력치 총합</h3>
              <div class="stats-table" id="totalCombatStatsTable">
                <!-- Dynamically generated -->
              </div>

              <!-- Rebirth Card -->
              <div class="rebirth-card">
                <div class="rebirth-title">🔄 초월 환생 (Rebirth) 시스템</div>
                <p class="rebirth-desc">20레벨 달성 시 환생 가능! 환생 시 레벨은 1로 돌아가지만 <strong>영구 골드/경험치 +35%, 공격력 +20%</strong> 배율과 보석 100개를 획득합니다!</p>
                <div class="rebirth-status" id="rebirthStatusText">환생 조건: 레벨 20 이상 (현재 Lv.1)</div>
                <button class="btn-rebirth" id="btnDoRebirth">환생 진행하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- QUESTS MODAL -->
      <div class="modal-backdrop" id="questModal" style="display: none;">
        <div class="modal-window glass-panel quest-window">
          <div class="modal-header">
            <h2>📜 퀘스트 저널 & 현상금</h2>
            <button class="modal-close-btn" id="btnCloseQuest">✕</button>
          </div>
          <div class="quest-tabs">
            <button class="quest-tab active" id="tabActiveQuests">진행 중 퀘스트</button>
            <button class="quest-tab" id="tabStoryQuests">메인 스토리 퀘스트</button>
            <button class="quest-tab" id="tabBounties">현상금 토벌 의뢰</button>
          </div>
          <div class="quest-content" id="questListContent">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>

      <!-- SHOP MODAL -->
      <div class="modal-backdrop" id="shopModal" style="display: none;">
        <div class="modal-window glass-panel shop-window">
          <div class="modal-header">
            <h2>🏪 마을 통합 상점</h2>
            <button class="modal-close-btn" id="btnCloseShop">✕</button>
          </div>
          <div class="shop-tabs">
            <button class="shop-tab active" id="tabShopWeapon">무기 & 장비</button>
            <button class="shop-tab" id="tabShopPotion">물약 & 소모품</button>
            <button class="shop-tab" id="tabShopEggs">펫 알</button>
          </div>
          <div class="shop-grid" id="shopItemsGrid">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>

      <!-- BLACKSMITH UPGRADE MODAL -->
      <div class="modal-backdrop" id="upgradeModal" style="display: none;">
        <div class="modal-window glass-panel upgrade-window">
          <div class="modal-header">
            <h2>🔨 대장장이 불칸의 장비 강화소</h2>
            <button class="modal-close-btn" id="btnCloseUpgrade">✕</button>
          </div>
          <div class="upgrade-layout">
            <div class="upgrade-select-panel">
              <h3>강화할 장비 선택</h3>
              <div class="upgrade-item-list" id="upgradeSelectList">
                <!-- Equipment list -->
              </div>
            </div>
            <div class="upgrade-forge-panel" id="forgePanel">
              <div class="forge-empty">강화할 장비를 좌측 목록에서 선택하세요.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PET & GACHA MODAL -->
      <div class="modal-backdrop" id="petModal" style="display: none;">
        <div class="modal-window glass-panel pet-window">
          <div class="modal-header">
            <h2>🐾 펫 컴패니언 & 부화소</h2>
            <button class="modal-close-btn" id="btnClosePet">✕</button>
          </div>
          <div class="pet-layout">
            <div class="owned-pets-panel">
              <h3>보유한 펫</h3>
              <div class="owned-pets-grid" id="ownedPetsGrid">
                <!-- Owned pets -->
              </div>
            </div>
            <div class="egg-incubator-panel">
              <h3>✨ 펫 알 즉시 부화</h3>
              <div class="incubator-card">
                <div class="egg-icon">🥚</div>
                <p>인벤토리의 알을 사용하거나 아래에서 부화시키세요!</p>
                <div class="egg-buttons">
                  <button class="btn-egg-hatch" id="btnHatchBasic">일반 알 부화 (250 G)</button>
                  <button class="btn-egg-hatch" id="btnHatchForest">숲의 알 부화 (800 G)</button>
                  <button class="btn-egg-hatch legendary" id="btnHatchLegendary">전설 알 부화 (50 💎)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- HELP & CONTROLS MODAL -->
      <div class="modal-backdrop" id="helpModal" style="display: none;">
        <div class="modal-window glass-panel help-window">
          <div class="modal-header">
            <h2>❓ 게임 가이드 & 조작법</h2>
            <button class="modal-close-btn" id="btnCloseHelp">✕</button>
          </div>
          <div class="help-content">
            <div class="help-section">
              <h3>🕹️ 기본 조작키</h3>
              <ul class="help-list">
                <li><span class="key-badge">W A S D</span> : 캐릭터 이동</li>
                <li><span class="key-badge">Space</span> : 점프</li>
                <li><span class="key-badge">Shift</span> : 달리기 (스프린트)</li>
                <li><span class="key-badge">마우스 드래그</span> : 3인칭 카메라 시점 회전</li>
                <li><span class="key-badge">마우스 휠</span> : 카메라 줌 인/아웃</li>
                <li><span class="key-badge">마우스 좌클릭</span> 또는 <span class="key-badge">F</span> : 3단 연속 기본 공격</li>
                <li><span class="key-badge">E</span> : NPC 대화 및 마법 버섯 채집</li>
              </ul>
            </div>
            <div class="help-section">
              <h3>⚔️ 스킬 & 단축키</h3>
              <ul class="help-list">
                <li><span class="key-badge">1</span> : 휠윈드 (360도 회전 회오리 베기)</li>
                <li><span class="key-badge">2</span> : 파이어볼 (전방 폭발 화염구 발사)</li>
                <li><span class="key-badge">3</span> : 홀리빔 (신성한 빛의 기둥 & 광역 폭딜 + HP 35% 치유)</li>
                <li><span class="key-badge">4</span> : 대시 (순간 무적 돌진)</li>
                <li><span class="key-badge">Q</span> : 체력 물약 즉시 사용</li>
                <li><span class="key-badge">I</span> : 인벤토리 / <span class="key-badge">C</span> : 스탯창 / <span class="key-badge">J</span> : 퀘스트창</li>
                <li><span class="key-badge">B</span> : 상점 / <span class="key-badge">P</span> : 펫 메뉴 / <span class="key-badge">U</span> : 대장간 강화</li>
              </ul>
            </div>
            <div class="help-section">
              <h3>🌟 게임 핵심 팁</h3>
              <ul class="help-list">
                <li>마을 중앙의 <strong>허수아비</strong>를 타격하면 전투 감각과 수련 능력치를 올릴 수 있습니다.</li>
                <li>퀘스트를 따라 슬라임 ➔ 고블린 ➔ 스켈레톤 ➔ 마그마 골렘 ➔ <strong>월드 보스 오크 군주 고르가르</strong>를 토벌하세요!</li>
                <li>대장장이에게서 장비를 <strong>+10 단계까지 강화</strong>하여 무기의 빛과 엄청난 위력을 확인하세요!</li>
                <li>20레벨 달성 시 <strong>환생(Rebirth)</strong>을 진행하여 영구 능력치 배율을 쌓으세요!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modals);
    this.setupModalsEventListeners();
  }

  createToasts() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  showToast(message, type = 'normal') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `game-toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  updateHud() {
    const stats = this.game.stats;
    if (!stats) return;

    const lvlEl = document.getElementById('hudPlayerLvl');
    if (lvlEl) lvlEl.textContent = `Lv.${stats.level}`;

    const rebEl = document.getElementById('hudRebirthBadge');
    if (rebEl) rebEl.textContent = `${stats.rebirthCount}차 환생`;

    const hpPct = Math.max(0, Math.min(100, (stats.currentHp / stats.maxHp) * 100));
    const hpFill = document.getElementById('hudHpFill');
    if (hpFill) hpFill.style.width = `${hpPct}%`;
    const hpText = document.getElementById('hudHpText');
    if (hpText) hpText.textContent = `${stats.currentHp} / ${stats.maxHp}`;

    const mpPct = Math.max(0, Math.min(100, (stats.currentMp / stats.maxMp) * 100));
    const mpFill = document.getElementById('hudMpFill');
    if (mpFill) mpFill.style.width = `${mpPct}%`;
    const mpText = document.getElementById('hudMpText');
    if (mpText) mpText.textContent = `${stats.currentMp} / ${stats.maxMp}`;

    const expPct = Math.max(0, Math.min(100, (stats.exp / stats.maxExp) * 100));
    const expFill = document.getElementById('hudExpFill');
    if (expFill) expFill.style.width = `${expPct}%`;
    const expText = document.getElementById('hudExpText');
    if (expText) expText.textContent = `${Math.floor(expPct)}%`;

    const goldEl = document.getElementById('hudGold');
    if (goldEl) goldEl.textContent = stats.gold.toLocaleString();

    const gemsEl = document.getElementById('hudGems');
    if (gemsEl) gemsEl.textContent = stats.gems.toLocaleString();

    // Potion count
    const hpPotionCount = (this.game.inventory?.getItemCount('hp_potion_s') || 0) +
                          (this.game.inventory?.getItemCount('hp_potion_m') || 0) +
                          (this.game.inventory?.getItemCount('hp_potion_l') || 0);
    const potEl = document.getElementById('hotbarHpCount');
    if (potEl) potEl.textContent = hpPotionCount;

    // Cooldown overlays
    const combat = this.game.combat;
    if (combat) {
      this.updateCooldownBar('cdSkill1', combat.cooldowns.whirlwind, combat.maxCooldowns.whirlwind);
      this.updateCooldownBar('cdSkill2', combat.cooldowns.fireball, combat.maxCooldowns.fireball);
      this.updateCooldownBar('cdSkill3', combat.cooldowns.holyBeam, combat.maxCooldowns.holyBeam);
      this.updateCooldownBar('cdSkill4', combat.cooldowns.dash, combat.maxCooldowns.dash);
    }
  }

  updateCooldownBar(elemId, currentCd, maxCd) {
    const elem = document.getElementById(elemId);
    if (!elem) return;
    if (currentCd > 0) {
      elem.style.display = 'block';
      const pct = (currentCd / maxCd) * 100;
      elem.style.height = `${pct}%`;
    } else {
      elem.style.display = 'none';
    }
  }

  updateBossHealth(currentHp, maxHp, bossName) {
    const bossHud = document.getElementById('bossHud');
    if (!bossHud) return;
    bossHud.style.display = 'block';
    const nameEl = document.getElementById('bossName');
    if (nameEl) nameEl.textContent = bossName;
    const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    const fillEl = document.getElementById('bossHpFill');
    if (fillEl) fillEl.style.width = `${pct}%`;
    const textEl = document.getElementById('bossHpText');
    if (textEl) textEl.textContent = `${currentHp} / ${maxHp} (${Math.round(pct)}%)`;
  }

  hideBossHealth() {
    const bossHud = document.getElementById('bossHud');
    if (bossHud) bossHud.style.display = 'none';
  }

  updateQuestTracker() {
    const list = document.getElementById('trackerList');
    if (!list) return;

    list.innerHTML = '';
    const active = this.game.questSystem?.activeQuests || {};
    const questKeys = Object.keys(active);

    if (questKeys.length === 0) {
      list.innerHTML = `<div class="tracker-empty">진행 중인 퀘스트가 없습니다. 마을 NPC와 대화해보세요!</div>`;
      return;
    }

    for (const qId of questKeys) {
      const progress = active[qId];
      const qData = this.game.getQuestData(qId);
      if (!qData) continue;

      const item = document.createElement('div');
      item.className = `tracker-item ${progress.isComplete ? 'complete' : ''}`;
      item.innerHTML = `
        <div class="tracker-title">${qData.title}</div>
        <div class="tracker-progress">
          <span>진행도: ${progress.currentCount} / ${progress.targetCount}</span>
          ${progress.isComplete ? '<span class="complete-tag">완료 가능!</span>' : ''}
        </div>
      `;
      item.addEventListener('click', () => {
        this.toggleModal('questModal');
      });
      list.appendChild(item);
    }
  }

  onLevelUp(newLevel) {
    this.showToast(`🎉 레벨 업! [Lv.${newLevel}] 달성! 스탯 포인트 +3 획득!`, 'rainbow');
  }

  showHatchAnimation(petData) {
    this.showToast(`✨ 알 부화 성공! [${petData.name}] 획득! (${petData.icon})`, 'rainbow');
    this.renderPetModal();
  }

  // --- MODAL TOGGLES & RENDERING ---
  toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const isVisible = modal.style.display !== 'none';
    this.closeAllModals();

    if (!isVisible) {
      modal.style.display = 'flex';
      if (modalId === 'inventoryModal') this.renderInventoryModal();
      if (modalId === 'statsModal') this.renderStatsModal();
      if (modalId === 'questModal') this.renderQuestModal('active');
      if (modalId === 'shopModal') this.renderShopModal('weapon');
      if (modalId === 'petModal') this.renderPetModal();
      if (modalId === 'upgradeModal') this.renderUpgradeModal();
    }
  }

  closeAllModals() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(m => m.style.display = 'none');
  }

  // --- NPC DIALOGUE SYSTEM ---
  openNpcDialogue(npc) {
    this.currentDialogueNpc = npc;
    const modal = document.getElementById('dialogueModal');
    if (!modal) return;

    this.closeAllModals();
    modal.style.display = 'flex';

    document.getElementById('dialogueNpcName').textContent = npc.name;
    document.getElementById('dialogueNpcTitle').textContent = npc.title;

    const questSystem = this.game.questSystem;
    const activeQuests = questSystem.activeQuests;

    // Check if player can turn in a quest to this NPC
    let turnInQuestId = null;
    for (const [qId, prog] of Object.entries(activeQuests)) {
      const qData = this.game.getQuestData(qId);
      if (qData && qData.giverId === npc.id && prog.isComplete) {
        turnInQuestId = qId;
        break;
      }
    }

    // Check if NPC has a story quest ready to give
    let offerQuestId = null;
    for (const [qId, qData] of Object.entries(QUEST_DATABASE)) {
      if (qData.giverId === npc.id && !questSystem.isQuestCompleted(qId) && !questSystem.isQuestActive(qId)) {
        offerQuestId = qId;
        break;
      }
    }

    const actionsContainer = document.getElementById('dialogueActions');
    actionsContainer.innerHTML = '';

    if (turnInQuestId) {
      const qData = this.game.getQuestData(turnInQuestId);
      document.getElementById('dialogueText').textContent = qData.dialogueComplete || '수고했네! 여기 보상을 받게나.';

      const btnComplete = document.createElement('button');
      btnComplete.className = 'btn-dialogue-primary';
      btnComplete.textContent = `🎁 [${qData.title}] 보상 받기`;
      btnComplete.addEventListener('click', () => {
        questSystem.completeQuest(turnInQuestId);
        modal.style.display = 'none';
      });
      actionsContainer.appendChild(btnComplete);

    } else if (offerQuestId) {
      const qData = QUEST_DATABASE[offerQuestId];
      document.getElementById('dialogueText').textContent = qData.dialogueOffer;

      const btnAccept = document.createElement('button');
      btnAccept.className = 'btn-dialogue-primary';
      btnAccept.textContent = `📜 [${qData.title}] 퀘스트 수락`;
      btnAccept.addEventListener('click', () => {
        questSystem.acceptQuest(offerQuestId);
        modal.style.display = 'none';
      });
      actionsContainer.appendChild(btnAccept);

    } else {
      // General NPC Chat / Open Special Menus
      if (npc.id === 'npc_elder') {
        document.getElementById('dialogueText').textContent = '용사여, 마을과 대륙의 평화를 위해 힘써주게나. 수련과 강화를 게을리하지 말게!';
      } else if (npc.id === 'npc_blacksmith') {
        document.getElementById('dialogueText').textContent = '내 대장간에서는 어떤 장비든 최고 단계로 벼려낼 수 있지! 자네 무기를 강화해보겠나?';
        const btnUpgrade = document.createElement('button');
        btnUpgrade.className = 'btn-dialogue-primary';
        btnUpgrade.textContent = '🔨 대장간 강화소 열기';
        btnUpgrade.addEventListener('click', () => {
          modal.style.display = 'none';
          this.toggleModal('upgradeModal');
        });
        actionsContainer.appendChild(btnUpgrade);
      } else if (npc.id === 'npc_alchemist') {
        document.getElementById('dialogueText').textContent = '상처를 치유할 물약과 마나를 보충해줄 영약이 준비되어 있답니다. 둘러보시겠어요?';
        const btnShop = document.createElement('button');
        btnShop.className = 'btn-dialogue-primary';
        btnShop.textContent = '🏪 물약 상점 열기';
        btnShop.addEventListener('click', () => {
          modal.style.display = 'none';
          this.renderShopModal('potion');
          document.getElementById('shopModal').style.display = 'flex';
        });
        actionsContainer.appendChild(btnShop);
      } else if (npc.id === 'npc_petmaster') {
        document.getElementById('dialogueText').textContent = '펫은 단순한 동물 이상입니다! 주인의 숨겨진 능력을 이끌어내주는 소중한 파트너예요!';
        const btnPet = document.createElement('button');
        btnPet.className = 'btn-dialogue-primary';
        btnPet.textContent = '🐾 펫 부화소 열기';
        btnPet.addEventListener('click', () => {
          modal.style.display = 'none';
          this.toggleModal('petModal');
        });
        actionsContainer.appendChild(btnPet);
      } else if (npc.id === 'npc_bounty') {
        document.getElementById('dialogueText').textContent = '위험한 몬스터들을 소탕하고 막대한 현상금을 수령하십시오! 무엇을 토벌하시겠습니까?';
        const btnBounty = document.createElement('button');
        btnBounty.className = 'btn-dialogue-primary';
        btnBounty.textContent = '📜 현상금 의뢰 확인';
        btnBounty.addEventListener('click', () => {
          modal.style.display = 'none';
          this.renderQuestModal('bounties');
          document.getElementById('questModal').style.display = 'flex';
        });
        actionsContainer.appendChild(btnBounty);
      }
    }

    if (this.game.audio) this.game.audio.playNpcTalk();
  }

  // --- INVENTORY MODAL RENDER ---
  renderInventoryModal() {
    const inv = this.game.inventory;
    if (!inv) return;

    // 1. Render Equipped Slots
    const slots = ['weapon', 'armor', 'helmet', 'wings'];
    slots.forEach(slot => {
      const item = inv.equipped[slot];
      const slotEl = document.getElementById(`eq${slot.charAt(0).toUpperCase() + slot.slice(1)}Content`);
      if (item && slotEl) {
        const db = ITEM_DATABASE[item.id];
        const lvlStr = item.upgradeLevel ? ` (+${item.upgradeLevel})` : '';
        slotEl.innerHTML = `<span class="item-icon">${db.icon}</span> <span class="item-name" style="color:${db.color}">${db.name}${lvlStr}</span>`;
        slotEl.onclick = () => {
          inv.unequipItem(slot);
          this.renderInventoryModal();
        };
      } else if (slotEl) {
        slotEl.innerHTML = `<span class="empty-txt">비어있음</span>`;
        slotEl.onclick = null;
      }
    });

    // 2. Render Grid Slots
    const grid = document.getElementById('invGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const capEl = document.getElementById('invCapacity');
    if (capEl) capEl.textContent = `${inv.items.length}/${inv.maxSlots}`;

    for (let i = 0; i < inv.maxSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      const item = inv.items[i];

      if (item) {
        const db = ITEM_DATABASE[item.id];
        slot.classList.add(`rarity-${db.rarity}`);
        const lvlStr = item.upgradeLevel ? `<span class="slot-up-lvl">+${item.upgradeLevel}</span>` : '';
        const countStr = item.count > 1 ? `<span class="slot-item-count">x${item.count}</span>` : '';
        slot.innerHTML = `
          <span class="slot-icon-large">${db.icon}</span>
          ${lvlStr}
          ${countStr}
        `;

        slot.addEventListener('click', () => {
          this.selectedInventorySlot = i;
          this.renderItemDetail(item, i);
          document.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
        });
      } else {
        slot.classList.add('empty');
      }
      grid.appendChild(slot);
    }
  }

  renderItemDetail(item, index) {
    const panel = document.getElementById('itemDetailPanel');
    if (!panel) return;
    const db = ITEM_DATABASE[item.id];
    if (!db) {
      panel.innerHTML = '<div class="detail-empty">아이템 정보를 찾을 수 없습니다.</div>';
      return;
    }

    const lvlStr = item.upgradeLevel ? ` (+${item.upgradeLevel})` : '';
    let statsHtml = '';
    if (db.atk) statsHtml += `<div>공격력: +${Math.round(db.atk * (1 + (item.upgradeLevel || 0) * 0.18))}</div>`;
    if (db.def) statsHtml += `<div>방어력: +${Math.round(db.def * (1 + (item.upgradeLevel || 0) * 0.18))}</div>`;
    if (db.hp) statsHtml += `<div>생명력: +${db.hp}</div>`;
    if (db.crit) statsHtml += `<div>치명타: +${Math.round(db.crit * 100)}%</div>`;
    if (db.speed) statsHtml += `<div>이동속도: +${db.speed}</div>`;
    if (db.str) statsHtml += `<div>STR: +${db.str}</div>`;
    if (db.healAmount) statsHtml += `<div>회복량: +${db.healAmount} HP</div>`;
    if (db.mpAmount) statsHtml += `<div>마나 회복: +${db.mpAmount} MP</div>`;

    const isEquippable = ['weapon', 'armor', 'helmet', 'wings'].includes(db.type);
    const isUsable = ['potion', 'egg'].includes(db.type);

    panel.innerHTML = `
      <div class="detail-card rarity-${db.rarity}">
        <div class="detail-title" style="color: ${db.color};">
          ${db.icon} ${db.name}${lvlStr}
        </div>
        <div class="detail-type">분류: ${db.type.toUpperCase()} | 등급: ${db.rarity.toUpperCase()}</div>
        <div class="detail-stats">${statsHtml}</div>
        <div class="detail-desc">${db.desc}</div>
        <div class="detail-actions">
          ${isEquippable ? `<button class="btn-detail-action equip" id="btnDetailEquip">장착하기</button>` : ''}
          ${isUsable ? `<button class="btn-detail-action use" id="btnDetailUse">사용하기</button>` : ''}
          <button class="btn-detail-action sell" id="btnDetailSell">판매 (${Math.floor(db.price * 0.5)} G)</button>
        </div>
      </div>
    `;

    if (document.getElementById('btnDetailEquip')) {
      document.getElementById('btnDetailEquip').onclick = () => {
        this.game.inventory.equipItem(index);
        this.renderInventoryModal();
      };
    }
    if (document.getElementById('btnDetailUse')) {
      document.getElementById('btnDetailUse').onclick = () => {
        this.game.inventory.useItem(index);
        this.renderInventoryModal();
      };
    }
    if (document.getElementById('btnDetailSell')) {
      document.getElementById('btnDetailSell').onclick = () => {
        const sellGold = Math.floor(db.price * 0.5) * (item.count || 1);
        this.game.stats.addGold(sellGold);
        this.game.inventory.removeItem(item.id, item.count || 1);
        this.showToast(`'${db.name}' 판매 완료! (+${sellGold} G)`, 'gold');
        this.renderInventoryModal();
      };
    }
  }

  // --- STATS MODAL RENDER ---
  renderStatsModal() {
    const stats = this.game.stats;
    if (!stats) return;

    const ptEl = document.getElementById('statAvailablePoints');
    if (ptEl) ptEl.textContent = stats.statPoints;
    const strEl = document.getElementById('statValStr');
    if (strEl) strEl.textContent = stats.str;
    const dexEl = document.getElementById('statValDex');
    if (dexEl) dexEl.textContent = stats.dex;
    const vitEl = document.getElementById('statValVit');
    if (vitEl) vitEl.textContent = stats.vit;
    const intEl = document.getElementById('statValInt');
    if (intEl) intEl.textContent = stats.int;

    const table = document.getElementById('totalCombatStatsTable');
    if (table) {
      table.innerHTML = `
        <div class="stat-table-row"><span>⚔️ 총 공격력</span><span>${stats.totalAtk}</span></div>
        <div class="stat-table-row"><span>🛡️ 총 방어력</span><span>${stats.totalDef}</span></div>
        <div class="stat-table-row"><span>❤️ 최대 생명력</span><span>${stats.maxHp}</span></div>
        <div class="stat-table-row"><span>💙 최대 마나</span><span>${stats.maxMp}</span></div>
        <div class="stat-table-row"><span>💥 치명타 확률</span><span>${Math.round(stats.critRate * 100)}%</span></div>
        <div class="stat-table-row"><span>⚡ 이동 속도</span><span>${stats.moveSpeed.toFixed(1)}</span></div>
        <div class="stat-table-row"><span>⏳ 쿨타임 감소</span><span>${Math.round(stats.cooldownReduction * 100)}%</span></div>
        <div class="stat-table-row gold"><span>🪙 골드 획득 배율</span><span>x${stats.goldMultiplier.toFixed(2)}</span></div>
        <div class="stat-table-row exp"><span>⭐ 경험치 배율</span><span>x${stats.expMultiplier.toFixed(2)}</span></div>
      `;
    }

    const canReb = stats.canRebirth();
    const rebText = document.getElementById('rebirthStatusText');
    const rebBtn = document.getElementById('btnDoRebirth');
    if (rebText && rebBtn) {
      if (canReb) {
        rebText.textContent = `✨ 환생 가능! [현재 Lv.${stats.level}] 환생하여 영구 배율을 획득하세요!`;
        rebText.style.color = '#00e676';
        rebBtn.disabled = false;
        rebBtn.classList.add('ready');
      } else {
        rebText.textContent = `환생 조건: 20레벨 이상 (현재 Lv.${stats.level})`;
        rebText.style.color = '#ff9800';
        rebBtn.disabled = true;
        rebBtn.classList.remove('ready');
      }
    }
  }

  // --- QUEST MODAL RENDER ---
  renderQuestModal(activeTab = 'active') {
    const content = document.getElementById('questListContent');
    if (!content) return;
    content.innerHTML = '';

    const questSystem = this.game.questSystem;

    if (activeTab === 'active') {
      const active = questSystem.activeQuests;
      const keys = Object.keys(active);
      if (keys.length === 0) {
        content.innerHTML = `<div class="empty-quest-msg">진행 중인 퀘스트가 없습니다. 마을 NPC나 현상금 게시판을 방문해보세요!</div>`;
        return;
      }

      for (const qId of keys) {
        const prog = active[qId];
        const qData = this.game.getQuestData(qId);
        if (!qData) continue;

        const card = document.createElement('div');
        card.className = `quest-card ${prog.isComplete ? 'ready' : ''}`;
        card.innerHTML = `
          <div class="qc-header">
            <h4>${qData.title}</h4>
            <span class="qc-badge">${qData.giverName || '의뢰'}</span>
          </div>
          <p class="qc-desc">${qData.dialogueInProgress || qData.desc || ''}</p>
          <div class="qc-prog-bar">
            <div class="qc-fill" style="width: ${(prog.currentCount / prog.targetCount) * 100}%"></div>
          </div>
          <div class="qc-meta">
            <span>목표: ${prog.currentCount} / ${prog.targetCount}</span>
            <span>보상: ${qData.rewardExp || 0} EXP, ${qData.rewardGold || 0} G ${qData.rewardGems ? `, ${qData.rewardGems} 💎` : ''}</span>
          </div>
          ${prog.isComplete ? `<button class="btn-claim-quest" data-id="${qId}">🎁 보상 수령</button>` : ''}
        `;
        content.appendChild(card);
      }

      content.querySelectorAll('.btn-claim-quest').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const qId = e.target.getAttribute('data-id');
          questSystem.completeQuest(qId);
          this.renderQuestModal('active');
        });
      });

    } else if (activeTab === 'story') {
      for (const [qId, qData] of Object.entries(QUEST_DATABASE)) {
        const isDone = questSystem.isQuestCompleted(qId);
        const isActive = questSystem.isQuestActive(qId);

        const card = document.createElement('div');
        card.className = `quest-card ${isDone ? 'done' : (isActive ? 'active' : 'locked')}`;
        card.innerHTML = `
          <div class="qc-header">
            <h4>${qData.title}</h4>
            <span class="qc-badge">${isDone ? '완료됨' : (isActive ? '진행 중' : '미수락')}</span>
          </div>
          <p class="qc-desc">${qData.dialogueOffer}</p>
          <div class="qc-meta">
            <span>의뢰인: ${qData.giverName}</span>
            <span>보상: ${qData.rewardExp} EXP, ${qData.rewardGold} G</span>
          </div>
        `;
        content.appendChild(card);
      }

    } else if (activeTab === 'bounties') {
      BOUNTY_LIST.forEach(bounty => {
        const isActive = questSystem.isQuestActive(bounty.id);
        const card = document.createElement('div');
        card.className = `quest-card ${isActive ? 'active' : ''}`;
        card.innerHTML = `
          <div class="qc-header">
            <h4>${bounty.title}</h4>
            <span class="qc-badge">반복 가능</span>
          </div>
          <p class="qc-desc">${bounty.desc}</p>
          <div class="qc-meta">
            <span>보상: ${bounty.rewardGold} G, ${bounty.rewardExp} EXP ${bounty.rewardGems ? `, ${bounty.rewardGems} 💎` : ''}</span>
            ${!isActive ? `<button class="btn-accept-bounty" data-id="${bounty.id}">의뢰 수락</button>` : '<span class="active-tag">진행 중</span>'}
          </div>
        `;
        content.appendChild(card);
      });

      content.querySelectorAll('.btn-accept-bounty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const bId = e.target.getAttribute('data-id');
          questSystem.acceptQuest(bId);
          this.renderQuestModal('bounties');
        });
      });
    }
  }

  // --- SHOP MODAL RENDER ---
  renderShopModal(category = 'weapon') {
    const grid = document.getElementById('shopItemsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const items = Object.values(ITEM_DATABASE).filter(item => {
      if (category === 'weapon') return ['weapon', 'armor', 'helmet', 'wings'].includes(item.type);
      if (category === 'potion') return ['potion', 'material'].includes(item.type);
      if (category === 'egg') return item.type === 'egg';
      return false;
    });

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `shop-item-card rarity-${item.rarity}`;
      const priceText = item.gemPrice ? `${item.gemPrice} 💎` : `${item.price} 🪙`;

      card.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-name" style="color:${item.color}">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-price">${priceText}</div>
        <button class="btn-buy-item" data-id="${item.id}">구매하기</button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-buy-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.getAttribute('data-id');
        const dbItem = ITEM_DATABASE[itemId];
        if (!dbItem) return;

        if (dbItem.gemPrice) {
          if (this.game.stats.spendGems(dbItem.gemPrice)) {
            this.game.inventory.addItem(itemId, 1);
            if (this.game.audio) this.game.audio.playCoin();
            this.showToast(`💎 '${dbItem.name}' 구매 완료!`, 'gold');
          } else {
            this.showToast('보석이 부족합니다!', 'red');
          }
        } else {
          if (this.game.stats.spendGold(dbItem.price)) {
            this.game.inventory.addItem(itemId, 1);
            if (this.game.audio) this.game.audio.playCoin();
            this.showToast(`🪙 '${dbItem.name}' 구매 완료!`, 'gold');
          } else {
            this.showToast('골드가 부족합니다!', 'red');
          }
        }
      });
    });
  }

  // --- UPGRADE MODAL RENDER ---
  renderUpgradeModal() {
    const list = document.getElementById('upgradeSelectList');
    if (!list) return;
    list.innerHTML = '';

    const inv = this.game.inventory;
    const upgradables = [];

    // Check equipped items
    for (const [slot, item] of Object.entries(inv.equipped)) {
      if (item) upgradables.push({ item, source: `장착 중 [${slot}]` });
    }
    // Check inventory items
    inv.items.forEach((item) => {
      const db = ITEM_DATABASE[item.id];
      if (['weapon', 'armor', 'helmet', 'wings'].includes(db?.type)) {
        upgradables.push({ item, source: `인벤토리` });
      }
    });

    if (upgradables.length === 0) {
      list.innerHTML = `<div class="empty-txt">강화할 수 있는 장비가 없습니다.</div>`;
      return;
    }

    upgradables.forEach(({ item, source }) => {
      const db = ITEM_DATABASE[item.id];
      const card = document.createElement('div');
      card.className = `up-select-item rarity-${db.rarity}`;
      const lvlStr = item.upgradeLevel ? ` (+${item.upgradeLevel})` : '';
      card.innerHTML = `
        <span>${db.icon} ${db.name}${lvlStr}</span>
        <span class="src-tag">${source}</span>
      `;
      card.addEventListener('click', () => {
        this.selectedUpgradeItem = item;
        this.renderForgePanel(item);
        document.querySelectorAll('.up-select-item').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      list.appendChild(card);
    });
  }

  renderForgePanel(item) {
    const panel = document.getElementById('forgePanel');
    if (!panel) return;
    const db = ITEM_DATABASE[item.id];
    if (!db) return;

    const curLvl = item.upgradeLevel || 0;
    const stoneCost = Math.max(1, Math.floor(curLvl / 2) + 1);
    const goldCost = Math.round(100 * Math.pow(1.6, curLvl));
    const rates = [0.95, 0.90, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15];
    const ratePct = Math.round((rates[curLvl] || 0.15) * 100);

    const curMultiplier = 1.0 + (curLvl * 0.18);
    const nextMultiplier = 1.0 + ((curLvl + 1) * 0.18);

    const stoneCount = this.game.inventory.getItemCount('enhance_stone');

    panel.innerHTML = `
      <div class="forge-card rarity-${db.rarity}">
        <div class="forge-item-preview">
          <div class="forge-icon">${db.icon}</div>
          <h3>${db.name} <span class="up-badge">+${curLvl} ➔ +${curLvl + 1}</span></h3>
        </div>
        <div class="forge-stat-compare">
          ${db.atk ? `<div>공격력: ${Math.round(db.atk * curMultiplier)} ➔ <strong style="color:#00e676;">${Math.round(db.atk * nextMultiplier)} (+${Math.round(db.atk * 0.18)})</strong></div>` : ''}
          ${db.def ? `<div>방어력: ${Math.round(db.def * curMultiplier)} ➔ <strong style="color:#00e676;">${Math.round(db.def * nextMultiplier)} (+${Math.round(db.def * 0.18)})</strong></div>` : ''}
        </div>
        <div class="forge-costs">
          <div class="cost-item">💎 필요 강화석: <strong>${stoneCost}개</strong> (보유: ${stoneCount}개)</div>
          <div class="cost-item">🪙 필요 골드: <strong>${goldCost.toLocaleString()} G</strong></div>
          <div class="cost-item chance">✨ 성공 확률: <strong>${ratePct}%</strong></div>
        </div>
        <button class="btn-execute-forge" id="btnDoForge">🔥 강화 시도하기</button>
      </div>
    `;

    const forgeBtn = document.getElementById('btnDoForge');
    if (forgeBtn) {
      forgeBtn.onclick = () => {
        const res = this.game.inventory.upgradeEquipment(item);
        this.showToast(res.msg, res.success ? 'rainbow' : 'red');
        this.renderUpgradeModal();
        this.renderForgePanel(item);
      };
    }
  }

  // --- PET MODAL RENDER ---
  renderPetModal() {
    const grid = document.getElementById('ownedPetsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const petSys = this.game.petSystem;
    if (!petSys) return;

    if (petSys.ownedPets.length === 0) {
      grid.innerHTML = `<div class="empty-txt">보유한 펫이 없습니다. 알을 부화시켜보세요!</div>`;
      return;
    }

    petSys.ownedPets.forEach(pId => {
      const pet = PET_DATABASE[pId];
      if (!pet) return;

      const isEquipped = petSys.activePetId === pId;
      const card = document.createElement('div');
      card.className = `pet-card rarity-${pet.rarity} ${isEquipped ? 'active-pet' : ''}`;
      card.innerHTML = `
        <div class="pet-icon">${pet.icon}</div>
        <div class="pet-name">${pet.name}</div>
        <div class="pet-desc">${pet.desc}</div>
        <div class="pet-action">
          ${isEquipped ? `<button class="btn-pet-unequip">해제하기</button>` : `<button class="btn-pet-equip">장착하기</button>`}
        </div>
      `;

      if (isEquipped) {
        card.querySelector('.btn-pet-unequip').onclick = () => {
          petSys.unequipPet();
        };
      } else {
        card.querySelector('.btn-pet-equip').onclick = () => {
          petSys.equipPet(pId);
        };
      }
      grid.appendChild(card);
    });
  }

  setupHudEventListeners() {
    // Menu buttons
    const bindClick = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.onclick = handler;
    };

    bindClick('btnOpenInv', () => this.toggleModal('inventoryModal'));
    bindClick('btnOpenStats', () => this.toggleModal('statsModal'));
    bindClick('btnOpenQuests', () => this.toggleModal('questModal'));
    bindClick('btnOpenShop', () => this.toggleModal('shopModal'));
    bindClick('btnOpenPets', () => this.toggleModal('petModal'));
    bindClick('btnOpenUpgrade', () => this.toggleModal('upgradeModal'));

    // Utility buttons
    bindClick('btnBgmToggle', () => {
      const active = this.game.audio.toggleBGM();
      const el = document.getElementById('btnBgmToggle');
      if (el) el.textContent = active ? '🎵 BGM: ON' : '🎵 BGM: OFF';
    });
    bindClick('btnSfxToggle', () => {
      const soundOn = this.game.audio.toggleMute();
      const el = document.getElementById('btnSfxToggle');
      if (el) el.textContent = soundOn ? '🔊 SFX: ON' : '🔇 SFX: OFF';
    });
    bindClick('btnHelp', () => this.toggleModal('helpModal'));

    // Action Hotbar Slots Click
    bindClick('slotAttack', () => this.game.player.performAttack());
    bindClick('slotSkill1', () => this.game.combat.castWhirlwind());
    bindClick('slotSkill2', () => this.game.combat.castFireball());
    bindClick('slotSkill3', () => this.game.combat.castHolyBeam());
    bindClick('slotSkill4', () => this.game.player.dash());
    bindClick('slotPotionHp', () => this.game.inventory.quickUseHpPotion());
  }

  setupModalsEventListeners() {
    const bindClick = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.onclick = handler;
    };

    // Close buttons for all modals
    bindClick('btnCloseDialogue', () => { document.getElementById('dialogueModal').style.display = 'none'; });
    bindClick('btnCloseInv', () => { document.getElementById('inventoryModal').style.display = 'none'; });
    bindClick('btnCloseStats', () => { document.getElementById('statsModal').style.display = 'none'; });
    bindClick('btnCloseQuest', () => { document.getElementById('questModal').style.display = 'none'; });
    bindClick('btnCloseShop', () => { document.getElementById('shopModal').style.display = 'none'; });
    bindClick('btnCloseUpgrade', () => { document.getElementById('upgradeModal').style.display = 'none'; });
    bindClick('btnClosePet', () => { document.getElementById('petModal').style.display = 'none'; });
    bindClick('btnCloseHelp', () => { document.getElementById('helpModal').style.display = 'none'; });

    // Stat points allocate (+)
    document.querySelectorAll('.btn-stat-add').forEach(btn => {
      btn.onclick = (e) => {
        const stat = e.target.getAttribute('data-stat');
        this.game.stats.allocateStat(stat);
      };
    });

    // Rebirth button
    bindClick('btnDoRebirth', () => {
      this.game.stats.doRebirth();
    });

    // Quest tabs
    bindClick('tabActiveQuests', () => {
      this.setQuestTabActive('tabActiveQuests');
      this.renderQuestModal('active');
    });
    bindClick('tabStoryQuests', () => {
      this.setQuestTabActive('tabStoryQuests');
      this.renderQuestModal('story');
    });
    bindClick('tabBounties', () => {
      this.setQuestTabActive('tabBounties');
      this.renderQuestModal('bounties');
    });

    // Shop tabs
    bindClick('tabShopWeapon', () => {
      this.setShopTabActive('tabShopWeapon');
      this.renderShopModal('weapon');
    });
    bindClick('tabShopPotion', () => {
      this.setShopTabActive('tabShopPotion');
      this.renderShopModal('potion');
    });
    bindClick('tabShopEggs', () => {
      this.setShopTabActive('tabShopEggs');
      this.renderShopModal('egg');
    });

    // Pet Hatching buttons
    bindClick('btnHatchBasic', () => {
      if (this.game.stats.spendGold(250)) {
        this.game.petSystem.hatchEgg('basic');
      } else {
        this.showToast('골드가 부족합니다! (250 G 필요)', 'red');
      }
    });
    bindClick('btnHatchForest', () => {
      if (this.game.stats.spendGold(800)) {
        this.game.petSystem.hatchEgg('forest');
      } else {
        this.showToast('골드가 부족합니다! (800 G 필요)', 'red');
      }
    });
    bindClick('btnHatchLegendary', () => {
      if (this.game.stats.spendGems(50)) {
        this.game.petSystem.hatchEgg('legendary');
      } else {
        this.showToast('보석이 부족합니다! (50 💎 필요)', 'red');
      }
    });
  }

  setQuestTabActive(activeId) {
    document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  setShopTabActive(activeId) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  showInteractPrompt(text) {
    const prompt = document.getElementById('interactPrompt');
    if (!prompt) return;
    prompt.style.display = 'flex';
    const textEl = document.getElementById('interactText');
    if (textEl) textEl.textContent = text;
  }

  hideInteractPrompt() {
    const prompt = document.getElementById('interactPrompt');
    if (prompt) prompt.style.display = 'none';
  }
}
