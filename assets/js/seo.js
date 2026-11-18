(function (global) {
  "use strict";

  var ORIGIN = "https://example.com";
  var PERSON_ID = ORIGIN + "/#person";
  var WEBSITE_ID = ORIGIN + "/#website";
  var OG_IMAGE = ORIGIN + "/assets/images/og-image.jpg";
  var PROFILE_IMAGE = ORIGIN + "/assets/images/profile.png";
  var ARTICLE_SCRIPT_ID = "seo-article-jsonld";
  var JSONLD_SCRIPT_ID = "seo-graph-jsonld";

  var SAME_AS = [
    "https://github.com/your-username",
    "https://www.linkedin.com/in/your-username",
    "https://www.youtube.com/@yourusername",
    "https://x.com/yourusername",
    "https://mastodon.social/@your_username",
    "https://www.instagram.com/your.username",
    "https://gitlab.com/your-username",
    "https://www.kaggle.com/yourusername",
    "https://soundcloud.com/your-username"
  ];

  var IDENTITY_HOSTS = [
    { host: "github.com", path: /^\/your-username\/?$/ },
    { host: "linkedin.com", path: /^\/in\/your-username\/?$/ },
    { host: "youtube.com", path: /^\/@yourusername\/?$/ },
    { host: "youtu.be", path: /./ },
    { host: "x.com", path: /^\/yourusername\/?$/ },
    { host: "twitter.com", path: /^\/yourusername\/?$/ },
    { host: "mastodon.social", path: /^\/@your_username\/?$/ },
    { host: "instagram.com", path: /^\/your\.username\/?$/ },
    { host: "gitlab.com", path: /^\/your-username\/?$/ },
    { host: "kaggle.com", path: /^\/yourusername\/?$/ },
    { host: "soundcloud.com", path: /^\/your-username\/?$/ }
  ];

  var current = { kind: "tab", tab: "home", article: null };

  var PAGE_META = {
    home: {
      titleKey: "meta.title.home",
      title: "Your Name — Your Job Title",
      descriptionKey: "meta.description.home",
      description: "Your Name is a Your Job Title at Your Company. Add a short, searchable description of who you are and what you do here.",
      path: "/",
      type: "profile"
    },
    projects: {
      titleKey: "meta.title.projects",
      title: "Projects — Your Name",
      descriptionKey: "meta.description.projects",
      description: "Personal projects by Your Name: machine learning, NLP, quantitative finance, language-learning apps, and production software.",
      path: "/projects"
    },
    experience: {
      titleKey: "meta.title.experience",
      title: "Experience — Your Name",
      descriptionKey: "meta.description.experience",
      description: "Roles, employers and experience of Your Name.",
      path: "/experience"
    },
    resources: {
      titleKey: "meta.title.resources",
      title: "Resources — Your Name",
      descriptionKey: "meta.description.resources",
      description: "Notes, cheat sheets, fonts, and other resources published by Your Name.",
      path: "/resources"
    },
    music: {
      titleKey: "meta.title.music",
      title: "Music — Your Name",
      descriptionKey: "meta.description.music",
      description: "Piano compositions, transcriptions, and arrangements by Your Name.",
      path: "/music"
    },
    blog: {
      titleKey: "meta.title.blog",
      title: "Blog — Your Name",
      descriptionKey: "meta.description.blog",
      description: "Writing by Your Name on machine learning, quantitative finance, language, and design.",
      path: "/blog"
    },
    info: {
      titleKey: "meta.title.info",
      title: "Info — Your Name",
      descriptionKey: "meta.description.info",
      description: "Social profiles and contact details for Your Name.",
      path: "/info"
    },
    photography: {
      titleKey: "meta.title.photography",
      title: "Photography — Your Name",
      descriptionKey: "meta.description.photography",
      description: "Landscape, cityscape, and architecture photography by Your Name.",
      path: "/photography/"
    },
    releases: {
      titleKey: "meta.title.releases",
      title: "Release notes — Your Name",
      descriptionKey: "meta.description.releases",
      description: "Changelog and release history for example.com.",
      path: "/releases"
    },
    apps: {
      titleKey: "meta.title.apps",
      title: "Apps — Your Name",
      descriptionKey: "meta.description.apps",
      description: "Apps and tools built by Your Name.",
      path: "/apps"
    },
    settings: {
      titleKey: "meta.title.settings",
      title: "Settings — Your Name",
      descriptionKey: "meta.description.settings",
      description: "Site settings for example.com.",
      path: "/settings"
    },
    "textbook-project": {
      titleKey: "meta.title.textbook",
      title: "Featured project — Your Name",
      descriptionKey: "meta.description.textbook",
      description: "A featured project by Your Name.",
      path: "/textbook-project"
    }
  };

  function t(key, fallback) {
    try {
      if (global.portfolioI18n && typeof global.portfolioI18n.t === "function") {
        var value = global.portfolioI18n.t(key);
        if (value && value !== key) return value;
      }
    } catch (_) {}
    return fallback;
  }

  function locale() {
    try {
      if (global.portfolioI18n && typeof global.portfolioI18n.locale === "function") {
        return global.portfolioI18n.locale();
      }
    } catch (_) {}
    return "en-GB";
  }

  function absoluteUrl(path) {
    if (!path) return ORIGIN + "/";
    if (/^https?:/i.test(path)) return path;
    if (path.charAt(0) !== "/") path = "/" + path;
    return ORIGIN + path;
  }

  function ensureMeta(selector, attrs) {
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      Object.keys(attrs).forEach(function (key) {
        if (key !== "content") el.setAttribute(key, attrs[key]);
      });
      document.head.appendChild(el);
    }
    if (attrs.content != null) el.setAttribute("content", attrs.content);
    return el;
  }

  function ensureLink(rel, extraSelector) {
    var selector = 'link[rel="' + rel + '"]' + (extraSelector || "");
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    return el;
  }

  function setCanonical(url) {
    var link = ensureLink("canonical");
    link.setAttribute("href", url);
  }

  function upsertJsonLd(id, data) {
    var el = document.getElementById(id);
    if (!data) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function personNode() {
    return {
      "@type": "Person",
      "@id": PERSON_ID,
      "name": "Your Name",
      "givenName": "Your",
      "familyName": "Name",
      "alternateName": ["your-username"],
      "url": ORIGIN + "/",
      "image": {
        "@type": "ImageObject",
        "url": PROFILE_IMAGE,
        "contentUrl": PROFILE_IMAGE,
        "caption": "Your Name"
      },
      "description": "Your Name is a Your Job Title at Your Company. Add a short, searchable description of who you are and what you do here.",
      "jobTitle": "Your Job Title",
      "email": "mailto:hello@example.com",
      "worksFor": { "@type": "Organization", "name": "Your Company", "url": "https://example.com" },
      "alumniOf": [
        { "@type": "CollegeOrUniversity", "name": "Your University", "url": "https://example.com" }
      ],
      "knowsAbout": ["topic one", "topic two", "topic three"],
      "knowsLanguage": [
        { "@type": "Language", "name": "English", "alternateName": "en" }
      ],
      "sameAs": SAME_AS.slice()
    };
  }

  function siteGraph() {
    var person = personNode();
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": ORIGIN + "/#profile",
          "url": ORIGIN + "/",
          "name": "Your Name",
          "isPartOf": { "@id": WEBSITE_ID },
          "about": { "@id": PERSON_ID },
          "mainEntity": person,
          "inLanguage": ["en-GB", "fr", "it", "ja", "zh"]
        },
        {
          "@type": "WebSite",
          "@id": WEBSITE_ID,
          "url": ORIGIN + "/",
          "name": "Your Name",
          "alternateName": ["example.com"],
          "publisher": { "@id": PERSON_ID },
          "inLanguage": ["en-GB", "fr", "it", "ja", "zh"]
        }
      ]
    };
  }

  function applyMeta(opts) {
    var title = opts.title;
    var description = opts.description;
    var url = opts.url;
    var image = opts.image || OG_IMAGE;
    var type = opts.type || "website";
    var loc = locale();

    if (title) document.title = title;

    ensureMeta('meta[name="description"]', { name: "description", content: description || "" });
    ensureMeta('meta[name="author"]', { name: "author", content: "Your Name" });
    ensureMeta('meta[name="robots"]', {
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    });

    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Your Name" });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: title || "" });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description || "" });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: url });
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: image });
    ensureMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: "Your Name" });
    ensureMeta('meta[property="og:locale"]', { property: "og:locale", content: loc.replace("-", "_") });
    ensureMeta('meta[property="profile:first_name"]', { property: "profile:first_name", content: "Your" });
    ensureMeta('meta[property="profile:last_name"]', { property: "profile:last_name", content: "Name" });

    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    ensureMeta('meta[name="twitter:site"]', { name: "twitter:site", content: "@yourusername" });
    ensureMeta('meta[name="twitter:creator"]', { name: "twitter:creator", content: "@yourusername" });
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title || "" });
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description || "" });
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });

    setCanonical(url);
  }

  function applyTab(tabName) {
    var tab = PAGE_META[tabName] ? tabName : "home";
    current = { kind: "tab", tab: tab, article: null };
    var page = PAGE_META[tab];
    applyMeta({
      title: t(page.titleKey, page.title),
      description: t(page.descriptionKey, page.description),
      url: absoluteUrl(page.path),
      type: page.type || "website"
    });
    upsertJsonLd(ARTICLE_SCRIPT_ID, null);
  }

  function applyArticle(post) {
    if (!post) return;
    var slug = String(post.slug || "").replace(/^.*\//, "").replace(/\.md$/i, "");
    var isMusic = !!post.isMusic;
    var path = isMusic
      ? "/blog/?post=" + encodeURIComponent(slug)
      : "/blog/?post=" + encodeURIComponent(slug);
    var url = absoluteUrl(path);
    var title = (post.title || slug) + " | Your Name";
    var description = post.summary || post.description || t("meta.description.blog", PAGE_META.blog.description);
    var image = post.coverImage || post.image
      ? absoluteUrl(String(post.coverImage || post.image).replace(/^\.\.\//, "/").replace(/^assets\//, "/assets/"))
      : OG_IMAGE;

    current = { kind: "article", tab: isMusic ? "music" : "blog", article: post };
    applyMeta({
      title: title,
      description: description,
      url: url,
      image: image,
      type: "article"
    });

    var node = {
      "@context": "https://schema.org",
      "@type": isMusic ? "MusicComposition" : "BlogPosting",
      "@id": url + "#post",
      "headline": post.title || slug,
      "name": post.title || slug,
      "description": description,
      "url": url,
      "mainEntityOfPage": url,
      "image": image,
      "inLanguage": locale(),
      "author": { "@id": PERSON_ID },
      "publisher": { "@id": PERSON_ID },
      "isPartOf": { "@id": WEBSITE_ID }
    };
    if (post.date) {
      var iso = String(post.date).length <= 10 ? post.date : String(post.date).slice(0, 10);
      node.datePublished = iso;
    }
    if (Array.isArray(post.tags) && post.tags.length) node.keywords = post.tags.join(", ");
    upsertJsonLd(ARTICLE_SCRIPT_ID, node);
  }

  function refresh() {
    if (current.kind === "article" && current.article) applyArticle(current.article);
    else applyTab(current.tab || "home");
  }

  function relMeAttr(url) {
    try {
      var parsed = new URL(String(url), ORIGIN);
      var host = parsed.hostname.replace(/^www\./, "");
      var path = parsed.pathname.replace(/\/+$/, "") || "/";
      for (var i = 0; i < IDENTITY_HOSTS.length; i += 1) {
        var rule = IDENTITY_HOSTS[i];
        if (host === rule.host || host.endsWith("." + rule.host)) {
          if (rule.path.test(path) || rule.path.test(parsed.pathname)) return "me";
        }
      }
    } catch (_) {}
    return "";
  }

  function ensureGraph() {
    if (document.getElementById(JSONLD_SCRIPT_ID) || document.getElementById("person-jsonld")) return;
    upsertJsonLd(JSONLD_SCRIPT_ID, siteGraph());
  }

  document.addEventListener("portfolio:language-change", function () {
    refresh();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureGraph, { once: true });
  } else {
    ensureGraph();
  }

  global.portfolioSeo = {
    ORIGIN: ORIGIN,
    PERSON_ID: PERSON_ID,
    SAME_AS: SAME_AS,
    applyTab: applyTab,
    applyArticle: applyArticle,
    refresh: refresh,
    relMeAttr: relMeAttr,
    personNode: personNode,
    siteGraph: siteGraph
  };
})(typeof window !== "undefined" ? window : this);
