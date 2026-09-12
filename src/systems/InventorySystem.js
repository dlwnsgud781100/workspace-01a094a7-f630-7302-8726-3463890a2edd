// InventorySystem.js - Inventory, equipment, items, and blacksmith upgrade system
export const ITEM_DATABASE = {
  // --- WEAPONS ---
  wood_sword: {
    id: 'wood_sword',
    name: '초보자의 목검',
    type: 'weapon',
    rarity: 'common',
    atk: 8,
    price: 30,
    desc: '모험을 갓 시작한 여행자가 사용하는 가벼운 목검입니다.',
    icon: '🗡️',
    color: '#8d6e63',
    modelType: 'sword_wood'
  },
  iron_blade: {
    id: 'iron_blade',
    name: '강철 롱소드',
    type: 'weapon',
    rarity: 'common',
    atk: 22,
    price: 150,
    desc: '마을 대장장이가 제련한 튼튼한 강철 검입니다.',
    icon: '⚔️',
    color: '#b0bec5',
    modelType: 'sword_iron'
  },
  knight_blade: {
    id: 'knight_blade',
    name: '왕국 기사의 명검',
    type: 'weapon',
    rarity: 'rare',
    atk: 48,
    crit: 0.05,
    str: 4,
    price: 500,
    desc: '왕국 수호 기사단이 수여받는 날카로운 검입니다.',
    icon: '⚔️',
    color: '#42a5f5',
    modelType: 'sword_knight'
  },
  flame_katana: {
    id: 'flame_katana',
    name: '화염의 카타나',
    type: 'weapon',
    rarity: 'epic',
    atk: 95,
    str: 10,
    crit: 0.08,
    price: 1800,
    desc: '타오르는 불꽃의 기운이 깃든 붉은 카타나입니다.',
    icon: '🔥',
    color: '#ff7043',
    modelType: 'sword_fire'
  },
  frost_claymore: {
    id: 'frost_claymore',
    name: '서리 한기의 대검',
    type: 'weapon',
    rarity: 'epic',
    atk: 140,
    vit: 15,
    hp: 120,
    price: 3200,
    desc: '적을 얼어붙게 만드는 혹한의 대검입니다.',
    icon: '❄️',
    color: '#29b6f6',
    modelType: 'sword_frost'
  },
  dragon_slayer: {
    id: 'dragon_slayer',
    name: '용살자: 드래곤 슬레이어',
    type: 'weapon',
    rarity: 'legendary',
    atk: 230,
    str: 25,
    crit: 0.15,
    price: 8000,
    desc: '고대 거룡을 베어 넘겼다는 전설의 대검입니다.',
    icon: '🐲',
    color: '#ffa726',
    modelType: 'sword_dragon'
  },
  excalibur: {
    id: 'excalibur',
    name: '성검 엑스칼리버',
    type: 'weapon',
    rarity: 'mythic',
    atk: 420,
    str: 35,
    dex: 25,
    vit: 25,
    int: 25,
    crit: 0.25,
    price: 25000,
    desc: '빛의 축복을 받아 모든 어둠을 정화하는 궁극의 신성검입니다.',
    icon: '✨',
    color: '#ab47bc',
    modelType: 'sword_excalibur'
  },

  // --- ARMORS ---
  cloth_armor: {
    id: 'cloth_armor',
    name: '모험가의 천옷',
    type: 'armor',
    rarity: 'common',
    def: 6,
    hp: 40,
    price: 30,
    desc: '가볍고 활동하기 편한 수련용 도복입니다.',
    icon: '🥋',
    color: '#90a4ae'
  },
  leather_tunic: {
    id: 'leather_tunic',
    name: '질긴 가죽 갑옷',
    type: 'armor',
    rarity: 'rare',
    def: 20,
    hp: 120,
    price: 300,
    desc: '야수들의 공격을 막아주는 단단한 가죽 갑옷입니다.',
    icon: '🦺',
    color: '#42a5f5'
  },
  iron_plate: {
    id: 'iron_plate',
    name: '수호 기사 판금갑주',
    type: 'armor',
    rarity: 'epic',
    def: 55,
    hp: 350,
    vit: 10,
    price: 1500,
    desc: '강철로 제작되어 웬만한 타격을 튕겨내는 중갑입니다.',
    icon: '🛡️',
    color: '#ab47bc'
  },
  dragon_armor: {
    id: 'dragon_armor',
    name: '용린의 수호성갑',
    type: 'armor',
    rarity: 'legendary',
    def: 120,
    hp: 900,
    vit: 25,
    str: 15,
    price: 7000,
    desc: '용의 비늘을 엮어 만든 무적의 갑옷입니다.',
    icon: '🐉',
    color: '#ffa726'
  },
  celestial_robe: {
    id: 'celestial_robe',
    name: '천상의 신성 성갑',
    type: 'armor',
    rarity: 'mythic',
    def: 240,
    hp: 2000,
    vit: 50,
    int: 30,
    price: 20000,
    desc: '신들의 가호가 깃든 불멸의 성갑입니다.',
    icon: '👑',
    color: '#f06292'
  },

  // --- HELMETS ---
  novice_cap: {
    id: 'novice_cap',
    name: '초보자 가죽 모자',
    type: 'helmet',
    rarity: 'common',
    def: 3,
    hp: 25,
    price: 20,
    desc: '햇빛을 가려주는 수수한 모자입니다.',
    icon: '🧢',
    color: '#90a4ae'
  },
  viking_helm: {
    id: 'viking_helm',
    name: '바이킹 뿔투구',
    type: 'helmet',
    rarity: 'rare',
    def: 14,
    str: 6,
    hp: 80,
    price: 350,
    desc: '용맹한 전사의 상징인 뿔 달린 강철 투구입니다.',
    icon: '🪖',
    color: '#42a5f5'
  },
  shadow_hood: {
    id: 'shadow_hood',
    name: '암살자의 그림자 두건',
    type: 'helmet',
    rarity: 'epic',
    crit: 0.10,
    dex: 12,
    speed: 2,
    price: 1800,
    desc: '기척을 숨기고 치명타 확률을 대폭 높여줍니다.',
    icon: '🥷',
    color: '#ab47bc'
  },
  golden_crown: {
    id: 'golden_crown',
    name: '영광의 황금 왕관',
    type: 'helmet',
    rarity: 'legendary',
    hp: 400,
    vit: 15,
    goldBonus: 0.25,
    price: 6000,
    desc: '착용자에게 막대한 부와 명예를 가져다주는 왕관입니다.',
    icon: '👑',
    color: '#ffa726'
  },

  // --- WINGS / CAPES ---
  angel_wings: {
    id: 'angel_wings',
    name: '빛의 천사 날개',
    type: 'wings',
    rarity: 'legendary',
    speed: 4,
    crit: 0.08,
    hp: 300,
    price: 10000,
    desc: '순백의 날개로 이동 속도와 도약력을 크게 상승시킵니다.',
    icon: '🪽',
    color: '#ffa726'
  },
  demon_wings: {
    id: 'demon_wings',
    name: '혼돈의 악마 날개',
    type: 'wings',
    rarity: 'legendary',
    atk: 50,
    speed: 3,
    str: 15,
    price: 10000,
    desc: '암흑의 힘으로 공격력과 민첩성을 부여합니다.',
    icon: '🦇',
    color: '#ffa726'
  },
  phoenix_wings: {
    id: 'phoenix_wings',
    name: '불사조의 화염 날개',
    type: 'wings',
    rarity: 'mythic',
    atk: 100,
    speed: 6,
    hp: 800,
    crit: 0.15,
    price: 30000,
    desc: '꺼지지 않는 화염으로 전장을 지배하는 환상의 날개입니다.',
    icon: '🔥',
    color: '#f06292'
  },

  // --- CONSUMABLES ---
  hp_potion_s: {
    id: 'hp_potion_s',
    name: '하급 체력 물약',
    type: 'potion',
    rarity: 'common',
    healAmount: 80,
    price: 25,
    desc: '체력을 80 즉시 회복합니다.',
    icon: '🧪',
    color: '#e53935'
  },
  hp_potion_m: {
    id: 'hp_potion_m',
    name: '중급 체력 물약',
    type: 'potion',
    rarity: 'rare',
    healAmount: 250,
    price: 70,
    desc: '체력을 250 즉시 회복합니다.',
    icon: '🧪',
    color: '#43a047'
  },
  hp_potion_l: {
    id: 'hp_potion_l',
    name: '상급 체력 물약',
    type: 'potion',
    rarity: 'epic',
    healAmount: 700,
    price: 200,
    desc: '체력을 700 대량 회복합니다.',
    icon: '🧪',
    color: '#8e24aa'
  },
  mp_potion: {
    id: 'mp_potion',
    name: '신비한 마나 물약',
    type: 'potion',
    rarity: 'common',
    mpAmount: 100,
    price: 35,
    desc: '마나를 100 즉시 회복합니다.',
    icon: '💙',
    color: '#1e88e5'
  },
  enhance_stone: {
    id: 'enhance_stone',
    name: '신비한 강화석',
    type: 'material',
    rarity: 'rare',
    price: 100,
    desc: '대장간에서 무기 및 방어구를 한계 돌파시키는 마법 광석입니다.',
    icon: '💎',
    color: '#00e5ff'
  },

  // --- PET EGGS ---
  basic_egg: {
    id: 'basic_egg',
    name: '일반 펫 알',
    type: 'egg',
    rarity: 'common',
    price: 250,
    desc: '귀여운 아기 강아지나 닌자 고양이가 부화할 수 있는 알입니다.',
    icon: '🥚',
    color: '#b0bec5',
    eggTier: 'basic'
  },
  forest_egg: {
    id: 'forest_egg',
    name: '숲의 신비한 펫 알',
    type: 'egg',
    rarity: 'rare',
    price: 800,
    desc: '팬더 수도승, 화염 드레이크 등 강력한 펫이 깃든 알입니다.',
    icon: '🥚',
    color: '#66bb6a',
    eggTier: 'forest'
  },
  legendary_egg: {
    id: 'legendary_egg',
    name: '전설의 용 알',
    type: 'egg',
    rarity: 'legendary',
    price: 2500,
    gemPrice: 50,
    desc: '썬더 피닉스, 사이버 메카 등 최강의 펫이 잠들어 있는 신화급 알입니다.',
    icon: '🥚',
    color: '#ffa726',
    eggTier: 'legendary'
  }
};

