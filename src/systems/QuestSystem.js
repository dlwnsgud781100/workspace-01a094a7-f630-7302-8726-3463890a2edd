// QuestSystem.js - Comprehensive story quest chain, side quests, and repeatable bounties
import confetti from 'canvas-confetti';

export const QUEST_DATABASE = {
  quest_1: {
    id: 'quest_1',
    title: '새로운 모험가의 첫걸음',
    giverId: 'npc_elder',
    giverName: '마을 촌장 기디온',
    type: 'story',
    dialogueOffer: '어서오게, 젊은 용사여! 블록 퀘스트 대륙에 온 것을 환영하네. 먼저 마을 광장에 배치된 훈련용 허수아비를 5회 타격하여 기본 전투 감각을 익혀보게나! (조작: WASD 이동 / 마우스 좌클릭 또는 F키 공격)',
    dialogueInProgress: '마을 광장에 있는 훈련용 목각 인형(허수아비)을 5번 공격해보게나.',
    dialogueComplete: '훌륭하군! 검을 휘두르는 솜씨가 제법이야. 이 초보자의 목검과 지원 물약을 받게.',
    objectiveType: 'dummy_hit',
    targetCount: 5,
    rewardExp: 150,
    rewardGold: 250,
    rewardGems: 10,
    rewardItems: [{ id: 'wood_sword', count: 1 }, { id: 'hp_potion_s', count: 5 }],
    nextQuestId: 'quest_2'
  },
  quest_2: {
    id: 'quest_2',
    title: '마을 외곽의 불청객',
    giverId: 'npc_elder',
    giverName: '마을 촌장 기디온',
    type: 'story',
    dialogueOffer: '기본기는 충분하군! 지금 마을 앞 초원에 젤리처럼 통통 튀는 초록 슬라임들이 출몰하고 있네. 슬라임 4마리를 처치하여 실전 전투 능력을 입증해보게!',
    dialogueInProgress: '마을 밖 푸른 초원의 초록 슬라임 4마리를 처치해주게.',
    dialogueComplete: '역시 자네에게 재능이 있군! 상처를 보호해줄 질긴 가죽 갑옷을 지급하겠네.',
    objectiveType: 'kill_slime',
    targetCount: 4,
    rewardExp: 400,
    rewardGold: 450,
    rewardGems: 15,
    rewardItems: [{ id: 'leather_tunic', count: 1 }, { id: 'hp_potion_s', count: 5 }],
    nextQuestId: 'quest_3'
  },
  quest_3: {
    id: 'quest_3',
    title: '대장장이 불칸의 부탁',
    giverId: 'npc_blacksmith',
    giverName: '대장장이 불칸',
    type: 'story',
    dialogueOffer: '이봐 용사! 깊은 숲의 고블린 녀석들이 내 소중한 제련용 철광석을 훔쳐갔어! 고블린 5마리를 처치하고 혼쭐을 내주면, 내가 직접 벼려낸 날카로운 강철 롱소드를 주겠네!',
    dialogueInProgress: '깊은 숲에 숨은 고블린 5마리를 토벌하고 오게!',
    dialogueComplete: '하하하! 녀석들이 혼비백산했겠군! 약속대로 강철 롱소드와 강화석을 주마!',
    objectiveType: 'kill_goblin',
    targetCount: 5,
    rewardExp: 900,
    rewardGold: 900,
    rewardGems: 25,
    rewardItems: [{ id: 'iron_blade', count: 1 }, { id: 'enhance_stone', count: 6 }],
    nextQuestId: 'quest_4'
  },
  quest_4: {
    id: 'quest_4',
    title: '연금술사 릴리의 약초 수집',
    giverId: 'npc_alchemist',
    giverName: '연금술사 릴리',
    type: 'story',
    dialogueOffer: '안녕하세요 모험가님! 특제 마나 비약을 만들기 위해 숲속 필드 곳곳에 자라난 푸른빛 마법 버섯 3개가 필요해요. 필드를 탐색하며 버섯과 상호작용(E키)해주세요!',
    dialogueInProgress: '숲 필드에 피어난 푸른 마법 버섯 3개를 찾아주세요.',
    dialogueComplete: '와아! 아주 싱싱한 버섯이네요! 모험에 큰 도움이 될 상급 회복 물약 세트를 드릴게요!',
    objectiveType: 'gather_mushroom',
    targetCount: 3,
    rewardExp: 1400,
    rewardGold: 1200,
    rewardGems: 30,
    rewardItems: [{ id: 'hp_potion_m', count: 8 }, { id: 'mp_potion', count: 8 }],
    nextQuestId: 'quest_5'
  },
  quest_5: {
    id: 'quest_5',
    title: '펫 조련사 포치와 운명의 동반자',
    giverId: 'npc_petmaster',
    giverName: '펫 조련사 포치',
    type: 'story',
    dialogueOffer: '혼자 떠나는 여정은 쓸쓸하죠? 인벤토리(I)에서 펫 알을 사용하거나 펫 부화소(P)에서 알을 1개 부화시켜보세요! 당신을 든든하게 받쳐줄 컴패니언이 태어날 거예요!',
    dialogueInProgress: '인벤토리나 펫 메뉴에서 알을 부화시켜보세요.',
    dialogueComplete: '정말 귀엽고 늠름한 펫이군요! 펫과 함께라면 더욱 빠른 성장이 가능할 거예요!',
    objectiveType: 'hatch_egg',
    targetCount: 1,
    rewardExp: 1800,
    rewardGold: 1500,
    rewardGems: 50,
    rewardItems: [{ id: 'forest_egg', count: 1 }, { id: 'enhance_stone', count: 5 }],
    nextQuestId: 'quest_6'
  },
  quest_6: {
    id: 'quest_6',
    title: '어둠의 지하묘지와 스켈레톤',
    giverId: 'npc_elder',
    giverName: '마을 촌장 기디온',
    type: 'story',
    dialogueOffer: '어둠의 장막이 드리우고 있네... 숲 안쪽 고대 지하묘지에서 사악한 스켈레톤 가디언들이 배회하고 있네. 녀석들 5마리를 격퇴하고 묘지의 결계를 지켜주게!',
    dialogueInProgress: '지하묘지 부근의 스켈레톤 가디언 5마리를 처치해주게.',
    dialogueComplete: '대단하군! 자네의 명성이 온 마을에 자자하네! 기사의 명검을 하사하겠네.',
    objectiveType: 'kill_skeleton',
    targetCount: 5,
    rewardExp: 3500,
    rewardGold: 3000,
    rewardGems: 60,
    rewardItems: [{ id: 'knight_blade', count: 1 }, { id: 'shadow_hood', count: 1 }],
    nextQuestId: 'quest_7'
  },
  quest_7: {
    id: 'quest_7',
    title: '대장간의 비기: 장비 강화',
    giverId: 'npc_blacksmith',
    giverName: '대장장이 불칸',
    type: 'story',
    dialogueOffer: '앞으로 마주할 적들은 상상을 초월할 정도로 강력해! 내 대장간(U키 또는 대화)에서 장비를 [+3 단계] 이상으로 강화해봐! 성공하면 무기에서 영롱한 기운이 뿜어져 나오지!',
    dialogueInProgress: '대장간 메뉴에서 아무 무기나 방어구를 +3 이상으로 강화해보게.',
    dialogueComplete: '오오! 진정한 명장의 손길이 닿은 명검이 탄생했군! 이 여분의 강화석과 보석을 받게!',
    objectiveType: 'upgrade_gear',
    targetCount: 3,
    rewardExp: 5500,
    rewardGold: 4500,
    rewardGems: 100,
    rewardItems: [{ id: 'enhance_stone', count: 15 }],
    nextQuestId: 'quest_8'
  },
  quest_8: {
    id: 'quest_8',
    title: '화산 지대의 파이어 골렘',
    giverId: 'npc_bounty',
    giverName: '현상금 집행관 로날드',
    type: 'story',
    dialogueOffer: '화산 분화구 지대에서 불타는 암석으로 이루어진 파이어 골렘들이 깨어났습니다. 녀석들은 높은 방어력을 자랑합니다. 골렘 3마리를 처치하여 분화구 통로를 확보하십시오!',
    dialogueInProgress: '화산 지대의 파이어 골렘 3마리를 격파하십시오.',
    dialogueComplete: '훌륭한 전공입니다! 뜨거운 화염의 카타나와 중갑 기사 판금갑주를 지급합니다!',
    objectiveType: 'kill_golem',
    targetCount: 3,
    rewardExp: 9000,
    rewardGold: 7000,
    rewardGems: 150,
    rewardItems: [{ id: 'flame_katana', count: 1 }, { id: 'iron_plate', count: 1 }],
    nextQuestId: 'quest_9'
  },
  quest_9: {
    id: 'quest_9',
    title: '최후의 결전: 오크 군주 고르가르',
    giverId: 'npc_elder',
    giverName: '마을 촌장 기디온',
    type: 'story',
    dialogueOffer: '때가 무르익었네... 화산 깊은 곳 제단에 오크 군주 고르가르가 강림했네! 지면을 강타하는 붉은 충격파 범위를 신속히 회피하고, 스킬 콤보로 녀석을 정벌해주게!',
    dialogueInProgress: '화산 깊은 곳의 보스 [오크 군주 고르가르]를 쓰러뜨리게!',
    dialogueComplete: '해냈군! 대륙의 영웅이여! 전설의 용살자 대검과 용린의 수호성갑을 바치네!',
    objectiveType: 'kill_boss',
    targetCount: 1,
    rewardExp: 30000,
    rewardGold: 25000,
    rewardGems: 500,
    rewardItems: [{ id: 'dragon_slayer', count: 1 }, { id: 'dragon_armor', count: 1 }, { id: 'legendary_egg', count: 1 }],
    nextQuestId: 'quest_10'
  },
  quest_10: {
    id: 'quest_10',
    title: '초월자의 길: 최초 환생',
    giverId: 'npc_elder',
    giverName: '마을 촌장 기디온',
    type: 'story',
    dialogueOffer: '자네는 이미 대륙 최고의 용사네. 이제 20레벨 이상을 달성하여 환생(Rebirth)을 완수하게! 새로운 차원의 힘과 영구 능력치 배율을 획득할 수 있네!',
    dialogueInProgress: '20레벨에 도달하여 스탯창(C)에서 [환생하기]를 진행해보게.',
    dialogueComplete: '진정한 초월의 경지에 이르렀군! 신화의 성검 엑스칼리버와 빛의 천사 날개를 영원히 간직하게!',
    objectiveType: 'reach_rebirth',
    targetCount: 1,
    rewardExp: 80000,
    rewardGold: 60000,
    rewardGems: 1000,
    rewardItems: [{ id: 'excalibur', count: 1 }, { id: 'angel_wings', count: 1 }],
    nextQuestId: null
  }
};

