# Canva Design Coach

**A context-aware AI layer that detects when intermediate Canva users are doing pro-level work and surfaces pro-level shortcuts at the moment of need.**

Built as a high-fidelity functional prototype for MGMT 276 (PM Delivery), UCLA Anderson School of Management, Spring 2026.

---

## Live Demo

**[design-coach-companion.lovable.app](https://design-coach-companion.lovable.app)**

---

## How to Trigger the Demo

1. Open the live demo link above
2. You will see a Canva-style editor with a 3-page Q4 Brand Deck
3. **Click and drag the LOGO element** off its snap guide (the faint crosshair at the top-left of the canvas)
4. When you release the logo, it snaps back. Drag it off again. And again.
5. After the **3rd drag** across any combination of the 3 pages, Design Coach fires
6. Follow the prompt through the full flow: Design Coach card → Pro upgrade modal → Welcome to Pro → Grid lock tutorial → Pro Mode with Smart Align suggestions → Apply All alignment animation → Milestone toast and recap card

The **Demo Controls panel** (bottom-right) shows your snap release counter and lets you reset at any time. Two stub buttons simulate the other trigger types (undo-redo loop, idle time) to demonstrate the system supports multiple trigger architectures.

---

## What Design Coach Does

Canva's free-to-Pro conversion rate sits at ~12% across 265M MAU. The 6–12 month user cohort — people who have outgrown beginner templates but haven't left for Figma or Adobe — is the highest-churn, highest-potential segment in the user base. The features they need already exist in Canva Pro. They are simply invisible at the exact moment the user needs them.

Design Coach addresses this by:

- **Detecting friction signals** in real time (alignment overrides, undo-redo loops, idle time on elements)
- **Surfacing a single contextual prompt** when the user's behavior signals they are doing pro-level work
- **Guiding the user through a one-tap Pro unlock** in a peer-to-peer tone, never teacher-to-student
- **Applying AI-suggested alignment** across all pages simultaneously after Pro unlock
- **Closing the loop** with a milestone toast and recap card that explicitly name the business outcome

The strategic thesis: Design Coach is not a tutorial system. It is a continuous AI agent that recognizes intermediate user intent and offers a more powerful tool for the same job. The goal is a 20% lift in free-to-Pro conversion in the 6–12 month cohort.

---

## The Agentic Loop

```
User drags logo off snap guide (3x across pages)
        ↓
Friction detection engine fires DesignCoachTrigger
        ↓
Contextual prompt card: "Looks like you're working with a custom grid"
        ↓
User taps "Lock to grid" → Pro upgrade modal
        ↓
"You're already designing like a pro" → Upgrade to Pro
        ↓
Welcome to Pro → Grid lock tutorial overlay (single-screen, peer-mode)
        ↓
Pro Mode Active — 12-column grid visible across all 3 pages
        ↓
Smart Align chips appear on each page
        ↓
User taps "Apply all 3 suggestions" → staggered alignment animation
        ↓
Milestone toast: "All 3 pages aligned. You just saved ~12 minutes."
        ↓
Recap card: surfaces the 4-step business story
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State | React state (in-memory, no backend) |
| Build & deploy | Lovable |
| Design reference | Canva visual system (teal #00C4CC, purple #7D2AE8) |

---

## Key Design Decisions

**One trigger fully built, two stubbed.** Alignment override is the most intermediate-coded trigger — the user is consciously fighting the template, which signals intent rather than confusion. Idle time and undo-redo loop are architecturally supported and button-fired in the demo.

**Single-screen tutorial, not 3-step lesson.** A 3-step tutorial reads as teacher-mode. The strategic positioning requires peer-mode. The confirmation-style overlay explains value after the action, not before.

**Persistent state mutation, not just animation.** An early build ran a satisfying Apply All animation but did not actually move elements. Fixed by requiring strict pixel coordinates and explicit state persistence.

**Peer-mode copy throughout.** Every prompt, modal, and toast is written in the voice of a senior designer, not a product onboarding flow. "You're already designing like a pro" not "Unlock more features."

---

## Project Structure

```
/src
  /components
    CanvasEditor.tsx         — Main editor chrome (toolbar, sidebar, properties panel)
    PageThumbnails.tsx       — Left rail with 3 clickable page thumbnails
    DesignCoachCard.tsx      — Contextual prompt card (the trigger surface)
    ProUpgradeModal.tsx      — Free-to-Pro conversion modal
    GridTutorialOverlay.tsx  — Single-screen grid lock tutorial
    SmartAlignChip.tsx       — Per-page alignment suggestion chips
    MilestoneToast.tsx       — Bottom-center completion toast
    RecapCard.tsx            — Post-alignment strategic outcome summary
    DemoControls.tsx         — Portfolio-only control panel (counter, reset, stubs)
    FirstTimeVisitorBanner.tsx — Portfolio-only onboarding affordance
  /data
    tutorials.json           — Deterministic RAG mapping (trigger → feature → copy)
  /hooks
    useSnapDetection.ts      — Alignment override trigger logic
    useProMode.ts            — Pro tier state management
```

---

## Deliverables

This repository is part of a four-component submission:

| Deliverable | Status |
|---|---|
| Functional prototype (this repo) | Complete |
| Source of Truth MD file | Complete |
| PR-FAQ with appendix (Word doc) | Complete |
| Loom video walkthrough | Complete |

---

## Team

**Group 5 — MGMT 276, UCLA Anderson, Spring 2026**

- Jessica Arias
- Shauty Arovah

---

## Course Context

This prototype was built as the final deliverable for MGMT 276 (PM Delivery) at UCLA Anderson School of Management. The assignment brief required teams to re-architect or significantly improve a well-known AI product by building a high-fidelity, functional prototype using an agentic development workflow, with the MD file spec as the primary code-generator instruction.

The underlying product strategy (Design Coach and the intermediate user cliff thesis) was developed in MGMT 276 Assignment 2 in collaboration with Jessica Arias.
