# Apps

```language-content
::en
The grid below is the local copy of the launcher. The source of truth is [`/switcher/apps.json`](/switcher/apps.json) — add an app there (and its icon under `/switcher/icons/`) and it appears in the apps popover too.

::fr
La grille ci-dessous est la copie locale du lanceur. La source de vérité est [`/switcher/apps.json`](/switcher/apps.json) — ajoutez-y une app (et son icône sous `/switcher/icons/`) et elle apparaît aussi dans le menu des apps.

::zh
下方网格是启动器的本地副本。真实数据源是 [`/switcher/apps.json`](/switcher/apps.json)——在那里添加应用（图标放在 `/switcher/icons/`），它也会出现在应用弹出菜单中。

::ja
下のグリッドはランチャーのローカルコピーです。正本は [`/switcher/apps.json`](/switcher/apps.json) です。そこにアプリ（と `/switcher/icons/` のアイコン）を追加すると、アプリのポップオーバーにも表示されます。

::it
La griglia sotto è la copia locale del launcher. La fonte di verità è [`/switcher/apps.json`](/switcher/apps.json) — aggiungi un'app lì (e l'icona in `/switcher/icons/`) e compare anche nel popover delle app.

```

<div class="ios-app-grid">
  <a class="ios-app" href="https://example.com" aria-label="Portfolio" data-tooltip="my personal site — projects, writing, music, and more." target="_blank">
    <div class="ios-app-icon">
      <img src="/switcher/icons/portfolio.png" alt="Portfolio"/>
    </div>
    <span class="ios-app-label">Portfolio</span>
  </a>

  <a class="ios-app" href="https://app-one.example.com" aria-label="App One" data-tooltip="a one-line description of your first app." target="_blank">
    <div class="ios-app-icon">
      <img src="/switcher/icons/app-one.png" alt="App One"/>
    </div>
    <span class="ios-app-label">App One</span>
  </a>

  <a class="ios-app" href="https://app-two.example.com" aria-label="App Two" data-tooltip="a one-line description of your second app." target="_blank">
    <div class="ios-app-icon">
      <img src="/switcher/icons/app-two.png" alt="App Two"/>
    </div>
    <span class="ios-app-label">App Two</span>
  </a>

  <a class="ios-app" href="https://app-three.example.com" aria-label="App Three" data-tooltip="a one-line description of your third app." target="_blank">
    <div class="ios-app-icon">
      <img src="/switcher/icons/app-three.png" alt="App Three"/>
    </div>
    <span class="ios-app-label">App Three</span>
  </a>
</div>
