# demo

## Markdown Features Demo {.wow .animated .fadeInUp data-wow-delay="0.15s"}

### Heading level 3 {.wow .animated .fadeInUp data-wow-delay="0.2s"}
#### Heading level 4 {.wow .animated .fadeInUp data-wow-delay="0.25s"}
##### Heading level 5 {.wow .animated .fadeInUp data-wow-delay="0.3s"}
###### Heading level 6 {.wow .animated .fadeInUp data-wow-delay="0.35s"}

Inline formatting: **bold**, *italic*, `inline code`, and a [link](https://github.com). {.wow .animated .fadeIn data-wow-delay="0.4s"}

Unordered list example:
- First bullet
- Second bullet
- Third bullet

Ordered list example:
1. First step
2. Second step
3. Third step

> This is a blockquote example showing quoted content.

| Feature | Supported | Notes |
|:--|:--:|--:|
| h4-h6 | yes | added parser support |
| Tables | yes | alignment supported |
| Fenced code | yes | language class emitted |

::vspace 2em

## Code blocks with syntax highlighting {.wow .animated .fadeInUp data-wow-delay="0.2s"}
This is supposed to work... but it doesn't.

```javascript
function greet(name) {
	return "Hello, " + name + "!";
}
```

```python
import numpy as np

# A tiny example: fit a line with least squares
x = np.linspace(0, 10, 50)
y = 2.0 * x + 1.0 + np.random.normal(scale=0.5, size=x.size)

slope, intercept = np.polyfit(x, y, deg=1)
print(f"y ≈ {slope:.2f}x + {intercept:.2f}")
```

```sql
-- A small example schema and query
CREATE TABLE projects (
    name        VARCHAR(50),
    year        INT,
    stars       INT
);

INSERT INTO projects VALUES
    ('Project One', 2025, 12),
    ('Project Two', 2026, 40);

SELECT name, stars
FROM projects
WHERE year >= 2025
ORDER BY stars DESC;
```

```r
greet <- function(name) {
  return(paste("Hello,", name, "!"))
}
```

::vspace 2em
---
::vspace 2em

### LaTeX Demo {.wow .animated .fadeInUp data-wow-delay="0.2s"}

Inline math example: $E = mc^2$ and $\nabla \cdot \vec{F} = 0$.

Block math example:

$$
\int_{0}^{1} x^2\,dx = \frac{1}{3}
$$

$$e^{i\pi} + 1 = 0$$

::vspace 2em
---
::vspace 2em

# Rotation Demos {.wow .animated .fadeInUp data-wow-delay="0.2s"}
This is a demo of the rotation system, which can rotate text or attributes on a set interval.
A rotation runs through its items once and then settles on the last one; add `"loop": true` (on the block, or on a single entry) to keep it cycling for as long as the page is open, as every example below does.


```rotations
[
  {
    "loop": true,
    "id": "hero-image",
    "element": "img",
    "mode": "attr",
    "effect": "zoom-in",
    "interval": 3200,
    "attributes": { "class": "card-image", "loading": "lazy" },
    "items": [
      { "attrs": { "src": "assets/images/placeholder-1.jpg", "alt": "Placeholder 1" } },
      { "attrs": { "src": "assets/images/placeholder-2.jpg", "alt": "Placeholder 2" } }
    ]
  }
]
```

```rotations
[
  {
    "loop": true,
    "id": "focus-inline",
    "selector": ".focus-rotator",
    "mode": "text",
    "effect": "fade",
    "interval": 1800,
    "items": ["ML", "NLP", "Quant", "Vision"]
  }
]
```

::vspace 2em
---
::vspace 2em

## Rotations Cookbook {.wow .animated .fadeInUp data-wow-delay="0.2s"}
These examples show different `rotations` setups you can reuse in any markdown page.

### Flame + Spark Typed Demo

```rotations
{
    "sparks": true,
    "rotations": [
        {
            "loop": true,
            "id": "flame-spark-typed-demo",
            "element": "span",
            "mode": "text",
            "effect": "typed",
            "interval": 2600,
            "typingSpeed": 52,
            "items": [
                "Building fast experiments",
                "构建快速实验",
                "素早い実験を作る"
            ]
        }
    ]
}
```

::rotation flame-spark-typed-demo

::vspace 1.2em

### 1) Typed text rotation (slot + span)
```rotations
[
    {
        "loop": true,
        "id": "cookbook-typed",
        "element": "span",
        "mode": "text",
        "effect": "typed",
        "interval": 2200,
        "typingSpeed": 48,
        "pauseOnHover": true,
        "items": [
            "I build fast prototypes.",
            "I build robust systems.",
            "I build data products."
        ]
    }
]
```

### 2) Heading rotation (h2 with fade-up)
```rotations
[
    {
        "loop": true,
        "id": "cookbook-heading",
        "element": "h2",
        "mode": "text",
        "effect": "fade-up",
        "interval": 2600,
        "items": [
            "Rotation as a heading",
            "Same slot, new heading",
            "Swap titles automatically"
        ]
    }
]
```

### 3) Markdown rotation (lists + table)
```rotations
[
    {
        "loop": true,
        "id": "cookbook-markdown",
        "element": "div",
        "mode": "markdown",
        "effect": "fade-left",
        "interval": 3400,
        "items": [
            "- Item A\\n- Item B\\n- Item C",
            "| Skill | Level |\\n|:--|:--:|\\n| Python | Advanced |\\n| SQL | Advanced |"
        ]
    }
]
```

### 4) HTML rotation (custom card-like snippets)
```rotations
[
    {
        "loop": true,
        "id": "cookbook-html",
        "element": "div",
        "mode": "html",
        "effect": "zoom-in",
        "interval": 3000,
        "items": [
            "<p><strong>HTML mode:</strong> Use custom markup directly.</p>",
            "<blockquote><p>Great for stylized snippets and badges.</p></blockquote>"
        ]
    }
]
```

### 5) Image rotation (img + attr mode)
```rotations
[
    {
        "loop": true,
        "id": "cookbook-images",
        "element": "img",
        "mode": "attr",
        "effect": "zoom-out",
        "interval": 2800,
        "attributes": { "class": "card-image", "loading": "lazy" },
        "items": [
            { "attrs": { "src": "assets/images/placeholder-1.jpg", "alt": "Placeholder 1" } },
            { "attrs": { "src": "assets/images/placeholder-2.jpg", "alt": "Placeholder 2" } }
        ]
    }
]
```

### 6) Selector target rotation (overwrite existing element)
Selector target placeholder {.selector-rotation-demo}

```rotations
[
    {
        "loop": true,
        "id": "cookbook-selector",
        "selector": ".selector-rotation-demo",
        "mode": "text",
        "effect": "pulse",
        "interval": 1800,
        "items": [
            "Selector-based rotation",
            "Targets an existing markdown node",
            "No generated element needed"
        ]
    }
]
```

### 7) Random order + start index
```rotations
[
    {
        "loop": true,
        "id": "cookbook-random",
        "element": "p",
        "mode": "text",
        "effect": "fade-right",
        "interval": 1700,
        "startIndex": 1,
        "randomOrder": true,
        "items": [
            "First idea",
            "Second idea",
            "Third idea",
            "Fourth idea"
        ]
    }
]
```

### 8) WOW-style effect shorthand
```rotations
[
    {
        "loop": true,
        "id": "cookbook-wow",
        "element": "p",
        "mode": "text",
        "effect": "wow:fadeInLeft",
        "effectDuration": 900,
        "interval": 2400,
        "items": [
            "Uses wow-style animation class",
            "Good for stronger entrance motion",
            "Still rotates on interval"
        ]
    }
]
```
::vspace 2em

## Carousel

A `carousel` fence turns its body into a swipeable, keyboard-navigable set of
slides. Slides are separated by a line of three dashes; any text after the
dashes becomes that slide's indicator label — labelled indicators render as
pills, unlabelled ones as dots. Navigation loops infinitely: drag or swipe
left/right, click the arrows or an indicator, or focus the carousel and use the
left/right arrow keys (Home/End jump to the first/last slide).

A label can lead with an icon — either emoji, or a Font Awesome name:

| Label written as | Indicator |
|:--|:--|
| `--- 📸 Photography` | leading emoji (any number of them) + text |
| `--- fa:camera Photography` | Font Awesome, solid by default |
| `--- fa:brands/github GitHub` | Font Awesome with an explicit style |
| `--- fa-regular fa-heart Favourites` | raw Font Awesome classes |
| `--- 🎵` | icon only — a pill with no text |

The Font Awesome stylesheet is fetched lazily, and only if a page actually uses
an `fa` icon, so emoji-only pages pay nothing for it.

```carousel
--- 🎠 Overview
### Swipe, tap or type
This whole block is one carousel. Each slide holds ordinary markdown — headings,
**bold text**, lists, images, tables, maths.

- drag horizontally to swipe
- click the **‹** / **›** arrows
- press the arrow keys once the carousel has focus

--- fa:tags Labelled pills
### Labels become pills
Give a slide a label and its indicator grows from a dot into a pill, so a
carousel can read as a small set of tabs instead of an anonymous slideshow.

| Indicator | When |
|:--|:--|
| dot | slide has no label |
| pill | slide has a label |

--- fa:brands/markdown Anything inside
### Mix in whatever you like
Inline maths such as $e^{i\pi} + 1 = 0$ renders as usual, and so do images,
quotes and links.

> Content that would otherwise force a long vertical scroll can sit side by side
> instead.

---
This last slide has no label, so its indicator stays a plain dot.
```
