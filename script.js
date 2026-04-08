const API_KEY = 'gXWuiVeIgn7kkVSY9aBja30dTZYEc8fiMzKfQhvK';
const API_URL = 'https://api.nasa.gov/planetary/apod';
// DOM Elements
const datePicker = document.getElementById('date-picker');
const hdToggle = document.getElementById('hd-toggle');
const loadingContainer = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const apodContent = document.getElementById('apod-content');

const mediaContainer = document.getElementById('media-container');
const apodTitle = document.getElementById('apod-title');
const apodDate = document.getElementById('apod-date');
const apodCopyright = document.getElementById('apod-copyright');
const apodExplanation = document.getElementById('apod-explanation');

const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');
const modalCaption = document.getElementById('modal-caption');

// Gallery DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const sortSelect = document.getElementById('sort-select');
const galleryGrid = document.getElementById('gallery-grid');
const galleryLoading = document.getElementById('gallery-loading');

let currentApodData = null;
let galleryData = [];
let displayedGallery = [];
let favorites = JSON.parse(localStorage.getItem('nasa_favorites')) || [];

// Initialize Date Picker
function initDatePicker() {
    const today = new Date();
    // Format YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Set max to prevent future date fetching
    datePicker.max = formattedDate;
}

// Fetch APOD Data
async function fetchApod(date = '') {
    // Show Loading state
    apodContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingContainer.classList.remove('hidden');

    try {
        let url = `${API_URL}?api_key=${API_KEY}`;
        if (date) {
            url += `&date=${date}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.msg || `HTTP error! status: ${response.status}. Please check your connection or try again later.`);
        }

        const data = await response.json();
        currentApodData = data;

        renderApod(data);
    } catch (error) {
        console.error("Error fetching APOD:", error);
        errorText.textContent = `Error: ${error.message}`;
        loadingContainer.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
}

// Render data into DOM dynamically
function renderApod(data) {
    const isHD = hdToggle.checked;

    // Media handling (Image vs Video)
    mediaContainer.innerHTML = ''; // Clear previous media

    if (data.media_type === 'video') {
        const iframe = document.createElement('iframe');
        iframe.src = data.url;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;

        mediaContainer.classList.remove('is-image');
        mediaContainer.appendChild(iframe);
        mediaContainer.onclick = null; // No modal for video
    } else {
        const img = document.createElement('img');
        img.src = isHD && data.hdurl ? data.hdurl : data.url;
        img.alt = data.title;

        mediaContainer.classList.add('is-image');
        mediaContainer.appendChild(img);

        // Setup Modal for Image
        mediaContainer.onclick = () => {
            modal.classList.remove('hidden');
            // Try to always use HD inside the full screen modal if available
            modalImg.src = data.hdurl || data.url;
            modalCaption.textContent = data.title;
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        };
    }

    // Text Content Update
    apodTitle.textContent = data.title;
    apodDate.textContent = formatDateString(data.date);
    apodExplanation.textContent = data.explanation;

    // Check if copyright exists as it's optional in NASA's API
    if (data.copyright) {
        // Clean up newlines that sometimes come from the API
        const cleanCopyright = data.copyright.trim().replace(/\n/g, '');
        apodCopyright.textContent = `© ${cleanCopyright}`;
        apodCopyright.style.display = 'block';
    } else {
        apodCopyright.style.display = 'none';
        apodCopyright.textContent = '';
    }

    // Hide loading / show content
    loadingContainer.classList.add('hidden');
    apodContent.classList.remove('hidden');
}

// Utility to format "2026-04-01" to "April 1, 2026"
function formatDateString(dateStr) {
    if (!dateStr) return '';
    const dateOpts = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(undefined, dateOpts);
}

// ----------------------------------------------------
// MILESTONE 3: Gallery Features (Search, Sort, Filter)
// ----------------------------------------------------

async function fetchGallery() {
    galleryLoading.classList.remove('hidden');
    galleryGrid.classList.add('hidden');
    try {
        const url = `${API_URL}?api_key=${API_KEY}&count=12`;
        const response = await fetch(url);
        if(!response.ok) throw new Error("Failed to fetch gallery");
        
        const data = await response.json();
        
        // Remove duplicates if any by date using HOF
        const uniqueData = data.filter((item, index, self) =>
            index === self.findIndex((t) => t.date === item.date)
        );
        galleryData = uniqueData;
        
        applyFiltersAndSort();
    } catch(err) {
        console.error("Gallery error:", err);
        galleryGrid.innerHTML = `<p class="error-container">Could not load mission archives.</p>`;
        galleryGrid.classList.remove('hidden');
    } finally {
        galleryLoading.classList.add('hidden');
    }
}

function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = filterSelect.value;
    const sortValue = sortSelect.value;

    // 1. FILTERING (using Array HOF .filter)
    displayedGallery = galleryData.filter(item => {
        // Search filter matching title or explanation
        const matchSearch = item.title.toLowerCase().includes(searchTerm) || 
                            (item.explanation && item.explanation.toLowerCase().includes(searchTerm));
        
        // Category filter
        let matchCategory = true;
        if (filterValue === 'image') matchCategory = item.media_type === 'image';
        else if (filterValue === 'video') matchCategory = item.media_type === 'video';
        else if (filterValue === 'favorites') matchCategory = favorites.includes(item.date);
        
        return matchSearch && matchCategory;
    });

    // 2. SORTING (using Array HOF .sort)
    displayedGallery.sort((a, b) => {
        if (sortValue === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortValue === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortValue === 'alpha-asc') return a.title.localeCompare(b.title);
        if (sortValue === 'alpha-desc') return b.title.localeCompare(a.title);
        return 0;
    });

    renderGalleryList(displayedGallery);
}

function renderGalleryList(data) {
    galleryGrid.innerHTML = '';
    
    if (data.length === 0) {
        galleryGrid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">No missions found matching your criteria.</p>`;
        galleryGrid.classList.remove('hidden');
        return;
    }
    
    // 3. ITERATING (using Array HOF .map/.forEach)
    data.map(item => {
        const isFav = favorites.includes(item.date);
        const card = document.createElement('div');
        card.className = 'apod-card';
        
        const mediaHtml = item.media_type === 'video' 
            ? `<iframe class="card-media" src="${item.url}" frameborder="0" allowfullscreen></iframe>`
            : `<img class="card-media" src="${item.url}" alt="${item.title}" loading="lazy">`;
            
        card.innerHTML = `
            ${mediaHtml}
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-meta">
                    <span class="card-date">${formatDateString(item.date)}</span>
                    <button class="btn-favorite ${isFav ? 'active' : ''}" data-date="${item.date}" title="Toggle Favorite">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;
        
        const favBtn = card.querySelector('.btn-favorite');
        favBtn.addEventListener('click', () => toggleFavorite(item.date, favBtn));
        
        galleryGrid.appendChild(card);
    });
    
    galleryGrid.classList.remove('hidden');
}

function toggleFavorite(date, buttonEl) {
    if (favorites.includes(date)) {
        // Remove favorite using HOF .filter
        favorites = favorites.filter(d => d !== date);
        buttonEl.classList.remove('active');
        buttonEl.textContent = '🤍';
    } else {
        favorites.push(date);
        buttonEl.classList.add('active');
        buttonEl.textContent = '❤️';
    }
    localStorage.setItem('nasa_favorites', JSON.stringify(favorites));
    
    // Refresh if currently filtering by favorites
    if (filterSelect.value === 'favorites') {
        applyFiltersAndSort();
    }
}

// Gallery Event Listeners
let debounceTimer;
searchInput.addEventListener('input', () => {
    // Debouncing the search for better performance
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        applyFiltersAndSort();
    }, 400);
});

filterSelect.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);

// Theme Toggle Listener
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    themeToggleBtn.querySelector('.icon').textContent = isLightMode ? '🌙' : '☀️';
    localStorage.setItem('nasa_theme', isLightMode ? 'light' : 'dark');
});

// ----------------------------------------------------


// Listeners
datePicker.addEventListener('change', (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
        fetchApod(selectedDate);
    }
});

hdToggle.addEventListener('change', () => {
    // Re-render the image dynamically to swap SD/HD sources
    if (currentApodData && currentApodData.media_type === 'image') {
        const img = mediaContainer.querySelector('img');
        if (img) {
            // Apply a small opacity transition for UX
            img.style.opacity = '0.7';
            img.src = hdToggle.checked && currentApodData.hdurl ? currentApodData.hdurl : currentApodData.url;
            img.onload = () => { img.style.opacity = '1'; };
        }
    }
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalImg.src = ''; // Clear source to stop background downloading
    document.body.style.overflow = 'auto'; // Restore scroll
});

// Close modal when clicking outside the image content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal.click();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal.click();
    }
});

// System Boot
initDatePicker();

// Init Theme
if (localStorage.getItem('nasa_theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggleBtn.querySelector('.icon').textContent = '🌙';
}

// Fetch general gallery list along with today's APOD
fetchGallery();

// Initial fetch without date to get the latest available APOD.
// Avoiding direct passing of 'today' solves timezone issues on NASA's server side.
fetchApod().then(() => {
    if (currentApodData && currentApodData.date) {
        datePicker.value = currentApodData.date; // Sync input with loaded picture
    }
});