export const BOUNTY_LIST = [
  {
    id: 'bounty_slime',
    title: '[현상금] 초원 슬라임 대량 소탕',
    giverId: 'npc_bounty',
    objectiveType: 'kill_slime',
    targetCount: 8,
    rewardGold: 700,
    rewardExp: 600,
    desc: '마을 초원에 번식하는 슬라임 8마리를 사냥합니다.'
  },
  {
    id: 'bounty_goblin',
    title: '[현상금] 숲의 고블린 약탈단 격퇴',
    giverId: 'npc_bounty',
    objectiveType: 'kill_goblin',
    targetCount: 6,
    rewardGold: 1400,
    rewardExp: 1200,
    desc: '상단을 위협하는 고블린 6마리를 처치합니다.'
  },
  {
    id: 'bounty_skeleton',
    title: '[현상금] 지하묘지 스켈레톤 정벌',
    giverId: 'npc_bounty',
    objectiveType: 'kill_skeleton',
    targetCount: 5,
    rewardGold: 2800,
    rewardExp: 2500,
    desc: '묘지에서 날뛰는 해골 병사 5마리를 토벌합니다.'
  },
  {
    id: 'bounty_boss',
    title: '[현상금] 오크 제왕 고르가르 레이드',
    giverId: 'npc_bounty',
    objectiveType: 'kill_boss',
    targetCount: 1,
    rewardGold: 15000,
    rewardExp: 15000,
    rewardGems: 200,
    desc: '화산 지역의 최강 보스 고르가르를 토벌합니다.'
  }
];

