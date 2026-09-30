# Security

Energy Icons ships static SVG files and small React components with no runtime dependencies beyond React, so the attack surface is small. If you find a problem anyway, such as an SVG that could run script, or an issue with the website:

- **Report it privately** through [GitHub's private vulnerability reporting](https://github.com/It-s-Sam/energy-icons/security/advisories/new). Please don't open a public issue.
- Include what you found, how to reproduce it, and the affected version.

Fixes ship in the latest release. Every icon is checked at build time for scripts, embedded styles and images (`npm run icons`).
