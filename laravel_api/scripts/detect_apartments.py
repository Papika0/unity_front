import cv2
import numpy as np
import json
import argparse
import sys
import os
import re
import time
import shutil

# Use PyMuPDF (fitz) instead of pdf2image - no system dependencies needed
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

def pdf_to_image(pdf_path, dpi=100):
    """Convert first page of PDF to image array using PyMuPDF
    
    Note: Lower DPI (100) is used for shared hosting memory limits.
    Increase to 150 for better quality if memory allows.
    """
    if fitz is None:
        pass # Optional dependency

    
    doc = fitz.open(pdf_path)
    if len(doc) == 0:
        doc.close()
        raise ValueError("PDF has no pages")
    
    page = doc[0]
    # Calculate zoom factor for desired DPI (PDF default is 72 DPI)
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    
    # Render page to pixmap
    pix = page.get_pixmap(matrix=mat)
    
    # Get dimensions before converting
    height, width, n_channels = pix.height, pix.width, pix.n
    
    # Convert to numpy array using frombuffer and copy to own memory
    img_data = np.frombuffer(pix.samples, dtype=np.uint8).copy()
    img_data = img_data.reshape(height, width, n_channels)
    
    # Release pixmap memory
    pix = None
    
    # Convert RGB to BGR for OpenCV
    if n_channels == 4:  # RGBA
        img_bgr = cv2.cvtColor(img_data, cv2.COLOR_RGBA2BGR)
        del img_data
    elif n_channels == 3:  # RGB
        img_bgr = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR)
        del img_data
    else:
        img_bgr = img_data
    
    doc.close()
    return img_bgr

def get_pdf_text_data(pdf_path, image_w, image_h):
    """
    Extract text and coordinates from PDF using PyMuPDF
    Returns a list of dicts: {'text': str, 'center': (x, y)}
    mapped to image dimensions
    """
    if fitz is None:
        sys.stderr.write("PyMuPDF not available for text extraction\n")
        return None
        
    try:
        doc = fitz.open(pdf_path)
        if len(doc) == 0:
            return None
            
        page = doc[0]
        page_rect = page.rect
        page_w = page_rect.width
        page_h = page_rect.height
        
        scale_x = image_w / page_w
        scale_y = image_h / page_h
        
        # Extract words with positions using get_text("words")
        # Returns list of tuples: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
        word_list = page.get_text("words")
        
        words = []
        for w in word_list:
            x_min, y_min, x_max, y_max, text = w[0], w[1], w[2], w[3], w[4]
            
            if not text:
                continue
            
            # center in image coordinates
            cx = ((x_min + x_max) / 2) * scale_x
            cy = ((y_min + y_max) / 2) * scale_y
            
            words.append({
                'text': text,
                'x_min': x_min,
                'y_min': y_min,
                'x_max': x_max,
                'y_max': y_max,
                'center': (cx, cy)
            })
        
        doc.close()
            
        # Group words into lines (simple clustering by mid-y)
        lines = []
        # Sort by Y then X
        words.sort(key=lambda w: (w['y_min'], w['x_min']))
        
        current_line = []
        for word in words:
            if not current_line:
                current_line.append(word)
                continue
                
            # Check overlap vertically with last word in line
            last = current_line[-1]
            
            # 1. Check for Line Break (X coordinate decreasing significantly)
            # Tolerance of 10px to account for slight jitter
            if word['x_min'] < last['x_max'] - 10:
                lines.append(current_line)
                current_line = [word]
                continue
                
            # 2. Check overlap (Y coordinate)
            y_overlap = min(last['y_max'], word['y_max']) - max(last['y_min'], word['y_min'])
            height = min(last['y_max'] - last['y_min'], word['y_max'] - word['y_min'])
            
            if y_overlap > height * 0.5:
                current_line.append(word)
            else:
                lines.append(current_line)
                current_line = [word]
        if current_line:
            lines.append(current_line)
            
        # Parse numbers from lines
        numbers = []
        import re
        

        for line in lines:
            line_text = ' '.join(w['text'] for w in line)
            
            # Priority 1: "bina X", "apt X", "apartment X"
            # We check this FIRST, ignoring "m2" presence because sometimes they are on same line
            match = re.search(r'(?:bina|apt|apartment|ბინა)\s*(\d+[-\w]*)', line_text, re.IGNORECASE)
            if match:
                num = match.group(1)
                
                # Approximate position
                avg_x = sum(w['center'][0] for w in line) / len(line)
                avg_y = sum(w['center'][1] for w in line) / len(line)
                
                numbers.append({
                    'number': num,
                    'center': (avg_x, avg_y),
                    'source': 'pdf'
                })
                continue
            
            # Skip if contains area pattern for bare numbers
            if re.search(r'(m2|მ2|sq|sqm)', line_text, re.IGNORECASE):
                continue
                
            # Priority 2: Just a number
            match = re.search(r'^(\d+[-\w]*)$', line_text.strip())
            if match:
                num = match.group(1)
                if '.' in num:
                     continue 

                avg_x = sum(w['center'][0] for w in line) / len(line)
                avg_y = sum(w['center'][1] for w in line) / len(line)
                numbers.append({
                    'number': num,
                    'center': (avg_x, avg_y),
                    'source': 'pdf'
                })
        
        return numbers

    except Exception as e:
        sys.stderr.write(f"PDF text extraction failed: {e}\n")
        return None

