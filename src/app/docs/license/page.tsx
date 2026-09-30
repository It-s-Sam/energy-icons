import type { Metadata } from "next";

import { Code, DocSection, DocsPage, P } from "@/components/docs/docs-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "License & legal" };

const repo = siteConfig.links.github?.href ?? "https://github.com/It-s-Sam/energy-icons";

function A({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
      {children}
    </a>
  );
}

export default function LicensePage() {
  return (
    <DocsPage
      title="License & legal"
      lead="Energy Icons is free for personal and commercial work under the MIT License. No attribution is required."
    >
      <DocSection title="License">
        <P>
          The icons, the <Code>energy-icons</Code> package and this website are released under the{" "}
          <A href={`${repo}/blob/main/LICENSE`}>MIT License</A>. Use them in apps, websites, print, products and
          client work, commercial or not. Modify them freely.
        </P>
        <P>
          Crediting Energy Icons is appreciated but not required. If you redistribute the icon files themselves, for
          example in another icon pack or a design kit, keep the <Code>LICENSE</Code> file with them. The npm
          package and the Download all zip already include it.
        </P>
      </DocSection>

      <DocSection title="How the icons are made">
        <P>
          Icons are drawn in Figma by Sam, and extended with Claude working from the same construction rules and
          grid. Every icon is reviewed and finalised by hand before it ships.
        </P>
      </DocSection>

      <DocSection title="Trademarks">
        <P>
          A few icons depict symbols associated with trademarks, such as Bluetooth, USB, Wi-Fi and EV connector
          standards like CCS and CHAdeMO. These marks belong to their owners. Their inclusion is for identification
          only and implies no affiliation or endorsement. Follow the owner’s guidelines when you use them.
        </P>
        <P>“Energy Icons” and the Energy Icons logo identify this project. Please don’t use them in a way that suggests your product is made or endorsed by it.</P>
      </DocSection>

      <DocSection title="Third-party software">
        <P>
          The website’s animated hero is adapted from Toolcraft (MIT, Pixel Point), and uses the Montserrat and
          Geist Mono typefaces (SIL Open Font License). Full notices are in{" "}
          <A href={`${repo}/blob/main/THIRD_PARTY_NOTICES.md`}>THIRD_PARTY_NOTICES.md</A>. The npm package contains
          only the icons.
        </P>
      </DocSection>

      <DocSection title="Privacy">
        <P>
          This site sets no cookies and runs no analytics or tracking. Your light or dark theme choice is saved in
          your own browser’s local storage and never leaves your device. The site is hosted on Vercel, which keeps
          standard server logs, such as IP addresses, to operate and secure the service.
        </P>
        <P>
          Sponsorship goes through GitHub Sponsors, under GitHub’s own terms and privacy policy.
        </P>
      </DocSection>

      <DocSection title="No warranty">
        <P>
          The icons and code are provided “as is”, without warranty of any kind, as set out in the MIT License.
          Questions or concerns: <A href={`${repo}/issues`}>open an issue</A>.
        </P>
      </DocSection>
    </DocsPage>
  );
}
