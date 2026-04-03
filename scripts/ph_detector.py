import sys
import json
import cv2
import numpy as np
import urllib.request
import os

def analyze_ph(image_source):
    try:
        # 1. Smart Image Loader: Check if it's a URL or a Local File
        if image_source.startswith('http://') or image_source.startswith('https://'):
            # It's a web URL
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}
            req = urllib.request.Request(image_source, headers=headers)
            response = urllib.request.urlopen(req)
            arr = np.asarray(bytearray(response.read()), dtype=np.uint8)
            img = cv2.imdecode(arr, -1)
        else:
            # It's a local file on your computer
            if not os.path.exists(image_source):
                raise Exception(f"File not found on your computer: {image_source}")
            img = cv2.imread(image_source)

        if img is None:
            raise Exception("Could not decode image. Ensure it is a valid JPG or PNG.")

        # 2. Calculate Average Color
        avg_color_per_row = np.average(img, axis=0)
        avg_color = np.average(avg_color_per_row, axis=0)
        b, g, r = avg_color[0], avg_color[1], avg_color[2]

        # 3. Simulate pH calculation based on color
        brightness = (r + g + b) / 3
        ph_value = 7.0 # Default neutral
        
        if brightness < 80:
            ph_value = 5.5 # Highly contaminated / dark
        elif g > b and g > r:
            ph_value = 6.5 # Algae presence
        elif brightness > 200:
            ph_value = 7.5 # Very clear/bleached
            
        # 4. Print result
        result = {"success": True, "phLevel": round(ph_value, 1)}
        print(json.dumps(result))

    except Exception as e:
        error_result = {"success": False, "error": str(e), "phLevel": None}
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_source = sys.argv[1]
        analyze_ph(image_source)
    else:
        print(json.dumps({"success": False, "error": "No image provided"}))