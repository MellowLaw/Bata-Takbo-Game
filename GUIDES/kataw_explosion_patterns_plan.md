# Kataw Boss — Explosion Attack Patterns Plan

## Naming Convention

| Level | Term | Example |
|---|---|---|
| **Attack Group** | Top-level attack family | "Tidal Burst", "Abyssal Cross", "Diamond Storm" |
| **Variation** | A distinct tile layout (A, B, C, D) | Tidal Burst **Variation A** |
| **Wave** | One sequential explosion layer | Wave 1 → Wave 2 → Wave 3 |

**Wave Rule:** Rapid cascading effect with 100ms overlap. Telegraph warnings appear 1.1s before detonation.

---

## Sprite Asset Table

### Group 1: Tidal Burst (`-b` sprites) — ✅ IMPLEMENTED

| Color | File | Key | Frame Size | Frames | Anim Key |
|---|---|---|---|---|---|
| 🟡 Yellow | `explosion-1-b.png` | `ch3_explosion_1` | 80×48 | 13 | `anim_ch3_explosion_1` |
| 🔴 Red | `explosion-2-b.png` | `ch3_explosion_2` | 48×48 | 8 | `anim_ch3_explosion_2` |
| 🟣 Purple | `explosion-3-b.png` | `ch3_explosion_3` | 48×48 | 7 | `anim_ch3_explosion_3` |
| 🟠 Dot | `explosion-4-b.png` | `ch3_explosion_4` | 128×128 | 12 | `anim_ch3_explosion_4` |

### Group 2: Abyssal Cross (`-a` sprites) — ✅ IMPLEMENTED

| Color | File | Key | Frame Size | Frames | Anim Key |
|---|---|---|---|---|---|
| 🟠 Orange | `explosion-4-a.png` | `ch3_explosion_4a` | 256×256 | 64 (8×8) | `anim_ch3_explosion_4a` |
| 🔴 Red | `explosion-2-a.png` | `ch3_explosion_2a` | 256×256 | 64 (8×8) | `anim_ch3_explosion_2a` |
| 🟣 Purple | `explosion-3-a.png` | `ch3_explosion_3a` | 256×256 | 64 (8×8) | `anim_ch3_explosion_3a` |

### Group 3: Diamond Storm (`-d` sprites) — ✅ IMPLEMENTED

| Color | File | Key | Frame Size | Frames | Anim Key |
|---|---|---|---|---|---|
| 🟡 Yellow | `explosion-1-d.png` | `ch3_explosion_1d` | 64×64 | 8 | `anim_ch3_explosion_1d` |
| 🔴 Red | `explosion-2-d.png` | `ch3_explosion_2d` | 128×80 | 10 | `anim_ch3_explosion_2d` |
| 🟣 Purple | `explosion-3-d.png` | `ch3_explosion_3d` | 192×192 | 22 | `anim_ch3_explosion_3d` |

---

## Group 1: Tidal Burst — ✅ IMPLEMENTED

### Variation A (attack-1_1)

Yellow outermost → Red middle → Purple inner. Center 3×3 is safe.

```
R0: Y Y Y Y Y Y Y Y Y
R1: Y R R R R R R R Y
R2: Y R P P P P P R Y
R3: Y R P . . . P R Y
R4: Y R P . . . P R Y
R5: Y R P . . . P R Y
R6: Y R P P P P P R Y
R7: Y R R R R R R R Y
R8: Y Y Y Y Y Y Y Y Y
```

### Variation B (attack-1_2)

Purple outer → Red → gap → Yellow center 3×3 block.

```
R0: P P P P P P P P P
R1: P R R R R R R R P
R2: P R . . . . . R P
R3: P R . Y Y Y . R P
R4: P R . Y Y Y . R P
R5: P R . Y Y Y . R P
R6: P R . . . . . R P
R7: P R R R R R R R P
R8: P P P P P P P P P
```

