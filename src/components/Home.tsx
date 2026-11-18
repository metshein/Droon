import { course, modules } from '../content';
import { href } from '../router';
import { useProgress } from '../progress';
import { MODULE_COLORS } from './Shell';
import { IconArrowRight, IconFolder } from './Icons';

export default function Home() {
  const progress = useProgress();
  const first = modules.find((m) => m.steps.length > 0);

  return (
    <main className="page home">
      <section className="hero">
        <p className="crumbs">Interaktiivne kursus</p>
        <h1>{course.title}</h1>
        <p className="subtitle">{course.subtitle}</p>
        <p className="hint">
          Iga teema on samm-sammult läbitav animeeritud skeem. Liigu nuppudega või nooleklahvidega <kbd>←</kbd>{' '}
          <kbd>→</kbd>.
        </p>
        {first && (
          <a className="btn primary" href={href(first.id, 1)}>
            Alusta <IconArrowRight />
          </a>
        )}
      </section>

      <ol className="module-grid">
        {modules.map((m) => {
          const ready = m.steps.length > 0;
          const seen = progress.visited[m.id]?.length ?? 0;
          const pct = ready ? Math.round((seen / m.steps.length) * 100) : 0;
          const quiz = progress.quiz[m.id];
          const body = (
            <>
              <div className="card-top">
                <IconFolder color={MODULE_COLORS[m.number % MODULE_COLORS.length]} />
                <span className="module-num">{String(m.number).padStart(2, '0')}</span>
                {!ready && <span className="badge">Tulekul</span>}
                {quiz && (
                  <span className="badge green">
                    Test {quiz.score}/{quiz.total}
                  </span>
                )}
              </div>
              <h2>{m.title}</h2>
              <p>{m.summary}</p>
              {ready && (
                <>
                  <div className="card-meta">
                    <span>{m.steps.length} sammu</span>
                    {m.minutes && <span>{m.minutes} min</span>}
                    <span>{pct}%</span>
                  </div>
                  <div className="mini-progress">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                </>
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
