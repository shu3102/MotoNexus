from fastapi import FastAPI, UploadFile, File, HTTPException
import pytesseract
from PIL import Image
import io
import re

app = FastAPI(title="MotoNexus AI Service", version="1.0.0")

@app.post("/api/ai/ocr/document")
async def extract_document_info(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Simple OCR
        text = pytesseract.image_to_string(image)
        
        # Extract potential dates (simple regex for DD/MM/YYYY or YYYY-MM-DD)
        date_pattern = r'\b(\d{2}[/\-]\d{2}[/\-]\d{4}|\d{4}[/\-]\d{2}[/\-]\d{2})\b'
        raw_dates = re.findall(date_pattern, text)
        
        normalized_dates = []
        from dateutil import parser
        for d in raw_dates:
            try:
                dt = parser.parse(d, dayfirst=True)
                normalized_dates.append(dt.strftime("%Y-%m-%d"))
            except:
                pass
        
        # In a real scenario, an LLM or fine-tuned model would parse the raw text
        return {
            "raw_text": text.strip(),
            "detected_dates": normalized_dates,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from pydantic import BaseModel
from typing import List, Optional

class LocationPoint(BaseModel):
    lat: float
    lng: float
    timestamp: Optional[int] = None

@app.post("/api/ai/analytics/trip")
async def analyze_trip(route: List[LocationPoint]):
    if len(route) < 2:
        return {"avg_speed": 0, "max_lean_angle": 0, "estimated_fuel_cost": 0}
        
    # Simulate AI analysis on raw GPS telemetry
    import random
    
    # In a real model, this would compute precise integrals over the GPS curve
    avg_speed = random.uniform(40.0, 85.0) # km/h
    max_lean = random.uniform(25.0, 45.0) # degrees
    
    # Calculate simple distance based on points (mocking)
    distance_km = len(route) * 0.1
    fuel_cost = distance_km * 0.05 * 1.5 # (distance * liters/km * price/liter)
    
    return {
        "avg_speed": round(avg_speed, 1),
        "max_lean_angle": round(max_lean, 1),
        "estimated_fuel_cost": round(fuel_cost, 2),
        "status": "success"
    }
