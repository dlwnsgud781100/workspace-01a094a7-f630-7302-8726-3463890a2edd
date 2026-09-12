// StatsSystem.js - Character stats, leveling, rebirth, and training simulator
export class StatsSystem {
  constructor(game) {
    this.game = game;

    // Player base attributes
    this.level = 1;
    this.exp = 0;
    this.maxExp = 100;

    this.str = 5;  // Strength (Physical Attack)
    this.dex = 5;  // Agility (Crit & Speed)
    this.vit = 5;  // Vitality (HP & Defense)
    this.int = 5;  // Intelligence (Magic Damage & MP)
    this.statPoints = 5;

    this.currentHp = 150;
    this.currentMp = 80;

    this.gold = 200;
    this.gems = 20;

    this.rebirthCount = 0;
    this.trainingCount = 0;

    // Computed combat stats
    this.totalAtk = 25;
    this.totalDef = 10;
    this.maxHp = 175;
    this.maxMp = 100;
    this.critRate = 0.08;
    this.critDmg = 1.5;
    this.moveSpeed = 14;
    this.cooldownReduction = 0;

    this.goldMultiplier = 1.0;
    this.expMultiplier = 1.0;
    this.damageMultiplier = 1.0;

    this.recalculate();
    this.currentHp = this.maxHp;
    this.currentMp = this.maxMp;
  }

  recalculate() {
    // Rebirth bonus: +35% gold, +35% exp, +20% damage per rebirth
    this.goldMultiplier = 1.0 + (this.rebirthCount * 0.35);
    this.expMultiplier = 1.0 + (this.rebirthCount * 0.35);
    this.damageMultiplier = 1.0 + (this.rebirthCount * 0.20);

    // Equipment bonus
    const equip = this.game?.inventory?.getEquippedBonuses() || {
      atk: 0, def: 0, hp: 0, mp: 0, crit: 0, speed: 0, str: 0, dex: 0, vit: 0, int: 0
    };

    // Pet bonus
    const petBonus = this.game?.petSystem?.getActivePetBonus() || {
      atkMul: 0, goldMul: 0, expMul: 0, speedBonus: 0, defBonus: 0, critBonus: 0
    };

    const totalStr = this.str + equip.str;
    const totalDex = this.dex + equip.dex;
    const totalVit = this.vit + equip.vit;
    const totalInt = this.int + equip.int;

    this.maxHp = Math.round(100 + (totalVit * 15) + equip.hp);
    this.maxMp = Math.round(50 + (totalInt * 10) + equip.mp);

    const baseAtk = 10 + (totalStr * 4) + equip.atk;
    this.totalAtk = Math.round((baseAtk * (1.0 + petBonus.atkMul)) * this.damageMultiplier);
    this.totalDef = Math.round(totalVit * 2 + equip.def + petBonus.defBonus);
    this.critRate = Math.min(0.75, 0.05 + (totalDex * 0.006) + equip.crit + petBonus.critBonus);
    this.critDmg = 1.5 + (totalDex * 0.005);
    this.moveSpeed = 14 + (totalDex * 0.08) + equip.speed + petBonus.speedBonus;
    this.cooldownReduction = Math.min(0.40, (totalInt * 0.006));

    this.goldMultiplier += petBonus.goldMul;
    this.expMultiplier += petBonus.expMul;

    // Clamp current hp/mp
    if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
    if (this.currentMp > this.maxMp) this.currentMp = this.maxMp;
  }

  addExp(amount) {
    const finalExp = Math.round(amount * this.expMultiplier);
    this.exp += finalExp;

    let leveledUp = false;
    while (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level++;
      this.maxExp = Math.round(100 * Math.pow(1.22, this.level - 1));
      this.statPoints += 3;
      leveledUp = true;
    }

    if (leveledUp) {
      this.recalculate();
      this.currentHp = this.maxHp;
      this.currentMp = this.maxMp;
      if (this.game?.ui) {
        this.game.ui.onLevelUp(this.level);
      }
      if (this.game?.audio) {
        this.game.audio.playLevelUp();
      }
    }

    if (this.game?.ui) {
      this.game.ui.updateHud();
    }
    return leveledUp;
  }

