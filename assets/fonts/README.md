# Vendored web fonts

All faces here are redistributable; each is listed with where it came from and
under what terms.

| Directory | Family | Source | Licence |
| --- | --- | --- | --- |
| `fraunces/` | Fraunces (variable: `opsz`, `wght`, `SOFT`, `WONK`) | [Undercase Type](https://fraunces.undercase.xyz) via Google Fonts | SIL Open Font License 1.1 |
| `cmu/` | CMU Sans Serif — Regular, Bold, Oblique, BoldOblique | [Computer Modern Unicode](https://cm-unicode.sourceforge.io) (`cmunss`, `cmunsx`, `cmunsi`, `cmunso`) | SIL Open Font License 1.1 |
| `instrument-serif/` | Instrument Serif — Regular, Italic | [Instrument](https://github.com/Instrument/instrument-serif) via Google Fonts | SIL Open Font License 1.1 |

## Subsetting

Everything is shipped as WOFF2, subset to what the site actually sets:

- **CMU Sans Serif** — Latin-1, Latin Extended-A/B, IPA, combining diacritics,
  general punctuation, super/subscripts, currency, letterlike symbols, arrows,
  mathematical operators, box drawing, geometric shapes, and the Latin
  ligatures. Roughly 50 KB per style, down from ~500 KB.
- **Instrument Serif** — Google's own `latin` and `latin-ext` slices, taken
  unmodified, so the `unicode-range` declarations in the CSS match theirs.
  1.8 KB, from a 5.9 MB original.

They are consumed by [`/cv/style.css`](../../cv/style.css) (CMU Sans Serif,
[`/portfolio/style.css`](../../portfolio/style.css) (Fraunces).

To rebuild a CMU subset:

```sh
pyftsubset /usr/share/fonts/truetype/cmu/cmunss.ttf \
  --unicodes='U+0000-00FF,U+0100-017F,U+0180-024F,U+02B0-02FF,U+0300-036F,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+2500-257F,U+25A0-25FF,U+2600-26FF,U+FB00-FB4F' \
  --layout-features='*' --flavor=woff2 \
  --output-file=cmu/CMUSansSerif-Regular.woff2
```
