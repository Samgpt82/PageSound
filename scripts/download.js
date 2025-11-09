document.addEventListener('DOMContentLoaded', () => {
    const downloadLinks = document.querySelectorAll('.download-link');

    downloadLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) {
            return;
        }

        const filename = link.getAttribute('download') || href.split('/').pop() || 'audio.mp3';

        link.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const response = await fetch(href);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                const tempLink = document.createElement('a');
                tempLink.href = objectUrl;
                tempLink.download = filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                tempLink.remove();

                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            } catch (error) {
                console.error('Download failed, falling back to direct link.', error);
                window.location.href = href;
            }
        });
    });
});

