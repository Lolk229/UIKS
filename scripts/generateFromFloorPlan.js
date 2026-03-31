#!/usr/bin/env node

/**
 * Floor Plan Recognition and Coordinate Generation Script
 * 
 * Usage:
 *   node scripts/generateFromFloorPlan.js --pdf plans/floor3.pdf --extract
 *   node scripts/generateFromFloorPlan.js --pdf plans/floor3.pdf --ocr --floor 3
 *   node scripts/generateFromFloorPlan.js --floor 3 --generate-all --dry-run
 *   node scripts/generateFromFloorPlan.js --floor 3 --apply
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  pdf: null,
  extract: false,
  ocr: false,
  floor: null,
  generateAll: false,
  dryRun: false,
  apply: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--pdf' && i + 1 < args.length) {
    options.pdf = args[++i];
  } else if (args[i] === '--extract') {
    options.extract = true;
  } else if (args[i] === '--ocr') {
    options.ocr = true;
  } else if (args[i] === '--floor' && i + 1 < args.length) {
    options.floor = parseInt(args[++i]);
  } else if (args[i] === '--generate-all') {
    options.generateAll = true;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--apply') {
    options.apply = true;
  }
}

// Main execution
async function main() {
  try {
    if (options.extract) {
      await extractPdfToImage();
    } else if (options.ocr) {
      await performOcr();
    } else if (options.generateAll) {
      await generateAllPoints();
    } else if (options.apply) {
      await applyChanges();
    } else {
      showHelp();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * Extract image from PDF
 */
