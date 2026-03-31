# Example Workflow

This example demonstrates the complete workflow for processing a floor plan.

## Sample Files

For testing purposes, you can create sample calibration files:

### Example: floor3-calibration.json

```json
{
  "floor": 3,
  "pdfPoints": [
    {"x": 100, "y": 100},
    {"x": 1000, "y": 100},
    {"x": 1000, "y": 800},
    {"x": 100, "y": 800}
  ],
  "svgPoints": [
    {"x": 500, "y": 500},
    {"x": 2500, "y": 500},
    {"x": 2500, "y": 3500},
    {"x": 500, "y": 3500}
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Example: floor3-rooms.json

```json
{
  "rooms": [
    {
      "id": "Б3-1",
      "bbox": {"x": 150, "y": 200, "width": 100, "height": 80},
      "center": {"x": 200, "y": 240},
      "text": "Б3-1",
      "confidence": 0.95
    },
    {
      "id": "Б3-2",
      "bbox": {"x": 300, "y": 200, "width": 100, "height": 80},
      "center": {"x": 350, "y": 240},
      "text": "Б3-2",
      "confidence": 0.92
    }
  ]
}
```

## Testing the Generation

Once you have these files in `plans/calibration/`, you can test the generation:

```bash
node scripts/generateFromFloorPlan.js --floor 3 --generate-all --dry-run
```

This will create `floor3-generated.json` with transformed coordinates.

## Expected Output

The generated file should contain:

```json
{
  "floor": 3,
  "rooms": [
    {
      "id": "Б3-1",
      "name": "Б3-1",
      "coords": [740, 680],
      "type": "room",
      "floor": 3
    },
    {
      "id": "Б3-2",
      "name": "Б3-2",
      "coords": [740, 1030],
      "type": "room",
      "floor": 3
    }
  ],
  "corridors": [],
  "doors": []
}
```

Note: Actual coordinates depend on your calibration points.
