(function (global) {
  "use strict";

  var LANGUAGE_PREF_KEY = "portfolio-language";
  var SUPPORTED = ["en", "fr", "it", "ja", "zh", "pl"];
  var LOCALES = { en: "en-GB", fr: "fr-FR", it: "it-IT", ja: "ja-JP", zh: "zh-CN", pl: "pl-PL" };
  var NAMES = {
    en: "English",
    fr: "Français",
    it: "Italiano",
    ja: "日本語",
    zh: "中文",
    pl: "Polski"
  };
  var FLAGS = { en: "🇬🇧", fr: "🇫🇷", it: "🇮🇹", ja: "🇯🇵", zh: "🇨🇳", pl: "🇵🇱" };

  var STRINGS = {
    "meta.siteTitle": {
      en: "Your Name — Your Job Title",
      fr: "Your Name — Votre titre",
      it: "Your Name — Il tuo titolo",
      ja: "Your Name — あなたの肩書き",
      zh: "Your Name — 你的职位"
    },
    "meta.title.home": {
      en: "Your Name — Your Job Title",
      fr: "Your Name — Votre titre",
      it: "Your Name — Il tuo titolo",
      ja: "Your Name — あなたの肩書き",
      zh: "Your Name — 你的职位"
    },
    "meta.title.projects": {
      en: "Projects — Your Name",
      fr: "Projets — Your Name",
      it: "Progetti — Your Name",
      ja: "プロジェクト — Your Name",
      zh: "项目 — Your Name"
    },
    "meta.title.experience": {
      en: "Experience — Your Name",
      fr: "Expérience — Your Name",
      it: "Esperienza — Your Name",
      ja: "経歴 — Your Name",
      zh: "经历 — Your Name"
    },
    "meta.title.resources": {
      en: "Resources — Your Name",
      fr: "Ressources — Your Name",
      it: "Risorse — Your Name",
      ja: "リソース — Your Name",
      zh: "资源 — Your Name"
    },
    "meta.title.designs": {
      en: "Designs Gallery — Your Name",
      fr: "Galerie de créations — Your Name",
      it: "Galleria di design — Your Name",
      ja: "デザインギャラリー — Your Name",
      zh: "设计作品集 — Your Name"
    },
    "meta.title.music": {
      en: "Music — Your Name",
      fr: "Musique — Your Name",
      it: "Musica — Your Name",
      ja: "音楽 — Your Name",
      zh: "音乐 — Your Name"
    },
    "meta.title.blog": {
      en: "Blog — Your Name",
      fr: "Blog — Your Name",
      it: "Blog — Your Name",
      ja: "ブログ — Your Name",
      zh: "博客 — Your Name"
    },
    "meta.title.info": {
      en: "Info — Your Name",
      fr: "Infos — Your Name",
      it: "Info — Your Name",
      ja: "情報 — Your Name",
      zh: "信息 — Your Name"
    },
    "meta.title.photography": {
      en: "Photography — Your Name",
      fr: "Photographie — Your Name",
      it: "Fotografia — Your Name",
      ja: "写真 — Your Name",
      zh: "摄影 — Your Name"
    },
    "meta.title.releases": {
      en: "Release notes — Your Name",
      fr: "Notes de version — Your Name",
      it: "Note di rilascio — Your Name",
      ja: "リリースノート — Your Name",
      zh: "更新日志 — Your Name"
    },
    "meta.title.apps": {
      en: "Apps — Your Name",
      fr: "Apps — Your Name",
      it: "App — Your Name",
      ja: "アプリ — Your Name",
      zh: "应用 — Your Name"
    },
    "meta.title.settings": {
      en: "Settings — Your Name",
      fr: "Réglages — Your Name",
      it: "Impostazioni — Your Name",
      ja: "設定 — Your Name",
      zh: "设置 — Your Name"
    },
    "meta.title.textbook": {
      en: "Featured project — Your Name",
      fr: "Projet phare — Your Name",
      it: "Progetto in evidenza — Your Name",
      ja: "注目プロジェクト — Your Name",
      zh: "精选项目 — Your Name"
    },
    "meta.description.home": {
      en: "Your Name is a Your Job Title at Your Company. Add a short, searchable description of who you are and what you do here.",
      fr: "Your Name est Votre titre chez Votre entreprise. Ajoutez ici une courte description de qui vous êtes et de ce que vous faites.",
      it: "Your Name è Il tuo titolo presso La tua azienda. Aggiungi qui una breve descrizione di chi sei e di cosa fai.",
      ja: "Your Name は Your Company の Your Job Title です。ここにあなたの自己紹介を短く書いてください。",
      zh: "Your Name 是 Your Company 的 Your Job Title。请在此处简要介绍你是谁、做什么。"
    },
    "meta.description.projects": {
      en: "Personal projects by Your Name.",
      fr: "Projets personnels de Your Name.",
      it: "Progetti personali di Your Name.",
      ja: "Your Name の個人プロジェクト。",
      zh: "Your Name 的个人项目。"
    },
    "meta.description.experience": {
      en: "Roles and experience of Your Name.",
      fr: "Parcours et expérience de Your Name.",
      it: "Ruoli ed esperienza di Your Name.",
      ja: "Your Name の経歴と職務経験。",
      zh: "Your Name 的经历与工作背景。"
    },
    "meta.description.resources": {
      en: "Notes, cheat sheets and other resources published by Your Name.",
      fr: "Notes, fiches et autres ressources publiées par Your Name.",
      it: "Note, schede e altre risorse pubblicate da Your Name.",
      ja: "Your Name が公開しているノートやチートシートなどのリソース。",
      zh: "Your Name 发布的笔记、速查表及其他资源。"
    },
    "meta.description.designs": {
      en: "Visual design and artwork by Your Name.",
      fr: "Créations visuelles et œuvres de Your Name.",
      it: "Design visivi e opere di Your Name.",
      ja: "Your Name のビジュアルデザインとアートワーク。",
      zh: "Your Name 的视觉设计和艺术作品。"
    },
    "meta.description.music": {
      en: "Music by Your Name.",
      fr: "Musique de Your Name.",
      it: "Musica di Your Name.",
      ja: "Your Name の音楽。",
      zh: "Your Name 的音乐。"
    },
    "meta.description.blog": {
      en: "Writing by Your Name.",
      fr: "Textes de Your Name.",
      it: "Scritti di Your Name.",
      ja: "Your Name の文章。",
      zh: "Your Name 的写作。"
    },
    "meta.description.info": {
      en: "Social profiles and contact details for Your Name.",
      fr: "Profils et coordonnées de Your Name.",
      it: "Profili e contatti di Your Name.",
      ja: "Your Name のプロフィールと連絡先。",
      zh: "Your Name 的社交档案与联系方式。"
    },
    "meta.description.photography": {
      en: "Photography by Your Name.",
      fr: "Photographies de Your Name.",
      it: "Fotografie di Your Name.",
      ja: "Your Name の写真。",
      zh: "Your Name 的摄影作品。"
    },
    "photo.loading": { en: "loading…", pl: "ładowanie…" },
    "photo.loadError": { en: "Could not load photos.", pl: "Nie udało się załadować zdjęć." },
    "photo.viewer": { en: "Photo viewer", pl: "Przeglądarka zdjęć" },
    "photo.openImage": { en: "Open image in new tab", pl: "Otwórz zdjęcie w nowej karcie" },
    "photo.back": { en: "back to photography", pl: "wróć do fotografii" },
    "photo.notFound": { en: "Photo not found.", pl: "Nie znaleziono zdjęcia." },
    "photo.location": { en: "location", pl: "lokalizacja" },
    "photo.mapTitle": { en: "Photo location map", pl: "Mapa lokalizacji zdjęcia" },
    "photo.browse": { en: "Browse photos", pl: "Przeglądaj zdjęcia" },
    "photo.previous": { en: "previous", pl: "poprzednie" },
    "photo.next": { en: "next", pl: "następne" },
    "photo.counter": { en: "Photo {current} of {total}", pl: "Zdjęcie {current} z {total}" },
    "photo.titleSuffix": { en: "{title} | Your Name", pl: "{title} | Your Name" },
    "photo.meta.date": { en: "date", pl: "data" },
    "photo.meta.dimensions": { en: "dimensions", pl: "wymiary" },
    "photo.meta.camera": { en: "camera", pl: "aparat" },
    "photo.meta.lens": { en: "lens", pl: "obiektyw" },
    "photo.meta.focal": { en: "focal length", pl: "ogniskowa" },
    "photo.meta.shutter": { en: "shutter", pl: "czas naświetlania" },
    "photo.meta.aperture": { en: "aperture", pl: "przysłona" },
    "photo.meta.iso": { en: "ISO", pl: "ISO" },
    "photo.meta.coordinates": { en: "coordinates", pl: "współrzędne" },
    "meta.description.releases": {
      en: "Changelog and release history for this site.",
      fr: "Journal des versions de ce site.",
      it: "Cronologia delle versioni di questo sito.",
      ja: "このサイトの更新履歴。",
      zh: "本网站的更新记录。"
    },
    "meta.description.apps": {
      en: "Apps and tools built by Your Name.",
      fr: "Applications et outils créés par Your Name.",
      it: "App e strumenti creati da Your Name.",
      ja: "Your Name が作ったアプリとツール。",
      zh: "Your Name 开发的应用与工具。"
    },
    "meta.description.settings": {
      en: "Site settings.",
      fr: "Réglages du site.",
      it: "Impostazioni del sito.",
      ja: "サイト設定。",
      zh: "网站设置。"
    },
    "meta.description.textbook": {
      en: "A featured project by Your Name.",
      fr: "Un projet phare de Your Name.",
      it: "Un progetto in evidenza di Your Name.",
      ja: "Your Name の注目プロジェクト。",
      zh: "Your Name 的精选项目。"
    },
    "meta.blogPostTitle": {
      en: "Blog Post | Your Name",
      fr: "Article | Your Name",
      it: "Articolo | Your Name",
      ja: "ブログ記事 | Your Name",
      zh: "博客文章 | Your Name"
    },
    "nav.home": { en: "introduction", fr: "introduction", it: "introduzione", ja: "紹介", zh: "介绍" },
    "nav.projects": { en: "personal projects", fr: "projets personnels", it: "progetti personali", ja: "個人プロジェクト", zh: "个人项目" },
    "nav.experience": { en: "experience", fr: "expérience", it: "esperienza", ja: "経歴", zh: "经历" },
    "nav.resources": { en: "resources", fr: "ressources", it: "risorse", ja: "リソース", zh: "资源" },
    "nav.designs": { en: "designs gallery", fr: "galerie de créations", it: "galleria di design", ja: "デザインギャラリー", zh: "设计作品集" },
    "nav.music": { en: "music", fr: "musique", it: "musica", ja: "音楽", zh: "音乐" },
    "nav.blog": { en: "blog", fr: "blog", it: "blog", ja: "ブログ", zh: "博客" },
    "nav.photography": { en: "photography", fr: "photographie", it: "fotografia", ja: "写真", zh: "摄影" },
    "nav.getCv": { en: "get cv", fr: "télécharger le CV", it: "scarica il CV", ja: "CVを入手", zh: "获取简历" },

    "title.home": {
      en: "welcome to my page!!",
      fr: "bienvenue sur ma page !!",
      it: "benvenuto sulla mia pagina!!",
      ja: "私のページへようこそ!!",
      zh: "欢迎来到我的主页!!"
    },
    "title.projects": {
      en: "personal projects i've worked on",
      fr: "projets personnels sur lesquels j'ai travaillé",
      it: "progetti personali a cui ho lavorato",
      ja: "これまで手がけた個人プロジェクト",
      zh: "我做过的个人项目"
    },
    "title.experience": { en: "experience", fr: "expérience", it: "esperienza", ja: "経歴", zh: "经历" },
    "title.resources": { en: "resources", fr: "ressources", it: "risorse", ja: "リソース", zh: "资源" },
    "title.designs": { en: "designs gallery", fr: "galerie de créations", it: "galleria di design", ja: "デザインギャラリー", zh: "设计作品集" },
    "title.music": { en: "music", fr: "musique", it: "musica", ja: "音楽", zh: "音乐" },
    "title.blog": { en: "blog", fr: "blog", it: "blog", ja: "ブログ", zh: "博客" },
    "title.post": { en: "blog post", fr: "article", it: "articolo", ja: "ブログ記事", zh: "博客文章" },
    "title.info": { en: "information corner", fr: "coin informations", it: "angolo informazioni", ja: "インフォメーション", zh: "信息角" },
    "title.releases": { en: "release notes", fr: "notes de version", it: "note di rilascio", ja: "リリースノート", zh: "更新日志" },
    "title.settings": { en: "settings", fr: "réglages", it: "impostazioni", ja: "設定", zh: "设置" },
    "title.apps": { en: "apps", fr: "apps", it: "app", ja: "アプリ", zh: "应用" },
    "title.textbook-project": { en: "featured project", fr: "projet phare", it: "progetto in evidenza", ja: "注目プロジェクト", zh: "精选项目" },
    "designs.intro": {
      en: "A small gallery of visual design and artwork.",
      fr: "Une petite galerie de créations visuelles et d’œuvres.",
      it: "Una piccola galleria di design visivi e opere.",
      ja: "ビジュアルデザインとアートワークの小さなギャラリーです。",
      zh: "这里展示一些视觉设计和艺术作品。"
    },
    "designs.galleryLabel": { en: "Designs gallery", fr: "Galerie de créations", it: "Galleria di design", ja: "デザインギャラリー", zh: "设计作品集" },
    "designs.artwork1": { en: "Artwork 1", fr: "Création 1", it: "Opera 1", ja: "作品 1", zh: "作品 1" },
    "designs.artwork2": { en: "Artwork 2", fr: "Création 2", it: "Opera 2", ja: "作品 2", zh: "作品 2" },
    "designs.artwork3": { en: "Artwork 3", fr: "Création 3", it: "Opera 3", ja: "作品 3", zh: "作品 3" },
    "designs.placeholderNote": {
      en: "These are starter placeholders—replace them with your own designs.",
      fr: "Ces images sont des exemples à remplacer par vos propres créations.",
      it: "Queste immagini sono segnaposto: sostituiscile con i tuoi design.",
      ja: "現在はサンプル画像です。ご自身のデザインに置き換えてください。",
      zh: "这些是示例占位图，请替换为你自己的设计。"
    },

    "tooltip.github": { en: "check out my github repos.", fr: "découvrez mes dépôts GitHub.", it: "dai un'occhiata ai miei repo GitHub.", ja: "GitHub リポジトリを見る。", zh: "看看我的 GitHub 仓库。" },
    "tooltip.linkedin": { en: "connect with me on LinkedIn.", fr: "connectez-vous avec moi sur LinkedIn.", it: "connettiti con me su LinkedIn.", ja: "LinkedIn でつながる。", zh: "在 LinkedIn 上联系我。" },
    "tooltip.info": { en: "learn more about me through my link-tree.", fr: "en savoir plus via mon link-tree.", it: "scopri di più dal mio link-tree.", ja: "リンクツリーでもっと知る。", zh: "通过我的链接树了解更多。" },
    "tooltip.apps": { en: "a collection of small projects and web-apps I've built.", fr: "une collection de petits projets et d'apps que j'ai construits.", it: "una raccolta di piccoli progetti e web-app che ho costruito.", ja: "作ってきた小さなプロジェクトとウェブアプリ。", zh: "我做过的一批小项目和网页应用。" },
    "tooltip.search": { en: "search the site (⌘K).", fr: "rechercher sur le site (⌘K).", it: "cerca nel sito (⌘K).", ja: "サイト内検索（⌘K）。", zh: "搜索本站（⌘K）。" },
    "tooltip.settings": { en: "manage your account and site settings.", fr: "gérer les réglages du site.", it: "gestisci le impostazioni del sito.", ja: "サイト設定を管理。", zh: "管理网站设置。" },
    "tooltip.perf": { en: "Is this site running too slow? Disable all the cool effects.", fr: "Le site est trop lent ? Désactivez les effets.", it: "Il sito è troppo lento? Disattiva gli effetti.", ja: "重いですか？演出をオフにできます。", zh: "觉得卡顿？可以关掉所有特效。" },

    "aria.info": { en: "Info page", fr: "Page infos", it: "Pagina info", ja: "情報ページ", zh: "信息页" },
    "aria.apps": { en: "Apps", fr: "Apps", it: "App", ja: "アプリ", zh: "应用" },
    "aria.search": { en: "Search", fr: "Recherche", it: "Cerca", ja: "検索", zh: "搜索" },
    "aria.settings": { en: "Settings", fr: "Réglages", it: "Impostazioni", ja: "設定", zh: "设置" },
    "aria.theme": { en: "Theme", fr: "Thème", it: "Tema", ja: "テーマ", zh: "主题" },
    "aria.close": { en: "Close", fr: "Fermer", it: "Chiudi", ja: "閉じる", zh: "关闭" },
    "aria.prevImage": { en: "Previous image", fr: "Image précédente", it: "Immagine precedente", ja: "前の画像", zh: "上一张" },
    "aria.nextImage": { en: "Next image", fr: "Image suivante", it: "Immagine successiva", ja: "次の画像", zh: "下一张" },
    "aria.zoomOut": { en: "Zoom out", fr: "Zoom arrière", it: "Riduci zoom", ja: "縮小", zh: "缩小" },
    "aria.zoomReset": { en: "Reset zoom", fr: "Réinitialiser le zoom", it: "Reimposta zoom", ja: "ズームをリセット", zh: "重置缩放" },
    "aria.zoomIn": { en: "Zoom in", fr: "Zoom avant", it: "Ingrandisci", ja: "拡大", zh: "放大" },
    "aria.searchProjects": { en: "Search projects", fr: "Rechercher des projets", it: "Cerca progetti", ja: "プロジェクトを検索", zh: "搜索项目" },
    "aria.searchExperience": { en: "Search experience", fr: "Rechercher l'expérience", it: "Cerca esperienza", ja: "経歴を検索", zh: "搜索经历" },
    "aria.searchResources": { en: "Search resources", fr: "Rechercher des ressources", it: "Cerca risorse", ja: "リソースを検索", zh: "搜索资源" },
    "aria.searchBlog": { en: "Search blog posts", fr: "Rechercher des articles", it: "Cerca articoli", ja: "記事を検索", zh: "搜索博客" },
    "aria.searchMusic": { en: "Search music", fr: "Rechercher de la musique", it: "Cerca musica", ja: "音楽を検索", zh: "搜索音乐" },
    "aria.filterType": { en: "Filter by type", fr: "Filtrer par type", it: "Filtra per tipo", ja: "種類で絞り込み", zh: "按类型筛选" },
    "aria.sitePages": { en: "Site pages", fr: "Pages du site", it: "Pagine del sito", ja: "サイトページ", zh: "网站页面" },
    "aria.defaultLanguage": { en: "Default language", fr: "Langue par défaut", it: "Lingua predefinita", ja: "デフォルト言語", zh: "默认语言" },
    "aria.404actions": { en: "404 actions", fr: "Actions 404", it: "Azioni 404", ja: "404 の操作", zh: "404 操作" },
    "aria.seeAllApps": { en: "See all apps", fr: "Voir toutes les apps", it: "Vedi tutte le app", ja: "すべてのアプリを見る", zh: "查看全部应用" },
    "aria.openSettings": { en: "Open full settings page", fr: "Ouvrir la page des réglages", it: "Apri la pagina impostazioni", ja: "設定ページを開く", zh: "打开完整设置页" },
    "aria.toc": { en: "Table of contents", fr: "Table des matières", it: "Indice", ja: "目次", zh: "目录" },

    "filter.tag": { en: "tag", fr: "tag", it: "tag", ja: "タグ", zh: "标签" },
    "filter.year": { en: "year", fr: "année", it: "anno", ja: "年", zh: "年份" },
    "filter.allTags": { en: "all tags", fr: "tous les tags", it: "tutti i tag", ja: "すべてのタグ", zh: "全部标签" },
    "filter.allRoles": { en: "all roles", fr: "tous les rôles", it: "tutti i ruoli", ja: "すべての役割", zh: "全部角色" },
    "filter.allYears": { en: "all years", fr: "toutes les années", it: "tutti gli anni", ja: "すべての年", zh: "全部年份" },
    "filter.search": { en: "search…", fr: "rechercher…", it: "cerca…", ja: "検索…", zh: "搜索…" },
    "view.grid": { en: "display as grid", fr: "afficher en grille", it: "mostra come griglia", ja: "グリッド表示", zh: "网格显示" },
    "view.list": { en: "display as list", fr: "afficher en liste", it: "mostra come elenco", ja: "リスト表示", zh: "列表显示" },
    "view.columns": { en: "display as columns", fr: "afficher en colonnes", it: "mostra come colonne", ja: "カラム表示", zh: "分栏显示" },

    "empty.projects": { en: "No projects match the selected filters.", fr: "Aucun projet ne correspond aux filtres.", it: "Nessun progetto corrisponde ai filtri.", ja: "条件に合うプロジェクトはありません。", zh: "没有符合筛选条件的项目。" },
    "empty.experience": { en: "No experience entries match the selected filters.", fr: "Aucune expérience ne correspond aux filtres.", it: "Nessuna esperienza corrisponde ai filtri.", ja: "条件に合う経歴はありません。", zh: "没有符合筛选条件的经历。" },
    "empty.resources": { en: "No resources match the selected filters.", fr: "Aucune ressource ne correspond aux filtres.", it: "Nessuna risorsa corrisponde ai filtri.", ja: "条件に合うリソースはありません。", zh: "没有符合筛选条件的资源。" },
    "empty.blog": { en: "No blog posts match the selected filters.", fr: "Aucun article ne correspond aux filtres.", it: "Nessun articolo corrisponde ai filtri.", ja: "条件に合う記事はありません。", zh: "没有符合筛选条件的文章。" },
    "empty.music": { en: "No music posts match the selected filters.", fr: "Aucun morceau ne correspond aux filtres.", it: "Nessun brano corrisponde ai filtri.", ja: "条件に合う音楽はありません。", zh: "没有符合筛选条件的音乐。" },
    "empty.loadingPosts": { en: "Loading posts…", fr: "Chargement des articles…", it: "Caricamento articoli…", ja: "記事を読み込み中…", zh: "正在加载文章…" },
    "empty.couldNotLoadPosts": { en: "Could not load posts.", fr: "Impossible de charger les articles.", it: "Impossibile caricare gli articoli.", ja: "記事を読み込めませんでした。", zh: "无法加载文章。" },
    "empty.loadingMusic": { en: "Loading music…", fr: "Chargement de la musique…", it: "Caricamento musica…", ja: "音楽を読み込み中…", zh: "正在加载音乐…" },
    "empty.couldNotLoadMusic": { en: "Could not load music.", fr: "Impossible de charger la musique.", it: "Impossibile caricare la musica.", ja: "音楽を読み込めませんでした。", zh: "无法加载音乐。" },

    "btn.viewDetails": { en: "view details", fr: "voir les détails", it: "vedi dettagli", ja: "詳細を見る", zh: "查看详情" },
    "btn.close": { en: "close", fr: "fermer", it: "chiudi", ja: "閉じる", zh: "关闭" },
    "btn.backToBlog": { en: "back to blog", fr: "retour au blog", it: "torna al blog", ja: "ブログに戻る", zh: "返回博客" },
    "btn.backToMusic": { en: "back to music", fr: "retour à la musique", it: "torna alla musica", ja: "音楽に戻る", zh: "返回音乐" },
    "btn.backToHome": { en: "Back to home", fr: "Retour à l'accueil", it: "Torna alla home", ja: "ホームに戻る", zh: "返回首页" },
    "btn.readPdf": { en: "read pdf", fr: "lire le PDF", it: "leggi il PDF", ja: "PDFを読む", zh: "阅读 PDF" },
    "btn.seeWebsite": { en: "see website", fr: "voir le site", it: "vedi il sito", ja: "サイトを見る", zh: "查看网站" },
    "btn.viewGithub": { en: "view on github", fr: "voir sur GitHub", it: "vedi su GitHub", ja: "GitHub で見る", zh: "在 GitHub 查看" },
    "btn.watchDemo": { en: "watch demo", fr: "voir la démo", it: "guarda la demo", ja: "デモを見る", zh: "观看演示" },
    "btn.openResource": { en: "open resource", fr: "ouvrir la ressource", it: "apri la risorsa", ja: "リソースを開く", zh: "打开资源" },
    "btn.openLink": { en: "open link", fr: "ouvrir le lien", it: "apri il link", ja: "リンクを開く", zh: "打开链接" },
    "btn.openInNewPage": { en: "open in new page", fr: "ouvrir dans une nouvelle page", it: "apri in una nuova pagina", ja: "新しいページで開く", zh: "在新页面打开" },
    "btn.copy": { en: "copy", fr: "copier", it: "copia", ja: "コピー", zh: "复制" },
    "btn.copied": { en: "copied", fr: "copié", it: "copiato", ja: "コピー済み", zh: "已复制" },
    "btn.failed": { en: "failed", fr: "échec", it: "errore", ja: "失敗", zh: "失败" },
    "btn.showMore": { en: "+ Show More", fr: "+ Voir plus", it: "+ Mostra di più", ja: "+ もっと見る", zh: "+ 展开" },
    "btn.showLess": { en: "- Show Less", fr: "- Voir moins", it: "- Mostra meno", ja: "- 閉じる", zh: "- 收起" },
    "btn.openScore": { en: "open score", fr: "ouvrir la partition", it: "apri la partitura", ja: "楽譜を開く", zh: "打开乐谱" },
    "btn.open": { en: "open ↗", fr: "ouvrir ↗", it: "apri ↗", ja: "開く ↗", zh: "打开 ↗" },

    "kicker.blogPost": { en: "blog post", fr: "article", it: "articolo", ja: "ブログ記事", zh: "博客文章" },
    "kicker.musicPost": { en: "music post", fr: "morceau", it: "brano", ja: "音楽投稿", zh: "音乐帖" },
    "music.audioPlayer": { en: "audio player", fr: "lecteur audio", it: "lettore audio", ja: "オーディオプレーヤー", zh: "音频播放器" },
    "music.sheetMusic": { en: "sheet music", fr: "partition", it: "spartito", ja: "楽譜", zh: "乐谱" },
    "toc.title": { en: "Table of Contents", fr: "Table des matières", it: "Indice", ja: "目次", zh: "目录" },

    "settings.appearance": { en: "Appearance", fr: "Apparence", it: "Aspetto", ja: "外観", zh: "外观" },
    "settings.theme": { en: "Theme", fr: "Thème", it: "Tema", ja: "テーマ", zh: "主题" },
    "settings.language": { en: "Language", fr: "Langue", it: "Lingua", ja: "言語", zh: "语言" },
    "settings.perf": { en: "Performance Mode", fr: "Mode performance", it: "Modalità prestazioni", ja: "パフォーマンスモード", zh: "性能模式" },
    "settings.videoBg": { en: "Video Background", fr: "Arrière-plan vidéo", it: "Sfondo video", ja: "動画背景", zh: "视频背景" },
    "settings.bubbles": { en: "Bubbles Animation", fr: "Animation des bulles", it: "Animazione delle bolle", ja: "バブルアニメーション", zh: "气泡动画" },
    "settings.marieKondo": { en: "Marie Kondo Mode", fr: "Mode Marie Kondo", it: "Modalità Marie Kondo", ja: "マリー・コンドモード", zh: "近藤麻理惠模式" },
    "banner.lag": { en: "is this site lagging for you? enable marie kondo mode by clicking here", fr: "ce site rame chez vous ? activez le mode Marie Kondo en cliquant ici", it: "questo sito ti va a scatti? attiva la modalità Marie Kondo cliccando qui", ja: "このサイトが重いですか？ ここをクリックしてマリー・コンドモードを有効にしましょう", zh: "网站卡顿吗？点击这里启用近藤麻理惠模式" },
    "banner.lagDismiss": { en: "Dismiss this message", fr: "Masquer ce message", it: "Chiudi questo messaggio", ja: "このメッセージを閉じる", zh: "关闭此消息" },
    "settings.system": { en: "system", fr: "système", it: "sistema", ja: "システム", zh: "系统" },
    "settings.light": { en: "light", fr: "clair", it: "chiaro", ja: "ライト", zh: "浅色" },
    "settings.dark": { en: "dark", fr: "sombre", it: "scuro", ja: "ダーク", zh: "深色" },
    "settings.openFull": { en: "open full settings page", fr: "ouvrir la page des réglages", it: "apri la pagina impostazioni", ja: "設定ページを開く", zh: "打开完整设置页" },
    "settings.togglePerf": { en: "Toggle performance mode", fr: "Activer le mode performance", it: "Attiva la modalità prestazioni", ja: "パフォーマンスモードを切替", zh: "切换性能模式" },
    "settings.toggleVideo": { en: "Toggle video background", fr: "Activer l'arrière-plan vidéo", it: "Attiva lo sfondo video", ja: "動画背景を切替", zh: "切换视频背景" },
    "settings.toggleBubbles": { en: "Toggle iridescent bubbles animation", fr: "Activer l'animation des bulles", it: "Attiva l'animazione delle bolle", ja: "バブルアニメーションを切替", zh: "切换气泡动画" },
    "settings.toggleMarie": { en: "Toggle Marie Kondo mode", fr: "Activer le mode Marie Kondo", it: "Attiva la modalità Marie Kondo", ja: "マリー・コンドモードを切替", zh: "切换近藤麻理惠模式" },

    "search.placeholder": { en: "search the site…", fr: "rechercher sur le site…", it: "cerca nel sito…", ja: "サイト内を検索…", zh: "搜索本站…" },
    "search.hint": {
      en: "<kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open <kbd>esc</kbd> close",
      fr: "<kbd>↑</kbd><kbd>↓</kbd> naviguer <kbd>↵</kbd> ouvrir <kbd>esc</kbd> fermer",
      it: "<kbd>↑</kbd><kbd>↓</kbd> naviga <kbd>↵</kbd> apri <kbd>esc</kbd> chiudi",
      ja: "<kbd>↑</kbd><kbd>↓</kbd> 移動 <kbd>↵</kbd> 開く <kbd>esc</kbd> 閉じる",
      zh: "<kbd>↑</kbd><kbd>↓</kbd> 浏览 <kbd>↵</kbd> 打开 <kbd>esc</kbd> 关闭"
    },
    "search.type.all": { en: "all", fr: "tout", it: "tutto", ja: "すべて", zh: "全部" },
    "search.type.page": { en: "pages", fr: "pages", it: "pagine", ja: "ページ", zh: "页面" },
    "search.type.blog": { en: "blog", fr: "blog", it: "blog", ja: "ブログ", zh: "博客" },
    "search.type.project": { en: "projects", fr: "projets", it: "progetti", ja: "プロジェクト", zh: "项目" },
    "search.type.experience": { en: "experience", fr: "expérience", it: "esperienza", ja: "経歴", zh: "经历" },
    "search.type.resource": { en: "resources", fr: "ressources", it: "risorse", ja: "リソース", zh: "资源" },
    "search.type.music": { en: "music", fr: "musique", it: "musica", ja: "音楽", zh: "音乐" },
    "search.results": { en: "{n} results", fr: "{n} résultats", it: "{n} risultati", ja: "{n} 件", zh: "{n} 条结果" },
    "search.result": { en: "{n} result", fr: "{n} résultat", it: "{n} risultato", ja: "{n} 件", zh: "{n} 条结果" },
    "search.noResults": { en: "no results for “{query}”", fr: "aucun résultat pour « {query} »", it: "nessun risultato per “{query}”", ja: "「{query}」の結果はありません", zh: "没有 “{query}” 的结果" },
    "search.noItems": { en: "no items to show", fr: "rien à afficher", it: "nessun elemento da mostrare", ja: "表示する項目がありません", zh: "没有可显示的项目" },
    "search.navigateTo": { en: "navigate to {tab}", fr: "aller à {tab}", it: "vai a {tab}", ja: "{tab} へ移動", zh: "前往 {tab}" },
    "search.untitledPost": { en: "untitled post", fr: "article sans titre", it: "articolo senza titolo", ja: "無題の記事", zh: "无标题文章" },
    "search.section": { en: "{title} — section", fr: "{title} — section", it: "{title} — sezione", ja: "{title} — セクション", zh: "{title} — 章节" },
    "search.page.settings": { en: "site settings", fr: "réglages du site", it: "impostazioni del sito", ja: "サイト設定", zh: "网站设置" },
    "search.page.apps": { en: "all apps", fr: "toutes les apps", it: "tutte le app", ja: "すべてのアプリ", zh: "全部应用" },
    "search.page.info": { en: "about / link-tree", fr: "à propos / link-tree", it: "info / link-tree", ja: "について / リンクツリー", zh: "关于 / 链接树" },
    "search.page.cv": { en: "curriculum vitae", fr: "curriculum vitae", it: "curriculum vitae", ja: "履歴書", zh: "简历" },
    "search.page.cvAwards": { en: "awards, activities & commendations", fr: "prix, activités et distinctions", it: "premi, attività e riconoscimenti", ja: "受賞・活動・表彰", zh: "奖项、活动与表彰" },
    "search.page.cvSkills": { en: "skills & interests", fr: "compétences et centres d'intérêt", it: "competenze e interessi", ja: "スキルと関心", zh: "技能与兴趣" },
    "search.page.cvLanguages": { en: "languages", fr: "langues", it: "lingue", ja: "言語", zh: "语言" },
    "search.page.cvReferences": { en: "references", fr: "références", it: "referenze", ja: "推薦", zh: "推荐人" },

    "apps.title": { en: "apps", fr: "apps", it: "app", ja: "アプリ", zh: "应用" },
    "apps.seeAll": { en: "see all apps", fr: "voir toutes les apps", it: "vedi tutte le app", ja: "すべてのアプリを見る", zh: "查看全部应用" },

    "footer.copyright": { en: "© 2026 Your Name. All rights reserved.", fr: "© 2026 Your Name. Tous droits réservés.", it: "© 2026 Your Name. Tutti i diritti riservati.", ja: "© 2026 Your Name. All rights reserved.", zh: "© 2026 Your Name. 保留所有权利。" },
    "footer.perfMode": { en: "performance mode", fr: "mode performance", it: "modalità prestazioni", ja: "パフォーマンスモード", zh: "性能模式" },
    "footer.selectTheme": { en: "select theme", fr: "choisir le thème", it: "seleziona tema", ja: "テーマを選択", zh: "选择主题" },
    "footer.videoBg": {
      en: "Video Backgrounds: Your Video Credit Here.",
      fr: "Arrière-plans vidéo : Votre crédit vidéo ici.",
      it: "Sfondi video: Il tuo credito video qui.",
      ja: "動画背景：ここに動画のクレジットを記載。",
      zh: "视频背景：请在此填写视频来源。"
    },
    "footer.hosted": {
      en: "Hosted using GitHub Pages & Firebase.",
      fr: "Hébergé avec GitHub Pages et Firebase.",
      it: "Ospitato con GitHub Pages e Firebase.",
      ja: "GitHub Pages と Firebase でホスト。",
      zh: "由 GitHub Pages 与 Firebase 托管。"
    },
    "footer.releaseLog": {
      en: "First publication: January 1st 2026. Latest update: January 1st 2026. See release log <a href=\"./releases\">here</a>.",
      fr: "Première publication : 1 janvier 2026. Dernière mise à jour : 1 janvier 2026. Voir le journal des versions <a href=\"./releases\">ici</a>.",
      it: "Prima pubblicazione: 1 gennaio 2026. Ultimo aggiornamento: 1 gennaio 2026. Vedi il registro delle versioni <a href=\"./releases\">qui</a>.",
      ja: "初公開：2026年1月1日。最新更新：2026年1月1日。リリースログは<a href=\"./releases\">こちら</a>。",
      zh: "首次发布：2026年1月1日。最近更新：2026年1月1日。更新日志见<a href=\"./releases\">这里</a>。"
    },
    "footer.usefulPages": { en: "useful pages", fr: "pages utiles", it: "pagine utili", ja: "便利なページ", zh: "常用页面" },
    "footer.home": { en: "Home", fr: "Accueil", it: "Home", ja: "ホーム", zh: "首页" },
    "footer.projects": { en: "Projects", fr: "Projets", it: "Progetti", ja: "プロジェクト", zh: "项目" },
    "footer.experience": { en: "Experience", fr: "Expérience", it: "Esperienza", ja: "経歴", zh: "经历" },
    "footer.resources": { en: "Resources", fr: "Ressources", it: "Risorse", ja: "リソース", zh: "资源" },
    "footer.designs": { en: "Designs gallery", fr: "Galerie de créations", it: "Galleria di design", ja: "デザインギャラリー", zh: "设计作品集" },
    "footer.music": { en: "Music", fr: "Musique", it: "Musica", ja: "音楽", zh: "音乐" },
    "footer.blog": { en: "Blog", fr: "Blog", it: "Blog", ja: "ブログ", zh: "博客" },
    "footer.photography": { en: "Photography", fr: "Photographie", it: "Fotografia", ja: "写真", zh: "摄影" },
    "footer.counterUnavailable": { en: "counter unavailable", fr: "compteur indisponible", it: "contatore non disponibile", ja: "カウンター利用不可", zh: "计数器不可用" },
    "footer.visitorCount": { en: "Visitor count", fr: "Nombre de visiteurs", it: "Conteggio visitatori", ja: "訪問者数", zh: "访问次数" },

    "info.kicker": {
      en: "The gateway to my digital presence.",
      fr: "La porte d'entrée vers ma présence numérique.",
      it: "La porta d'ingresso alla mia presenza digitale.",
      ja: "私のデジタルな居場所への入り口です。",
      zh: "通往我数字足迹的入口。"
    },
    "info.footer": {
      en: "Pick a card, any card. If you want a swift response, your best bet is e-mail or WhatsApp.",
      fr: "Choisissez une carte, n'importe laquelle. Pour une réponse rapide, le mieux reste l'e-mail ou WhatsApp.",
      it: "Pesca una carta, una qualsiasi. Se vuoi una risposta veloce, la scommessa migliore è e-mail o WhatsApp.",
      ja: "どれでも好きなカードを選んでください。早く返事が欲しいなら、メールか WhatsApp が一番です。",
      zh: "随便抽一张卡片。若想尽快得到回复，最好发邮件或 WhatsApp。"
    },
    "info.identity": { en: "identity", fr: "identité", it: "identità", ja: "アイデンティティ", zh: "身份" },
    "info.socials": { en: "socials", fr: "réseaux", it: "social", ja: "ソーシャル", zh: "社交" },
    "info.payments": { en: "payments & bookings", fr: "paiements et réservations", it: "pagamenti e prenotazioni", ja: "支払いと予約", zh: "支付与预约" },
    "info.coding": { en: "coding", fr: "code", it: "coding", ja: "コーディング", zh: "编程" },
    "info.creative": { en: "creative and other", fr: "création et autres", it: "creativo e altro", ja: "クリエイティブとその他", zh: "创作及其他" },

    "bp.loading": { en: "loading post…", fr: "chargement de l'article…", it: "caricamento articolo…", ja: "記事を読み込み中…", zh: "正在加载文章…" },
    "bp.notFound": { en: "Post not found.", fr: "Article introuvable.", it: "Articolo non trovato.", ja: "記事が見つかりません。", zh: "未找到文章。" },
    "bp.loadingAria": { en: "Loading post", fr: "Chargement de l'article", it: "Caricamento articolo", ja: "記事を読み込み中", zh: "正在加载文章" },

    "error404.eyebrow": {
      en: "Your Name's Portfolio",
      fr: "Portfolio de Your Name",
      it: "Portfolio di Your Name",
      ja: "Your Name のポートフォリオ",
      zh: "Your Name 的作品集"
    },
    "error404.kicker": { en: "error 404", fr: "erreur 404", it: "errore 404", ja: "エラー 404", zh: "错误 404" },
    "error404.title": { en: "Page Not Found", fr: "Page introuvable", it: "Pagina non trovata", ja: "ページが見つかりません", zh: "页面未找到" },
    "error404.documentTitle": { en: "404 | Page Not Found", fr: "404 | Page introuvable", it: "404 | Pagina non trovata", ja: "404 | ページが見つかりません", zh: "404 | 页面未找到" },
    "error404.heading": { en: "Oh, bother!", fr: "Oh, zut !", it: "Oh, accidenti!", ja: "おや、困った！", zh: "哎呀，麻烦了！" },
    "error404.body1": {
      en: "The page you requested is unavailable.",
      fr: "La page demandée n'est pas disponible.",
      it: "La pagina richiesta non è disponibile.",
      ja: "お探しのページは利用できません。",
      zh: "您请求的页面不可用。"
    },
    "error404.body2": {
      en: "It may have moved, or the URL may be out of date.",
      fr: "Elle a peut-être été déplacée, ou l'URL n'est plus à jour.",
      it: "Potrebbe essere stata spostata, o l'URL non è più aggiornato.",
      ja: "移動したか、URL が古くなっている可能性があります。",
      zh: "它可能已搬家，或者网址已经过时。"
    },
    "error404.rotations": {
      en: [
        "Please try again later. Oh bother.",
        "Or don't bother. No-one's compelling you.",
        "Anyway, what are you doing here? This is a 404 page.",
        "Were you snooping around? That's not very nice.",
        "I hope you find what you're looking for, but I doubt it.",
        "Kierkegaard said that life can only be understood backwards",
        "but it must be lived forwards.",
        "I don't know what that has to do with anything, but it sounds profound.",
        "If you think about it, 404 errors are just a reminder",
        "that the internet is a vast and ever-changing place.",
        "Who knows what you'll find if you keep exploring?",
        "The fleeting nature of human existence is mirrored in the ephemeral nature of web content.",
        "So maybe this 404 page is a metaphor for life itself.",
        "Or maybe it's just a page that says 'Page Not Found'. Who knows?",
        "I'm not a philosopher, I'm just a 404 page. But I like to think I have a certain existential charm.",
        "In the grand scheme of things, a 404 error is simply a blip on the radar of the internet.",
        "What is your raison d'être, dear visitor? Are you here to find something specific, or are you just wandering aimlessly through the vast expanse of the internet?",
        "In the end, nothing really matters.",
        "Except maybe finding your way back to the homepage. That's probably a good idea.",
        "But if you want to stay here and ponder the mysteries of existence, I won't stop you.",
        "After all, isn't that what the internet is for? To explore, to learn, to connect with others, and to find meaning in the chaos of information?"
      ],
      fr: [
        "Réessayez plus tard. Oh zut.",
        "Ou ne vous donnez pas la peine. Personne ne vous y oblige.",
        "Au fait, que faites-vous ici ? C'est une page 404.",
        "Vous fouinez ? Ce n'est pas très poli.",
        "J'espère que vous trouverez ce que vous cherchez, mais j'en doute.",
        "Kierkegaard disait que la vie ne se comprend qu'à rebours",
        "mais qu'elle doit se vivre en avant.",
        "Je ne sais pas ce que cela vient faire ici, mais ça sonne profond.",
        "Si l'on y pense, les erreurs 404 ne sont qu'un rappel",
        "que l'internet est un lieu vaste et en perpétuel changement.",
        "Qui sait ce que vous trouverez si vous continuez à explorer ?",
        "Le caractère éphémère de l'existence humaine se reflète dans celui du web.",
        "Alors cette page 404 est peut-être une métaphore de la vie elle-même.",
        "Ou peut-être n'est-ce qu'une page qui dit « Page introuvable ». Qui sait ?",
        "Je ne suis pas philosophe, je suis juste une page 404. Mais j'aime à croire que j'ai un certain charme existentiel.",
        "À l'échelle de l'univers, une erreur 404 n'est qu'un petit bip sur le radar d'internet.",
        "Quelle est votre raison d'être, cher visiteur ? Cherchez-vous quelque chose de précis, ou errez-vous dans l'immensité du web ?",
        "En fin de compte, rien n'a vraiment d'importance.",
        "Sauf peut-être retrouver le chemin de l'accueil. Ce serait une bonne idée.",
        "Mais si vous voulez rester ici et ruminer les mystères de l'existence, je ne vous en empêcherai pas.",
        "Après tout, n'est-ce pas le propre d'internet ? Explorer, apprendre, se relier, et trouver du sens dans le chaos de l'information ?"
      ],
      it: [
        "Riprova più tardi. Oh accidenti.",
        "Oppure non ti disturbare. Nessuno ti obbliga.",
        "Comunque, che ci fai qui? Questa è una pagina 404.",
        "Stavi frugando in giro? Non è molto educato.",
        "Spero che tu trovi quello che cerchi, ma ne dubito.",
        "Kierkegaard diceva che la vita si può capire solo all'indietro",
        "ma va vissuta in avanti.",
        "Non so cosa c'entri, ma suona profondo.",
        "A pensarci bene, gli errori 404 sono solo un promemoria",
        "che internet è un luogo vasto e in continuo cambiamento.",
        "Chissà cosa troverai se continui a esplorare?",
        "La natura fugace dell'esistenza umana si specchia in quella effimera dei contenuti web.",
        "Forse questa pagina 404 è una metafora della vita stessa.",
        "O forse è solo una pagina che dice «Pagina non trovata». Chi lo sa?",
        "Non sono un filosofo, sono solo una pagina 404. Ma mi piace pensare di avere un certo fascino esistenziale.",
        "Nel grande schema delle cose, un errore 404 è solo un blip sul radar di internet.",
        "Qual è la tua raison d'être, caro visitatore? Cerchi qualcosa di specifico, o vaghi senza meta nella vastità della rete?",
        "Alla fine, niente conta davvero.",
        "Tranne forse ritrovare la strada per la homepage. Quella sarebbe una buona idea.",
        "Ma se vuoi restare qui a meditare sui misteri dell'esistenza, non ti fermerò.",
        "Dopottutto, non è questo lo scopo di internet? Esplorare, imparare, connettersi e trovare senso nel caos dell'informazione?"
      ],
      ja: [
        "後でもう一度お試しください。困ったなあ。",
        "あるいは、無理しなくてもいい。誰も強制していません。",
        "ところで、何をしているのですか？ここは404ページです。",
        "こっそり探っていました？あまりよくありませんね。",
        "探しているものが見つかるといいのですが、たぶん無理です。",
        "キルケゴールは、人生は後ろ向きにしか理解できないと言いました",
        "しかし、前を向いて生きなければならない、と。",
        "これが何の関係があるのか分かりませんが、深そうに聞こえます。",
        "よく考えると、404エラーはただのリマインダーです",
        "インターネットが広大で絶えず変わる場所だということの。",
        "探し続ければ、何が見つかるでしょう？",
        "人間の存在のはかなさは、ウェブコンテンツのはかなさに映っています。",
        "だからこの404ページは、人生そのものの比喩なのかもしれません。",
        "あるいは、ただ「ページが見つかりません」と書いてあるだけかも。誰にも分かりません。",
        "私は哲学者ではなく、ただの404ページです。でも、どこか実存的な魅力があると思っています。",
        "大局的に見れば、404エラーはインターネットのレーダー上の小さな点にすぎません。",
        "訪問者よ、あなたの存在理由は何ですか？何か具体的なものを探していますか、それともネットの広大さを彷徨っていますか？",
        "結局のところ、何も本当には重要ではありません。",
        "ホームページに戻ることくらいは、たぶん良い考えだとして。",
        "でも、ここに残って存在の謎を考えたいなら、止めはしません。",
        "そもそも、インターネットとはそういうものでは？探検し、学び、つながり、情報の混沌の中に意味を見出すために。"
      ],
      zh: [
        "请稍后再试。哎呀，麻烦了。",
        "或者别费心。没人逼你。",
        "话说回来，你在这儿干什么？这是个404页面。",
        "你在四处窥探吗？那可不太礼貌。",
        "希望你能找到要找的东西，不过我表示怀疑。",
        "克尔凯郭尔说，人生只能向后理解",
        "却必须向前度过。",
        "我不知道这跟眼下有什么关系，但听起来很深刻。",
        "仔细想想，404错误不过是个提醒",
        "提醒我们互联网广阔且不断变化。",
        "继续探索的话，谁知道会发现什么？",
        "人类存在的短暂，映照着网络内容的转瞬即逝。",
        "所以这个404页面，也许就是人生的隐喻。",
        "又或者，它只是一页写着「页面未找到」的纸。谁知道呢？",
        "我不是哲学家，我只是一个404页面。但我愿意相信自己有一点存在主义的魅力。",
        "从宏大尺度看，404错误不过是互联网雷达上的一个小点。",
        "亲爱的访客，你的存在理由是什么？你是在找某样具体的东西，还是只是在互联网的广阔里漫无目的地走？",
        "到头来，其实没什么真正重要。",
        "也许除了找到回首页的路。那大概是个好主意。",
        "但如果你想留在这里思考存在的奥秘，我不会拦你。",
        "毕竟，互联网不就是为了这个吗？探索、学习、连接，并在信息的混沌里寻找意义？"
      ]
    }
  };

  var POLISH_STRINGS = {
    "meta.siteTitle": "Your Name — Twoje stanowisko",
    "meta.title.home": "Your Name — Twoje stanowisko",
    "meta.title.projects": "Projekty — Your Name",
    "meta.title.experience": "Doświadczenie — Your Name",
    "meta.title.resources": "Materiały — Your Name",
    "meta.title.designs": "Galeria projektów — Your Name",
    "meta.title.music": "Muzyka — Your Name",
    "meta.title.blog": "Blog — Your Name",
    "meta.title.info": "Informacje — Your Name",
    "meta.title.photography": "Fotografia — Your Name",
    "meta.title.releases": "Historia zmian — Your Name",
    "meta.title.apps": "Aplikacje — Your Name",
    "meta.title.settings": "Ustawienia — Your Name",
    "meta.title.textbook": "Wyróżniony projekt — Your Name",
    "meta.description.home": "Your Name pracuje jako Twoje stanowisko w firmie Twoja firma. Dodaj krótki opis tego, kim jesteś i czym się zajmujesz.",
    "meta.description.projects": "Projekty osobiste Your Name.",
    "meta.description.experience": "Stanowiska i doświadczenie Your Name.",
    "meta.description.resources": "Notatki, ściągi i inne materiały opublikowane przez Your Name.",
    "meta.description.designs": "Projekty wizualne i grafiki Your Name.",
    "meta.description.music": "Muzyka Your Name.",
    "meta.description.blog": "Teksty Your Name.",
    "meta.description.info": "Profile społecznościowe i dane kontaktowe Your Name.",
    "meta.description.photography": "Fotografie Your Name.",
    "meta.description.releases": "Dziennik zmian i historia wydań tej witryny.",
    "meta.description.apps": "Aplikacje i narzędzia stworzone przez Your Name.",
    "meta.description.settings": "Ustawienia witryny.",
    "meta.description.textbook": "Wyróżniony projekt Your Name.",
    "meta.blogPostTitle": "Wpis na blogu | Your Name",
    "nav.home": "wprowadzenie",
    "nav.projects": "projekty osobiste",
    "nav.experience": "doświadczenie",
    "nav.resources": "materiały",
    "nav.designs": "galeria projektów",
    "nav.music": "muzyka",
    "nav.blog": "blog",
    "nav.photography": "fotografia",
    "nav.getCv": "pobierz CV",
    "title.home": "witaj na mojej stronie!!",
    "title.projects": "projekty osobiste, nad którymi pracowałem",
    "title.experience": "doświadczenie",
    "title.resources": "materiały",
    "title.designs": "galeria projektów",
    "title.music": "muzyka",
    "title.blog": "blog",
    "title.post": "wpis na blogu",
    "title.info": "informacje",
    "title.releases": "historia zmian",
    "title.settings": "ustawienia",
    "title.apps": "aplikacje",
    "title.textbook-project": "wyróżniony projekt",
    "designs.intro": "Mała galeria projektów wizualnych i grafiki.",
    "designs.galleryLabel": "Galeria projektów",
    "designs.artwork1": "Grafika 1",
    "designs.artwork2": "Grafika 2",
    "designs.artwork3": "Grafika 3",
    "designs.placeholderNote": "To przykładowe grafiki — zastąp je własnymi projektami.",
    "tooltip.github": "zobacz moje repozytoria na GitHubie.",
    "tooltip.linkedin": "nawiąż ze mną kontakt na LinkedIn.",
    "tooltip.info": "dowiedz się więcej o mnie z mojej strony z linkami.",
    "tooltip.apps": "zbiór małych projektów i aplikacji internetowych, które stworzyłem.",
    "tooltip.search": "przeszukaj witrynę (⌘K).",
    "tooltip.settings": "zarządzaj ustawieniami witryny.",
    "tooltip.perf": "Witryna działa zbyt wolno? Wyłącz efekty.",
    "aria.info": "Strona informacyjna",
    "aria.apps": "Aplikacje",
    "aria.search": "Szukaj",
    "aria.settings": "Ustawienia",
    "aria.theme": "Motyw",
    "aria.close": "Zamknij",
    "aria.prevImage": "Poprzednie zdjęcie",
    "aria.nextImage": "Następne zdjęcie",
    "aria.zoomOut": "Pomniejsz",
    "aria.zoomReset": "Resetuj powiększenie",
    "aria.zoomIn": "Powiększ",
    "aria.searchProjects": "Szukaj projektów",
    "aria.searchExperience": "Szukaj doświadczenia",
    "aria.searchResources": "Szukaj materiałów",
    "aria.searchBlog": "Szukaj wpisów na blogu",
    "aria.searchMusic": "Szukaj muzyki",
    "aria.filterType": "Filtruj według typu",
    "aria.sitePages": "Strony witryny",
    "aria.defaultLanguage": "Domyślny język",
    "aria.404actions": "Działania na stronie 404",
    "aria.seeAllApps": "Zobacz wszystkie aplikacje",
    "aria.openSettings": "Otwórz pełną stronę ustawień",
    "aria.toc": "Spis treści",
    "filter.tag": "tag",
    "filter.year": "rok",
    "filter.allTags": "wszystkie tagi",
    "filter.allRoles": "wszystkie role",
    "filter.allYears": "wszystkie lata",
    "filter.search": "szukaj…",
    "view.grid": "wyświetl jako siatkę",
    "view.list": "wyświetl jako listę",
    "view.columns": "wyświetl jako kolumny",
    "empty.projects": "Brak projektów pasujących do wybranych filtrów.",
    "empty.experience": "Brak wpisów o doświadczeniu pasujących do wybranych filtrów.",
    "empty.resources": "Brak materiałów pasujących do wybranych filtrów.",
    "empty.blog": "Brak wpisów na blogu pasujących do wybranych filtrów.",
    "empty.music": "Brak utworów pasujących do wybranych filtrów.",
    "empty.loadingPosts": "Ładowanie wpisów…",
    "empty.couldNotLoadPosts": "Nie udało się załadować wpisów.",
    "empty.loadingMusic": "Ładowanie muzyki…",
    "empty.couldNotLoadMusic": "Nie udało się załadować muzyki.",
    "btn.viewDetails": "zobacz szczegóły",
    "btn.close": "zamknij",
    "btn.backToBlog": "wróć do bloga",
    "btn.backToMusic": "wróć do muzyki",
    "btn.backToHome": "Wróć na stronę główną",
    "btn.readPdf": "otwórz PDF",
    "btn.seeWebsite": "zobacz witrynę",
    "btn.viewGithub": "zobacz na GitHubie",
    "btn.watchDemo": "zobacz prezentację",
    "btn.openResource": "otwórz materiał",
    "btn.openLink": "otwórz link",
    "btn.openInNewPage": "otwórz na nowej stronie",
    "btn.copy": "kopiuj",
    "btn.copied": "skopiowano",
    "btn.failed": "niepowodzenie",
    "btn.showMore": "+ Pokaż więcej",
    "btn.showLess": "- Pokaż mniej",
    "btn.openScore": "otwórz nuty",
    "btn.open": "otwórz ↗",
    "kicker.blogPost": "wpis na blogu",
    "kicker.musicPost": "utwór",
    "music.audioPlayer": "odtwarzacz audio",
    "music.sheetMusic": "nuty",
    "toc.title": "Spis treści",
    "settings.appearance": "Wygląd",
    "settings.theme": "Motyw",
    "settings.language": "Język",
    "settings.perf": "Tryb wydajności",
    "settings.videoBg": "Tło wideo",
    "settings.bubbles": "Animacja bąbelków",
    "settings.marieKondo": "Tryb Marie Kondo",
    "banner.lag": "Witryna działa wolno? Kliknij tutaj, aby włączyć tryb Marie Kondo.",
    "banner.lagDismiss": "Zamknij tę wiadomość",
    "settings.system": "systemowy",
    "settings.light": "jasny",
    "settings.dark": "ciemny",
    "settings.openFull": "otwórz pełną stronę ustawień",
    "settings.togglePerf": "Przełącz tryb wydajności",
    "settings.toggleVideo": "Przełącz tło wideo",
    "settings.toggleBubbles": "Przełącz animację opalizujących bąbelków",
    "settings.toggleMarie": "Przełącz tryb Marie Kondo",
    "search.placeholder": "szukaj w witrynie…",
    "search.hint": "<kbd>↑</kbd><kbd>↓</kbd> nawiguj <kbd>↵</kbd> otwórz <kbd>esc</kbd> zamknij",
    "search.type.all": "wszystko",
    "search.type.page": "strony",
    "search.type.blog": "blog",
    "search.type.project": "projekty",
    "search.type.experience": "doświadczenie",
    "search.type.resource": "materiały",
    "search.type.music": "muzyka",
    "search.results": "{n} wyników",
    "search.result": "{n} wynik",
    "search.noResults": "brak wyników dla „{query}”",
    "search.noItems": "brak elementów do wyświetlenia",
    "search.navigateTo": "przejdź do: {tab}",
    "search.untitledPost": "wpis bez tytułu",
    "search.section": "{title} — sekcja",
    "search.page.settings": "ustawienia witryny",
    "search.page.apps": "wszystkie aplikacje",
    "search.page.info": "o mnie / linki",
    "search.page.cv": "życiorys",
    "search.page.cvAwards": "nagrody, aktywności i wyróżnienia",
    "search.page.cvSkills": "umiejętności i zainteresowania",
    "search.page.cvLanguages": "języki",
    "search.page.cvReferences": "referencje",
    "apps.title": "aplikacje",
    "apps.seeAll": "zobacz wszystkie aplikacje",
    "footer.copyright": "© 2026 Your Name. Wszelkie prawa zastrzeżone.",
    "footer.perfMode": "tryb wydajności",
    "footer.selectTheme": "wybierz motyw",
    "footer.videoBg": "Tła wideo: tutaj podaj autora filmu.",
    "footer.hosted": "Witryna hostowana przez GitHub Pages i Firebase.",
    "footer.releaseLog": "Pierwsza publikacja: 1 stycznia 2026. Ostatnia aktualizacja: 1 stycznia 2026. Zobacz <a href=\"./releases\">historię zmian</a>.",
    "footer.usefulPages": "przydatne strony",
    "footer.home": "Strona główna",
    "footer.projects": "Projekty",
    "footer.experience": "Doświadczenie",
    "footer.resources": "Materiały",
    "footer.designs": "Galeria projektów",
    "footer.music": "Muzyka",
    "footer.blog": "Blog",
    "footer.photography": "Fotografia",
    "footer.counterUnavailable": "licznik niedostępny",
    "footer.visitorCount": "Liczba odwiedzin",
    "photo.loading": "ładowanie…",
    "photo.loadError": "Nie udało się załadować zdjęć.",
    "photo.viewer": "Przeglądarka zdjęć",
    "photo.openImage": "Otwórz zdjęcie w nowej karcie",
    "photo.back": "wróć do fotografii",
    "photo.notFound": "Nie znaleziono zdjęcia.",
    "photo.location": "lokalizacja",
    "photo.mapTitle": "Mapa lokalizacji zdjęcia",
    "photo.browse": "Przeglądaj zdjęcia",
    "photo.previous": "poprzednie",
    "photo.next": "następne",
    "photo.counter": "Zdjęcie {current} z {total}",
    "photo.titleSuffix": "{title} | Your Name",
    "photo.meta.date": "data",
    "photo.meta.dimensions": "wymiary",
    "photo.meta.camera": "aparat",
    "photo.meta.lens": "obiektyw",
    "photo.meta.focal": "ogniskowa",
    "photo.meta.shutter": "czas naświetlania",
    "photo.meta.aperture": "przysłona",
    "photo.meta.iso": "ISO",
    "photo.meta.coordinates": "współrzędne",
    "info.kicker": "Brama do mojej cyfrowej obecności.",
    "info.footer": "Wybierz dowolną kartę. Jeśli zależy Ci na szybkiej odpowiedzi, najlepiej napisz e-mail lub na WhatsAppie.",
    "info.identity": "tożsamość",
    "info.socials": "media społecznościowe",
    "info.payments": "płatności i rezerwacje",
    "info.coding": "programowanie",
    "info.creative": "twórczość i inne",
    "bp.loading": "ładowanie wpisu…",
    "bp.notFound": "Nie znaleziono wpisu.",
    "bp.loadingAria": "Ładowanie wpisu",
    "error404.eyebrow": "Portfolio Your Name",
    "error404.kicker": "błąd 404",
    "error404.title": "Nie znaleziono strony",
    "error404.documentTitle": "404 | Nie znaleziono strony",
    "error404.heading": "Ojej!",
    "error404.body1": "Żądana strona jest niedostępna.",
    "error404.body2": "Mogła zostać przeniesiona albo adres URL jest nieaktualny.",
    "error404.rotations": [
      "Spróbuj ponownie później. Ojej.",
      "Albo nie próbuj — nikt Cię do tego nie zmusza.",
      "Co tu robisz? To strona błędu 404.",
      "Rozglądasz się po kątach? To niezbyt miłe.",
      "Mam nadzieję, że znajdziesz to, czego szukasz, choć wątpię.",
      "Kierkegaard mówił, że życie można zrozumieć tylko wstecz,",
      "ale trzeba je przeżyć naprzód.",
      "Nie wiem, co to ma wspólnego z tą stroną, ale brzmi mądrze.",
      "Błędy 404 przypominają nam,",
      "że internet jest ogromny i ciągle się zmienia.",
      "Kto wie, co znajdziesz, jeśli będziesz dalej szukać?",
      "Ulotność ludzkiego życia odbija się w przemijającej naturze treści internetowych.",
      "Może więc ta strona 404 jest metaforą samego życia.",
      "A może po prostu mówi „Nie znaleziono strony”. Kto wie?",
      "Nie jestem filozofem, tylko stroną 404, ale lubię myśleć, że mam egzystencjalny urok.",
      "W wielkiej skali rzeczy błąd 404 to tylko drobny pik na radarze internetu.",
      "Jaki jest Twój cel, drogi gościu? Szukasz czegoś konkretnego czy błądzisz bez celu po bezkresie sieci?",
      "Ostatecznie nic nie ma większego znaczenia.",
      "Może poza powrotem na stronę główną. To chyba dobry pomysł.",
      "Jeśli chcesz zostać i rozmyślać o tajemnicach istnienia, nie będę Cię powstrzymywać.",
      "Czy nie po to jest internet? By odkrywać, uczyć się, łączyć i szukać sensu w chaosie informacji?"
    ]
  };

  function normalizeLang(value) {
    var lang = String(value || "").toLowerCase();
    return SUPPORTED.indexOf(lang) !== -1 ? lang : "";
  }

  // Map a BCP 47 tag (en-GB, zh-CN, zh-Hant-TW, …) onto a supported code.
  function mapBrowserTag(tag) {
    var raw = String(tag || "").toLowerCase().replace(/_/g, "-");
    if (!raw) return "";
    var exact = normalizeLang(raw);
    if (exact) return exact;
    return normalizeLang(raw.split("-")[0]);
  }

  function detectBrowserLang() {
    var candidates = [];
    try {
      var nav = global.navigator || {};
      if (nav.languages && nav.languages.length) {
        for (var i = 0; i < nav.languages.length; i += 1) {
          candidates.push(nav.languages[i]);
        }
      }
      if (nav.language) candidates.push(nav.language);
      if (nav.userLanguage) candidates.push(nav.userLanguage);
    } catch (_) {}

    for (var j = 0; j < candidates.length; j += 1) {
      var mapped = mapBrowserTag(candidates[j]);
      if (mapped) return mapped;
    }
    return "";
  }

  function getStoredLang() {
    try {
      return normalizeLang(global.localStorage && global.localStorage.getItem(LANGUAGE_PREF_KEY));
    } catch (_) {
      return "";
    }
  }

  // Saved manual choice wins. Otherwise follow the browser. English is last resort.
  function getLang() {
    return getStoredLang() || detectBrowserLang() || "en";
  }

  function setDocumentLang(lang) {
    var next = normalizeLang(lang) || "en";
    if (document.documentElement) {
      document.documentElement.setAttribute("lang", next);
    }
  }

  function interpolate(template, vars) {
    if (!vars) return template;
    return String(template).replace(/\{(\w+)\}/g, function (_, key) {
      return vars[key] == null ? "" : String(vars[key]);
    });
  }

  function t(key, vars) {
    var entry = STRINGS[key];
    if (!entry) return key;
    var lang = getLang();
    var value = lang === "pl" ? POLISH_STRINGS[key] : entry[lang];
    if (value === undefined) value = entry.en;
    if (Array.isArray(value)) return value;
    if (value == null) return key;
    return interpolate(value, vars);
  }

  function applyNodeText(el, value) {
    if (!el) return;
    var kbd = el.querySelector && el.querySelector("kbd.settings-shortcut-kbd");
    el.textContent = value;
    if (kbd) {
      try { delete el.dataset.shortcutAnnotated; } catch (_) {}
    }
  }

  function apply(root) {
    var scope = root || document;
    if (!scope || !scope.querySelectorAll) return;

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      applyNodeText(el, t(key));
    });

    scope.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key));
    });

    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(key));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (!key) return;
      el.setAttribute("title", t(key));
    });

    scope.querySelectorAll("[data-i18n-tooltip]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-tooltip");
      if (!key) return;
      el.setAttribute("data-tooltip", t(key));
    });
  }

  // tcolorbox bodies use ::mobile / ::desktop as layout splitters, not locales.
  var LANGUAGE_CONTENT_RESERVED = { mobile: true, desktop: true };

  function parseLanguageContent(rawBlock) {
    var result = {};
    if (!rawBlock) return result;
    var lines = String(rawBlock).replace(/\r\n/g, "\n").split("\n");
    var currentLang = "";
    var buffer = [];

    function flush() {
      if (!currentLang) return;
      var content = buffer.join("\n").trim();
      if (content) result[currentLang] = content;
      buffer = [];
    }

    for (var i = 0; i < lines.length; i += 1) {
      var marker = lines[i].trim().match(/^::([a-zA-Z-]+)$/);
      if (marker) {
        var code = marker[1].toLowerCase();
        if (LANGUAGE_CONTENT_RESERVED[code]) {
          if (currentLang) buffer.push(lines[i]);
          continue;
        }
        flush();
        currentLang = code;
        continue;
      }
      if (currentLang) buffer.push(lines[i]);
    }
    flush();
    return result;
  }

  function parseLanguageContentFence(line) {
    var match = String(line || "").trim().match(
      /^```(?:language-content|language content|language content section)(?=[\s`]|$)(.*)$/i
    );
    if (!match) return null;
    var flags = { hide: false, borderless: false };
    String(match[1] || "").trim().split(/\s+/).forEach(function (token) {
      if (!token) return;
      var normalized = token.toLowerCase();
      if (normalized === "hide" || normalized === "hidden") flags.hide = true;
      if (normalized === "borderless" || normalized === "no-border" || normalized === "noborder") {
        flags.borderless = true;
      }
    });
    return flags;
  }

  function isLanguageContentFenceOpen(line) {
    return parseLanguageContentFence(line) != null;
  }

  function isIdentFenceOpen(line) {
    return /^```[A-Za-z]/.test(String(line || "").trim());
  }

  function isBareFenceClose(line) {
    return /^```\s*$/.test(String(line || "").trim());
  }

  // Walk markdown and split around ```language-content fences, counting nested
  // ```ident / ``` pairs so inner carousel / coverflow blocks stay intact.
  function splitMarkdownByLanguageContent(markdown) {
    var src = String(markdown || "").replace(/\r\n/g, "\n");
    var lines = src.split("\n");
    var parts = [];
    var mdBuf = [];
    var i = 0;

    function flushMd() {
      if (mdBuf.length) {
        parts.push({ type: "md", raw: mdBuf.join("\n") });
        mdBuf = [];
      }
    }

    while (i < lines.length) {
      var fence = parseLanguageContentFence(lines[i]);
      if (fence) {
        flushMd();
        i += 1;
        var depth = 1;
        var inner = [];
        while (i < lines.length) {
          var trimmed = lines[i].trim();
          if (isIdentFenceOpen(trimmed)) {
            depth += 1;
            inner.push(lines[i]);
          } else if (isBareFenceClose(trimmed)) {
            depth -= 1;
            if (depth === 0) {
              i += 1;
              break;
            }
            inner.push(lines[i]);
          } else {
            inner.push(lines[i]);
          }
          i += 1;
        }
        parts.push({
          type: "lang",
          raw: inner.join("\n"),
          hide: !!fence.hide,
          borderless: !!fence.borderless
        });
        continue;
      }
      mdBuf.push(lines[i]);
      i += 1;
    }
    flushMd();
    return parts;
  }

  function stripLanguageContentBlocks(markdown) {
    return splitMarkdownByLanguageContent(markdown)
      .filter(function (part) { return part.type === "md"; })
      .map(function (part) { return part.raw; })
      .join("\n");
  }

  function parseAllLanguageContentBlocks(markdown) {
    return splitMarkdownByLanguageContent(markdown)
      .filter(function (part) { return part.type === "lang"; })
      .map(function (part) { return parseLanguageContent(part.raw); })
      .filter(function (parsed) { return Object.keys(parsed).length > 0; });
  }

  var settingLang = false;

  function setLang(lang, options) {
    var normalized = normalizeLang(lang);
    if (!normalized) return getLang();
    var silent = options && options.silent;
    try {
      if (global.localStorage) global.localStorage.setItem(LANGUAGE_PREF_KEY, normalized);
    } catch (_) {}
    setDocumentLang(normalized);
    apply(document);
    if (typeof document.title === "string") {
      var titled = document.querySelector("title");
      if (titled && titled.getAttribute("data-i18n")) {
        document.title = t(titled.getAttribute("data-i18n"));
      }
    }
    if (!silent && !settingLang) {
      settingLang = true;
      try {
        document.dispatchEvent(new CustomEvent("portfolio:language-change", {
          detail: { language: normalized }
        }));
      } finally {
        settingLang = false;
      }
    }
    return normalized;
  }

  function mountPicker(container) {
    if (!container) return null;
    container.innerHTML = "";
    var select = document.createElement("select");
    select.className = "i18n-lang-select";
    select.setAttribute("aria-label", t("settings.language"));
    SUPPORTED.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = (FLAGS[code] || "🌐") + " " + (NAMES[code] || code);
      if (code === getLang()) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      setLang(select.value);
    });
    container.appendChild(select);
    document.addEventListener("portfolio:language-change", function (event) {
      var next = event && event.detail && event.detail.language;
      if (next && select.value !== next) select.value = next;
    });
    return select;
  }

  setDocumentLang(getLang());
  function bootApply() {
    apply(document);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApply, { once: true });
  } else {
    bootApply();
  }

  global.portfolioI18n = {
    KEY: LANGUAGE_PREF_KEY,
    SUPPORTED: SUPPORTED,
    LOCALES: LOCALES,
    NAMES: NAMES,
    FLAGS: FLAGS,
    getLang: getLang,
    getStoredLang: getStoredLang,
    detectBrowserLang: detectBrowserLang,
    setLang: setLang,
    t: t,
    apply: apply,
    parseLanguageContent: parseLanguageContent,
    parseAllLanguageContentBlocks: parseAllLanguageContentBlocks,
    parseLanguageContentFence: parseLanguageContentFence,
    splitMarkdownByLanguageContent: splitMarkdownByLanguageContent,
    stripLanguageContentBlocks: stripLanguageContentBlocks,
    mountPicker: mountPicker,
    locale: function () { return LOCALES[getLang()] || "en-GB"; }
  };
})(typeof window !== "undefined" ? window : this);