export class QuestSystem {
  constructor(game) {
    this.game = game;
    this.activeQuests = {};   // questId -> { currentCount, isComplete }
    this.completedQuests = new Set();
    this.mushroomsGathered = 0;

    // Start with first story quest accepted automatically
    this.acceptQuest('quest_1');
  }

  isQuestActive(questId) {
    return !!this.activeQuests[questId];
  }

  isQuestCompleted(questId) {
    return this.completedQuests.has(questId);
  }

  getQuestProgress(questId) {
    return this.activeQuests[questId] || null;
  }

  acceptQuest(questId) {
    const qData = QUEST_DATABASE[questId] || BOUNTY_LIST.find(b => b.id === questId);
    if (!qData) return false;
    if (this.completedQuests.has(questId) && qData.type === 'story') return false;

    this.activeQuests[questId] = {
      id: questId,
      currentCount: 0,
      targetCount: qData.targetCount,
      isComplete: false
    };

    if (this.game?.audio) this.game.audio.playQuestAccept();
    if (this.game?.ui) {
      this.game.ui.showToast(`📜 퀘스트 수락: [${qData.title}]`, 'gold');
      this.game.ui.updateQuestTracker();
      this.game.ui.renderQuestModal();
    }
    return true;
  }

  progressObjective(type, amount = 1) {
    for (const [qId, progress] of Object.entries(this.activeQuests)) {
      const qData = QUEST_DATABASE[qId] || BOUNTY_LIST.find(b => b.id === qId);
      if (!qData) continue;

      if (qData.objectiveType === type && !progress.isComplete) {
        progress.currentCount = Math.min(qData.targetCount, progress.currentCount + amount);
        if (progress.currentCount >= qData.targetCount) {
          progress.isComplete = true;
          if (this.game?.ui) {
            this.game.ui.showToast(`✨ 퀘스트 완료 가능! [${qData.title}]`, 'rainbow');
          }
        }
        if (this.game?.ui) {
          this.game.ui.updateQuestTracker();
        }
      }
    }
  }