async function extractPdfToImage() {
  if (!options.pdf) {
    throw new Error('--pdf parameter is required for extraction');
  }

  console.log('Loading PDF libraries...');
  
  // Try to load pdfjs-dist with proper compatibility
  let pdfjsLib;
  try {
    // Try legacy build first (compatible with older versions)
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (e) {
    try {
      // Fallback to standard build for newer versions
      pdfjsLib = require('pdfjs-dist');
    } catch (e2) {
      throw new Error('Failed to load pdfjs-dist. Please ensure it is installed correctly.');
    }
  }
  
  const { createCanvas } = require('canvas');
  const Jimp = require('jimp');

  console.log(`Extracting image from: ${options.pdf}`);
  
  const pdfPath = path.resolve(options.pdf);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;

  console.log('Rendering first page...');
  const page = await pdfDocument.getPage(1);
  
  const scale = 300 / 72; // 300 DPI
  const viewport = page.getViewport({ scale });
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  const floorNum = options.floor || path.basename(options.pdf, '.pdf').replace(/[^\d]/g, '');
  const outputPath = path.join('plans', 'extracted', `floor${floorNum}.png`);
  
  console.log(`Saving image to: ${outputPath}`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✓ Successfully extracted image: ${outputPath}`);
  console.log(`  Dimensions: ${viewport.width}x${viewport.height}`);
}

/**
 * Perform OCR on the extracted image
 */
async function performOcr() {
  if (!options.floor) {
    throw new Error('--floor parameter is required for OCR');
  }

  console.log('Loading Tesseract.js...');
  const Tesseract = require('tesseract.js');
  const Jimp = require('jimp');

  const imagePath = path.join('plans', 'extracted', `floor${options.floor}.png`);
  
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}. Run --extract first.`);
  }

  console.log(`Performing OCR on: ${imagePath}`);
  console.log('This may take a few minutes...');

  const { data: { text, words } } = await Tesseract.recognize(
    imagePath,
    'rus+eng',
    {
      logger: m => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`);
        }
      }
    }
  );

  console.log('\n\nProcessing OCR results...');

  // Patterns for room numbers
  const roomPatterns = [
    /Б\d+-\d+/gi,
    /[БВГДКЛМНПРСТХ]\d+-\d+/gi
  ];

  // Exclude keywords
  const excludeKeywords = [
    'WC', 'туалет', 'санузел', 'уборн',
    'лестниц', 'лестн', 'холл', 'тамбур',
    'венткамера', 'вентк', 'щитов', 'электр'
  ];

  const rooms = [];
  const foundRoomIds = new Set();

  // Process each word from OCR
  for (const word of words) {
    const text = word.text.trim();
    
    // Skip if contains excluded keywords
    if (excludeKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
      continue;
    }

    // Check if matches room pattern
    for (const pattern of roomPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const roomId = match.toUpperCase();
          
          if (!foundRoomIds.has(roomId)) {
            foundRoomIds.add(roomId);
            
            rooms.push({
              id: roomId,
              bbox: {
                x: word.bbox.x0,
                y: word.bbox.y0,
                width: word.bbox.x1 - word.bbox.x0,
                height: word.bbox.y1 - word.bbox.y0
              },
              center: {
                x: (word.bbox.x0 + word.bbox.x1) / 2,
                y: (word.bbox.y0 + word.bbox.y1) / 2
              },
              text: roomId,
              confidence: word.confidence
            });
          }
        }
      }
    }
  }

  console.log(`Found ${rooms.length} rooms: ${rooms.map(r => r.id).join(', ')}`);

  const outputPath = path.join('plans', 'calibration', `floor${options.floor}-rooms.json`);
  fs.writeFileSync(outputPath, JSON.stringify({ rooms }, null, 2));
  
  console.log(`✓ Saved OCR results to: ${outputPath}`);
}

/**
 * Calculate affine transformation matrix
 * Uses least squares to find best-fit transformation from 4+ calibration points
 */
function calculateTransformMatrix(pdfPoints, svgPoints) {
  const n = pdfPoints.length;
  if (n < 3) {
    throw new Error('At least 3 points required for transformation');
  }

  // For affine transformation: x' = a*x + b*y + c, y' = d*x + e*y + f
  // We solve using normal equations: A^T * A * params = A^T * b
  
  // Build the system of equations
  let A11 = 0, A12 = 0, A13 = 0;
  let A21 = 0, A22 = 0, A23 = 0;
  let A31 = 0, A32 = 0, A33 = 0;
  let bx1 = 0, bx2 = 0, bx3 = 0;
  let by1 = 0, by2 = 0, by3 = 0;

  for (let i = 0; i < n; i++) {
    const px = pdfPoints[i].x;
    const py = pdfPoints[i].y;
    const sx = svgPoints[i].x;
    const sy = svgPoints[i].y;

    A11 += px * px;
    A12 += px * py;
    A13 += px;
    
    A21 += py * px;
    A22 += py * py;
    A23 += py;
    
    A31 += px;
    A32 += py;
    A33 += 1;

    bx1 += px * sx;
    bx2 += py * sx;
    bx3 += sx;

    by1 += px * sy;
    by2 += py * sy;
    by3 += sy;
  }

  // Solve 3x3 system using Cramer's rule for x coefficients (a, b, c)
  const det = A11 * (A22 * A33 - A23 * A32) 
            - A12 * (A21 * A33 - A23 * A31) 
            + A13 * (A21 * A32 - A22 * A31);

  if (Math.abs(det) < 1e-10) {
    // Fallback to simple scale/translate
    console.warn('Warning: Calibration points may be collinear, using simplified transformation');
    const scaleX = (svgPoints[1].x - svgPoints[0].x) / (pdfPoints[1].x - pdfPoints[0].x);
    const scaleY = (svgPoints[2].y - svgPoints[0].y) / (pdfPoints[2].y - pdfPoints[0].y);
    
    return {
      a: scaleX || 1,
      b: 0,
      c: svgPoints[0].x - scaleX * pdfPoints[0].x,
      d: 0,
      e: scaleY || 1,
      f: svgPoints[0].y - scaleY * pdfPoints[0].y
    };
  }

  // Solve for a, b, c (x transformation)
  const det_a = bx1 * (A22 * A33 - A23 * A32) 
              - A12 * (bx2 * A33 - A23 * bx3) 
              + A13 * (bx2 * A32 - A22 * bx3);
  const det_b = A11 * (bx2 * A33 - A23 * bx3) 
              - bx1 * (A21 * A33 - A23 * A31) 
              + A13 * (A21 * bx3 - bx2 * A31);
  const det_c = A11 * (A22 * bx3 - bx2 * A32) 
              - A12 * (A21 * bx3 - bx2 * A31) 
              + bx1 * (A21 * A32 - A22 * A31);

  // Solve for d, e, f (y transformation)
  const det_d = by1 * (A22 * A33 - A23 * A32) 
              - A12 * (by2 * A33 - A23 * by3) 
              + A13 * (by2 * A32 - A22 * by3);
  const det_e = A11 * (by2 * A33 - A23 * by3) 
              - by1 * (A21 * A33 - A23 * A31) 
              + A13 * (A21 * by3 - by2 * A31);
  const det_f = A11 * (A22 * by3 - by2 * A32) 
              - A12 * (A21 * by3 - by2 * A31) 
              + by1 * (A21 * A32 - A22 * A31);

  return {
    a: det_a / det,
    b: det_b / det,
    c: det_c / det,
    d: det_d / det,
    e: det_e / det,
    f: det_f / det
  };
}

/**
 * Transform coordinates from PDF to SVG
 */
function transformCoordinates(pdfX, pdfY, matrix) {
  const { a, b, c, d, e, f } = matrix;
  const svgX = a * pdfX + b * pdfY + c;
  const svgY = d * pdfX + e * pdfY + f;
  
  // Return in config.js format: [y, x]
  return [Math.round(svgY), Math.round(svgX)];
}

/**
 * Generate all points (rooms, corridors, doors)
 */
async function generateAllPoints() {
  if (!options.floor) {
    throw new Error('--floor parameter is required');
  }

  console.log(`Generating points for floor ${options.floor}...`);

  // Load rooms from OCR
  const roomsPath = path.join('plans', 'calibration', `floor${options.floor}-rooms.json`);
  if (!fs.existsSync(roomsPath)) {
    throw new Error(`Rooms file not found: ${roomsPath}. Run --ocr first.`);
  }

  const roomsData = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));

  // Load calibration
  const calibrationPath = path.join('plans', 'calibration', `floor${options.floor}-calibration.json`);
  if (!fs.existsSync(calibrationPath)) {
    throw new Error(`Calibration file not found: ${calibrationPath}. Create calibration first using tools/calibration.html`);
  }

  const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'));
  const matrix = calculateTransformMatrix(calibration.pdfPoints, calibration.svgPoints);

  // Generate room points
  const generatedRooms = [];
  const seenCoords = new Set();
  const warnings = [];

  for (const room of roomsData.rooms) {
    const coords = transformCoordinates(room.center.x, room.center.y, matrix);
    const coordKey = `${coords[0]},${coords[1]}`;
    
    if (seenCoords.has(coordKey)) {
      warnings.push(`Room ${room.id}: duplicate coordinates ${coords}`);
    }
    seenCoords.add(coordKey);

    // Check bounds (assuming SVG viewBox is ~4000x4000)
    if (coords[0] < 0 || coords[0] > 4000 || coords[1] < 0 || coords[1] > 4000) {
      warnings.push(`Room ${room.id}: coordinates may be outside viewBox ${coords}`);
    }

    generatedRooms.push({
      id: room.id,
      name: room.id,
      coords: coords,
      type: 'room',
      floor: options.floor
    });
  }

  console.log(`\n=== Generation Report ===`);
  console.log(`Floor: ${options.floor}`);
  console.log(`Rooms generated: ${generatedRooms.length}`);
  console.log(`Corridor nodes: 0 (not implemented yet)`);
  console.log(`Doors generated: 0 (not implemented yet)`);

  if (warnings.length > 0) {
    console.log(`\nWarnings:`);
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  const output = {
    floor: options.floor,
    rooms: generatedRooms,
    corridors: [],
    doors: []
  };

  const outputPath = path.join('plans', 'calibration', `floor${options.floor}-generated.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✓ Saved generated points to: ${outputPath}`);
  
  if (!options.dryRun) {
    console.log('\nUse --dry-run flag to preview before applying');
  }
}

/**
 * Apply changes to config.js
 */
async function applyChanges() {
  if (!options.floor) {
    throw new Error('--floor parameter is required');
  }

  const generatedPath = path.join('plans', 'calibration', `floor${options.floor}-generated.json`);
  if (!fs.existsSync(generatedPath)) {
    throw new Error(`Generated points file not found: ${generatedPath}. Run --generate-all first.`);
  }

  const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
  const configPath = path.join('js', 'config.js');

  // Create backup
  const backupPath = `${configPath}.backup.${Date.now()}`;
  fs.copyFileSync(configPath, backupPath);
  console.log(`Created backup: ${backupPath}`);

  // Read config.js
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Parse the points section
  const pointsRegex = /points:\s*{([^}]+)}/s;
  const match = configContent.match(pointsRegex);

  if (!match) {
    throw new Error('Could not parse points section in config.js');
  }

  // Generate new floor entry
  const floorPoints = generated.rooms.map(room => {
    const coordsStr = `[${room.coords[0]}, ${room.coords[1]}]`;
    return `      { id: "${room.id}", name: "${room.name}", coords: ${coordsStr}, type: "${room.type}" }`;
  }).join(',\n');

  const newFloorEntry = `    ${options.floor}: [\n${floorPoints}\n    ]`;

  // Check if floor already exists
  const floorRegex = new RegExp(`${options.floor}:\\s*\\[[^\\]]*\\]`, 's');
  
  if (configContent.match(floorRegex)) {
    console.log(`Floor ${options.floor} already exists. Updating...`);
    configContent = configContent.replace(floorRegex, newFloorEntry);
  } else {
    console.log(`Adding new floor ${options.floor}...`);
    // Add after last floor entry
    const lastFloorMatch = configContent.match(/(\d+):\s*\[[^\]]*\]/g);
    if (lastFloorMatch && lastFloorMatch.length > 0) {
      const lastEntry = lastFloorMatch[lastFloorMatch.length - 1];
      configContent = configContent.replace(lastEntry, `${lastEntry},\n${newFloorEntry}`);
    }
  }

  fs.writeFileSync(configPath, configContent);
  console.log(`✓ Successfully updated config.js`);
  console.log(`  Added ${generated.rooms.length} rooms for floor ${options.floor}`);
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Floor Plan Recognition and Coordinate Generation Script

Usage:
  Extract image from PDF:
    node scripts/generateFromFloorPlan.js --pdf plans/floor3.pdf --extract [--floor 3]

  Perform OCR recognition:
    node scripts/generateFromFloorPlan.js --pdf plans/floor3.pdf --ocr --floor 3

  Generate points (after calibration):
    node scripts/generateFromFloorPlan.js --floor 3 --generate-all [--dry-run]

  Apply changes to config.js:
    node scripts/generateFromFloorPlan.js --floor 3 --apply

Workflow:
  1. Extract image: --pdf FILE --extract
  2. Run OCR: --pdf FILE --ocr --floor N
  3. Create calibration using tools/calibration.html
  4. Generate points: --floor N --generate-all --dry-run
  5. Review in tools/preview.html
  6. Apply: --floor N --apply
  `);
}

// Run main function
main();
