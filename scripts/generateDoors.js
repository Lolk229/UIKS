#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration parameters
const SCRIPT_CONFIG = {
  axisTolerance: 25,
  maxRoomToCorridorDistance: 65, // Increased to handle rooms further from corridors
  axisSpanMargin: 50,
  doorAlignTolerance: 24,
  doorPositionRatio: 0.6, // 60% from room to corridor axis
};

// Parse command line arguments
const args = process.argv.slice(2);
let floor = null;
let applyChanges = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--floor' && i + 1 < args.length) {
    floor = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--apply') {
    applyChanges = true;
  }
}

if (!floor) {
  console.error('Usage: node generateDoors.js --floor <floor_number> [--apply]');
  console.error('Example: node generateDoors.js --floor 2 --apply');
  process.exit(1);
}

console.log(`=== Door Generation Script ===`);
console.log(`Floor: ${floor}`);
console.log(`Mode: ${applyChanges ? 'APPLY' : 'DRY-RUN'}`);
console.log('');

// Load config.js
const configPath = path.join(__dirname, '..', 'js', 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract CONFIG object from the file
// We need to evaluate the file to get the CONFIG object
// Create a minimal environment for eval
const L = { CRS: { Simple: 'simple' } };
let CONFIG_DATA;
try {
  // Use Function constructor to evaluate in a controlled scope
  const evalFunc = new Function('L', configContent + '\nreturn CONFIG;');
  CONFIG_DATA = evalFunc(L);
} catch (error) {
  console.error('Error loading config.js:', error.message);
  process.exit(1);
}

// Get rooms and corridor nodes for the specified floor
const rooms = CONFIG_DATA.points[floor] || [];
const corridorNodes = CONFIG_DATA.corridorNodes[floor] || [];

// Filter only room type entries
const roomsOnly = rooms.filter(r => r.type === 'room');

// Filter corridor-type nodes
const corridorOnly = corridorNodes.filter(n => n.type === 'corridor');

// Get existing doors
const existingDoors = corridorNodes.filter(n => n.type === 'door');
const existingDoorRooms = new Set(existingDoors.map(d => d.room));

console.log(`Total rooms on floor ${floor}: ${roomsOnly.length}`);
console.log(`Existing doors: ${existingDoors.length}`);
console.log(`Corridor nodes: ${corridorOnly.length}`);
console.log('');

// Find corridor axes
function findCorridorAxes(corridorNodes) {
  const axes = [];
  const processed = new Set();

  // Group corridor nodes by similar Y coordinate (horizontal axes)
  const yGroups = {};
  corridorNodes.forEach(node => {
    const [y, x] = node.coords;
    let found = false;
    
    for (const key in yGroups) {
      const keyY = parseFloat(key);
      if (Math.abs(y - keyY) <= SCRIPT_CONFIG.axisTolerance) {
        yGroups[key].push(node);
        found = true;
        break;
      }
    }
    
    if (!found) {
      yGroups[y] = [node];
    }
  });

  // Create horizontal axes
  for (const key in yGroups) {
    const group = yGroups[key];
    if (group.length >= 2) {
      const yCoords = group.map(n => n.coords[0]);
      const xCoords = group.map(n => n.coords[1]);
      const medianY = median(yCoords);
      
      axes.push({
        orientation: 'horizontal',
        axisCoord: medianY,
        span: {
          min: Math.min(...xCoords) - SCRIPT_CONFIG.axisSpanMargin,
          max: Math.max(...xCoords) + SCRIPT_CONFIG.axisSpanMargin
        }
      });
      
      group.forEach(n => processed.add(n.id));
    }
  }

  // Group corridor nodes by similar X coordinate (vertical axes)
  const xGroups = {};
  corridorNodes.forEach(node => {
    // Don't skip processed nodes - intersections can be part of both axes
    
    const [y, x] = node.coords;
    let found = false;
    
    for (const key in xGroups) {
      const keyX = parseFloat(key);
      if (Math.abs(x - keyX) <= SCRIPT_CONFIG.axisTolerance) {
        xGroups[key].push(node);
        found = true;
        break;
      }
    }
    
    if (!found) {
      xGroups[x] = [node];
    }
  });

  // Create vertical axes
  for (const key in xGroups) {
    const group = xGroups[key];
    if (group.length >= 2) {
      const xCoords = group.map(n => n.coords[1]);
      const yCoords = group.map(n => n.coords[0]);
      const medianX = median(xCoords);
      
      axes.push({
        orientation: 'vertical',
        axisCoord: medianX,
        span: {
          min: Math.min(...yCoords) - SCRIPT_CONFIG.axisSpanMargin,
          max: Math.max(...yCoords) + SCRIPT_CONFIG.axisSpanMargin
        }
      });
    }
  }

  return axes;
}

function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Calculate perpendicular distance from point to axis
function perpDistanceToAxis(point, axis) {
  const [y, x] = point;
  
  if (axis.orientation === 'horizontal') {
    return Math.abs(y - axis.axisCoord);
  } else {
    return Math.abs(x - axis.axisCoord);
  }
}

// Check if a point projects onto the axis span
function isInAxisSpan(point, axis) {
  const [y, x] = point;
  
  if (axis.orientation === 'horizontal') {
    return x >= axis.span.min && x <= axis.span.max;
  } else {
    return y >= axis.span.min && y <= axis.span.max;
  }
}

// Calculate door coordinates
function calculateDoorCoords(roomCoords, axis) {
  const [roomY, roomX] = roomCoords;
  
  if (axis.orientation === 'horizontal') {
    const doorY = roomY + (axis.axisCoord - roomY) * SCRIPT_CONFIG.doorPositionRatio;
    return [Math.round(doorY), roomX];
  } else {
    const doorX = roomX + (axis.axisCoord - roomX) * SCRIPT_CONFIG.doorPositionRatio;
    return [roomY, Math.round(doorX)];
  }
}

// Find corridor axes
const axes = findCorridorAxes(corridorOnly);
console.log(`Found ${axes.length} corridor axes:`);
axes.forEach((axis, i) => {
  console.log(`  Axis ${i + 1}: ${axis.orientation}, coord=${axis.axisCoord}, span=[${axis.span.min}, ${axis.span.max}]`);
});
console.log('');

// Generate doors for rooms without doors
const newDoors = [];
const skippedRooms = [];
const report = {
  floor: floor,
  totalRooms: roomsOnly.length,
  doorsAdded: 0,
  doorsSkipped: 0,
  addedDoors: [],
  skippedRooms: []
};

roomsOnly.forEach(room => {
  // Skip if door already exists
  if (existingDoorRooms.has(room.id)) {
    skippedRooms.push({
      room: room.id,
      reason: 'Door already exists'
    });
    report.doorsSkipped++;
    report.skippedRooms.push({ room: room.id, reason: 'Door already exists' });
    return;
  }

  // Find best axis for this room
  const candidates = [];
  
  axes.forEach(axis => {
    const perpDist = perpDistanceToAxis(room.coords, axis);
    const inSpan = isInAxisSpan(room.coords, axis);
    
    if (perpDist <= SCRIPT_CONFIG.maxRoomToCorridorDistance && inSpan) {
      candidates.push({
        axis,
        perpDist
      });
    }
  });

  if (candidates.length === 0) {
    skippedRooms.push({
      room: room.id,
      reason: 'No suitable corridor axis found'
    });
    report.doorsSkipped++;
    report.skippedRooms.push({ room: room.id, reason: 'No suitable corridor axis found' });
    return;
  }

  // Select axis with minimum perpendicular distance
  candidates.sort((a, b) => a.perpDist - b.perpDist);
  const bestCandidate = candidates[0];
  
  const doorCoords = calculateDoorCoords(room.coords, bestCandidate.axis);
  
  const doorObj = {
    id: `Door_${room.id}`,
    type: 'door',
    room: room.id,
    coords: doorCoords
  };

  newDoors.push(doorObj);
  report.doorsAdded++;
  report.addedDoors.push({
    id: doorObj.id,
    coords: doorCoords,
    orientation: bestCandidate.axis.orientation,
    perpDist: Math.round(bestCandidate.perpDist)
  });
});

// Print report
console.log('=== Door Generation Report ===');
console.log(`Floor: ${floor}`);
console.log(`Total rooms processed: ${report.totalRooms}`);
console.log(`Doors added: ${report.doorsAdded}`);
console.log(`Doors skipped: ${report.doorsSkipped}`);
console.log('');

if (report.addedDoors.length > 0) {
  console.log('Added doors:');
  report.addedDoors.forEach(door => {
    console.log(`  - ${door.id}: [${door.coords[0]}, ${door.coords[1]}] (${door.orientation} axis, perpDist=${door.perpDist})`);
  });
  console.log('');
}

if (report.skippedRooms.length > 0) {
  console.log('Skipped rooms:');
  report.skippedRooms.forEach(item => {
    console.log(`  - ${item.room}: ${item.reason}`);
  });
  console.log('');
}

// Apply changes if requested
if (applyChanges) {
  console.log('Applying changes to config.js...');
  
  // Create backup
  const backupPath = path.join(__dirname, '..', 'js', 'config.backup.js');
  fs.copyFileSync(configPath, backupPath);
  console.log(`Backup created: ${backupPath}`);
  
  // Update config.js
  // We need to insert new doors at the end of corridorNodes[floor] array
  
  // Find the corridorNodes section for this floor
  // Look for the pattern:  corridorNodes: { ... floor: [\n  ... \n    ],
  
  // Strategy: Find "corridorNodes:" then find the specific floor entry
  const corridorNodesIndex = configContent.indexOf('corridorNodes:');
  if (corridorNodesIndex === -1) {
    console.error('Could not find corridorNodes section in config.js');
    process.exit(1);
  }
  
  // From corridorNodes:, find the floor entry pattern
  const floorPattern = new RegExp(`\\s+${floor}:\\s*\\[`, 'g');
  let match;
  let floorStartIndex = -1;
  
  // Start searching from corridorNodes section
  const searchStart = configContent.substring(corridorNodesIndex);
  match = floorPattern.exec(searchStart);
  
  if (!match) {
    console.error(`Could not find ${floor}: [ in corridorNodes section`);
    process.exit(1);
  }
  
  floorStartIndex = corridorNodesIndex + match.index + searchStart.substring(match.index).indexOf('[');
  
  // Find the matching closing bracket
  let bracketCount = 1;
  let endIndex = floorStartIndex + 1;
  while (bracketCount > 0 && endIndex < configContent.length) {
    if (configContent[endIndex] === '[') bracketCount++;
    if (configContent[endIndex] === ']') bracketCount--;
    endIndex++;
  }
  
  if (bracketCount !== 0) {
    console.error('Could not find matching closing bracket for corridorNodes[' + floor + ']');
    process.exit(1);
  }
  
  // Extract the array content
  const arrayContent = configContent.substring(floorStartIndex + 1, endIndex - 1);
  
  // Generate door entries as strings
  const doorEntries = newDoors.map(door => {
    const coordsStr = `[${door.coords[0]}, ${door.coords[1]}]`;
    return `      { id: "${door.id}", type: "door", room: "${door.room}", coords: ${coordsStr} }`;
  }).join(',\n');
  
  // Build the new array content
  let newArrayContent;
  if (arrayContent.trim().endsWith(',')) {
    // Already has a comma
    newArrayContent = arrayContent + '\n\n      // Generated doors for missing rooms\n' + doorEntries + '\n    ';
  } else {
    // Need to add comma before new doors
    newArrayContent = arrayContent + ',\n\n      // Generated doors for missing rooms\n' + doorEntries + '\n    ';
  }
  
  // Replace the old content with new content
  const updatedContent = configContent.substring(0, floorStartIndex + 1) + newArrayContent + configContent.substring(endIndex - 1);
  
  fs.writeFileSync(configPath, updatedContent, 'utf8');
  console.log(`✓ Updated config.js with ${newDoors.length} new doors`);
  console.log('');
} else {
  console.log('DRY-RUN mode: No changes applied.');
  console.log('Run with --apply flag to update config.js');
  console.log('');
}

console.log('Done!');