export class InventorySystem {
  constructor(game) {
    this.game = game;
    this.maxSlots = 28;
    this.items = []; // array of { id, count, upgradeLevel }
    this.equipped = {
      weapon: null,  // { id, count: 1, upgradeLevel: 0 }
      armor: null,
      helmet: null,
      wings: null
    };

    // Starter setup
    this.addItem('wood_sword', 1);
    this.addItem('cloth_armor', 1);
    this.addItem('novice_cap', 1);
    this.addItem('hp_potion_s', 10);
    this.addItem('mp_potion', 5);
    this.addItem('enhance_stone', 6);
    this.addItem('basic_egg', 1);

    // Auto-equip starter items
    this.equipItem(0); // wood sword
    this.equipItem(0); // cloth armor
    this.equipItem(0); // novice cap
  }

  addItem(itemId, count = 1, upgradeLevel = 0) {
    const dbItem = ITEM_DATABASE[itemId];
    if (!dbItem) return false;

    // If stackable (potions, materials, eggs)
    const isStackable = ['potion', 'material', 'egg'].includes(dbItem.type);
    if (isStackable) {
      const existing = this.items.find(it => it.id === itemId);
      if (existing) {
        existing.count += count;
        if (this.game?.ui) this.game.ui.renderInventoryModal();
        return true;
      }
    }

    // Otherwise find empty slot
    if (this.items.length < this.maxSlots) {
      this.items.push({
        id: itemId,
        count: count,
        upgradeLevel: upgradeLevel
      });
      if (this.game?.ui) this.game.ui.renderInventoryModal();
      return true;
    }

    if (this.game?.ui) this.game.ui.showToast('인벤토리가 가득 찼습니다!', 'red');
    return false;
  }

