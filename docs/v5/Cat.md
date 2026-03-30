# Cat Sprite Sheet (Cat.png)

Source: https://shadow28144.itch.io/pixel-cat

## Animations in sprite sheet

| Row | Animation        | Frames | Size   | Description                          |
|-----|------------------|--------|--------|--------------------------------------|
| 1   | Sleep            | 16     | 23x16  | Lying down with zzz growing/shrinking |
| 2   | Walk right       | 4      | 25x15  | Side walk facing right               |
| 3   | Walk left        | 4      | 26x15  | Side walk facing left                |
| 4   | Walk down        | 4      | 20x18  | Front-facing walk                    |
| 5   | Walk up          | 3      | 20x18  | Back-facing walk                     |
| 6   | Idle (sit)       | 2      | 20x18  | Sitting still, tail sway             |
| 7   | Eating/Licking   | 12     | 20-26x17 | Licking paw animation              |
| 8   | Fishing (cast)   | 8      | 28x18  | Sitting with fishing rod, blue water |
| 9   | Fishing (catch)  | 10     | 28x30  | Catching fish with splash            |
| 10  | Emoji            | 1      | 16x16  | Smiley face icon                     |
| 11  | Walk (top-down)  | 4      | 24x18  | Small top-down walking               |
| 12  | Standing (front) | 5      | 13x30  | Standing up, front view              |
| 13  | Standing (back)  | 3      | 13x23  | Standing up, back view               |
| 14  | Sit tail wag     | 6      | 24x19  | Sitting with tail wagging            |

## Current game activities mapping (v5)

| Activity | Sprite used              | Frames | Notes                              |
|----------|--------------------------|--------|------------------------------------|
| idle     | Row 14 (sit tail wag)    | 6      | Lively tail wagging animation      |
| walk     | Row 2 (walk right)       | 4      | flipX for left direction           |
| run      | Row 2 (walk right)       | 4      | Same as walk, played faster        |
| sleep    | Row 1 (sleep)            | 6      | Sleeping body, game adds zzz overlay |
| lick     | Row 7 (eating/licking)   | 12     | Full licking cycle                 |
| meow     | Row 6 (idle sit)         | 2      | Static pose, game adds meow text   |
| vocab    | Row 6 (idle sit)         | 2      | Static pose, game adds vocab bubble |

## Unused animations (available for future features)

- **Fishing** (rows 8-9): 18 frames with rod cast + fish catch
- **Walk down** (row 4): 4 frames, front-facing walk
- **Walk up** (row 5): 3 frames, back-facing walk
- **Walk left** (row 3): 4 frames (currently using flipX instead)
- **Walk top-down** (row 11): 4 frames, small top-down perspective
- **Standing front** (row 12): 5 frames
- **Standing back** (row 13): 3 frames
