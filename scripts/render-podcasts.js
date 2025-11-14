// Load and render podcasts dynamically
let podcastsData = null;

async function loadPodcastsData() {
    if (podcastsData) return podcastsData;
    
    try {
        // Determine the correct path based on current location
        let jsonPath = 'data/podcasts.json';
        const path = window.location.pathname;
        if (path.includes('/podcasts/')) {
            jsonPath = '../../data/podcasts.json';
        } else if (path.includes('/books/') || path.includes('/about/') || path.includes('/contact/')) {
            jsonPath = '../data/podcasts.json';
        }
        
        const response = await fetch(jsonPath);
        podcastsData = await response.json();
        return podcastsData;
    } catch (error) {
        console.error('Error loading podcasts data:', error);
        return { podcasts: [] };
    }
}

function renderPodcastCard(podcast, container, basePath = '') {
    const card = document.createElement('article');
    card.className = 'podcast-card';
    // Determine correct path based on current location
    let podcastPath = `podcasts/${podcast.id}/index.html`;
    if (basePath) {
        podcastPath = `${basePath}${podcast.id}/index.html`;
    } else if (window.location.pathname.includes('/podcasts/')) {
        podcastPath = `${podcast.id}/index.html`;
    }
    
    card.innerHTML = `
        <a class="card-media" href="${podcastPath}">
            <img src="${podcast.coverImageThumb}" alt="${podcast.title} cover art">
        </a>
        <div class="episode-meta">Episode ${podcast.episodeNumber} · ${podcast.length}</div>
        <h3><a href="${podcastPath}" class="card-title">${podcast.title}</a></h3>
        <p>${podcast.description}</p>
        <a href="${podcastPath}" class="text-link">Listen to episode</a>
    `;
    container.appendChild(card);
}

function renderPodcastDetail(podcast) {
    const main = document.querySelector('.detail-main');
    if (!main) return;
    
    // Determine correct back link path
    const path = window.location.pathname;
    let backLink = '../index.html#podcasts';
    if (path.includes('/podcasts/')) {
        backLink = '../../index.html#podcasts';
    }
    
    main.innerHTML = `
        <a class="back-link" href="${backLink}">← All podcast episodes</a>
        <div class="detail-grid">
            <div class="detail-cover">
                <img src="${podcast.coverImage}" alt="${podcast.title} episode artwork">
            </div>
            <div class="detail-content">
                <span class="pill">Episode ${podcast.episodeNumber}</span>
                <h1>${podcast.title}</h1>
                <div class="detail-meta">
                    <span>Length: ${podcast.length}</span>
                    <span>Format: ${podcast.format}</span>
                    <span>Released: ${podcast.releaseDate}</span>
                </div>
                <p class="detail-description">${podcast.summary}</p>
                <section>
                    <h2>Episode highlights</h2>
                    <ul>
                        ${podcast.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </section>
                <div class="detail-audio">
                    <h2>Stream the episode</h2>
                    <audio controls>
                        <source src="${podcast.audioFile}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <a class="text-link download-link" href="${podcast.audioFile}" download="${podcast.audioDownloadName}">Download MP3</a>
                    <p class="detail-audio-note">This is a 1-second placeholder file. Replace <code>sample.mp3</code> with your mastered audio file.</p>
                </div>
            </div>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadPodcastsData();
    
    // Check if we're on a podcast detail page
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
    
    // Look for podcast ID in path (e.g., /podcasts/five-hour-workday/index.html or /podcasts/five-hour-workday/)
    let podcastId = null;
    const podcastsIndex = pathParts.indexOf('podcasts');
    if (podcastsIndex !== -1 && pathParts.length > podcastsIndex + 1) {
        podcastId = pathParts[podcastsIndex + 1];
    }
    
    // Also check URL hash or query params as fallback
    if (!podcastId) {
        const urlParams = new URLSearchParams(window.location.search);
        podcastId = urlParams.get('id');
    }
    
    if (podcastId && podcastId !== 'index.html' && podcastId !== 'podcasts') {
        const podcast = data.podcasts.find(p => p.id === podcastId);
        if (podcast) {
            renderPodcastDetail(podcast);
            document.title = `${podcast.title} | Summeries & Sound`;
            // Update meta description if needed
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = podcast.description;
            }
        } else {
            console.error(`Podcast with id "${podcastId}" not found`);
        }
    } else {
        // Render podcast cards on listing pages (only if container exists and is empty)
        // Skip homepage - it has its own rendering logic
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);
        // Homepage is at root (empty pathParts) or just has 'index.html'
        const isHomepage = pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'index.html');
        
        if (!isHomepage) {
            const container = document.getElementById('podcasts-container');
            if (container && container.children.length === 0) {
                data.podcasts.forEach(podcast => renderPodcastCard(podcast, container));
            }
        }
    }
});

