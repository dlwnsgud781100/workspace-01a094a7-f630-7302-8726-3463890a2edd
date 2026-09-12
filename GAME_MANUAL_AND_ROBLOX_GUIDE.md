# 🎮 블록 퀘스트 3D RPG (BlockQuest RPG) 개발 및 기획 가이드

로블록스(Roblox) 감성의 3D 액션 RPG 프로토타입과 실제 **로블록스 스튜디오(Roblox Studio) Luau 스크립트 아키텍처** 가이드입니다.

---

## 🌟 1. 웹 프로토타입 주요 구현 기능

웹 브라우저에서 바로 플레이하고 테스트할 수 있도록 완성된 시스템 목록입니다:

### 🕹️ 조작법 (Controls)
- **이동**: `W`, `A`, `S`, `D`
- **점프**: `Space`
- **달리기(스프린트)**: `Shift`
- **카메라 시점 회전**: 마우스 좌클릭 드래그 또는 우클릭 드래그
- **카메라 줌 인/아웃**: 마우스 휠
- **기본 공격 (3단 콤보)**: 마우스 좌클릭 또는 `F`
- **스킬 1 [휠윈드]**: `1` (360도 회전 회오리 베기 광역 공격)
- **스킬 2 [파이어볼]**: `2` (전방 폭발 화염구 투사체 발사)
- **스킬 3 [홀리빔]**: `3` (신성한 빛의 기둥 광역 폭딜 + HP 35% 즉시 치유)
- **스킬 4 [대시]**: `4` (순간 무적 돌진 및 잔상 효과)
- **물약 퀵슬롯**: `Q` (체력 물약 즉시 사용)
- **NPC 대화 / 버섯 채집**: `E` (가까이 접근 시 활성화)
- **메뉴 단축키**: `I` (인벤토리), `C` (스탯/환생), `J` (퀘스트/현상금), `B` (상점), `P` (펫 부화소), `U` (대장간 강화)

---

### 🗺️ 월드 맵 & 몬스터 생태계
1. **시작 마을 (평화로운 광장)**:
   - 중앙 분수대 및 회전 마법 수정
   - 촌장의 저택, 대장간, 연금술 공방, 펫 부화소, 현상금 길드 건물
   - **수련용 허수아비 (Training Dummy)**: 타격 시 수련 경험치 및 스탯 숙련도 획득 (시뮬레이터 성장 요소)
2. **속삭이는 숲 (Lv.1 ~ Lv.7)**:
   - 초록 슬라임 (통통 튀는 탄성 물리 적용)
   - 고블린 도적단 (몽둥이 공격 및 추적 AI)
   - 채집용 푸른 마법 버섯 (퀘스트 오브젝트)
3. **고대 지하묘지 (Lv.8 ~ Lv.14)**:
   - 해골 가디언 (검 & 방패를 장착한 언데드 전사)
4. **화산 분화구 & 보스 제단 (Lv.15 ~ Lv.20)**:
   - 마그마 골렘 (용암 코어를 가진 단단한 골렘)
   - **월드 보스 [오크 제왕 고르가르 (World Boss)]**:
     - 3.5배 거대 크기 및 거대 배틀액스
     - **바닥 지면 강타 붉은 장판 (Telegraph Circle)** 회피 기믹
     - **분노 페이즈 (HP 50% 이하)**: 포효와 함께 온몸이 붉게 타오르며 공격 속도/공격력 2배 폭증!

---

### 📜 퀘스트 & NPC 시스템 (우선 구현 요청)
- **마을 촌장 기디온 (`npc_elder`)**: 메인 스토리 퀘스트 10단계 및 최초 환생 안내
- **대장장이 불칸 (`npc_blacksmith`)**: 무기/방어구 +1 ~ +10 강화 시스템 (강화 성공률, 능력치 증폭, 무기 오라 빛 효과)
- **연금술사 릴리 (`npc_alchemist`)**: 체력/마나 회복 물약 상점 및 버섯 채집 서브 퀘스트
- **펫 조련사 포치 (`npc_petmaster`)**: 일반/숲/전설 펫 알 부화 가챠 시스템 및 3D 비행 컴패니언 펫
- **현상금 집행관 로날드 (`npc_bounty`)**: 반복 가능한 일일 슬라임/고블린/해골/보스 토벌 의뢰