  removeItem(itemId, count = 1) {
    const idx = this.items.findIndex(it => it.id === itemId);
    if (idx === -1) return false;

    const item = this.items[idx];
    if (item.count > count) {
      item.count -= count;
    } else {
      this.items.splice(idx, 1);
    }
    if (this.game?.ui) this.game.ui.renderInventoryModal();
    return true;
  }

  hasItem(itemId, count = 1) {
    let total = 0;
    for (const it of this.items) {
      if (it.id === itemId) total += it.count;
    }
    return total >= count;
  }

  getItemCount(itemId) {
    let total = 0;
    for (const it of this.items) {
      if (it.id === itemId) total += it.count;
    }
    return total;
  }

  equipItem(inventoryIndex) {
    if (inventoryIndex < 0 || inventoryIndex >= this.items.length) return false;
    const item = this.items[inventoryIndex];
    const dbItem = ITEM_DATABASE[item.id];
    if (!dbItem) return false;

    const validSlots = ['weapon', 'armor', 'helmet', 'wings'];
    if (!validSlots.includes(dbItem.type)) return false;

    const slot = dbItem.type;
    const prevEquipped = this.equipped[slot];

    // Remove from inventory
    this.items.splice(inventoryIndex, 1);

    // Equip item
    this.equipped[slot] = item;

    // Put previously equipped back into inventory
    if (prevEquipped) {
      this.items.push(prevEquipped);
    }

    if (this.game?.player) {
      this.game.player.updateAppearance();
    }
    if (this.game?.stats) {
      this.game.stats.recalculate();
    }
    if (this.game?.audio) {
      this.game.audio.playButtonClick();
    }
    if (this.game?.ui) {
      this.game.ui.updateHud();
      this.game.ui.renderInventoryModal();
      this.game.ui.showToast(`'${dbItem.name}' 장착 완료!`, 'gold');
    }
    return true;
  }

