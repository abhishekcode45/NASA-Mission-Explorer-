# NASA Mission Explorer 🚀🌌

**[Live Production Deployment](https://nasa-mission-explorer-ten.vercel.app)**

Welcome to the **NASA Mission Explorer**, a premium, interactive web application that leverages the official NASA "Astronomy Picture of the Day" (APOD) API. This high-end gallery allows users to view the cosmos as it appeared on their birthday, explore historical missions, and curate a collection of their favorite space phenomena!

## ✨ Key Features

- **Date Explorer:** Input a specific date to retrieve the corresponding astronomical picture, complete with explanations and copyright info directly from NASA.
- **Mission Archives Gallery:** A dynamic, randomized historic image gallery fetching data natively on boot.
- **Advanced Searching:** Instantly search through gallery titles and deep explanations.
- **Dynamic Sorting & Filtering:** Organize the gallery by Media Type, specific favorites, alphabetical sorting, or chronological order.
- **Space Theme Toggle:** Beautifully implemented Light/Dark mode seamlessly integrated using dynamic CSS variables.
- **Likes & Favorites System:** Favorite an image, and it completely persists across browser refresh (utilizing `LocalStorage`).
- **HD Image Modal:** Integrated full-screen zoom capability.

## 🛠️ Built With

- **HTML5:** Semantic architecture.
- **CSS3:** Premium raw CSS implementations focusing on glassmorphism, glowing micro-animations, Grid layout, and completely independent responsive design without external UI libraries.
- **JavaScript (ES6+):** Pure Vanilla JS architecture.

---

## 🎓 Academic Milestone Core Integrations

This project adheres strictly to **Milestone 3 & 4 Requirements**, highlighting a deep understanding of JavaScript functionality, API interactions, and advanced array manipulation.

### Array Higher-Order Functions (HOFs) Usage
No traditional `for` or `while` loops were used to display or parse the datasets. All rendering and data manipulation operations use strictly HOFs:
- `Array.prototype.map()`: Used inherently to dynamically inject HTML DOM cards for the Mission Archives display.
- `Array.prototype.filter()`: Masterfully handles the Live Search behavior (by keyword) and handles the "Images", "Videos", or "Favorites" sorting mechanics. Also powers duplicate cleanup.
- `Array.prototype.sort()`: Drives the dropdown capabilities determining `Newest vs Oldest` and Alphabetical behaviors natively.

### Bonus Elements Achieved
- **Local Storage:** Users who "Like" an APOD card have those selections saved to their local machine memory. Filtering by favorites directly ties back into this array.
- **Search Debouncing:** Rapidly typing into the search bar prevents immediate firing of filtering functions, instead using a carefully crafted `setTimeout()` debouncer mapped to `400ms`.
- **Loading Indicators:** Embedded CSS visual spinners actively trigger before data fetch and disappear when DOM inject takes place.

---

## ⚙️ Setup & Installation

Since this project has zero node module dependencies outside of deployment pipelines, execution is easy.

1. Clone or download the repository.
2. Open `index.html` directly in any modern browser.
3. Enjoy!

*(Note: API connection defaults to using personal generated NASA keys. If API limits are exceeded, please wait 30 minutes, or provide your own key inside `script.js`.)*

## 🌐 Public API Integrated
- **[NASA Open APIs (APOD)](https://api.nasa.gov/)**: An endpoint fetching the Astronomy Picture of the Day.
