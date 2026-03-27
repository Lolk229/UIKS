#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration parameters
const CONFIG = {
  axisTolerance: 25,              // how close nodes must be to be considered on same axis
  maxRoomToCorridorDistance: 60,  // max perpendicular distance from room to corridor (increased from 40)
  axisSpanMargin: 50,             // margin when checking span coverage
  doorAlignTolerance: 24,         // additional alignment check
  floor: 2                        // floor to process
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isApply = args.includes('--apply');

if (!isDryRun && !isApply) {
  console.log('Usage: node scripts/generateDoors.js [--dry-run | --apply]');
  console.log('  --dry-run: Show what would be generated without making changes');
  console.log('  --apply: Generate doors and update config.js');
  process.exit(1);
}

// Load config.js
const configPath = path.join(__dirname, '..', 'js', 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract CONFIG object from the file
// We'll use a simple regex approach since we just need to read it
let configData;
try {
  // Mock Leaflet object for parsing
  // NOTE: Using eval() here is acceptable because:
  // 1. We control the input (it's our own config file)
  // 2. This is a build-time script, not runtime code
  // 3. The config uses L.CRS.Simple which requires mocking
  const L = { CRS: { Simple: 'Simple' } };
  
  // Remove 'const CONFIG = ' and final semicolon, then parse
  const configMatch = configContent.match(/const CONFIG = ({[\s\S]*});/);
  if (!configMatch) {
    throw new Error('Could not find CONFIG object in config.js');
  }
  // Use eval in a controlled context (we control the input)
  configData = eval('(' + configMatch[1] + ')');
} catch (error) {
  console.error('Error parsing config.js:', error.message);
  process.exit(1);
}

// Extract rooms and corridor nodes for floor 2
const rooms = configData.points[CONFIG.floor] || [];
const corridorNodes = configData.corridorNodes[CONFIG.floor] || [];

// Filter corridor-type nodes only
const corridorPoints = corridorNodes.filter(node => node.type === 'corridor');

console.log(`Loaded ${rooms.length} rooms and ${corridorPoints.length} corridor nodes from floor ${CONFIG.floor}`);

// Helper function to calculate median
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// Group corridor nodes into axes
function groupIntoAxes(corridorPoints) {
  const axes = [];
  const MIN_AXIS_POINTS = 10; // Only consider axes with at least 10 corridor points
  
  // Try to find horizontal axes (same Y coordinate)
  const yGroups = {};
  corridorPoints.forEach(point => {
    const [y, x] = point.coords;
    let foundGroup = false;
    
    for (const yKey in yGroups) {
      if (Math.abs(y - parseFloat(yKey)) <= CONFIG.axisTolerance) {
        yGroups[yKey].push(point);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      yGroups[y] = [point];
    }
  });
  
  // Create horizontal axes (only if significant number of points)
  for (const yKey in yGroups) {
    const group = yGroups[yKey];
    if (group.length >= MIN_AXIS_POINTS) {
      const yCoords = group.map(p => p.coords[0]);
      const xCoords = group.map(p => p.coords[1]);
      axes.push({
        orientation: 'horizontal',
        axisCoord: median(yCoords),
        span: {
          min: Math.min(...xCoords),
          max: Math.max(...xCoords)
        },
        nodeCount: group.length
      });
    }
  }
  
  // Try to find vertical axes (same X coordinate)
  const xGroups = {};
  corridorPoints.forEach(point => {
    const [y, x] = point.coords;
    let foundGroup = false;
    
    for (const xKey in xGroups) {
      if (Math.abs(x - parseFloat(xKey)) <= CONFIG.axisTolerance) {
        xGroups[xKey].push(point);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      xGroups[x] = [point];
    }
  });
  
  // Create vertical axes (only if significant number of points)
  for (const xKey in xGroups) {
    const group = xGroups[xKey];
    if (group.length >= MIN_AXIS_POINTS) {
      const yCoords = group.map(p => p.coords[0]);
      const xCoords = group.map(p => p.coords[1]);
      axes.push({
        orientation: 'vertical',
        axisCoord: median(xCoords),
        span: {
          min: Math.min(...yCoords),
          max: Math.max(...yCoords)
        },
        nodeCount: group.length
      });
    }
  }
  
  return axes;
}

// Find existing door IDs
const existingDoorIds = new Set(
  corridorNodes.filter(n => n.type === 'door').map(n => n.room)
);

// Group corridor nodes into axes
const axes = groupIntoAxes(corridorPoints);
console.log(`Found ${axes.length} corridor axes (${axes.filter(a => a.orientation === 'horizontal').length} horizontal, ${axes.filter(a => a.orientation === 'vertical').length} vertical)`);

// Generate doors for each room
const addedDoors = [];
const skippedRooms = [];

rooms.forEach(room => {
  // Skip if not a room
  if (room.type !== 'room') {
    return;
  }
  
  // Skip if door already exists
  if (existingDoorIds.has(room.id)) {
    skippedRooms.push({
      room: room.id,
      reason: 'Door already exists'
    });
    return;
  }
  
  const [roomY, roomX] = room.coords;
  
  // Find candidate axes
  const candidates = [];
  
  axes.forEach(axis => {
    let perpDist, projectionCoord, isInSpan;
    
    if (axis.orientation === 'horizontal') {
      // Perpendicular distance is distance in Y
      perpDist = Math.abs(roomY - axis.axisCoord);
      // Projection coordinate is X
      projectionCoord = roomX;
      // Check if X is within span
      isInSpan = projectionCoord >= (axis.span.min - CONFIG.axisSpanMargin) &&
                 projectionCoord <= (axis.span.max + CONFIG.axisSpanMargin);
    } else {
      // Vertical axis
      // Perpendicular distance is distance in X
      perpDist = Math.abs(roomX - axis.axisCoord);
      // Projection coordinate is Y
      projectionCoord = roomY;
      // Check if Y is within span
      isInSpan = projectionCoord >= (axis.span.min - CONFIG.axisSpanMargin) &&
                 projectionCoord <= (axis.span.max + CONFIG.axisSpanMargin);
    }
    
    if (perpDist <= CONFIG.maxRoomToCorridorDistance && isInSpan) {
      candidates.push({
        axis,
        perpDist,
        projectionCoord
      });
    }
  });
  
  if (candidates.length === 0) {
    // Find minimum distance for reporting
    let minDist = Infinity;
    axes.forEach(axis => {
      const perpDist = axis.orientation === 'horizontal' 
        ? Math.abs(roomY - axis.axisCoord)
        : Math.abs(roomX - axis.axisCoord);
      minDist = Math.min(minDist, perpDist);
    });
    
    skippedRooms.push({
      room: room.id,
      reason: `No suitable corridor axis found (min perpDist=${Math.round(minDist)})`
    });
    return;
  }
  
  // Select axis with minimum perpendicular distance
  candidates.sort((a, b) => a.perpDist - b.perpDist);
  const selected = candidates[0];
  
  // Calculate door coordinates
  // Place door partway between room and corridor axis (not on the axis itself)
  // This creates a "door in the wall" effect
  let doorY, doorX;
  if (selected.axis.orientation === 'horizontal') {
    // Move door toward the corridor axis, but not all the way
    const direction = selected.axis.axisCoord > roomY ? 1 : -1;
    const offset = Math.round(selected.perpDist * 0.6); // 60% of the way to corridor
    doorY = roomY + (direction * offset);
    doorX = roomX;
  } else {
    // Vertical axis
    const direction = selected.axis.axisCoord > roomX ? 1 : -1;
    const offset = Math.round(selected.perpDist * 0.6); // 60% of the way to corridor
    doorY = roomY;
    doorX = roomX + (direction * offset);
  }
  
  // Create door object
  const door = {
    id: `Door_${room.id}`,
    type: 'door',
    room: room.id,
    coords: [doorY, doorX]
  };
  
  addedDoors.push({
    door,
    axisInfo: {
      orientation: selected.axis.orientation,
      axisCoord: selected.axis.axisCoord,
      perpDist: Math.round(selected.perpDist)
    }
  });
});

// Generate report
console.log('\n=== Door Generation Report ===');
console.log(`Total rooms processed: ${rooms.filter(r => r.type === 'room').length}`);
console.log(`Doors added: ${addedDoors.length}`);
console.log(`Doors skipped: ${skippedRooms.length}`);

if (addedDoors.length > 0) {
  console.log('\nAdded doors:');
  addedDoors.forEach(({ door, axisInfo }) => {
    console.log(`  - ${door.id}: [${door.coords[0]}, ${door.coords[1]}] (${axisInfo.orientation} axis at ${axisInfo.orientation === 'horizontal' ? 'Y' : 'X'}=${Math.round(axisInfo.axisCoord)}, perpDist=${axisInfo.perpDist})`);
  });
}

if (skippedRooms.length > 0) {
  console.log('\nSkipped rooms (manual review needed):');
  skippedRooms.forEach(({ room, reason }) => {
    console.log(`  - ${room}: ${reason}`);
  });
}

// Check for duplicates
const doorCoordStrings = addedDoors.map(d => d.door.coords.join(','));
const uniqueCoordStrings = [...new Set(doorCoordStrings)];
if (doorCoordStrings.length > uniqueCoordStrings.length) {
  console.log('\n⚠ Note: Some doors share the same coordinates (rooms at same location):');
  const coordCounts = {};
  doorCoordStrings.forEach(coord => {
    coordCounts[coord] = (coordCounts[coord] || 0) + 1;
  });
  Object.entries(coordCounts).filter(([coord, count]) => count > 1).forEach(([coord, count]) => {
    const doorsAtCoord = addedDoors.filter(d => d.door.coords.join(',') === coord);
    const roomIds = doorsAtCoord.map(d => d.door.room).join(', ');
    console.log(`  - [${coord}]: ${count} doors for rooms ${roomIds}`);
  });
}

// Validate distances to corridor nodes
console.log('\nValidating distances to corridor nodes...');
let validationWarnings = 0;
addedDoors.forEach(({ door }) => {
  const [doorY, doorX] = door.coords;
  let minDist = Infinity;
  
  corridorPoints.forEach(cp => {
    const [cpY, cpX] = cp.coords;
    // Use ** operator for more efficient squaring
    const dist = Math.sqrt((doorY - cpY) ** 2 + (doorX - cpX) ** 2);
    minDist = Math.min(minDist, dist);
  });
  
  if (minDist > 50) {
    console.log(`  ⚠ ${door.id}: Distance to nearest corridor node is ${Math.round(minDist)} (may need manual review)`);
    validationWarnings++;
  }
});

if (validationWarnings === 0) {
  console.log('  ✓ All doors are within 50 units of corridor nodes');
}

// Apply changes if requested
if (isApply && addedDoors.length > 0) {
  console.log('\nApplying changes...');
  
  // Create backup
  const backupPath = path.join(__dirname, '..', 'js', 'config.backup.js');
  fs.copyFileSync(configPath, backupPath);
  console.log(`  ✓ Backup created: ${backupPath}`);
  
  // Generate the door entries to insert
  const doorEntries = addedDoors.map(({ door }) => {
    // Format coordinates with proper spacing
    const yStr = String(door.coords[0]);
    const xStr = String(door.coords[1]);
    const coordStr = `[${yStr}, ${xStr}]`;
    
    // Determine spacing for alignment (same pattern as existing doors)
    const idPadding = ' '.repeat(Math.max(0, 17 - door.id.length));
    const roomPadding = ' '.repeat(Math.max(0, 10 - door.room.length));
    
    return `      { id: "${door.id}",${idPadding}type: "door", room: "${door.room}",${roomPadding}coords: ${coordStr} },`;
  }).join('\n');
  
  // Find the position to insert the doors
  // Look for the last door entry before "// Ось коридора" in floor 2's corridorNodes section
  const floor2Start = configContent.indexOf('  2: [', configContent.indexOf('corridorNodes:'));
  const floor2End = configContent.indexOf('  ]', floor2Start);
  const floor2Section = configContent.substring(floor2Start, floor2End);
  
  // Find the last door entry in floor 2
  // Pattern matches: { id: "Door_...", ... },\n\n
  const lastDoorMatch = floor2Section.match(/(\{ id: "Door_[^}]+\},)\s*\n\s*\n/);
  
  if (!lastDoorMatch) {
    console.error('  ✗ Could not find door section in config.js');
    console.log('  Expected format: { id: "Door_...", type: "door", ... },');
    console.log('  Please add doors manually or check the config file structure.');
    process.exit(1);
  }
  
  // Find the position in the original content
  const insertPos = configContent.indexOf(lastDoorMatch[0], floor2Start) + lastDoorMatch[0].length;
  
  // Insert new doors
  const beforeInsert = configContent.substring(0, insertPos);
  const afterInsert = configContent.substring(insertPos);
  const newContent = beforeInsert + doorEntries + '\n\n' + afterInsert;
  
  // Write the updated content
  fs.writeFileSync(configPath, newContent, 'utf8');
  console.log(`  ✓ Updated config.js with ${addedDoors.length} new doors`);
  
} else if (isDryRun) {
  console.log('\n(Dry-run mode: no changes made)');
}

console.log('\n=== Done ===');
