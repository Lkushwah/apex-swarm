# New Feature Implementation QA Checklist

When implementing new features or pushing significant changes, follow this checklist to ensure stability and quality before committing code.

## 1. Unit Testing
- [ ] Write unit tests for new classes or logic.
- [ ] Run `npm test` and ensure **ALL** tests pass.
- [ ] If a test fails due to a related logic change (e.g. adding i-frames), update the test correctly instead of bypassing it.

## 2. Gameplay Verification (Local Playtest)
- [ ] Verify the feature activates as expected in-game.
- [ ] If time-based (e.g., spawns at 5 minutes), use a debug key or modify timers temporarily to verify it triggers locally without waiting the full duration.
- [ ] Check for edge cases:
  - Does it work during APEX state?
  - Does it cause errors upon Player death / Game Over screen?
  - Does it interact correctly with existing systems (e.g., do weapons target new enemy types properly)?
  
## 3. UI and Visuals
- [ ] Ensure all UI elements (warnings, health bars, banners) scale correctly on resize.
- [ ] Verify particle effects don't leak memory (they are cleaned up in the array loops).
- [ ] Ensure colors and visual language match the game's aesthetic (no plain placeholder colors).

## 4. Save State & Persistence
- [ ] If new data is saved, check that `SaveManager` serializes and deserializes it correctly.
- [ ] Verify backward compatibility: Does an old save file still load without crashing?

## 5. Performance
- [ ] Test the game loop performance when many entities are spawned (e.g., glitch swarm or multiple bosses).
- [ ] Ensure arrays are cleaned up properly (no lingering references or memory leaks).

## 6. Pre-Commit Cleanup
- [ ] Remove all temporary test/debug code (timer overrides, hardcoded random rolls).
- [ ] Check for dangling `console.log` statements.
- [ ] Verify no development flags (like overriding Firebase environments) are left active.
