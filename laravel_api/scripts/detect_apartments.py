#!/usr/bin/env python3
"""
Apartment Detection Script - Two Image Workflow
Detects apartments from PDF with red lines, transforms polygons to clean PNG coordinates
Uses flood fill algorithm + ORB feature matching for alignment
"""

import cv2
import numpy as np
import json
import argparse
import sys
import os
from pdf2image import convert_from_path

# Poppler path for macOS (Homebrew installation)
POPPLER_PATH = '/opt/homebrew/bin'

def pdf_to_image(pdf_path, dpi=150):
    """Convert first page of PDF to image array (150 DPI for faster processing)"""
    # Try with poppler_path for macOS, fall back to system PATH
    try:
        pages = convert_from_path(pdf_path, dpi=dpi, poppler_path=POPPLER_PATH)
    except Exception:
        pages = convert_from_path(pdf_path, dpi=dpi)
    if not pages:
        raise ValueError("Could not convert PDF to image")
    return cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)

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
    Use flood fill to find enclosed apartment areas
    """
    h, w = barrier_mask.shape
    
    # Create fillable area (inverse of barrier)
    fillable = 255 - barrier_mask
    
    # Create seed points in a grid pattern
    grid_step = 30
    seed_points = []
    for y in range(grid_step, h - grid_step, grid_step):
        for x in range(grid_step, w - grid_step, grid_step):
            if fillable[y, x] > 0:
                seed_points.append((x, y))
    
    # Track which regions we've found
    regions = []
    filled_mask = np.zeros((h, w), dtype=np.uint8)
    
    for seed in seed_points:
        x, y = seed
        # Skip if already filled
        if filled_mask[y, x] > 0:
            continue
        
        # Create a mask for flood fill (needs to be h+2, w+2)
        ff_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
        # Set barriers in the flood fill mask
        ff_mask[1:-1, 1:-1] = barrier_mask // 255
        
        # Flood fill from this seed
        temp_image = fillable.copy()
        cv2.floodFill(temp_image, ff_mask, seed, 128)
        
        # Extract the filled region
        region = (temp_image == 128).astype(np.uint8) * 255
        
        # Calculate area
        area = np.sum(region > 0)
        total_area = h * w
        
        # Filter by reasonable apartment size (0.5% to 20% of image)
        min_area = total_area * 0.005
        max_area = total_area * 0.20
        
        if min_area < area < max_area:
            # Check if this overlaps significantly with existing regions
            is_new = True
            for existing in regions:
                overlap = np.sum((region > 0) & (existing > 0))
                if overlap > area * 0.5:
                    is_new = False
                    break
            
            if is_new:
                regions.append(region)
                filled_mask = cv2.bitwise_or(filled_mask, region)
    
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
    
    # Create ORB detector
    orb = cv2.ORB_create(nfeatures=5000)
    
    # Detect keypoints and compute descriptors
    kp1, desc1 = orb.detectAndCompute(gray1, None)
    kp2, desc2 = orb.detectAndCompute(gray2, None)
    
    if desc1 is None or desc2 is None:
        return None
    
    # Match features using FLANN
    FLANN_INDEX_LSH = 6
    index_params = dict(algorithm=FLANN_INDEX_LSH, table_number=6, key_size=12, multi_probe_level=1)
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
    
    if len(good_matches) < 10:
        return None
    
    # Get matched points
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    
    # Find homography
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    
    return H

def transform_polygon(polygon, H):
    """Transform polygon points using homography matrix"""
    if polygon is None or H is None:
        return None
    
    pts = np.array(polygon, dtype=np.float32).reshape(-1, 1, 2)
    transformed = cv2.perspectiveTransform(pts, H)
    return transformed.reshape(-1, 2).tolist()

def detect_apartments(source_path, target_path=None):
    """
    Main detection function
    
    Args:
        source_path: Path to PDF with red lines
        target_path: Optional path to clean PNG for alignment
        
    Returns:
        List of polygons (in target coordinates if target provided, else source coordinates)
    """
    # Load source image (PDF with lines)
    if source_path.lower().endswith('.pdf'):
        source_img = pdf_to_image(source_path)
    else:
        source_img = cv2.imread(source_path)
    
    if source_img is None:
        raise ValueError(f"Could not load source image: {source_path}")
    
    source_h, source_w = source_img.shape[:2]
    
    # Detect red lines and create barrier
    red_mask = detect_red_lines(source_img)
    barrier = clean_mask(red_mask, thickness=5)
    
    # Find apartment regions using flood fill
    regions = flood_fill_apartments(source_img, barrier)
    
    # Convert regions to polygons (in pixel coordinates)
    source_polygons = []
    for region in regions:
        poly = region_to_polygon(region)
        if poly and len(poly) >= 3:
            source_polygons.append(poly)
    
    # If no target, return polygons as percentages of source
    if target_path is None:
        result = []
        for poly in source_polygons:
            percent_poly = [[p[0] / source_w * 100, p[1] / source_h * 100] for p in poly]
            result.append(percent_poly)
        return result, source_w, source_h, None, None
    
    # Load target image
    if target_path.lower().endswith('.pdf'):
        target_img = pdf_to_image(target_path)
    else:
        target_img = cv2.imread(target_path)
    
    if target_img is None:
        raise ValueError(f"Could not load target image: {target_path}")
    
    target_h, target_w = target_img.shape[:2]
    
    # Find transformation between source and target
    H = find_transformation(source_img, target_img)
    
    if H is None:
        # Fallback: try percentage-based mapping (may not be accurate)
        result = []
        for poly in source_polygons:
            percent_poly = [[p[0] / source_w * 100, p[1] / source_h * 100] for p in poly]
            result.append(percent_poly)
        return result, source_w, source_h, target_w, target_h
    
    # Transform polygons to target coordinates
    target_polygons = []
    for poly in source_polygons:
        transformed = transform_polygon(poly, H)
        if transformed:
            # Convert to percentages of target size
            percent_poly = [[p[0] / target_w * 100, p[1] / target_h * 100] for p in transformed]
            target_polygons.append(percent_poly)
    
    return target_polygons, source_w, source_h, target_w, target_h

def main():
    parser = argparse.ArgumentParser(description='Detect apartments from floor plan PDF')
    parser.add_argument('--source', required=True, help='Path to PDF with red lines')
    parser.add_argument('--target', help='Path to clean image for polygon alignment')
    parser.add_argument('--output', help='Output JSON file path')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.source):
        print(json.dumps({'error': f'Source file not found: {args.source}'}))
        sys.exit(1)
    
    if args.target and not os.path.exists(args.target):
        print(json.dumps({'error': f'Target file not found: {args.target}'}))
        sys.exit(1)
    
    try:
        polygons, src_w, src_h, tgt_w, tgt_h = detect_apartments(args.source, args.target)
        
        result = {
            'success': True,
            'apartment_count': len(polygons),
            'source_dimensions': {'width': src_w, 'height': src_h},
            'target_dimensions': {'width': tgt_w, 'height': tgt_h} if tgt_w else None,
            'apartments': [
                {
                    'id': i + 1,
                    'polygon': poly
                }
                for i, poly in enumerate(polygons)
            ]
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
