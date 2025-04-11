import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.storage import storage



file_id = "d7928b24-cd1e-4371-a195-e014bd2bcaa9"  # You should get this from request or database
file_meta = storage.get_file(file_id)

if file_meta:
    print("File path:", file_meta.path)
    with open(file_meta.path, "rb") as f:
        content = f.read()
        # You can now process the file content (e.g., parse PDF)
else:
    print("File not found")
