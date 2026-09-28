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
    </DocsPage>
  );
}
