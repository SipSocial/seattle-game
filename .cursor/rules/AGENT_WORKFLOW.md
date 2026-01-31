# Seattle Seahawks Defense - Multi-Agent Workflow

## Overview

This project uses multiple AI agents (via Cursor) to handle different aspects of development. This document defines how agents should collaborate, share context, and avoid conflicts.

---

## Agent Roles

### Agent Charlie (Starter Agent)
**File**: `AGENT_CHARLIE.md`

**Responsibilities**:
- Project initialization and scaffolding
- Maintaining documentation
- Tracking overall project state
- Coordinating between agents
- Setting up new development environments

**When to Use**:
- Starting fresh on a new machine
- Major architecture decisions
- Documentation updates
- Resolving agent conflicts

---

### Specialized Agents

Agents can be spawned for specific tasks. Use the Task tool with appropriate `subagent_type`:

| Task Type | Subagent | Use Case |
|-----------|----------|----------|
| Code exploration | `explore` | "How does the campaign system work?" |
| Shell commands | `shell` | Git operations, npm scripts, deployments |
| General tasks | `generalPurpose` | Complex multi-step implementations |

---

## Context Sharing

### How Agents Share Context

1. **Documentation Files** (Primary)
   - `.cursor/rules/project-context.md` - Current project state
   - `.cursor/rules/ARCHITECTURE.md` - System design
   - `.cursor/rules/DESIGN_PLAN.md` - Visual/UX guidelines
   - `.cursor/rules/RULES.md` - Coding standards
   - This file - Workflow guidelines

2. **Code Comments** (Secondary)
   ```typescript
   /**
    * CampaignMapV2 - Interactive US map for Road to Super Bowl
    * 
    * @context Uses Leonardo-generated video background
    * @context Airplane is 3D draggable like player selection
    * @context Multiple stages at same city use LocationPickerModal
    */
   ```

3. **Zustand Store** (Runtime State)
   - All game state in `src/store/gameStore.ts`
   - Agents should update store, not create parallel state

---

## Task Handoff Protocol

### Starting a Task

```markdown
## Before Starting
1. Read `.cursor/rules/project-context.md`
2. Read relevant architecture docs
3. Check git status for any pending changes
4. Note current state of files you'll modify
```

### Completing a Task

```markdown
## Before Handing Off
1. Commit changes with descriptive message
2. Update documentation if needed
3. Note any unfinished work in project-context.md
4. List any known issues or edge cases
```

### Task Documentation Format

When creating tasks for other agents:

```markdown
## Task: [Short Description]

### Context
- What led to this task
- Related files/components
- Any constraints or requirements

### Objective
- Specific, measurable goal
- Expected deliverable

### Approach (optional)
- Suggested implementation if known
- Alternatives considered

### Acceptance Criteria
- [ ] Testable condition 1
- [ ] Testable condition 2
- [ ] No TypeScript errors
- [ ] Works on mobile
```

---

## Parallel Execution Guidelines

### When to Run Agents in Parallel

✅ **Good candidates**:
- Reading multiple independent files
- Searching different parts of codebase
- Independent feature implementations
- Running tests while making changes

❌ **Don't parallelize**:
- Changes to the same file
- Dependent operations (mkdir → cd)
- Git operations (add → commit → push)
- API calls that depend on previous results

### Example: Parallel Exploration

```typescript
// Launch multiple explore agents in parallel
Task("explore", "How does PlayerSelect handle touch?")
Task("explore", "How does CampaignMapV2 render markers?")
Task("explore", "What's in campaignAssets.ts?")
```

### Example: Sequential Operations

```bash
# These MUST be sequential
git add .
git commit -m "message"
git push origin master
vercel --prod
```

---

## Conflict Resolution

### File Conflicts

When two agents try to modify the same file:

1. **Stop and assess** - Don't force changes
2. **Check git status** - See actual conflicts
3. **Merge logically** - Combine both sets of changes
4. **Verify** - Run build, test functionality

### Logic Conflicts

When agents implement conflicting approaches:

1. **Document both** - Note in project-context.md
2. **Evaluate** - Which aligns better with DESIGN_PLAN.md?
3. **Decide** - Pick one, remove the other
4. **Update docs** - Record decision and rationale

---

## Communication Patterns

### Agent → User

When reporting to user:
- Lead with the outcome, not the process
- Show screenshots/URLs when relevant
- List any decisions that need user input
- Note any issues discovered

