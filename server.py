from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime

class PhotoServerHandler(SimpleHTTPRequestHandler):
    def get_saved_dates(self):
        dates_file = 'photo_dates.json'
        try:
            with open(dates_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def get_image_date(self, filepath):
        # First check if we have a saved date
        filename = os.path.basename(filepath)
        saved_dates = self.get_saved_dates()
        if filename in saved_dates:
            try:
                return datetime.fromisoformat(saved_dates[filename].replace('Z', '+00:00'))
            except ValueError:
                pass

        date_time = None
        try:
            # Try to get EXIF data if no saved date
            image = Image.open(filepath)
            exif = image._getexif()
            if exif:
                # Look for DateTimeOriginal or DateTime tag
                for tag_id in exif:
                    tag = TAGS.get(tag_id, tag_id)
                    if tag in ['DateTimeOriginal', 'DateTime']:
                        date_str = exif[tag_id]
                        date_time = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
                        break
        except Exception:
            pass
        
        # If no saved date and no EXIF date found, try file modification time
        if not date_time:
            try:
                # Try creation time first
                date_time = datetime.fromtimestamp(os.path.getctime(filepath))
            except Exception:
                # Fallback to modification time
                date_time = datetime.fromtimestamp(os.path.getmtime(filepath))
        
        return date_time

    def do_GET(self):
        # Handle /photos-list endpoint
        if self.path == '/photos-list':
            # Get list of files in photos directory
            photo_dir = 'photos'
            photos = []
            
            # Get all image files with their dates
            for filename in os.listdir(photo_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                    filepath = os.path.join(photo_dir, filename)
                    date = self.get_image_date(filepath)
                    photos.append({
                        'name': filename,
                        'timestamp': date.timestamp(),
                        'date': date.strftime('%Y-%m-%d %H:%M:%S')
                    })
            
            # Sort photos by date
            photos.sort(key=lambda x: x['timestamp'])
            
            # Send both filenames and dates
            photo_data = [{
                'name': photo['name'],
                'date': photo['date']
            } for photo in photos]
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(photo_data).encode())
            return

        # Handle all other requests normally
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == '/update-dates':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            updates = json.loads(post_data)
            
            # Update dates in our tracking system
            photo_dir = 'photos'
            for update in updates:
                filepath = os.path.join(photo_dir, update['name'])
                # Store the updated date in a separate JSON file or database
                # For this example, we'll use a JSON file
                self.update_photo_date(update['name'], update['date'])
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success'}).encode())
            return
        
        return SimpleHTTPRequestHandler.do_POST(self)

    def update_photo_date(self, filename, new_date):
        dates_file = 'photo_dates.json'
        try:
            with open(dates_file, 'r') as f:
                dates = json.load(f)
        except FileNotFoundError:
            dates = {}
        
        dates[filename] = new_date
        
        with open(dates_file, 'w') as f:
            json.dump(dates, f, indent=2)

# Run server
httpd = HTTPServer(('localhost', 8000), PhotoServerHandler)
print("Serving at port 8000")
httpd.serve_forever() 