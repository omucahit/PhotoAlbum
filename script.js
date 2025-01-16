// Initialize jsPDF
window.jsPDF = window.jspdf.jsPDF;

class PhotoAlbum {
    constructor() {
        this.currentPage = document.getElementById('currentPage');
        this.generatePDFButton = document.getElementById('generatePDF');
        this.paperSizeSelect = document.getElementById('paperSize');
        this.orientationSelect = document.getElementById('orientation');
        this.photosPerPageSelect = document.getElementById('photosPerPage');
        this.prevPageButton = document.getElementById('prevPage');
        this.nextPageButton = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        this.pageSelector = document.getElementById('pageSelector');
        
        this.photos = [];
        this.currentPageIndex = 0;
        this.photosPerPage = parseInt(this.photosPerPageSelect.value);
        
        this.hasUnsavedChanges = false;
        this.saveChangesButton = document.getElementById('saveChanges');
        
        this.init();
    }

    async init() {
        await this.loadPhotos();
        this.setupEventListeners();
        this.updatePage();
    }

    async loadPhotos() {
        try {
            const imageFiles = await this.getImageFiles();
            this.photos = imageFiles;
            this.updatePageInfo();
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }

    async getImageFiles() {
        const response = await fetch('/photos-list');
        const photoData = await response.json();
        return photoData.map(photo => ({
            url: `photos/${photo.name}`,
            date: photo.date
        }));
    }

    async createPhotoCard(photoInfo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.filename = photoInfo.url.split('/').pop(); // Store filename for reference

        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';

        const img = document.createElement('img');
        img.src = photoInfo.url;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'photo-info';

        // Create date input container
        const dateContainer = document.createElement('div');
        dateContainer.className = 'date-container';
        
        // Create date display
        const dateDiv = document.createElement('div');
        dateDiv.className = 'photo-date';
        const formattedDate = new Date(photoInfo.date).toLocaleDateString();
        dateDiv.textContent = formattedDate;
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'edit-date-btn';
        editButton.textContent = 'Edit';
        
        // Create date input (hidden by default)
        const dateInput = document.createElement('input');
        dateInput.type = 'datetime-local';
        dateInput.className = 'date-input';
        dateInput.style.display = 'none';
        dateInput.value = new Date(photoInfo.date).toISOString().slice(0, 16);
        
        // Add event listeners for date editing
        editButton.addEventListener('click', () => {
            dateDiv.style.display = 'none';
            editButton.style.display = 'none';
            dateInput.style.display = 'block';
        });

        dateInput.addEventListener('change', () => {
            const newDate = new Date(dateInput.value);
            dateDiv.textContent = newDate.toLocaleDateString();
            dateDiv.style.display = 'block';
            editButton.style.display = 'inline';
            dateInput.style.display = 'none';
            
            // Update photo data
            const index = this.photos.findIndex(p => p.url === photoInfo.url);
            if (index !== -1) {
                this.photos[index].date = newDate.toISOString();
                this.hasUnsavedChanges = true;
                this.saveChangesButton.style.display = 'inline-block';
            }
        });

        dateContainer.appendChild(dateDiv);
        dateContainer.appendChild(editButton);
        dateContainer.appendChild(dateInput);
        
        const caption = document.createElement('textarea');
        caption.className = 'photo-caption';
        caption.placeholder = 'Add a caption...';

        photoContainer.appendChild(img);
        infoDiv.appendChild(dateContainer);
        infoDiv.appendChild(caption);
        card.appendChild(photoContainer);
        card.appendChild(infoDiv);
        this.currentPage.appendChild(card);
    }

    setupEventListeners() {
        this.generatePDFButton.addEventListener('click', () => this.generatePDF());
        this.prevPageButton.addEventListener('click', () => this.previousPage());
        this.nextPageButton.addEventListener('click', () => this.nextPage());
        this.photosPerPageSelect.addEventListener('change', () => {
            this.photosPerPage = parseInt(this.photosPerPageSelect.value);
            this.currentPageIndex = 0;
            this.updatePage();
        });
        
        // Update layout when paper size or orientation changes
        this.paperSizeSelect.addEventListener('change', () => this.updateLayout());
        this.orientationSelect.addEventListener('change', () => this.updateLayout());
        
        this.saveChangesButton.addEventListener('click', () => this.saveChanges());

        // Add page selector event listener
        this.pageSelector.addEventListener('change', () => {
            this.currentPageIndex = parseInt(this.pageSelector.value) - 1;
            this.updatePage();
        });
    }

    updateLayout() {
        const orientation = this.orientationSelect.value;
        const photosPerPage = parseInt(this.photosPerPageSelect.value);
        
        // Update grid columns based on photos per page
        const columns = photosPerPage <= 2 ? 1 : 2;
        this.currentPage.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Update page dimensions
        const pages = document.querySelector('.pages');
        if (orientation === 'landscape') {
            pages.style.maxWidth = '297mm';
            this.currentPage.style.minHeight = '210mm';
        } else {
            pages.style.maxWidth = '210mm';
            this.currentPage.style.minHeight = '297mm';
        }
        
        this.updatePage();
    }

    updatePage() {
        this.currentPage.innerHTML = '';
        const start = this.currentPageIndex * this.photosPerPage;
        const end = start + this.photosPerPage;
        const pagePhotos = this.photos.slice(start, end);
        
        pagePhotos.forEach(imageUrl => this.createPhotoCard(imageUrl));
        this.updatePageInfo();
        this.updateNavigationButtons();
    }

    updatePageInfo() {
        const totalPages = Math.ceil(this.photos.length / this.photosPerPage);
        this.pageInfo.textContent = `Page ${this.currentPageIndex + 1} of ${totalPages}`;
        
        // Update page selector
        this.pageSelector.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Go to ${i}`;
            option.selected = i === this.currentPageIndex + 1;
            this.pageSelector.appendChild(option);
        }
    }

    updateNavigationButtons() {
        const totalPages = Math.ceil(this.photos.length / this.photosPerPage);
        this.prevPageButton.disabled = this.currentPageIndex === 0;
        this.nextPageButton.disabled = this.currentPageIndex >= totalPages - 1;
    }

    previousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.updatePage();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.photos.length / this.photosPerPage);
        if (this.currentPageIndex < totalPages - 1) {
            this.currentPageIndex++;
            this.updatePage();
        }
    }

    async generatePDF() {
        const progressElement = document.getElementById('pdfProgress');
        const progressTextElement = document.getElementById('pageProgress');
        progressElement.style.display = 'inline-block';
        this.generatePDFButton.disabled = true;

        try {
            const paperSize = this.paperSizeSelect.value;
            const orientation = this.orientationSelect.value;
            
            // Set PDF dimensions based on paper size and orientation
            const dimensions = this.getPDFDimensions(paperSize, orientation);
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: paperSize
            });

            // Calculate total pages
            const totalPages = Math.ceil(this.photos.length / this.photosPerPage);
            
            // Store current page index
            const originalPageIndex = this.currentPageIndex;
            let currentPage = 0;

            // Generate PDF for each page
            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                progressTextElement.textContent = `Page ${pageIndex + 1} of ${totalPages}`;
                // Set the current page
                this.currentPageIndex = pageIndex;
                this.updatePage();
                
                // Add a new page for subsequent pages
                if (currentPage > 0) {
                    pdf.addPage();
                }

                // Get the page element
                const pageElement = document.querySelector('.pages');

                // Capture the entire page
                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: pageElement.offsetWidth,
                    height: pageElement.offsetHeight,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                
                // Calculate dimensions to fit the page while maintaining aspect ratio
                const aspectRatio = canvas.width / canvas.height;
                const maxWidth = dimensions.width;
                const maxHeight = dimensions.height;
                
                let imgWidth = maxWidth;
                let imgHeight = imgWidth / aspectRatio;

                if (imgHeight > maxHeight) {
                    imgHeight = maxHeight;
                    imgWidth = imgHeight * aspectRatio;
                }

                // Center the image on the page
                const x = (dimensions.width - imgWidth) / 2;
                const y = (dimensions.height - imgHeight) / 2;

                pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                currentPage++;
            }

            // Restore original page
            this.currentPageIndex = originalPageIndex;
            this.updatePage();

            pdf.save('photo-album.pdf');
        } finally {
            progressElement.style.display = 'none';
            this.generatePDFButton.disabled = false;
        }
    }

    getPDFDimensions(paperSize, orientation) {
        const dimensions = {
            'a4': { width: 210, height: 297 },
            'letter': { width: 215.9, height: 279.4 }
        };

        const size = dimensions[paperSize];
        return orientation === 'portrait' ? size : { width: size.height, height: size.width };
    }

    async saveChanges() {
        if (!this.hasUnsavedChanges) return;

        try {
            // Sort photos by date
            this.photos.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Update the server with new dates
            const updates = this.photos.map(photo => ({
                name: photo.url.split('/').pop(),
                date: photo.date
            }));

            await fetch('/update-dates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            this.hasUnsavedChanges = false;
            this.saveChangesButton.style.display = 'none';
            
            // Refresh the current page
            this.updatePage();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes. Please try again.');
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoAlbum();
}); 