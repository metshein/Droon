import { course, modules } from '../content';
import { href } from '../router';
import { useProgress } from '../progress';

export default function Home() {
  const progress = useProgress();

  return (
    <main className="home">
      <section className="hero">
        <p className="eyebrow">Interaktiivne kursus</p>
        <h1>{course.title}</h1>
        <p className="lead">{course.subtitle}</p>
        <p className="hint">Iga teema on samm-sammult läbitav skeem. Liigu nuppudega või nooleklahvidega ← →.</p>
      </section>

      <ol className="module-grid">
        {modules.map((m) => {
          const ready = m.steps.length > 0;
          const seen = progress.visited[m.id]?.length ?? 0;
          const pct = ready ? Math.round((seen / m.steps.length) * 100) : 0;
          const quiz = progress.quiz[m.id];
          const body = (
            <>
              <span className="module-num">{String(m.number).padStart(2, '0')}</span>
              <h2>{m.title}</h2>
              <p>{m.summary}</p>
              <div className="module-meta">
                {ready ? (
                  <>
                    <span>{m.steps.length} sammu</span>
                    {quiz && (
                      <span className="badge">
                        Test {quiz.score}/{quiz.total}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="badge muted">Tulekul</span>
                )}
              </div>
              {ready && (
                <div className="mini-progress" aria-label={`Läbitud ${pct}%`}>
                  <div style={{ width: `${pct}%` }} />
                </div>
              )}
            </>
          );
          return (
            <li key={m.id}>
              {ready ? (
                <a className="module-card" href={href(m.id, 1)}>
                  {body}
                </a>
              ) : (
                <div className="module-card disabled" aria-disabled="true">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
