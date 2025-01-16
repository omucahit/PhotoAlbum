# Photo Album Generator

A web-based tool that automatically generates printable photo albums from your images. This tool allows you to organize photos, edit dates, add captions, and export to PDF with customizable layouts.

## Features

- 📸 Automatic loading of photos from a directory
- 📅 EXIF date extraction with editable dates
- 📝 Add captions to photos
- 📄 Multiple page layout options (1-6 photos per page)
- 📏 A4 and Letter paper size support
- 🔄 Portrait and landscape orientations
- 🔍 Page preview before PDF generation
- 📖 Direct page navigation
- 💾 Persistent date storage

## Prerequisites

- Python 3.x
- Web browser with JavaScript enabled
- PIL (Python Imaging Library)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-album-generator.git
cd photo-album-generator
```

2. Install required Python packages:
```bash
pip install Pillow
```

3. Create a photos directory:
```bash
mkdir photos
```

4. Add your photos to the `photos` directory

## Usage

1. Start the server:
```bash
python server.py
```

2. Open your web browser and navigate to:
```
http://localhost:8000
```

3. Working with Photos:
   - **Adding Photos**: Place images in the `photos` directory
   - **Editing Dates**: Click 'Edit' next to any photo's date
   - **Adding Captions**: Type directly in the caption box below each photo
   - **Saving Changes**: Click 'Save Changes' after editing dates
   - **Generating PDF**: Select layout options and click 'Generate PDF'

## Controls

### Navigation
- Previous/Next page buttons
- Direct page selection dropdown
- Photos per page selector (1/2/4/6)

### Layout Options
- Paper Size: A4 or Letter
- Orientation: Portrait or Landscape
- Photos per Page: 1, 2, 4, or 6

### Photo Management
- Edit photo dates with datetime picker
- Add captions to each photo
- Save changes to persist modifications

## Project Structure

```
photo-album-generator/
├── index.html        # Main HTML interface
├── styles.css        # CSS styles
├── script.js         # Frontend JavaScript
├── server.py         # Python server
├── photos/           # Directory for photos
├── photo_dates.json  # Stored photo dates
├── .gitignore       # Git ignore rules
└── README.md        # Documentation
```

## Technical Details

### Frontend
- HTML5 for structure
- CSS3 for styling
- JavaScript (ES6+) for interactivity
- Libraries:
  - EXIF.js: Image metadata extraction
  - jsPDF: PDF generation
  - html2canvas: Page capture

### Backend
- Python HTTP Server
- PIL/Pillow for image processing
- JSON for date storage

## Features in Detail

1. **Photo Management**
   - Automatic photo loading from directory
   - EXIF metadata extraction
   - Editable dates with persistence
   - Custom captions

2. **Page Layout**
   - Flexible grid system
   - Multiple photos per page
   - Responsive design
   - Preview before print

3. **PDF Generation**
   - High-quality output
   - Preserved layout and formatting
   - Progress indicator
   - Multiple paper sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- EXIF.js for image metadata extraction
- jsPDF for PDF generation capabilities
- html2canvas for HTML rendering
- PIL/Pillow for Python image processing

## Support

For support, please open an issue in the GitHub repository.