# Calibration Data Directory

This directory stores calibration data and OCR results for each floor.

## Files Generated

### {floor}-rooms.json
OCR recognition results containing room numbers and their bounding boxes.

### {floor}-calibration.json
Calibration data mapping PDF coordinates to SVG coordinates. Created using `tools/calibration.html`.

### {floor}-generated.json
Final generated points ready for import into config.js. Created by `--generate-all` command.

## Note

Some files (like *-generated.json) are excluded from version control as they are temporary/intermediate results.
