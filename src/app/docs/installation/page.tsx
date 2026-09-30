import type { Metadata } from "next";

import { Code, CodeBlock, DocSection, DocsPage, P } from "@/components/docs/docs-page";

export const metadata: Metadata = { title: "Installation" };

export default function InstallationPage() {
  return (
    <DocsPage
      title="Installation"
      lead="Install the React package, or take the SVG files. Both are MIT licensed."
    >
      <DocSection title="React">
        <P>Requires React 18 or newer.</P>
        <CodeBlock>{`npm install energy-icons`}</CodeBlock>
        <P>
          The name-based component includes every icon. Use it when the icon is chosen at runtime.
        </P>
        <CodeBlock>{`import { Icon } from "energy-icons/icon";

<Icon name="pylon" size={32} weight="bold" />`}</CodeBlock>
        <P>
          To ship a single drawing, import that icon. The slug is the path, and the component name is the slug in
          Pascal case.
        </P>
        <CodeBlock>{`import { Pylon } from "energy-icons/icons/pylon";

<Pylon size={32} />`}</CodeBlock>
      </DocSection>

      <DocSection title="SVG files">
        <P>
          Every master is also a file. Download the zip from the toolbar, or copy one SVG from an icon’s detail
          view. In the npm package the same files live at <Code>energy-icons/svg/&lt;slug&gt;/</Code>.
        </P>
        <CodeBlock>{`energy-icons/svg/pylon/20.svg
energy-icons/svg/pylon/48.svg
energy-icons/svg/pylon/20-bold.svg
energy-icons/svg/pylon/48-bold.svg`}</CodeBlock>
      </DocSection>
      <DocSection title="Without React">
        <P>
          Any framework, or plain HTML, can use the SVGs. Paste the markup inline to inherit the text colour, since
          every fill is <Code>currentColor</Code>. Pick the 20 master below 32px and the 48 master from 32px up.
        </P>
        <CodeBlock>{`<button>
  <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">…</svg>
  Charge
</button>`}</CodeBlock>
        <P>
          An <Code>&lt;img&gt;</Code> can’t pick up colour from the page and renders black. To tint a file loaded by
          URL, use it as a CSS mask. The files are also served from the npm package over a CDN.
        </P>
        <CodeBlock>{`.icon-pylon {
  width: 16px;
  height: 16px;
  background-color: currentColor;
  mask: url("https://cdn.jsdelivr.net/npm/energy-icons@1/svg/pylon/20.svg") center / contain no-repeat;
}`}</CodeBlock>
      </DocSection>
    </DocsPage>
  );
}