  addGold(amount) {
    const finalGold = Math.round(amount * this.goldMultiplier);
    this.gold += finalGold;
    if (this.game?.ui) {
      this.game.ui.updateHud();
    }
    return finalGold;
  }

  addGems(amount) {
    this.gems += amount;
    if (this.game?.ui) {
      this.game.ui.updateHud();
    }
  }

  spendGold(amount) {
    if (this.gold >= amount) {
      this.gold -= amount;
      if (this.game?.ui) this.game.ui.updateHud();
      return true;
    }
    return false;
  }

  spendGems(amount) {
    if (this.gems >= amount) {
      this.gems -= amount;
      if (this.game?.ui) this.game.ui.updateHud();
      return true;
    }
    return false;
  }

  spendMp(amount) {
    if (this.currentMp >= amount) {
      this.currentMp -= amount;
      if (this.game?.ui) this.game.ui.updateHud();
      return true;
    }
    return false;
  }

  allocateStat(statKey) {
    if (this.statPoints <= 0) return false;
    if (['str', 'dex', 'vit', 'int'].includes(statKey)) {
      this[statKey]++;
      this.statPoints--;
      this.recalculate();
      if (this.game?.audio) this.game.audio.playButtonClick();
      if (this.game?.ui) {
        this.game.ui.updateHud();
        this.game.ui.renderStatsModal();
      }
      return true;
    }
    return false;
  }

  // Training Dummy Simulator Feature
  trainOnDummy(dummyType = 'physical') {
    this.trainingCount++;
    const trainExp = Math.round(5 * this.expMultiplier);
    this.addExp(trainExp);
    this.addGold(3);

    // Random stat boost chance during training
    if (this.trainingCount % 15 === 0) {
      if (dummyType === 'physical') {
        this.str += 1;
        this.game?.ui?.showToast('💪 수련 달성! STR +1 증가!', 'gold');
      } else {
        this.int += 1;
        this.game?.ui?.showToast('🔮 마력 수련 달성! INT +1 증가!', 'gold');
      }
      this.recalculate();
    }
  }

  canRebirth() {
    return this.level >= 20;
  }

  doRebirth() {
    if (!this.canRebirth()) return false;

    this.rebirthCount++;
    this.level = 1;
    this.exp = 0;
    this.maxExp = 100;
    this.statPoints = 5 + (this.rebirthCount * 3);
    this.str = 5 + (this.rebirthCount * 2);
    this.dex = 5 + (this.rebirthCount * 2);
    this.vit = 5 + (this.rebirthCount * 2);
    this.int = 5 + (this.rebirthCount * 2);

    this.recalculate();
    this.currentHp = this.maxHp;
    this.currentMp = this.maxMp;

    this.addGems(100 * this.rebirthCount);

    if (this.game?.audio) this.game.audio.playUpgradeSuccess();
    if (this.game?.ui) {
      this.game.ui.showToast(`✨ 환생 성공! [${this.rebirthCount}차 환생] 영구 배율 증가!`, 'rainbow');
      this.game.ui.updateHud();
      this.game.ui.renderStatsModal();
    }
    if (this.game?.questSystem) {
      this.game.questSystem.onRebirthDone();
    }
    return true;
  }

  heal(amount) {
    const prev = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    if (this.game?.ui) this.game.ui.updateHud();
    return this.currentHp - prev;
  }

  restoreMp(amount) {
    const prev = this.currentMp;
    this.currentMp = Math.min(this.maxMp, this.currentMp + amount);
    if (this.game?.ui) this.game.ui.updateHud();
    return this.currentMp - prev;
  }

  takeDamage(amount) {
    const dmg = Math.max(1, Math.round(amount - (this.totalDef * 0.4)));
    this.currentHp = Math.max(0, this.currentHp - dmg);
    if (this.game?.ui) this.game.ui.updateHud();
    return dmg;
  }

  isDead() {
    return this.currentHp <= 0;
  }

  respawn() {
    this.currentHp = this.maxHp;
    this.currentMp = this.maxMp;
    if (this.game?.player) {
      this.game.player.teleportToTown();
    }
    if (this.game?.ui) {
      this.game.ui.showToast('마을에서 부활하였습니다!', 'red');
      this.game.ui.updateHud();
    }
  }
}