  completeQuest(questId) {
    const progress = this.activeQuests[questId];
    if (!progress || !progress.isComplete) return false;

    const qData = QUEST_DATABASE[questId] || BOUNTY_LIST.find(b => b.id === questId);
    if (!qData) return false;

    // Grant rewards
    if (qData.rewardExp) this.game.stats.addExp(qData.rewardExp);
    if (qData.rewardGold) this.game.stats.addGold(qData.rewardGold);
    if (qData.rewardGems) this.game.stats.addGems(qData.rewardGems);

    if (qData.rewardItems) {
      for (const item of qData.rewardItems) {
        this.game.inventory.addItem(item.id, item.count);
      }
    }

    // Mark completed
    delete this.activeQuests[questId];
    this.completedQuests.add(questId);

    // Audio & Confetti
    if (this.game?.audio) this.game.audio.playQuestComplete();
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    if (this.game?.ui) {
      this.game.ui.showToast(`🎉 퀘스트 완료! [${qData.title}] 보상 수령!`, 'gold');
      this.game.ui.updateHud();
      this.game.ui.updateQuestTracker();
      this.game.ui.renderQuestModal();
    }

    // Auto unlock next story quest if available
    if (qData.nextQuestId && QUEST_DATABASE[qData.nextQuestId]) {
      this.acceptQuest(qData.nextQuestId);
    }

    return true;
  }

  // Hook methods triggered by gameplay events
  onDummyHit() {
    this.progressObjective('dummy_hit', 1);
  }

  onMonsterKilled(mobType) {
    if (mobType === 'slime') this.progressObjective('kill_slime', 1);
    if (mobType === 'goblin') this.progressObjective('kill_goblin', 1);
    if (mobType === 'skeleton') this.progressObjective('kill_skeleton', 1);
    if (mobType === 'golem') this.progressObjective('kill_golem', 1);
    if (mobType === 'boss') this.progressObjective('kill_boss', 1);
  }

  onMushroomGathered() {
    this.progressObjective('gather_mushroom', 1);
  }

  onEggHatched() {
    this.progressObjective('hatch_egg', 1);
  }

  onUpgradeSuccess(level) {
    if (level >= 3) {
      this.progressObjective('upgrade_gear', 1);
    }
  }

  onRebirthDone() {
    this.progressObjective('reach_rebirth', 1);
  }
}
