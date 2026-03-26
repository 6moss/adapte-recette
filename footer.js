// Shared footer component
(function() {
    const footerHTML = `
        <div class="footer-links">
            <a href="/a-propos">A propos</a>
            <a href="/blog">Blog</a>
            <a href="/mentions-legales">Mentions legales</a>
            <a href="/confidentialite">Confidentialite</a>
            <a href="/contact">Contact</a>
        </div>
        <p class="footer-copy">&copy; ${new Date().getFullYear()} Adapte Recette. Fait avec amour pour les cuisiniers.</p>
    `;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFooter);
    } else {
        injectFooter();
    }

    function injectFooter() {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.innerHTML = footerHTML;
        }
    }
})();
