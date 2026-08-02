export type ContentLink = { href: `#${string}`; label: string };

export function LongFormContents({ label, links }: { label: string; links: ContentLink[] }) {
  return (
    <nav className="long-form-contents" aria-label={label}>
      {links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
    </nav>
  );
}