---

### 🐾 펫 컴패니언 시스템 (Simulator 요소)
- 플레이어의 어깨 옆을 부드럽게 날아다니며 궤도를 따라오는 3D 블록 펫
- **아기 댕댕이 (Common)**: 골드 +20%, 이동속도 +1
- **닌자 냥이 (Rare)**: 공격력 +22%, 치명타 +6%
- **판다 수도승 (Rare)**: 최대 HP +150, 방어력 +35
- **화염 베이비 드래곤 (Epic)**: 공격력 +45%, 스킬 피해 +20%
- **뇌전의 썬더 피닉스 (Legendary)**: 공격력 +80%, 치명타 +18%, 이동속도 +4.5
- **사이버 메카 드론 (Mythic)**: 공격력 +130%, 골드 +100%, 경험치 +100%, 방어력 +80

---

### 🔄 초월 환생 (Rebirth System)
- 레벨 20 달성 시 스탯창에서 환생 진행 가능
- 레벨은 1로 리셋되지만, **영구 골드/경험치 +35%, 공격력 +20%** 누적 배율과 보석 100개 지급!

---

## 🛠️ 2. 로블록스 스튜디오 (Roblox Studio) 실제 제작 구조 가이드

웹 프로토타입의 로직을 실제 로블록스 스튜디오로 옮길 때 추천하는 표준 프로젝트 구조(Luau)입니다:

### 📂 서비스 구조
```text
ReplicatedStorage/
├── Network/                (RemoteEvents & RemoteFunctions)
│   ├── AttackEvent
│   ├── CastSkillEvent
│   ├── UpgradeEvent
│   ├── HatchEggEvent
│   └── AcceptQuestEvent
├── Modules/
│   ├── ItemDatabase
│   ├── QuestDatabase
│   ├── PetDatabase
│   └── StatCalculator
└── Assets/
    ├── Weapons/
    ├── Pets/
    └── Particles/

ServerScriptService/
├── Data/
│   └── ProfileServiceManager  (유저 인벤토리, 레벨, 세이브 데이터)
├── Combat/
│   └── CombatServerHandler    (서버 판정 히트박스, 대미지 계산식)
├── Systems/
│   ├── MonsterAIService       (몬스터 스폰, 어그로, 패턴)
│   ├── QuestService           (퀘스트 진행도 저장)
│   └── BlacksmithService      (강화 확률 판정)

StarterPlayer/StarterPlayerScripts/
├── Controllers/
│   ├── MovementController
│   ├── CombatClientController  (공격 콤보, 스킬 시각효과, 카메라 셰이크)
│   ├── UIController            (ScreenGui 렌더링, HUD 갱신)
│   └── PetController           (RenderStepped 펫 팔로우)
```

### 💡 핵심 Luau 스크립트 예시 (몬스터 피격 & 대미지 계산)
```lua
-- ServerScriptService/CombatServerHandler.lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local AttackEvent = ReplicatedStorage.Network.AttackEvent

AttackEvent.OnServerEvent:Connect(function(player, comboStep, targetMonster)
    if not targetMonster or not targetMonster:FindFirstChild("Humanoid") then return end
    
    local character = player.Character
    if not character or not character:FindFirstChild("HumanoidRootPart") then return end
    
    -- 거리 검증 (치트 방지)
    local monsterRoot = targetMonster:FindFirstChild("HumanoidRootPart")
    local distance = (character.HumanoidRootPart.Position - monsterRoot.Position).Magnitude
    if distance > 15 then return end
    
    -- 대미지 계산
    local baseAtk = player.Stats.TotalAtk.Value
    local isCrit = math.random() < player.Stats.CritRate.Value
    local finalDamage = baseAtk * (isCrit and 1.5 or 1.0)
    
    targetMonster.Humanoid:TakeDamage(finalDamage)
end)
```