```markdown
✅ Good: "Deployed to https://seattle-game.vercel.app - 
         the 3D rotation is now smooth on mobile"

❌ Bad:  "I read the file and then I updated the animation 
         and then I committed and then I deployed"
```

### Agent → Agent (via docs)

When leaving context for next agent:

```markdown
## Current State (2026-01-30)

### Just Completed
- Campaign map location picker modal
- 3D airplane touch interaction
- Dark Side plane video integration

### In Progress
- None

### Known Issues
- Video autoplay requires user interaction on iOS Safari
- City markers need to be grouped when overlapping

### Next Steps
1. Generate player images with reference photos
2. Add DrinkSip jersey variants
3. Implement leaderboard
```

---

## Leonardo AI Workflow

### Asset Generation Protocol

Leonardo API calls are expensive and slow. Follow this process:

1. **Plan first** - Define exactly what you need
2. **Use admin pages** - `/admin/players` for interactive selection
3. **Generate variations** - Always generate 4 options
4. **User selects** - Don't auto-pick
5. **Store in data files** - `playerImages.ts`, `campaignAssets.ts`
6. **Use CDN URLs** - Don't download/re-host

### Prompt Management

All prompts live in:
- `src/lib/spritePrompts.ts` - Player and sprite prompts
- `src/lib/stagePrompts.ts` - Background and environment prompts

When creating new prompts:
1. Follow existing patterns
2. Include negative prompts
3. Specify exact colors (hex codes)
4. Reference existing good examples

### Handling NSFW Flags

Leonardo sometimes flags sports content as NSFW:

```typescript
// Check for TRADEMARK moderation (common with sports content)
if (result.modelCapacity === 'BLOCKED' || 
    result.status === 'NSFW_DETECTED') {
  // Construct URL manually from generation ID
  const url = constructImageUrl(result.generationId, index)
}
```

---

## Error Recovery

### Build Failures

```bash
# 1. Check the error
npm run build 2>&1

# 2. Common fixes
rm -rf .next          # Clear cache
rm -rf node_modules   # Reinstall deps
npm install

# 3. If TypeScript error
# Read the error message carefully
# Fix the specific file/line
```

### Server Won't Start

```bash
# 1. Check for processes on port
npx lsof -i :3004

# 2. Kill if needed
taskkill /F /PID <pid>  # Windows
kill -9 <pid>           # Mac/Linux

# 3. Restart
npm run dev
```

### Vercel Deploy Fails

```bash
# 1. Check local build works
npm run build

# 2. Force fresh deploy
vercel --prod --force

# 3. Check Vercel logs
vercel logs <deployment-url>
```

---

## Checklist Templates

### Pre-Work Checklist

- [ ] Read project-context.md
- [ ] Check git status (clean working tree?)
- [ ] Verify dev server runs
- [ ] Understand scope of task

### Post-Work Checklist

- [ ] TypeScript builds successfully
- [ ] No console errors
- [ ] Tested on mobile
- [ ] Committed with descriptive message
- [ ] Updated docs if needed
- [ ] Deployed (if requested)

### Deploy Checklist

- [ ] `npm run build` passes locally
- [ ] All changes committed
- [ ] `vercel --prod` succeeds
- [ ] Verify on production URL
- [ ] Test critical paths (play game, navigate map)

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server on :3004
npm run build            # Production build
npm run lint             # Check linting

# Git
git status               # Check changes
git add .                # Stage all
git commit -m "msg"      # Commit
git push origin master   # Push to GitHub

# Deployment
vercel                   # Preview deploy
vercel --prod            # Production deploy
vercel --prod --force    # Force rebuild

# Troubleshooting
rm -rf .next             # Clear Next.js cache
npx lsof -i :3004        # Find process on port
```

### Key File Locations

| Purpose | Location |
|---------|----------|
| Project context | `.cursor/rules/project-context.md` |
| Game state | `src/store/gameStore.ts` |
| Phaser config | `src/game/config/phaserConfig.ts` |
| Campaign data | `src/game/data/campaign.ts` |
| Player images | `src/game/data/playerImages.ts` |
| Leonardo assets | `src/game/data/campaignAssets.ts` |
| API routes | `app/api/` |

### Emergency Contacts (Code Paths)

| Problem | Check These Files |
|---------|-------------------|
| Game won't load | `app/play/components/GameCanvas.tsx` |
| Touch not working | Component with `onTouchMove`, check `touch-action` |
| Animations jank | Look for useState in touch handlers |
| Build fails | Read exact TypeScript error |
| Deploy fails | Check Vercel dashboard logs |
