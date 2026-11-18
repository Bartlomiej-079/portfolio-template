# Settings

<p class="settings-group-label" data-i18n="settings.appearance">Appearance</p>
<div class="settings-group">
  <div class="settings-row settings-row-segment" data-setting="theme">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#667eea,#764ba2);">🎨</div>
    <span class="settings-row-label" data-i18n="settings.theme">Theme</span>
    <div class="theme-segment" role="radiogroup" aria-label="Theme" data-i18n-aria="aria.theme">
      <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="system" data-i18n="settings.system">system</button>
      <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="light" data-i18n="settings.light">light</button>
      <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="dark" data-i18n="settings.dark">dark</button>
      <span class="theme-segment-indicator" aria-hidden="true"></span>
    </div>
  </div>
  <div class="settings-row settings-row-dropdown" data-setting="language">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#11998e,#38ef7d);">🌐</div>
    <span class="settings-row-label" data-i18n="settings.language">Language</span>
    <div class="lang-dropdown-mount" data-options="en,fr,it,ja,zh" aria-label="Default language" data-i18n-aria="aria.defaultLanguage"></div>
  </div>
  <div class="settings-row settings-row-toggle" data-setting="perf">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#f7971e,#ffd200);">⚡</div>
    <span class="settings-row-label" data-i18n="settings.perf">Performance Mode</span>
    <button
      type="button"
      class="ios-toggle"
      role="switch"
      aria-checked="false"
      data-toggle="perf"
      aria-label="Toggle performance mode"
      data-i18n-aria="settings.togglePerf"
      aria-keyshortcuts="Meta+Slash Control+Slash"
    ><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
  </div>
  <div class="settings-row settings-row-toggle" data-setting="video-bg">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#2193b0,#6dd5ed);">🎬</div>
    <span class="settings-row-label" data-i18n="settings.videoBg">Video Background</span>
    <button
      type="button"
      class="ios-toggle"
      role="switch"
      aria-checked="false"
      data-toggle="video-bg"
      aria-label="Toggle video background"
      data-i18n-aria="settings.toggleVideo"
      aria-keyshortcuts="Meta+Semicolon Control+Semicolon"
    ><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
  </div>
  <div class="settings-row settings-row-toggle" data-setting="animation">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#8e2de2,#c471ed);">🫧</div>
    <span class="settings-row-label" data-i18n="settings.bubbles">Bubbles Animation</span>
    <button
      type="button"
      class="ios-toggle"
      role="switch"
      aria-checked="false"
      data-toggle="animation"
      aria-label="Toggle iridescent bubbles animation"
      data-i18n-aria="settings.toggleBubbles"
      aria-keyshortcuts="Meta+Backslash Control+Backslash"
    ><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
  </div>
  <div class="settings-row settings-row-toggle" data-setting="marie-kondo">
    <div class="settings-row-icon" style="background: linear-gradient(135deg,#e0e0e0,#ffffff);">🧹</div>
    <span class="settings-row-label" data-i18n="settings.marieKondo">Marie Kondo Mode</span>
    <button
      type="button"
      class="ios-toggle"
      role="switch"
      aria-checked="false"
      data-toggle="marie-kondo"
      aria-label="Toggle Marie Kondo mode"
      data-i18n-aria="settings.toggleMarie"
      aria-keyshortcuts="Meta+KeyM Control+KeyM"
    ><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
  </div>
</div>
