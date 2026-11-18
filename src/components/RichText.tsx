import type { ReactNode } from 'react';

// Väike markdowni alamhulk sisu tekstide jaoks: lõigud, "- " loendid, **paks**, *kaldkiri*, `kood`.

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.length > 2 && p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

export default function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim());
        const items = lines.filter((l) => l.startsWith('- '));
        const intro = lines.filter((l) => !l.startsWith('- '));
        return (
          <div key={i} className="rt-block">
            {intro.length > 0 && <p>{inline(intro.join(' '))}</p>}
            {items.length > 0 && (
              <ul>
                {items.map((l, j) => (
                  <li key={j}>{inline(l.slice(2))}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}
