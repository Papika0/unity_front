# cPanel Setup Guide for Apartment Detection Script

This guide explains how to set up the Python apartment detection script on a cPanel shared hosting server.

## Prerequisites

- SSH access to your cPanel server
- cPanel with "Setup Python App" feature

---

## Step 1: Create Python Virtual Environment

1. Log into **cPanel Dashboard**
2. Go to **"Setup Python App"** (under Software section)
3. Click **"Create Application"**
4. Configure:
   - **Python version**: Select **3.8+** (3.9 recommended)
   - **Application root**: `backend_test/unity_front/laravel_api/scripts`
   - **Application URL**: Leave as default
   - Leave other fields empty
5. Click **"Create"**
6. Note the virtualenv path shown (e.g., `/home/unitydge45f/virtualenv/backend_test/unity_front/laravel_api/scripts/3.9/bin/activate`)

---

## Step 2: Install Python Dependencies

SSH into your server and run:

```bash
# Activate the virtual environment (use YOUR path from Step 1)
source /home/unitydge45f/virtualenv/backend_test/unity_front/laravel_api/scripts/3.9/bin/activate

# Install required packages
pip install PyMuPDF opencv-python-headless numpy

# Verify installation
python -c "import fitz; import cv2; import numpy; print('All imports OK')"
```

---

## Step 3: Configure Environment Variable

Add the Python path to your `.env` file on the server:

```bash
cd ~/backend_test/unity_front/laravel_api
nano .env
```

Add this line (use YOUR virtualenv path from Step 1):

```
PYTHON_PATH=/home/unitydge45f/virtualenv/backend_test/unity_front/laravel_api/scripts/3.9/bin/python3
```

Clear config cache:

```bash
php artisan config:clear
```

---

## Step 4: Set Up Storage Symlink

For images to be accessible, create the storage symlink:

```bash
cd ~/backend_test/unity_front/laravel_api
php artisan storage:link
```

If that fails, create it manually:

```bash
cd ~/backend_test/unity_front/laravel_api/public
rm -rf storage
ln -s ../storage/app/public storage
```

Set correct permissions:

```bash
chmod -R 755 ~/backend_test/unity_front/laravel_api/storage/app/public/
```

---

## Troubleshooting

### "No module named 'cv2'" or similar import errors

Re-install dependencies in the virtualenv:

```bash
source /home/unitydge45f/virtualenv/.../3.9/bin/activate
pip install PyMuPDF opencv-python-headless numpy
```

### "Signal 9" error (process killed)

This is a memory limit issue. Reduce DPI in `detect_apartments.py`:

```python
def pdf_to_image(pdf_path, dpi=72):  # Change from 100 to 72
```

### "Invalid response from detection script"

Check Laravel logs for the actual Python error:

```bash
tail -f ~/backend_test/unity_front/laravel_api/storage/logs/laravel.log
```

### Images disappear after upload

Run the storage symlink command (Step 4).

---

## Files to Deploy

When deploying updates, upload these files:

| File | Server Path |
|------|-------------|
| `scripts/detect_apartments.py` | `~/backend_test/unity_front/laravel_api/scripts/` |
| `app/Http/Controllers/Admin/AdminApartmentDetectionController.php` | `~/backend_test/unity_front/laravel_api/app/Http/Controllers/Admin/` |

---

## Quick Test Command

To test the script directly via SSH:

```bash
source /home/unitydge45f/virtualenv/backend_test/unity_front/laravel_api/scripts/3.9/bin/activate
cd ~/backend_test/unity_front/laravel_api/scripts
python detect_apartments.py --source /path/to/test.pdf
```
