<style>
    .site-footer-tiny {
        font-size: 0.8rem;
        font-style: italic;
        margin: 0;
    }
    .site-footer-social {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        margin-left: auto;
    }
    .site-footer-social-link {
        display: flex;
        align-items: center;
        opacity: 0.5;
        transition: opacity 0.15s;
        color: inherit;
    }
    .site-footer-social-link:hover {
        opacity: 1;
    }
    .site-footer-social-link svg {
        width: 1rem;
        height: 1rem;
        fill: currentColor;
    }
    .visitor-counter-wrap {
        display: flex;
        align-items: center;
    }
    .visitor-counter-img {
        display: block;
        border: 0;
        height: 1.3em;
        width: auto;
        min-width: 8ch;
    }
</style>

<div class="site-footer-inner wow animated fadeIn" data-wow-delay="0.05s">
    <span class="site-footer-text" data-i18n="footer.copyright">© 2026 Your Name. All rights reserved.</span>
    <div class="site-footer-controls">
        <button type="button" class="theme-toggle perf-mode-toggle" id="perf-mode-btn" data-tooltip="Is this site running too slow? Disable all the cool effects." data-i18n="footer.perfMode" data-i18n-tooltip="tooltip.perf" aria-keyshortcuts="Meta+Slash Control+Slash">performance mode</button>
        <span class="site-footer-text site-footer-text--theme" data-i18n="footer.selectTheme">select theme</span>
        <div class="theme-choice-group" role="group" aria-label="Theme mode" data-i18n-aria="aria.theme">
            <button type="button" class="theme-toggle" data-theme-choice="system" data-i18n="settings.system">system</button>
            <button type="button" class="theme-toggle" data-theme-choice="light" data-i18n="settings.light">light</button>
            <button type="button" class="theme-toggle" data-theme-choice="dark" data-i18n="settings.dark">dark</button>
        </div>
    </div>
</div>

<div class="site-footer-inner wow animated fadeIn" data-wow-delay="0.15s">
    <p class="site-footer-tiny" data-i18n="footer.videoBg">Video Backgrounds: Your Video Credit Here. </p>
    <div style="display:flex;align-items:center;gap:0.6rem;margin-left:auto;">
        <p class="site-footer-tiny" style="margin:0;" data-i18n="footer.hosted">Hosted using GitHub Pages & Firebase. </p>
        <a href="https://hitscounter.dev/history?url=https://example.com" target="_blank" rel="noopener" class="visitor-counter-wrap" aria-label="Visitor count" data-i18n-aria="footer.visitorCount">
            <img src="https://hitscounter.dev/api/hit?url=https%3A%2F%2Fexample.com&label=Hits&icon=github&color=%23198754&message=&style=flat-square&tz=Europe%2FLondon">
        </a>
    </div>
</div>

<div class="site-footer-inner site-footer-inner--nav wow animated fadeIn" data-wow-delay="0.25s">
    <p class="site-footer-tiny" data-i18n-html="footer.releaseLog">First publication: January 1st 2026. Latest update: November 18th 2026. See release log <a href="./releases">here.</a></p>
    <div class="site-footer-social" id="footer-social-links">
        <details class="footer-nav-accordion" id="footer-nav-accordion">
            <summary class="footer-nav-summary">
                <svg class="footer-nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
                <span class="footer-nav-label" data-i18n="footer.usefulPages">useful pages</span>
            </summary>
            <nav class="footer-nav-links" aria-label="Site pages" data-i18n-aria="aria.sitePages">
                <a class="footer-link" href="./" data-i18n="footer.home">Home</a>
                <a class="footer-link" href="./projects" data-i18n="footer.projects">Projects</a>
                <a class="footer-link" href="./experience" data-i18n="footer.experience">Experience</a>
                <a class="footer-link" href="./resources" data-i18n="footer.resources">Resources</a>
                <a class="footer-link" href="./music" data-i18n="footer.music">Music</a>
                <a class="footer-link" href="./blog" data-i18n="footer.blog">Blog</a>
                <a class="footer-link" href="./photography" data-i18n="footer.photography">Photography</a>
            </nav>
        </details>
    </div>
</div>