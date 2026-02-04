# Dark Side Football - Game Flow

## Entry Flow

```
User arrives at /v5/splash
    │
    ▼
┌─────────────┐
│  TRAILER    │ ← 30s video
│   PHASE     │   (skippable after 3s)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  CAPTURE    │ ← "Enter the Big Game Giveaway"
│   PHASE     │   CTA button
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  REGISTER   │ ← 4-step wizard
│   WIZARD    │   Email → Name → Address → Confirm
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  SUCCESS    │ ← "You're Entered!"
│             │   1 entry earned
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  GAME HUB   │ ← Main app
│             │   Campaign progress
└─────────────┘
```

## Main App Navigation

```
┌──────────────────────────────────────┐
│                                      │
│            GAME HUB                  │
│         /v5/game                     │
│                                      │
│  ┌─────────┐  ┌─────────┐           │
│  │ Defense │  │   QB    │           │
│  │  Game   │  │  Game   │           │
│  └────┬────┘  └────┬────┘           │
│       │            │                 │
│       ▼            ▼                 │
│  /v5/game/    /v5/game/             │
│   defense       qb                   │
│                                      │
└──────────────────────────────────────┘
          │
          │ (BottomNav)
          │
┌─────────┼─────────┬─────────┬───────┐
│         │         │         │       │
▼         ▼         ▼         ▼       ▼
Game    Picks     Live    Board   Profile
/game   /picks    /live   /leader  /profile
```

## Entry Earning

| Action | Entries |
|--------|---------|
| Registration | 1 |
| Complete Defense Game | 1-5 (by score) |
| Complete QB Game | 1-5 (by score) |
| Submit Picks | 1 |
| Answer Live Question | 1 |
| Correct Live Answer | +1 bonus |
| Product Scan | 1-10 (instant win) |
| Referral Signup | 3 |

## Game Flow - Defense

```
Player Select (/v5/game/defense/select)
    │
    ▼
Pre-Game (Phaser scene)
    │
    ▼
┌─────────────────────┐
│    PLAY LOOP        │
│  ┌───────────────┐  │
│  │ Pick Coverage │  │
│  │       ▼       │  │
│  │ Watch Play    │  │
│  │       ▼       │  │
│  │ See Result    │  │
│  │       ▼       │  │
│  │ Score Points  │  │
│  └───────┬───────┘  │
│          │          │
│     (4 quarters)    │
└──────────┼──────────┘
           │
           ▼
    Game Results
    /v5/game/results
           │
           ▼
    Entries Awarded
```

## Live Questions Flow

```
Before Game:
┌─────────────────────┐
│  COUNTDOWN TIMER    │
│  "Questions drop    │
│   at kickoff"       │
└─────────────────────┘

During Game:
┌─────────────────────┐
│  QUARTER TABS       │
│  Q1  Q2  Q3  Q4     │
├─────────────────────┤
│  QUESTION CARD      │
│  ┌───────────────┐  │
│  │ What will     │  │
│  │ happen on     │  │
│  │ the next      │  │
│  │ play?         │  │
│  ├───────────────┤  │
│  │ ○ Option A    │  │
│  │ ○ Option B    │  │
│  │ ○ Option C    │  │
│  └───────────────┘  │
│                     │
│  ⏱️ 60s timer       │
└─────────────────────┘

After Answer:
┌─────────────────────┐
│  RESULT             │
│  ✓ Correct!         │
│  +1 entry           │
└─────────────────────┘
```

## Picks Flow

```
Picks Hub (/v5/picks)
    │
    ├── Game Winner
    │       │
    │       ▼
    │   Pick Team A or B
    │
    ├── Over/Under
    │       │
    │       ▼
    │   Pick Over or Under
    │
    └── Player Props
            │
            ▼
        Pick player stats

All Picks Made
    │
    ▼
Confirm (/v5/picks/confirm)
    │
    ▼
Picks Locked
    │
    ▼
+1 Entry Earned
```

## Scan & Win Flow

```
Profile → Scan & Win
    │
    ▼
┌─────────────────────┐
│  CAMERA VIEW        │
│  Point at product   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  PHOTO CAPTURED     │
│  Verifying...       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  SCRATCH CARD       │
│  Scratch to reveal  │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  WIN        LOSE
 Prize      Try Again
 Claim      Tomorrow
```
