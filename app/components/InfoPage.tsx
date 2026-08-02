import { AppShell } from "./AppShell";

type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
export function InfoPage({ title, lead, sections }: { title: string; lead: string; sections: Section[] }) {
  return <AppShell><article className="info-page"><header><span className="eyebrow">빨강타로 안내</span><h1>{title}</h1><p>{lead}</p></header>{sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}</article></AppShell>;
}