  unequipItem(slotName) {
    const equipped = this.equipped[slotName];
    if (!equipped) return false;

    if (this.items.length >= this.maxSlots) {
      if (this.game?.ui) this.game.ui.showToast('인벤토리가 가득 차 해제할 수 없습니다!', 'red');
      return false;
    }

    this.equipped[slotName] = null;
    this.items.push(equipped);

    if (this.game?.player) {
      this.game.player.updateAppearance();
    }
    if (this.game?.stats) {
      this.game.stats.recalculate();
    }
    if (this.game?.audio) {
      this.game.audio.playButtonClick();
    }
    if (this.game?.ui) {
      this.game.ui.updateHud();
      this.game.ui.renderInventoryModal();
    }
    return true;
  }

  useItem(inventoryIndex) {
    if (inventoryIndex < 0 || inventoryIndex >= this.items.length) return false;
    const item = this.items[inventoryIndex];
    const dbItem = ITEM_DATABASE[item.id];
    if (!dbItem) return false;

    if (dbItem.type === 'potion') {
      if (dbItem.healAmount) {
        if (this.game?.stats.currentHp >= this.game?.stats.maxHp) {
          this.game?.ui?.showToast('이미 체력이 가득 차 있습니다.', 'normal');
          return false;
        }
        this.game.stats.heal(dbItem.healAmount);
        this.removeItem(item.id, 1);
        this.game?.ui?.showToast(`체력 +${dbItem.healAmount} 회복!`, 'green');
        if (this.game?.audio) this.game.audio.playButtonClick();
        return true;
      }
      if (dbItem.mpAmount) {
        if (this.game?.stats.currentMp >= this.game?.stats.maxMp) {
          this.game?.ui?.showToast('이미 마나가 가득 차 있습니다.', 'normal');
          return false;
        }
        this.game.stats.restoreMp(dbItem.mpAmount);
        this.removeItem(item.id, 1);
        this.game?.ui?.showToast(`마나 +${dbItem.mpAmount} 회복!`, 'blue');
        if (this.game?.audio) this.game.audio.playButtonClick();
        return true;
      }
    } else if (dbItem.type === 'egg') {
      // Hatch pet
      if (this.game?.petSystem) {
        this.removeItem(item.id, 1);
        this.game.petSystem.hatchEgg(dbItem.eggTier);
        return true;
      }
    } else if (['weapon', 'armor', 'helmet', 'wings'].includes(dbItem.type)) {
      return this.equipItem(inventoryIndex);
    }
    return false;
  }

