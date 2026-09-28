import type { Metadata } from "next";

import { Code, CodeBlock, DocSection, DocsPage, P, Step, Steps } from "@/components/docs/docs-page";

export const metadata: Metadata = { title: "Adding an icon" };

export default function AddingAnIconPage() {
  return (
    <DocsPage
      title="Adding an icon"
      lead="Two SVG files and one metadata entry. The icon then appears in the grid, search, category filters, the detail view, the <Icon> component and the Download all zip."
    >
      <DocSection title="Steps">
        <Steps>
          <Step title="Draw both masters in Figma">
            <P>
              Design the icon on a 20×20 frame with a 1px stroke and on a 48×48 frame with a 2px stroke. Outline
              strokes, flatten, and use a single fill. Export each frame as SVG with the full frame as the viewBox.
              Draw the Bold weight the same way with a 1.25px stroke at 20 and a 2.5px stroke at 48.
            </P>
          </Step>
          <Step title="Drop the files into /icons/<slug>/">
            <P>
              The slug is kebab-case and becomes the icon’s permanent name. Keep <Code>viewBox</Code> as{" "}
              <Code>0 0 20 20</Code> / <Code>0 0 48 48</Code> and fills as <Code>currentColor</Code>. Don’t edit
              the path data.
            </P>
            <CodeBlock>{`icons/
  heat-network/
    20.svg
    48.svg
    20-bold.svg
    48-bold.svg`}</CodeBlock>
          </Step>
          <Step title="Add one metadata entry">
            <P>
              Add an entry to <Code>src/data/icons.ts</Code>. Its position in the list sets its position in the
              grid. <Code>category</Code> is one of <Code>generation</Code>, <Code>grid-storage</Code>,{" "}
              <Code>heat-buildings</Code>, <Code>fuels</Code>, <Code>climate</Code>, <Code>transport</Code>,{" "}
              <Code>industry</Code>, <Code>data</Code>, <Code>business</Code>, <Code>tools</Code> or{" "}
              <Code>interface</Code> (see <Code>src/data/categories.ts</Code>). A category with no icons is hidden
              until its first icon arrives.
            </P>
            <CodeBlock>{`{
  slug: "heat-network",
  name: "Heat network",
  category: "heat-buildings",
  keywords: ["district heating", "heat network", "pipes"],
},`}</CodeBlock>
          </Step>
          <Step title="Run the dev server or a build">
            <P>
              <Code>npm run dev</Code> and <Code>npm run build</Code> run <Code>npm run icons</Code> first. It
              checks that every metadata entry has both files and every folder has metadata, then regenerates the
              registry and the zip. If anything is missing it stops and lists the problem.
            </P>
            <CodeBlock>{`npm run icons   # validate + regenerate on demand
npm test        # confirms output paths match the source files byte for byte`}</CodeBlock>
          </Step>
        </Steps>
      </DocSection>
    </DocsPage>
  );
}
