import type { Metadata } from "next";

import { Code, CodeBlock, DocSection, DocsPage, P, Step, Steps } from "@/components/docs/docs-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Contributing an icon" };

const repo = siteConfig.links.github?.href ?? "https://github.com/Sam-r-passmore/energy-icons";

function A({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
      {children}
    </a>
  );
}

export default function ContributingAnIconPage() {
  return (
    <DocsPage
      title="Contributing an icon"
      lead="Anyone can suggest or draw an icon. Every addition arrives as a pull request and is reviewed against the design principles before it ships."
    >
      <DocSection title="Ask for an icon">
        <P>
          The quickest route is an <A href={`${repo}/issues/new?template=icon_request.yml`}>icon request</A>.
          Describe what the symbol needs to show and where you’d use it. Requests are drawn in the order that best
          serves the set. Sponsoring doesn’t jump the queue, and the icons stay free either way.
        </P>
      </DocSection>

      <DocSection title="Draw one yourself">
        <P>
          Fork the <A href={repo}>repository</A>, add the icon on a branch, and open a pull request. Read the design
          principles first. An icon that breaks them will be asked to change before it can merge.
        </P>
        <Steps>
          <Step title="Draw both masters in Figma">
            <P>
              Design the icon on a 20×20 frame with a 1px stroke and on a 48×48 frame with a 2px stroke. Outline
              strokes, flatten, and use a single fill. Export each frame as SVG with the full frame as the viewBox.
              Draw the Bold weight the same way with a 1.25px stroke at 20 and a 2.5px stroke at 48.
            </P>
          </Step>
          <Step title="Add the files to /icons/<slug>/">
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
              grid. <Code>category</Code> is one of the ids in <Code>src/data/categories.ts</Code>.
            </P>
            <CodeBlock>{`{
  slug: "heat-network",
  name: "Heat network",
  category: "heat-buildings",
  keywords: ["district heating", "heat network", "pipes"],
},`}</CodeBlock>
          </Step>
          <Step title="Run the checks and open a pull request">
            <P>
              <Code>npm run icons</Code> checks that every entry has its files and that no SVG contains scripts,
              styles or stray strokes. <Code>npm test</Code> confirms the output matches the source byte for byte.
              CI runs both on your pull request.
            </P>
            <CodeBlock>{`npm run icons   # validate + regenerate
npm test        # byte-identical output check`}</CodeBlock>
          </Step>
        </Steps>
      </DocSection>

      <DocSection title="Review and release">
        <P>
          The maintainer reviews every pull request for drawing quality, consistency with the rest of the set, and
          a clear meaning. Nothing reaches the site or the npm package until it is merged. Merged icons ship in the
          next release.
        </P>
        <P>
          By contributing you agree your icon is your own work and is released under the project’s MIT License. Don’t
          submit drawings traced from other icon sets or logos you don’t have the right to share.
        </P>
      </DocSection>
    </DocsPage>
  );
}
