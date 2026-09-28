import { GithubGlyph } from "@/components/ui/ui-icons";
import { siteConfig } from "@/config/site";

/** Round icon button that sits beside the theme switch. */
export function GithubButton() {
  const github = siteConfig.links.github;
  if (!github) return null;

  return (
    <a
      href={github.href}
      target="_blank"
      rel="noreferrer"
      aria-label={github.label}
      title={github.label}
      className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-hover hover:text-fg"
    >
      <GithubGlyph size={16} />
    </a>
  );
}
