# Plans Directory

This directory contains floor plan PDFs and their processing results.

## Structure

- **floor{N}.pdf** - Place your source PDF files here
- **extracted/** - Auto-generated PNG images from PDFs (excluded from git)
- **calibration/** - Calibration data and OCR results

## Usage

1. Place your PDF floor plans in this directory
2. Run extraction: `node scripts/generateFromFloorPlan.js --pdf plans/floor3.pdf --extract --floor 3`
3. Results will be saved in subdirectories

## Example

```
plans/
  ├── floor3.pdf                    # Your source PDF
  ├── extracted/
  │   └── floor3.png               # Auto-generated
  └── calibration/
      ├── floor3-rooms.json        # OCR results
      ├── floor3-calibration.json  # From calibration.html
      └── floor3-generated.json    # Generated points
```