### Variation C (attack-1_3)

Purple outer → gap → Red ring → gap → single Yellow dot.

```
R0: P P P P P P P P P
R1: P . . . . . . . P
R2: P . R R R R R . P
R3: P . R . . . R . P
R4: P . R . Y . R . P
R5: P . R . . . R . P
R6: P . R R R R R . P
R7: P . . . . . . . P
R8: P P P P P P P P P
```

---

## Group 2: Abyssal Cross — ✅ IMPLEMENTED

> Cross/plus and scattered patterns. Uses `-a` sprites (8×8 = 64 frames each).
> Wave order: 🟠 Orange/Yellow → 🔴 Red → 🟣 Purple (outermost → innermost).

### Variation A (attack-2_1)

```
R0: Y Y R . P . R Y Y
R1: Y . R . P . R . Y
R2: R R . . P . . R R
R3: . . . . P . . . .
R4: Y P P P P P P P P
R5: . . . . P . . . .
R6: R R . . P . . R R
R7: Y . R . P . R . Y
R8: Y Y R . P . R Y Y
```

### Variation B (attack-2_2)

```
R0: . Y . Y P Y . Y .
R1: R R R R P R R R R
R2: . Y . Y P Y . Y .
R3: R R R R P R R R R
R4: P P P P P P P P P
R5: R R R R P R R R R
R6: . Y . Y P Y . Y .
R7: R R R R P R R R R
R8: . Y . Y P Y . Y .
```

### Variation C (attack-2_3)

```
R0: R Y Y Y P Y Y Y R
R1: R . . . P . . . R
R2: R R R R P R R R R
R3: R . . . P . . . R
R4: P P P P P P P P P
R5: R . . . P . . . R
R6: R R R R P R R R R
R7: R . . . P . . . R
R8: R Y Y Y P Y Y Y R
```

### Variation D (attack-2_4)

```
R0: Y Y R Y P Y R Y Y
R1: Y . R . P . R . Y
R2: R R R R P R R R R
R3: Y . R . P . R . Y
R4: P P P P P P P P P
R5: Y . R . P . R . Y
R6: R R R R P R R R R
R7: Y . R . P . R . Y
R8: Y Y R Y P Y R Y Y
```

---

## Group 3: Diamond Storm — ✅ IMPLEMENTED

> Irregular diamond/scattered patterns. Uses `-d` sprites.
> Wave order: 🟡 Yellow → 🔴 Red → 🟣 Purple (outermost → innermost).

### Variation A (attack-3_1)

```
R0: . . . . . . . . .
R1: . Y . . Y . . Y .
R2: . . R . . . R . .
R3: . . . P P P . . .
R4: . Y . P P P . Y .
R5: . . . P P P . . .
R6: . . R . . . R . .
R7: . Y . . Y . . Y .
R8: . . . . . . . . .
```

### Variation B (attack-3_2)

```
R0: R . . . P . . . R
R1: . R . Y P Y . R .
R2: . . R . P . R . .
R3: . Y . R P R . Y .
R4: P P P P P P P P P
R5: . Y . R P R . Y .
R6: . . R . P . R . .
R7: . R . Y P Y . R .
R8: R . . . P . . . R
```

### Variation C (attack-3_3)

```
R0: Y . . . R . . . Y
R1: . Y . . R . . Y .
R2: . . P P P P P . .
R3: . . P Y R Y P . .
R4: R R P R R R P R R
R5: . . P Y R Y P . .
R6: . . P P P P P . .
R7: . Y . . R . . Y .
R8: Y . . . R . . . Y
```

### Variation D (attack-3_4)

```
R0: . . . . Y . . . .
R1: . . . . R . . . .
R2: . . R . . . R . .
R3: . . . P P P . . .
R4: Y R . P . P . R Y
R5: . . . P P P . . .
R6: . . R . . . R . .
R7: . . . . R . . . .
R8: . . . . Y . . . .
```
