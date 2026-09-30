# Third-party notices

The Energy Icons drawings, packages and website are MIT licensed (see [LICENSE](LICENSE)). The website also includes the third-party work below. The `energy-icons` npm package contains none of it.

## Toolcraft (hero renderer)

The animated hero field in `src/components/hero/` (the WebGL dot, energy and glow shader, the soft-ellipse strength masks, and the floating icon frames) is adapted from source generated with Toolcraft.

```
MIT License

Copyright (c) 2026 Pixel Point

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## GitHub mark (Octicons)

The GitHub mark in the hero's "Star on GitHub" button is the Octicons `mark-github` glyph, Copyright (c) GitHub, Inc., used under the MIT License (same terms as above) and in line with GitHub's logo guidelines for linking to a GitHub repository. The mark is a trademark of GitHub, Inc.

## Fonts

- **Montserrat**, Copyright The Montserrat Project Authors, under the SIL Open Font License 1.1.
- **Geist Mono**, Copyright Vercel, Inc., under the SIL Open Font License 1.1.

Both are self-hosted by Next.js (`next/font`); the font files are unmodified.

## npm dependencies

Next.js and React (MIT) are bundled into the website. DialKit and Motion (MIT) power the hero tuning panels in development only and are not part of production builds. Every dependency and its licence is listed in `package-lock.json`.
