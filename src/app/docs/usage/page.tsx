import type { Metadata } from "next";

import { Code, CodeBlock, DocSection, DocsPage, P } from "@/components/docs/docs-page";

export const metadata: Metadata = { title: "Usage" };

export default function UsagePage() {
  return (
    <DocsPage
      title="Usage"
      lead="Size picks the optical master. Weight picks Regular or Bold. Colour comes from the surrounding text."
    >
      <DocSection title="Size">
        <P>
          The default size is 32. Sizes below 32 use the 20×20 master, drawn with a 1px stroke. Sizes from 32 up
          use the 48×48 master, drawn with a 2px stroke. The master is scaled through <Code>width</Code> and{" "}
          <Code>height</Code> only.
        </P>
        <CodeBlock>{`<Icon name="wind-turbine" size={16} />
<Icon name="wind-turbine" size={48} />`}</CodeBlock>
      </DocSection>

      <DocSection title="Weight">
        <P>
          <Code>weight</Code> is <Code>&quot;regular&quot;</Code> by default, or <Code>&quot;bold&quot;</Code>. Bold
          is a separate drawing, with a 1.25px stroke at 20 and a 2.5px stroke at 48. Leave it off for Regular.
        </P>
        <CodeBlock>{`<Icon name="pylon" weight="bold" />`}</CodeBlock>
      </DocSection>

      <DocSection title="Colour">
        <P>
          Icons use <Code>currentColor</Code>, so they inherit the text colour. Set <Code>color</Code> or a{" "}
          <Code>className</Code> on the icon.
        </P>
        <CodeBlock>{`<Icon name="solar-panel" className="text-sky-600" />`}</CodeBlock>
      </DocSection>

      <DocSection title="Accessibility">
        <P>
          An icon with no label is decorative and hidden from assistive tech. Pass <Code>title</Code> when the icon
          carries the meaning on its own.
        </P>
        <CodeBlock>{`<Icon name="pylon" title="Transmission" />`}</CodeBlock>
      </DocSection>
    </DocsPage>
  );
}
