# Door Generation Script

## Overview

This script automatically generates door points for auditoriums on floor 2 that don't have doors yet. It analyzes corridor axes and places doors at calculated positions between rooms and corridors.

## Usage

```bash
# Dry-run mode (preview changes without modifying files)
node scripts/generateDoors.js --dry-run

# Apply mode (generate doors and update config.js)
node scripts/generateDoors.js --apply
```

## How It Works

### 1. Corridor Axis Detection

The script identifies major corridor axes by grouping corridor nodes:

- **Horizontal axes**: Groups nodes with similar Y coordinates (within tolerance of 25 pixels)
- **Vertical axes**: Groups nodes with similar X coordinates (within tolerance of 25 pixels)
- Only axes with **10 or more corridor points** are considered (to filter out corner/turn points)

For floor 2, the main axes are:
- Horizontal: Y=630 and Y=2200
- Vertical: X=620 and X=3220

### 2. Door Placement Algorithm

For each room without a door:

1. Calculate perpendicular distance to each corridor axis
2. Check if the room's projection falls within the axis span (with 50px margin)
3. Filter candidates where perpDist ≤ 60 pixels
4. Select the axis with minimum perpendicular distance
5. Place door **60% of the way** from room to corridor axis (creates "door in wall" effect)

### 3. Configuration Parameters

```javascript
{
  axisTolerance: 25,              // grouping tolerance for axis detection
  maxRoomToCorridorDistance: 60,  // max perpendicular distance (pixels)
  axisSpanMargin: 50,             // margin when checking span coverage
  doorAlignTolerance: 24,         // alignment tolerance (currently unused)
  floor: 2                        // target floor
}
```

## Results

### Generated Doors: 57

The script successfully generated doors for 57 rooms on floor 2.

### Rooms Requiring Manual Review: 8

The following rooms are too far from any corridor axis and need manual door placement:

- **Б1-44, Б1-46, Б1-48**: perpDist=180 (very far from corridors)
- **Б1-51, Б1-53, Б1-57, Б1-59**: perpDist=75 (beyond max distance)
- **Б1-55**: perpDist=140 (very far from corridors)

These rooms may require:
- Additional corridor nodes to be defined
- Manual door placement at custom coordinates
- Review of room placement accuracy

### Shared Door Coordinates

Some rooms share the same physical location and thus generate doors at the same coordinates:

- **[608,620]**: Б1-13, Б1-15, Б1-17 (3 rooms)
- **[1560,638]**: Б1-20, Б1-22 (2 rooms)
- **[2222,1300]**: Б1-45, Б1-47 (2 rooms)
- **[1675,3240]**: Б1-81, Б1-83 (2 rooms)

This is expected behavior for rooms representing different uses of the same space.

## Safety Features

1. **Backup Creation**: Before applying changes, creates `config.backup.js`
2. **Dry-run Mode**: Preview all changes without modifying files
3. **Validation**: Checks distance from generated doors to nearest corridor nodes
4. **Duplicate Detection**: Reports rooms sharing coordinates

## Examples

### Example 1: Left-side room
```
Room Б1-11: [575, 815]
→ Found horizontal axis at Y=630 (perpDist=55)
→ Door placed at: [608, 815] (60% from room to axis)
```

### Example 2: Right-side room
```
Room Б1-34: [2150, 1185]
→ Found horizontal axis at Y=2200 (perpDist=50)
→ Door placed at: [2180, 1185] (60% from room to axis)
```

### Example 3: Top-side room
```
Room Б1-76: [980, 3170]
→ Found vertical axis at X=3220 (perpDist=50)
→ Door placed at: [980, 3200] (60% from room to axis)
```

## File Structure

```
scripts/
  └── generateDoors.js    # Main script

js/
  ├── config.js           # Main configuration (modified by --apply)
  └── config.backup.js    # Backup (created by --apply, gitignored)
```

## Notes

- The script is idempotent: running it multiple times won't create duplicates
- All coordinates use the format [Y, X] (row, column)
- Door placement at 60% distance ensures doors appear "in the wall" rather than in the corridor or inside the room
- The 60-pixel max distance allows for reasonable flexibility while maintaining accuracy