def detect_red_lines(image):
    """Detect red lines/marks in the image"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Red color range (handles both low and high hue values for red)
    lower_red1 = np.array([0, 80, 80])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 80, 80])
    upper_red2 = np.array([180, 255, 255])
    
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    red_mask = cv2.bitwise_or(mask1, mask2)
    
    # Clean up the mask
    kernel = np.ones((3, 3), np.uint8)
    red_mask = cv2.dilate(red_mask, kernel, iterations=2)
    
    return red_mask

def clean_mask(mask, thickness=5):
    """Create a barrier mask from red lines"""
    kernel = np.ones((thickness, thickness), np.uint8)
    barrier = cv2.dilate(mask, kernel, iterations=2)
    return barrier

def flood_fill_apartments(image, barrier_mask):
    """
    Use connected components to find enclosed apartment areas
    (Optimized replacement for iterative flood fill)
    """
    h, w = barrier_mask.shape
    total_area = h * w
    
    # Create fillable area (inverse of barrier)
    # 255 = potentially empty space (apartment), 0 = barrier
    fillable = 255 - barrier_mask
    
    # Connected components analysis
    # connectivity=4 means pixels must share an edge (not just corner)
    # We use 4-connectivity to match floodFill's typical behavior for tight seals
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fillable, connectivity=4)
    
    regions = []
    
    # Filter by reasonable apartment size (0.5% to 20% of image)
    min_area = total_area * 0.005
    max_area = total_area * 0.20
    
    # Start from 1 (0 is background/barrier)
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        
        if min_area < area < max_area:
            # Create a mask for this component
            # This is fast: numpy boolean comparison optimized in C
            component_mask = (labels == i).astype(np.uint8) * 255
            regions.append(component_mask)
            
    return regions

def region_to_polygon(region_mask, simplify_epsilon=5):
    """Convert a region mask to a simplified polygon"""
    contours, _ = cv2.findContours(region_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
    
    # Get the largest contour
    largest = max(contours, key=cv2.contourArea)
    
    # Simplify the polygon
    epsilon = simplify_epsilon
    approx = cv2.approxPolyDP(largest, epsilon, True)
    
    # Convert to list of points
    points = approx.reshape(-1, 2).tolist()
    
    return points

def find_transformation(source_img, target_img):
    """
    Find transformation matrix between source and target using ORB features
    """
    # Convert to grayscale
    if len(source_img.shape) == 3:
        gray1 = cv2.cvtColor(source_img, cv2.COLOR_BGR2GRAY)
    else:
        gray1 = source_img
        
    if len(target_img.shape) == 3:
        gray2 = cv2.cvtColor(target_img, cv2.COLOR_BGR2GRAY)
    else:
        gray2 = target_img
    
    # Create SIFT detector (more robust than ORB for 2D->3D)
    sift = cv2.SIFT_create()
    
    # Detect keypoints and compute descriptors
    kp1, desc1 = sift.detectAndCompute(gray1, None)
    kp2, desc2 = sift.detectAndCompute(gray2, None)
    
    if desc1 is None or desc2 is None:
        return None
    
    # Match features using FLANN with KDTREE for SIFT
    FLANN_INDEX_KDTREE = 1
    index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
    search_params = dict(checks=50)
    flann = cv2.FlannBasedMatcher(index_params, search_params)
    
    matches = flann.knnMatch(desc1, desc2, k=2)
    
    # Apply Lowe's ratio test
    good_matches = []
    for match in matches:
        if len(match) == 2:
            m, n = match
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)
    
    if len(good_matches) < 20:
        return None
    
    # Get matched points
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    
    # Find homography
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    
    if H is None:
        return None
        
    # Strict validation: Check inliers count
    # We need a robust match, not just minimum 4 points
    inliers = np.sum(mask)
    if inliers < 12:
        return None
    
    return H

def transform_polygon(polygon, H):
    """Transform polygon points using homography matrix"""
    if polygon is None or H is None:
        return None

    pts = np.array(polygon, dtype=np.float32).reshape(-1, 1, 2)
    transformed = cv2.perspectiveTransform(pts, H)
    return transformed.reshape(-1, 2).tolist()

def extract_apartment_number_ocr(image, region_mask):
    """Fallback OCR function (original)"""
    try:
        import pytesseract
    except ImportError:
        return None

    coords = np.argwhere(region_mask > 0)
    if len(coords) == 0:
        return None

    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)

    # Padding
    padding = 20
    h, w = image.shape[:2]
    y_min = max(0, y_min - padding)
    x_min = max(0, x_min - padding)
    y_max = min(h, y_max + padding)
    x_max = min(w, x_max + padding)

    cropped = image[y_min:y_max, x_min:x_max]
    if cropped.size == 0:
        return None
        
    # Preprocess
    if len(cropped.shape) == 3:
        gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
    else:
        gray = cropped.copy()
        
    try:
        # Scale up significantly for better OCR
        ch = gray.shape[0]
        scale = 3.0
        if ch < 50:
             scale = 60 / ch # Ensure at least 60px height
             
        # Resize
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
        # Thresholding to separate text
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Try both original gray and thresholded
        configs = ['--psm 6', '--psm 7']
        images = [gray, thresh]
        
        import re
        
        for img_ver in images:
            for config in configs:
                text = pytesseract.image_to_string(img_ver, config=config).strip()
                
                # Look for "bina X" or just numbers
                match = re.search(r'(?:bina|apt|apartment|ბინა)\s*(\d+[-\w]*)', text, re.IGNORECASE)
                if match:
                     return match.group(1)
                
                # Look for single number on lines without "m2"
                for line in text.split('\n'):
                    if re.search(r'(m2|მ2|sq|sqm)', line, re.IGNORECASE): continue
                    match = re.search(r'^(\d+[-\w]*)$', line.strip())
                    if match:
                         return match.group(1)
                 
        return None
    except Exception:
        return None

def detect_apartments(source_path, target_path=None, enable_ocr=True, debug=False):
    """
    Main detection function
    """
    # Load source image
    is_pdf = source_path.lower().endswith('.pdf')
    if is_pdf:
        source_img = pdf_to_image(source_path)
    else:
        source_img = cv2.imread(source_path)
    
    if source_img is None:
        raise ValueError(f"Could not load source image: {source_path}")
    
    source_h, source_w = source_img.shape[:2]
    
    # Try to extract text from PDF directly
    pdf_numbers = []
    if is_pdf and enable_ocr:
        pdf_numbers = get_pdf_text_data(source_path, source_w, source_h)
        if pdf_numbers:
            pass # We have data
        else:
            pdf_numbers = [] # Fallback to empty

    if debug:
        debug_dir = f"debug_output_{int(time.time())}"
        os.makedirs(debug_dir, exist_ok=True)
        print(f"DEBUG: Created debug directory {debug_dir}")
        cv2.imwrite(f"{debug_dir}/source.png", source_img)
        
        # Save extracted PDF numbers info
        with open(f"{debug_dir}/pdf_text.json", 'w') as f:
            json.dump(pdf_numbers, f, indent=2)

    # Detect red lines and create barrier
    red_mask = detect_red_lines(source_img)
    barrier = clean_mask(red_mask, thickness=5)
    
    if debug:
        cv2.imwrite(f"{debug_dir}/red_mask.png", red_mask)
        cv2.imwrite(f"{debug_dir}/barrier.png", barrier)
    
    # Find apartment regions using flood fill
    regions = flood_fill_apartments(source_img, barrier)

    if debug:
        # Visualize regions
        regions_vis = source_img.copy()
        for i, region in enumerate(regions):
            color = np.random.randint(0, 255, (3,)).tolist()
            regions_vis[region > 0] = color
        cv2.imwrite(f"{debug_dir}/regions.png", regions_vis)

    # Convert regions to polygons and match text
    # Convert regions to polygons and match text
    apartments_data = []
    
    # Pre-calculate polygons and valid regions
    polygons = []
    for i, region in enumerate(regions):
        poly = region_to_polygon(region)
        if poly and len(poly) >= 3:
            polygons.append({
                'id': i + 1,
                'polygon': poly,
                'region': region,
                'apartment_number': None
            })
            
    # Global Matching Strategy
    # 1. Collect all potential matches (polygon_idx, number_idx, distance, text_val)
    all_matches = []
    
    if pdf_numbers:
        for i, poly_data in enumerate(polygons):
            poly_pts = np.array(poly_data['polygon'])
            
            for j, num_data in enumerate(pdf_numbers):
                pt = num_data['center']
                dist = cv2.pointPolygonTest(poly_pts, pt, False)
                
                # Check strict inclusion or proximity (e.g., within 50px)
                # Prioritize: dist >= 0 (inside) > dist < 0 (outside)
                
                if dist >= -100: # Broad proximity search
                     all_matches.append({
                         'poly_idx': i,
                         'num_idx': j,
                         'dist': dist,
                         'text': num_data['number']
                     })
                     
    # 2. Sort matches
    # Primary key: dist (descending). Positive (inside) > Negative (outside close)
    all_matches.sort(key=lambda x: x['dist'], reverse=True)
    
    # 3. Assign uniquely
    assigned_polygons = set()
    assigned_numbers = set()
    
    for match in all_matches:
        p_idx = match['poly_idx']
        n_idx = match['num_idx']
        
        if p_idx in assigned_polygons or n_idx in assigned_numbers:
            continue
            
        # Assign
        polygons[p_idx]['apartment_number'] = match['text']
        assigned_polygons.add(p_idx)
        assigned_numbers.add(n_idx)
        
        if debug:
            print(f"DEBUG: Assigned {match['text']} to Polygon {polygons[p_idx]['id']} (dist={match['dist']:.2f})")

    # 4. Fallback to OCR for unassigned polygons
    for i, poly_data in enumerate(polygons):
        if i in assigned_polygons:
            continue
            
        if enable_ocr:
             if debug:
                 print(f"DEBUG: No PDF text match for Polygon {poly_data['id']}. Attempting OCR...")
             
             apt_num = extract_apartment_number_ocr(source_img, poly_data['region'])
             if apt_num:
                 poly_data['apartment_number'] = apt_num
                 if debug:
                     print(f"DEBUG: OCR result for Polygon {poly_data['id']}: {apt_num}")
    
    # Finalize data structure
    apartments_data = polygons

    # Visualize results if debug
    # Visualize aggregated results if debug
    if debug:
        final_debug_img = source_img.copy()
        
        for apt in apartments_data:
            # Draw polygon
            poly = apt['polygon']
            pts = np.array(poly, np.int32)
            pts = pts.reshape((-1, 1, 2))
            
            # Use random color or consistent green
            cv2.polylines(final_debug_img, [pts], True, (0, 255, 0), 3)
            
            # Label
            if apt['apartment_number']:
                # Calculate centroid for label
                M = cv2.moments(pts)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    
                    # Draw background box for text
                    text = str(apt['apartment_number'])
                    (w, h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
                    cv2.rectangle(final_debug_img, (cx - w//2 - 5, cy - h//2 - 5), (cx + w//2 + 5, cy + h//2 + 5), (0, 0, 0), -1)
                    cv2.putText(final_debug_img, text, (cx - w//2, cy + h//2), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        cv2.imwrite(f"{debug_dir}/final_detection.png", final_debug_img)
        print(f"DEBUG: Saved final combined visualization to {debug_dir}/final_detection.png")
            
    # Result formatting (Target Image Mapping logic preserved)
    # ... Same as before but cleaner ...

    final_result = []
    
    H = None
    target_w, target_h = None, None
    
    if target_path:
        if target_path.lower().endswith('.pdf'):
            target_img = pdf_to_image(target_path)
        else:
            target_img = cv2.imread(target_path)
            
        if target_img is not None:
             target_h, target_w = target_img.shape[:2]
             H = find_transformation(source_img, target_img)

    for apt in apartments_data:
        # Source coords percentage
        src_poly_pct = [[p[0] / source_w * 100, p[1] / source_h * 100] for p in apt['polygon']]
        
        # Decide output based on transformation availability
        if H is not None and target_w is not None:
             # Transform to target
             trans_poly = transform_polygon(apt['polygon'], H)
             if trans_poly:
                 final_poly_pct = [[p[0] / target_w * 100, p[1] / target_h * 100] for p in trans_poly]
                 
                 # Validate coordinates are within reasonable bounds
                 # Allow slight overscan (-10% to 110%) to account for crop/bleed
                 is_valid = all(
                     -10 <= p[0] <= 110 and -10 <= p[1] <= 110
                     for p in final_poly_pct
                 )
                 
                 if is_valid:
                     final_result.append({
                         'id': apt['id'],
                         'polygon': final_poly_pct,
                         'apartment_number': apt.get('apartment_number')
                     })
                 else:
                     # Invalid transform result - probably bad match
                     if debug:
                         print(f"DEBUG: Transform produced invalid coords for apt {apt['id']}, using source pct fallback")
                     
                     final_result.append({
                         'id': apt['id'],
                         'polygon': src_poly_pct,
                         'apartment_number': apt.get('apartment_number')
                     })
             else:
                 # Transform return None
                 if debug:
                     print(f"DEBUG: Transform failed for apt {apt['id']}, using source pct fallback")
                     
                 final_result.append({
                     'id': apt['id'],
                     'polygon': src_poly_pct,
                     'apartment_number': apt.get('apartment_number')
                 })
        else:
             # No H matrix
             final_result.append({
                 'id': apt['id'],
                 'polygon': src_poly_pct,
                 'apartment_number': apt.get('apartment_number')
             })
             
    return final_result, source_w, source_h, target_w, target_h

def main():
    parser = argparse.ArgumentParser(description='Detect apartments from floor plan PDF')
    parser.add_argument('--source', required=True, help='Path to PDF with red lines')
    parser.add_argument('--target', help='Path to clean image for polygon alignment')
    parser.add_argument('--output', help='Output JSON file path')
    parser.add_argument('--no-ocr', action='store_true', help='Disable OCR apartment number extraction')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode with verbose output and image dumps')

    args = parser.parse_args()

    if not os.path.exists(args.source):
        print(json.dumps({'error': f'Source file not found: {args.source}'}))
        sys.exit(1)

    try:
        apartments, src_w, src_h, tgt_w, tgt_h = detect_apartments(
            args.source,
            args.target,
            enable_ocr=not args.no_ocr,
            debug=args.debug
        )

        result = {
            'success': True,
            'apartment_count': len(apartments),
            'source_dimensions': {'width': src_w, 'height': src_h},
            'target_dimensions': {'width': tgt_w, 'height': tgt_h} if tgt_w else None,
            'apartments': apartments
        }

        output_json = json.dumps(result, indent=2)

        if args.output:
            with open(args.output, 'w') as f:
                f.write(output_json)
        else:
            print(output_json)

    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