  // Quick use Potion keys
  quickUseHpPotion() {
    // Find highest potion
    const potionIds = ['hp_potion_l', 'hp_potion_m', 'hp_potion_s'];
    for (const pId of potionIds) {
      const idx = this.items.findIndex(it => it.id === pId);
      if (idx !== -1) {
        return this.useItem(idx);
      }
    }
    this.game?.ui?.showToast('체력 물약이 부족합니다!', 'red');
    return false;
  }

  quickUseMpPotion() {
    const idx = this.items.findIndex(it => it.id === 'mp_potion');
    if (idx !== -1) {
      return this.useItem(idx);
    }
    this.game?.ui?.showToast('마나 물약이 부족합니다!', 'red');
    return false;
  }

  // Blacksmith Enhancement (+1 to +10)
  upgradeEquipment(targetItem) {
    if (!targetItem) return { success: false, msg: '강화할 장비를 선택하세요.' };
    const dbItem = ITEM_DATABASE[targetItem.id];
    if (!['weapon', 'armor', 'helmet', 'wings'].includes(dbItem?.type)) {
      return { success: false, msg: '강화할 수 없는 아이템입니다.' };
    }

    const currentLvl = targetItem.upgradeLevel || 0;
    if (currentLvl >= 10) {
      return { success: false, msg: '이미 최고 강화 단계(+10)입니다!' };
    }

    const stoneCost = Math.max(1, Math.floor(currentLvl / 2) + 1);
    const goldCost = Math.round(100 * Math.pow(1.6, currentLvl));

    if (!this.hasItem('enhance_stone', stoneCost)) {
      return { success: false, msg: `강화석이 부족합니다! (필요: ${stoneCost}개)` };
    }
    if (this.game.stats.gold < goldCost) {
      return { success: false, msg: `골드가 부족합니다! (필요: ${goldCost}G)` };
    }

    // Deduct cost
    this.removeItem('enhance_stone', stoneCost);
    this.game.stats.spendGold(goldCost);

    // Success probability curve
    // +1: 95%, +2: 90%, +3: 85%, +4: 75%, +5: 65%, +6: 55%, +7: 45%, +8: 35%, +9: 25%, +10: 15%
    const rates = [0.95, 0.90, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15];
    const successRate = rates[currentLvl] || 0.20;

    const roll = Math.random();
    if (roll < successRate) {
      targetItem.upgradeLevel = currentLvl + 1;
      this.game?.stats?.recalculate();
      if (this.game?.audio) this.game.audio.playUpgradeSuccess();
      if (this.game?.player) this.game.player.updateAppearance();
      if (this.game?.questSystem) this.game.questSystem.onUpgradeSuccess(targetItem.upgradeLevel);
      return {
        success: true,
        msg: `✨ 강화 대성공! [+${targetItem.upgradeLevel} ${dbItem.name}] 탄생!`,
        level: targetItem.upgradeLevel
      };
    } else {
      if (this.game?.audio) this.game.audio.playUpgradeFail();
      return {
        success: false,
        msg: `💥 강화 실패... 강화 수치는 유지되었습니다.`,
        level: currentLvl
      };
    }
  }

  getEquippedBonuses() {
    const bonus = {
      atk: 0, def: 0, hp: 0, mp: 0, crit: 0, speed: 0, str: 0, dex: 0, vit: 0, int: 0
    };

    for (const slot of Object.keys(this.equipped)) {
      const item = this.equipped[slot];
      if (!item) continue;
      const db = ITEM_DATABASE[item.id];
      if (!db) continue;

      const lvl = item.upgradeLevel || 0;
      const mult = 1.0 + (lvl * 0.18); // +18% base stats per upgrade level!

      if (db.atk) bonus.atk += Math.round(db.atk * mult);
      if (db.def) bonus.def += Math.round(db.def * mult);
      if (db.hp) bonus.hp += Math.round(db.hp * mult);
      if (db.mp) bonus.mp += Math.round(db.mp * mult);
      if (db.crit) bonus.crit += db.crit + (lvl * 0.01);
      if (db.speed) bonus.speed += db.speed + (lvl * 0.2);
      if (db.str) bonus.str += Math.round(db.str * mult);
      if (db.dex) bonus.dex += Math.round(db.dex * mult);
      if (db.vit) bonus.vit += Math.round(db.vit * mult);
      if (db.int) bonus.int += Math.round(db.int * mult);
    }

    return bonus;
  }
}
