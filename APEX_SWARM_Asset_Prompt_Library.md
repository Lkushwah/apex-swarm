# APEX SWARM — Asset & Prompt Library

> **Companion to:** Apex Swarm GDD v2.0
> **Purpose:** Ready-to-use generation prompts for every visual and audio artifact the game needs — character, enemies, bosses, weapons, items, VFX, HUD/UI, backgrounds, branding, sound effects, and music.

---

## 0. How to Use This Document

**Two asset tracks.** Per the GDD, the in-game player/enemies render as procedural Canvas primitives (glowing shapes with `shadowBlur`) — no sprites required for that layer in the MVP. The prompts in this document cover everything *else* that genuinely needs generated/illustrated art regardless of that choice: app icon, store listing art, marketing key art, loading/splash screens, weapon and passive icons (used in the draft UI and shop, where emoji placeholders won't ship), HUD chrome, backgrounds, VFX textures, and an optional future sprite-art upgrade pass. Where a section is procedural-only, it's marked **[Procedural — code, not art]**.

**Recommended tools.** Image: Midjourney v6/v7, Flux, or SDXL-family models. Audio SFX: ElevenLabs Sound Effects, Stable Audio, or a sound designer brief (prompts below work for either). Music: Stable Audio / Suno-style tools or a composer brief.

**Style consistency.** Every image prompt below assumes the **Master Style Block** in §1. For tools with persistent style/character reference (Midjourney `--cref`/`--sref`, an SDXL style LoRA), set it once. Otherwise, append the Master Style Block verbatim to the end of each prompt.

**Negative prompt (append to all image generations):**
```
no text, no watermark, no logo artifacts, no realistic human anatomy, no photorealism,
no blur, no extra limbs, no busy background clutter, no UI mockup borders
```

**File/folder convention** (matches the project structure in GDD §17):
```
/assets/key-art/      → marketing, splash, character/enemy/boss concept art
/assets/icons/         → weapon, passive, currency, upgrade icons (512×512 PNG, transparent)
/assets/ui/            → HUD chrome, buttons, panels, frames
/assets/vfx/           → particle textures, glow sprites, burst textures
/assets/backgrounds/   → parallax layers, menu/shop backgrounds
/assets/sfx/           → .ogg/.wav sound effects
/assets/music/         → looping .ogg tracks
```

---

## 1. Master Style Block

Append to every 2D art prompt unless the tool supports a persistent style reference:

```
neon cyberpunk vector illustration, glowing geometric line-work, dark navy
background (#0f172a), saturated neon accent palette (electric cyan #06b6d4,
hot magenta #ec4899, amber #fbbf24, violet #8b5cf6, signal red #ef4444),
soft outer glow and bloom, clean flat shading with subtle rim-light gradient,
crisp vector edges, high contrast, minimalist geometric forms, digital 2D
game asset, no gradients muddier than two-tone, transparent background
where applicable, ultra-clean linework, 4k resolution
```

---

## 2. Player Character — "The Cyber-Warrior"

### 2.1 [Procedural — code, not art]
In-engine, the player renders as a glowing cyan circle with a white inner core, per GDD §20. No sprite asset is required for this layer.

### 2.2 Key Art / Hero Portrait (marketing, loading screen, main menu backdrop)
```
Front three-quarter view of a sleek humanoid cyber-warrior, slim
armored silhouette with glowing circuit-line seams running across the
chest and limbs, a featureless smooth visor that emits a soft cyan
inner light instead of visible eyes, faint particle dust trailing
off the shoulders, standing in a confident ready stance, dark
unmarked armor plating accented with thin cyan glow lines, no
weapon visible in this pose, dramatic rim lighting from behind in
deep violet, dynamic but centered composition with generous
negative space around the figure, 9:16 portrait aspect ratio
```

### 2.3 Apex Mode State (transformation variant)
```
Same cyber-warrior character now engulfed in an intense white-gold
pulsing energy aura, circuit-line seams blazing white-hot, a thin
spinning ring of light orbiting the figure at chest height, sparks
and small energy motes radiating outward, screen-edge glow bleeding
in from red and gold at the corners, sense of explosive barely-
contained power, same pose/silhouette as the base portrait for
clean before/after consistency, 9:16 portrait aspect ratio
```

### 2.4 Dash Effect (motion variant)
```
Abstract motion-streak sprite: a short horizontal trail of cyan
light particles tapering from bright core to transparent tail,
faint afterimage silhouette ghosting behind a fast-moving point,
designed to be rotated to match movement direction in-engine,
isolated on transparent background, no character detail needed —
pure light-trail VFX asset
```

### 2.5 Cosmetic Skin Variants (Core-currency shop, §13/§18 of GDD)
| Skin | Prompt |
|---|---|
| **Chrome Founder's Edition** | Same cyber-warrior silhouette as §2.2, but armor plating rendered as polished chrome/mirror surface reflecting faint rainbow neon highlights, circuit-seams glowing gold instead of cyan |
| **Shadow Operative** | Same silhouette, matte black armor with no visible plating seams, only faint violet glow lines, visor light dimmed to a thin slit — a stealthier, lower-key reskin |
| **Solar Flare** | Same silhouette, armor plating in warm amber/orange tones, circuit-seams glowing white-hot, small ember particles drifting off the character at rest |

---

## 3. Enemy Roster

### 3.1 [Procedural — code, not art] for in-game gameplay rendering
Enemies render as colored geometric primitives (square, circle, diamond, hexagon, triangle, octagon, tiny-square cluster) per GDD §8. The prompts below are for **concept/key art** (used in loading-screen tips, a future "Bestiary" menu screen, and marketing) and for **icon art** (used in the Daily Challenge modifier cards, which reference specific enemy types).

### 3.2 Concept Art Prompts

| Enemy | Concept Art Prompt |
|---|---|
| **Swarmer** | A small aggressive red geometric construct shaped like a sharp-edged square crystal, glowing crimson cracks across its faceted surface, faint motion-blur streaks suggesting fast erratic movement, menacing but small-scale, swarm of 3–4 identical units clustered together for the key art |
| **Brute** | A large slow-moving orange spherical construct with thick armored plating segments, deep glowing orange cracks pulsing like a heartbeat, heavy and imposing despite the geometric simplicity, single unit centered, sense of weight and mass |
| **Shooter** | A purple diamond-shaped floating construct with a single glowing violet aperture at its center like an eye, thin angular "legs" of light suggesting it hovers rather than walks, a faint targeting-line glow extending from its core |
| **Shielder** | A cyan hexagonal construct, front-facing facets rendered as a thick glowing energy barrier, rear facets dimmer and exposed showing a brighter weak-point facet, subtle rotation-blur on the body suggesting it strafes rather than charges |
| **Phasewraith** | A violet triangular construct that appears semi-transparent/glitching, faint duplicate ghost-silhouettes offset behind it suggesting teleportation, jagged digital-noise distortion at its edges |
| **Bulwark Drone** | A steel-grey octagonal construct, geometric and mechanical rather than organic, a glowing charging ring visible around its midsection mid-activation, small thruster glow ports along its base |
| **Glitch Swarm (cluster)** | Five tiny magenta cube fragments clustered in a loose orbiting formation around a shared faint glitch-noise core, individually fragile-looking but visually "buzzing" together as one mass |

### 3.3 Bestiary Icon Prompts (compact, 512×512, transparent background)
```
[Enemy name from table above], isolated single icon centered on
transparent background, simplified silhouette readable at small
size, flat-glow vector style, no background elements, icon-grade
clarity
```

---

## 4. Boss Encounters

Bosses are spectacle moments (GDD §9) — these deserve full key art, not just icons, since they appear in telegraph banners, the bestiary, and marketing.

### 4.1 The Bulwark Prime
```
A massive imposing orange hexagonal construct, far larger and more
geometrically complex than standard enemies, compound layered
plating with multiple glowing fault-lines across its surface,
four faint concentric ring-shaped energy markers floating around
its base suggesting telegraphed shockwave attacks, slightly low-
angle composition to emphasize scale and threat, dark navy void
background with no ground plane visible, dramatic underlighting
```

### 4.2 Glitchmother
```
A large unstable magenta construct composed of many smaller cube
fragments barely held together in a roughly humanoid-adjacent
silhouette, visible cracks of digital noise/glitch distortion
running through its form, several smaller identical fragment-
clusters visibly "peeling off" the main body to suggest its split
attack, unsettling asymmetric silhouette, dark navy void background
```

### 4.3 Railwraith
```
An elongated, blade-thin violet diamond construct stretched into
a long angular form, faint glowing line trails suggesting it has
just swept across the frame at high speed, twin thin laser-beam
glow lines extending off both ends of its body, minimal but sharp
and fast-feeling silhouette, dark navy void background
```

### 4.4 The Apex Mirror
```
A tall humanoid silhouette identical in proportion to the player
character (§2.2) but rendered as a dark glass-like mirrored
surface, faint cyan-to-red gradient glow flickering across its
reflective armor as if uncertain which side it belongs to, no
visible face, holding faint ghost-outline echoes of multiple
weapon silhouettes around it suggesting it can use any of the
player's own weapons, dramatic symmetrical composition, dark
navy void background
```

### 4.5 Boss Telegraph Warning Icon
```
A simple triangular directional warning arrow icon, glowing amber-
red, sharp angular geometric style matching the rest of the icon
set, pulsing-ready single static frame, isolated on transparent
background
```

---

## 5. Weapons & Projectile VFX

### 5.1 Base Weapon Projectiles

| Weapon | Prompt |
|---|---|
| **Kinetic Blaster bolt** | A small elongated cyan energy bolt, bright glowing core fading to a soft tapered tail, simple and fast-reading silhouette, isolated on transparent background |
| **Plasma Orbit orb** | A small glowing blue-violet plasma sphere with a soft pulsing outer corona, faint internal swirl texture, isolated on transparent background |
| **Chain Lightning bolt** | A jagged branching bolt of bright electric-cyan light, sharp angular fork shape with thin secondary branches, glowing core with faint static-spark particles along its length, isolated on transparent background |
| **Missile Barrage missile** | A small sleek dart-shaped projectile with a glowing amber-orange thruster trail tapering behind it, minimal geometric body, isolated on transparent background |
| **Glitch Scythe arc** | A wide translucent crescent-shaped energy slash, bright violet-white leading edge fading to transparent trailing edge, motion-blur suggestion baked into the shape itself, isolated on transparent background |
| **Drone Swarm unit** | A tiny angular floating drone construct, steel-and-cyan coloring, single glowing optic/targeting light at its front, two small thruster glow points at the rear, isolated on transparent background |

### 5.2 Evolved Weapon VFX

| Evolution | Prompt |
|---|---|
| **Railgun Array** (Kinetic Blaster evolved) | A long continuous beam of intense white-cyan light with a bright glowing core and soft outer bloom, full-length beam asset designed to stretch across the screen, isolated on transparent background |
| **Singularity Ring** (Plasma Orbit evolved) | A single thin glowing ring of blue-violet energy with a faint dark gravitational distortion warping the space at its center, subtle inward-pulling particle streaks feeding into the ring, isolated on transparent background |
| **Storm Front** (Chain Lightning evolved) | A screen-wide radial burst of branching electric arcs emanating from a bright central point, dense web of jagged cyan-white lightning fractals, isolated on transparent background |
| **Apocalypse Pod** (Missile Barrage evolved) | A cluster of three small sub-munition projectiles splitting outward from a central burst point, each trailing a short amber glow tail, isolated on transparent background |
| **Reality Tear** (Glitch Scythe evolved) | A full 360-degree expanding ring of violet-white energy with a faint crimson lifesteal-tinted inner edge, jagged "tear" texture along the ring's outer rim suggesting reality glitching open, isolated on transparent background |
| **Hive Mind** (Drone Swarm evolved) | A tight formation of six small angular drones, each now emitting a thin tracking laser line, slightly larger and more detailed than the base drone, isolated on transparent background |

---

## 6. Passive Item Icons

512×512, transparent background, flat-glow vector icon style, single centered symbol, no background elements.

| ID | Icon Prompt |
|---|---|
| Targeting Module | A minimalist glowing cyan crosshair/reticle icon with a small concentric ring |
| Mass Core | A glowing violet sphere icon with a faint orbiting ring around it |
| Conductor Coil | A glowing cyan coiled-spring/spiral icon with small spark marks at each end |
| Warhead | A glowing amber diamond-shaped icon with radiating burst lines around it |
| Bloodline Edge | A glowing crimson droplet icon merged with a thin blade-edge silhouette |
| Swarm Link | A glowing cyan icon of three small connected nodes in a triangle formation |
| Iron Plate | A glowing steel-blue hexagonal shield icon, flat and geometric |
| Apex Capacitor | A glowing gold-red lightning-bolt-in-a-circle icon, battery/capacitor styling |
| Momentum Drive | A glowing cyan forward-chevron/arrow icon with a short motion-trail |
| Vampiric Core | A glowing crimson heart-shaped icon rendered in angular geometric facets rather than a soft heart shape |

---

## 7. Collectibles & Currency Icons

512×512, transparent background, small glowing gem/coin-style icon, soft particle sparkle around the form.

| Item | Icon Prompt |
|---|---|
| **XP Gem** | A small faceted green crystal/gem icon, bright glowing core, sharp angular cut facets, soft green particle sparkle around it |
| **Credit** | A small amber geometric coin/token icon, glowing inner ring pattern, faint amber particle sparkle around it |
| **Core** | A small iridescent pink-violet gem icon with a soft rainbow-sheen highlight across its facets, slightly more ornate/premium-feeling than the Credit icon, gentle sparkle particles around it |
| **Apex Shard** *(VFX particle, not a UI icon)* | A tiny glowing red-gold sliver-shaped particle, simple elongated diamond shape, used as a burst-particle texture rather than a standalone icon |

---

## 8. Environment & Backgrounds

### 8.1 In-Game Parallax Grid (gameplay background layer)
```
A subtle dark navy (#0f172a) infinite grid pattern viewed from a
slight top-down angle, thin glowing cyan grid lines with low
opacity, faint depth fog toward the horizon, no objects or
landmarks, designed as a seamlessly tileable background texture,
very low visual noise so gameplay elements stay readable on top
of it, wide aspect ratio
```

### 8.2 Main Menu Background
```
Dark navy void environment with a faint glowing cyan horizon-line
grid fading into deep shadow, the cyber-warrior character (§2.2)
silhouette standing in the lower-third facing away/toward the
horizon, scattered faint particle motes drifting upward, large
empty negative space in the upper two-thirds reserved for logo
and menu UI overlay, moody and atmospheric rather than busy,
9:16 portrait aspect ratio
```

### 8.3 Boss Arena Variant Background
```
Same dark navy grid environment as §8.1, but the grid lines pulse
a warning amber-red instead of cyan, faint cracked-energy fault
lines radiating from the center of the arena, slightly more
ominous and constrained-feeling than the standard background,
wide aspect ratio, seamlessly tileable
```

### 8.4 Shop / Menu Screen Backdrop (Power Upgrades & Cosmetics screens)
```
Abstract dark navy background with soft out-of-focus glowing
geometric shapes drifting in the deep background (hints of the
enemy/weapon silhouettes, heavily blurred and low-opacity so they
read as ambience, not content), large clean negative space
reserved for UI card grid overlay, 9:16 portrait aspect ratio
```

---

## 9. VFX / Particle Textures

| Effect | Prompt |
|---|---|
| **Enemy death burst** | A small radial burst of square-shaped particle fragments in the enemy's color, bright core fading outward, isolated on transparent background, designed for rapid reuse across many simultaneous deaths |
| **Bullet impact spark** | A tiny bright cyan-white spark-burst, 4–6 short radiating light streaks from a central point, isolated on transparent background |
| **Apex transition ring burst** | A large expanding ring of white-gold light with a soft outer glow falloff, designed to scale up rapidly from the player's position, isolated on transparent background |
| **Screen flash overlay** | A full-frame soft white radial flash, brightest at center fading to transparent at the edges, designed for a brief full-opacity-to-zero fade |
| **Lifesteal heal popup** | A small upward-floating crimson-pink "+HP" style glow particle with a soft heart-adjacent angular glyph, isolated on transparent background |
| **Level-up burst** | A vertical upward burst of golden light particles with a bright flash at the base, celebratory and bright, isolated on transparent background |
| **Boss telegraph warning ring** | A thin pulsing amber-red ring outline, designed to expand and contract on a loop, isolated on transparent background |
| **Evolution fanfare flash** | A large bright white-gold starburst flash with long radiating light rays, more dramatic and full-screen than the level-up burst, isolated on transparent background |
| **Glow/bloom sprite (utility)** | A simple soft circular white glow gradient, fully transparent at the edges, used as a generic multiply/additive glow layer behind any other VFX element |

---

## 10. HUD & UI Elements

### 10.1 HP Bar
```
A horizontal health bar frame, thin glowing crimson-red fill
inside a dark angular geometric border, segmented tick marks
along the frame edge, futuristic HUD styling, isolated on
transparent background
```

### 10.2 XP Bar
```
A horizontal experience bar frame, thin glowing green fill inside
a dark angular geometric border, slightly slimmer/lower-emphasis
than the HP bar, isolated on transparent background
```

### 10.3 Apex Meter (hero UI element — deserves the most polish)
```
A distinctive circular or arc-shaped meter frame, dark angular
geometric border with fine etched detail lines, fill rendered as
a glowing gradient sweeping from deep red at empty to bright gold-
white at full, a small pulsing ready-state glow ring that appears
only at 100%, an integrated button glyph at the meter's center
(a stylized angular "A" or burst icon) that visibly brightens and
becomes pressable-looking only when full, isolated on transparent
background, this should feel like the most premium/important
element in the entire HUD
```

### 10.4 Level Indicator Badge
```
A small hexagonal badge frame with a glowing cyan border, designed
to contain a level number, clean and compact, isolated on
transparent background
```

### 10.5 Survival Timer Frame
```
A small rounded rectangular frame with a thin glowing cyan border,
minimal and unobtrusive, designed to contain a MM:SS timer
readout, isolated on transparent background
```

### 10.6 Buttons
| Button Type | Prompt |
|---|---|
| Primary (Start Run, Confirm) | A rounded rectangular button with a bright glowing cyan border and a subtle dark-to-navy gradient fill, clean futuristic HUD styling, isolated on transparent background |
| Secondary (Back, Cancel) | Same button shape as Primary, but with a dimmer grey-blue border and no inner glow, clearly lower-emphasis, isolated on transparent background |
| Danger/Banish | Same button shape as Primary, but with a glowing crimson-red border, isolated on transparent background |
| Reroll | Same button shape as Primary, but with a glowing violet border and a small circular-arrow glyph motif worked into the frame corner |

### 10.7 Level-Up Draft Card Frame
```
A tall rounded-rectangle card frame, dark navy fill with a thin
glowing cyan border, a small decorative corner-accent flourish in
each corner, large empty central area reserved for a weapon/
passive icon, a lower strip area reserved for name/description
text, isolated on transparent background
```

### 10.8 Power Upgrade Shop Card Frame
```
Same card-frame language as §10.7 but in a wider horizontal
layout, with a small reserved progress-pip row along the bottom
edge (for showing current upgrade level out of max), isolated on
transparent background
```

### 10.9 Cosmetic Shop Card Frame
```
Same card-frame language as §10.7 but with an iridescent pink-
violet border treatment instead of cyan, to visually distinguish
the Core-currency cosmetic shop from the Credit-currency power
shop at a glance, isolated on transparent background
```

---

## 11. Full Screens (composition/background chrome)

### 11.1 Boss Telegraph Banner
```
A wide horizontal banner shape with jagged angular edges (not a
simple rectangle), glowing amber-red border, a large empty center
area reserved for the boss name and a warning-arrow icon, designed
to slide in dramatically from the top of the screen, isolated on
transparent background
```

### 11.2 Apex Mode Banner
```
A wide horizontal banner shape with sharper, more aggressive
angular edges than the boss banner, glowing white-gold border with
a faint animated-ready energy crackle texture along its edge,
large empty center area reserved for "APEX MODE" wordmark text,
isolated on transparent background
```

### 11.3 Game Over Screen Backdrop
```
Dark navy background with the cyber-warrior silhouette (§2.2)
shown kneeling/powered-down in the lower frame, faint dissipating
particle motes drifting from the character, large empty negative
space in the upper two-thirds reserved for run-summary UI,
melancholic but not grim tone, 9:16 portrait aspect ratio
```

---

## 12. Branding & Store Assets

### 12.1 Game Logo / Wordmark
```
A bold angular logotype reading "APEX SWARM" in a custom geometric
sans-serif treatment, sharp cut corners on select letterforms, the
wordmark rendered with a glowing cyan-to-violet gradient and a
soft outer bloom, small angular accent marks flanking the text,
isolated on transparent background, no additional symbols or
taglines included
```

### 12.2 App Icon
```
A square app icon, dark navy background, a single bold glowing
cyan circular core motif (echoing the player character's design
language) with a thin orbiting ring around it, extremely simple
and bold so it reads clearly at very small sizes, no text, no
fine detail, strong silhouette, 1:1 aspect ratio
```

### 12.3 Store Feature Graphic / Promo Banner
```
Wide horizontal composition: the cyber-warrior in Apex Mode state
(§2.3) centered, surrounded by a dynamic swirl of small enemy
silhouettes (Swarmer squares, Shooter diamonds) being repelled
outward by the character's energy aura, dramatic lighting, dark
navy background, large clean space reserved on one side for store
text overlay, 16:9 aspect ratio
```

### 12.4 Loading / Splash Screen
```
Minimal centered composition: the app icon core motif (§12.2)
rendered larger and more detailed with a soft pulsing glow
animation implied, dark navy background, small loading-indicator
reserved space at the bottom edge, otherwise empty and calm,
9:16 portrait aspect ratio
```

---

## 13. Audio — Sound Effects

Format target: `.ogg` (web) / `.wav` source masters. Each prompt includes a suggested duration.

### 13.1 Combat

| SFX | Prompt | Duration |
|---|---|---|
| Kinetic Blaster shot | Crisp, light electronic laser-zap, short bright high-frequency pulse with a quick downward pitch tail | 0.15s |
| Plasma Orbit hum/hit | A low continuous soft electric hum with a sharper short "tick" layered on each contact hit | 0.1s (hit), loopable (hum) |
| Chain Lightning fire | A sharp crackling electric zap with a fast branching/stutter texture, slight metallic ring | 0.4s |
| Missile Barrage launch | A low whoosh with a soft mechanical thunk at the start, rising pitch as it travels | 0.5s |
| Missile/explosive impact | A deep punchy electronic boom with a short bright crack on top, satisfying low-end thump | 0.4s |
| Glitch Scythe swing | A fast whoosh-slash with a digital glitch-stutter texture layered in, sharp transient attack | 0.3s |
| Drone Swarm fire | A very light, quick electronic chirp-zap, thinner and higher-pitched than the Kinetic Blaster | 0.1s |
| Dash | A short fast whoosh with a rising pitch sweep and a subtle digital "blip" tail | 0.2s |
| Player hit/damage taken | A short dull impact thud layered with a brief digital distortion crunch | 0.2s |
| Enemy death — Swarmer/Shooter | A light crisp digital "pop-fizzle" with a quick descending pitch | 0.2s |
| Enemy death — Brute/Bulwark Drone | A heavier crunch-boom with a low rumble tail, more weight than the light enemy death sound | 0.35s |
| Enemy death — Glitch Swarm cluster | A rapid cascading series of tiny pops, like quick popcorn bursts, layered to suggest multiple simultaneous small deaths | 0.3s |
| Shielder block (front-hit) | A dull metallic clang/deflect sound with no destructive sparkle, communicates "no effect" | 0.15s |
| Phasewraith teleport | A quick digital glitch-warp sound, fast pitch-bend stutter with a brief silence gap | 0.3s |
| Bulwark Drone shield charge-up | A rising electronic charging whine that builds steadily over its 2-second cast | 2.0s |

### 13.2 Pickups & Progression

| SFX | Prompt | Duration |
|---|---|---|
| XP Gem collect | A bright light "ding" chime, short and pleasant, mid-high pitch | 0.15s |
| Credit collect | A slightly richer metallic "clink" chime, a touch lower-pitched than the XP ding | 0.15s |
| Core collect | A premium-feeling shimmering chime with a soft sparkle-tail, more layered/harmonic than the other pickups | 0.3s |
| Level Up | A short ascending arpeggio sting, bright and triumphant, 3–4 notes rising | 0.6s |
| Reroll | A quick reversed-cymbal-style "whoosh-shuffle" sound suggesting cards being reshuffled | 0.3s |
| Banish | A short sharp digital "delete" zap with a downward pitch snap | 0.25s |
| Evolution trigger | A grand rising synth swell building into a bright triumphant chord hit, bigger and more cinematic than Level Up | 1.2s |

### 13.3 Apex Mode & Bosses

| SFX | Prompt | Duration |
|---|---|---|
| Apex Meter full "ready" ping | A clean bright bell-like chime with a subtle shimmer, distinct and attention-grabbing without being jarring | 0.4s |
| Apex Mode trigger sting | A powerful rising synth riser into an explosive cinematic hit, layered with a deep sub-bass thump and a bright white-noise sweep | 1.0s |
| Apex Mode lifesteal tick | A very soft warm pulse/heartbeat-adjacent sound, low in the mix, plays subtly on each lifesteal proc | 0.1s |
| Apex Mode fade-out warning | A descending synth sweep with a slightly tense, urgent edge, signaling the buff is about to end | 0.6s |
| Boss telegraph sting | A deep ominous low brass-adjacent synth stab with a sharp metallic warning bell layered on top | 0.8s |
| Boss death | A large multi-layered explosion sound, deep sub-bass boom, bright crackling debris layer, and a triumphant short musical tail | 1.5s |

### 13.4 UI & Meta

| SFX | Prompt | Duration |
|---|---|---|
| Button hover/focus | A very light, soft digital tick | 0.05s |
| Button confirm/tap | A clean short digital "click" with a subtle low-end thump | 0.1s |
| Screen transition (menu) | A soft electronic whoosh-swipe | 0.3s |
| Daily streak claim | A cheerful short bright chime sequence, friendly and rewarding | 0.5s |
| Game Over | A somber descending synth tone, melancholic but not harsh, fading out | 1.0s |

---

## 14. Audio — Music

All tracks should be composed for seamless looping. Target format: `.ogg`, 44.1kHz.

| Track | Prompt | Tempo/Length |
|---|---|---|
| **Main Menu Theme** | Atmospheric synthwave with a slow pulsing arpeggiated bassline, sparse melodic synth lead, spacious reverb, calm but with an undercurrent of tension — establishes the cyberpunk tone without demanding attention | ~95 BPM, 1:30 loop |
| **Gameplay Loop — Low Intensity** (early run) | Driving but restrained electronic track, steady mid-tempo arpeggiated synth bass, light percussion, a sense of building momentum without full intensity yet | ~120 BPM, 1:00 loop |
| **Gameplay Loop — High Intensity** (late run, layered/crossfaded in as survival time increases) | Same harmonic/melodic core as the Low Intensity track for smooth layering, but with denser percussion, a more aggressive distorted bass layer, and a faster-feeling rhythmic subdivision | ~120 BPM (same), 1:00 loop, designed to crossfade with Low Intensity |
| **Apex Mode Loop** | High-energy, hard-hitting electronic track, prominent driving four-on-the-floor or breakbeat percussion, bright distorted lead synth, triumphant and explosive in tone, clearly the most intense track in the game | ~140 BPM, 0:30–0:45 loop (short, since Apex Mode is only 8s base but can extend) |
| **Boss Theme** | Tense, weighty electronic track with a heavier low-end than the standard gameplay loop, ominous brass-adjacent synth stabs punctuating a relentless rhythmic bed, building sense of a significant set-piece moment | ~125 BPM, 1:00 loop |
| **Game Over Theme** | Slow, melancholic synth piece, sparse and minimal instrumentation, a single soft melodic line over a slow pad, reflective rather than sad, short non-looping cue | 0:15–0:20, one-shot |
| **Daily Challenge Sting** | A short bright, slightly mischievous synth flourish, distinct from the main gameplay tracks to flag "this is a special mode" | 0:05, one-shot |

---

## 15. Master Asset Production Checklist

| Asset Category | Count | Priority | Spec |
|---|---|---|---|
| Player key art (base, Apex, dash) | 3 | MVP | 9:16, transparent where applicable |
| Player cosmetic skins | 3 (+ more later) | Phase 4 | 9:16 |
| Enemy concept/bestiary art | 7 | Phase 2 | 1:1 |
| Boss key art | 4 | Phase 2 | 1:1 or 4:3 |
| Weapon projectile VFX (base) | 6 | MVP | transparent, small |
| Weapon projectile VFX (evolved) | 6 | Phase 1 | transparent, small |
| Passive item icons | 10 | MVP | 512×512 transparent |
| Collectible/currency icons | 4 | MVP | 512×512 transparent |
| Backgrounds | 4 | MVP–Phase 1 | tileable / 9:16 |
| VFX/particle textures | 9 | MVP | transparent |
| HUD elements | 9 | MVP | transparent |
| Screen banners/backdrops | 3 | MVP–Phase 2 | varies |
| Branding/store assets | 4 | Phase 3 (Android port) | varies |
| SFX | 34 | MVP (combat/pickup/UI) → Phase 1 (Apex/boss) | .ogg/.wav |
| Music tracks | 7 | MVP (menu + 1 gameplay loop) → Phase 1–2 (rest) | .ogg loop |

Priorities map to the Development Roadmap in GDD §22 — don't commission Phase 3/4 assets (branding, cosmetics, daily-challenge sting) before the core loop and USP pass are validated.
