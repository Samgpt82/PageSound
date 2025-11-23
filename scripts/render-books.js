// Load and render books dynamically
let booksData = null;

async function loadBooksData() {
    if (booksData) return booksData;
    
    try {
        // Determine the correct path based on current location
        let jsonPath = 'data/books.json';
        const path = window.location.pathname;
        if (path.includes('/books/')) {
            jsonPath = '../../data/books.json';
        } else if (path.includes('/podcasts/') || path.includes('/about/') || path.includes('/contact/')) {
            jsonPath = '../data/books.json';
        }
        
        console.log('Loading books from:', jsonPath);
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Failed to load books.json: ${response.status} ${response.statusText}`);
        }
        booksData = await response.json();
        console.log('Books data loaded successfully:', booksData.books.length, 'books');
        return booksData;
    } catch (error) {
        console.error('Error loading books data:', error);
        console.error('Current path:', window.location.pathname);
        console.error('Current URL:', window.location.href);
        return { books: [] };
    }
}

function renderBookCard(book, container, basePath = '') {
    const card = document.createElement('article');
    card.className = 'summary-card';
    // Determine correct path based on current location
    let bookPath = `books/${book.id}/index.html`;
    if (basePath) {
        bookPath = `${basePath}${book.id}/index.html`;
    } else if (window.location.pathname.includes('/books/')) {
        bookPath = `${book.id}/index.html`;
    }
    
    card.innerHTML = `
        <a class="card-media" href="${bookPath}">
            <img src="${book.coverImageThumb}" alt="${book.title} book cover">
        </a>
        <span class="pill">${book.category}</span>
        <h3><a href="${bookPath}" class="card-title">${book.title}</a></h3>
        <p>${book.description}</p>
        <a href="${bookPath}" class="text-link">View summary & audio</a>
    `;
    container.appendChild(card);
}

function renderBookDetail(book) {
    const main = document.querySelector('.detail-main');
    if (!main) return;
    
    // Determine correct back link path
    const path = window.location.pathname;
    let backLink = '../index.html#summaries';
    if (path.includes('/books/')) {
        backLink = '../../index.html#summaries';
    }
    
    main.innerHTML = `
        <a class="back-link" href="${backLink}">← All book summaries</a>
        <div class="detail-grid">
            <div class="detail-cover">
                <img src="${book.coverImage}" alt="${book.title} book cover">
            </div>
            <div class="detail-content">
                <span class="pill">${book.category}</span>
                <h1>${book.title}</h1>
                <div class="detail-meta">
                    <span>Author: ${book.author}</span>
                    <span>Release: ${book.releaseDate}</span>
                    <span>Summary length: ${book.summaryLength}</span>
                </div>
                <p class="detail-description">${book.summary}</p>
                <section>
                    <h2>Key takeaways</h2>
                    <ul>
                        ${book.keyTakeaways.map(takeaway => `<li>${takeaway}</li>`).join('')}
                    </ul>
                </section>
                <div class="detail-audio">
                    <h2>Listen to the audio summary</h2>
                    ${book.audioFiles && book.audioFiles.length > 0 ? 
                        // Multiple audio files
                        book.audioFiles.map((audio, index) => `
                            <div style="margin-bottom: 2rem;">
                                <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem; font-weight: 600;">Part ${index + 1}${audio.label ? `: ${audio.label}` : ''}</h3>
                                <audio controls style="width: 100%; margin-bottom: 0.5rem;">
                                    <source src="${audio.file}" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio>
                                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                                    <a class="text-link download-link" href="${audio.file}" download="${audio.downloadName || `part${index + 1}.mp3`}">Download Part ${index + 1}</a>
                                    ${audio.scriptFile ? `<a class="text-link" href="${audio.scriptFile}" target="_blank">View script Part ${index + 1}</a>` : ''}
                                </div>
                            </div>
                        `).join('') :
                        // Single audio file (backward compatibility)
                        `
                            <audio controls>
                                <source src="${book.audioFile}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                            <div style="margin-top: 1rem; display: flex; gap: 1.5rem; flex-wrap: wrap;">
                                <a class="text-link download-link" href="${book.audioFile}" download="${book.audioDownloadName}">Download MP3</a>
                                ${book.scriptFile ? `<a class="text-link" href="${book.scriptFile}" target="_blank">View script/transcript</a>` : ''}
                            </div>
                        `
                    }
                    <p class="detail-audio-note" style="margin-top: 1rem;">${book.audioFiles && book.audioFiles.length > 0 ? 'Multiple parts available. Listen to each part in order.' : 'This is a 1-second placeholder file. Replace <code>sample.mp3</code> with your recorded narration when ready.'}</p>
                </div>
            </div>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadBooksData();
    
    // Check if we're on a book detail page
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
    
    // Look for book ID in path (e.g., /books/deep-work/index.html or /books/deep-work/)
    let bookId = null;
    const booksIndex = pathParts.indexOf('books');
    if (booksIndex !== -1 && pathParts.length > booksIndex + 1) {
        bookId = pathParts[booksIndex + 1];
    }
    
    // Also check URL hash or query params as fallback
    if (!bookId) {
        const urlParams = new URLSearchParams(window.location.search);
        bookId = urlParams.get('id');
    }
    
    // Debug logging
    console.log('Path:', path);
    console.log('Path parts:', pathParts);
    console.log('Books index:', booksIndex);
    console.log('Book ID:', bookId);
    console.log('Books data loaded:', data.books.length, 'books');
    
    if (bookId && bookId !== 'index.html' && bookId !== 'books') {
        const book = data.books.find(b => b.id === bookId);
        if (book) {
            renderBookDetail(book);
            document.title = `${book.title} Summary | Summeries & Sound`;
            // Update meta description if needed
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = book.description;
            }
        } else {
            console.error(`Book with id "${bookId}" not found. Available books:`, data.books.map(b => b.id));
            const main = document.querySelector('.detail-main');
            if (main) {
                main.innerHTML = `
                    <div style="padding: 2rem; text-align: center;">
                        <h1>Book Not Found</h1>
                        <p>Book with ID "${bookId}" was not found in the database.</p>
                        <p>Available books: ${data.books.map(b => b.id).join(', ')}</p>
                        <a href="../../index.html" class="text-link">← Back to Home</a>
                    </div>
                `;
            }
        }
    } else {
        // Render book cards on listing pages (only if container exists and is empty)
        // Skip homepage - it has its own rendering logic
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);
        // Homepage is at root (empty pathParts) or just has 'index.html'
        const isHomepage = pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'index.html');
        
        if (!isHomepage) {
            const container = document.getElementById('books-container');
            if (container && container.children.length === 0) {
                data.books.forEach(book => renderBookCard(book, container));
            }
        }
    }
});

