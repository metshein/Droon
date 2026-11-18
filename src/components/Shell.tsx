import { useEffect, useState, type ReactNode } from 'react';
import { course, modules } from '../content';
import { href } from '../router';
import { useProgress } from '../progress';
import { useTheme } from '../theme';
import { IconCheck, IconChevron, IconDoc, IconFolder, IconMenu, IconMoon, IconQuiz, IconSun } from './Icons';

/** Moodulite kaustade värvid numbri järgi. */
export const MODULE_COLORS = ['#d6a65c', '#5aa04f', '#8a63d2', '#e08a3c', '#3a7bd5', '#2a9d8f', '#d9536f'];

interface Props {
  moduleId?: string;
  /** Aktiivne samm (0-põhine) või 'test' */
  current?: number | 'test';
  children: ReactNode;
}

function Sidebar({ moduleId, current }: Omit<Props, 'children'>) {
  const progress = useProgress();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const ready = modules.filter((m) => m.steps.length > 0);
  const totalSteps = ready.reduce((n, m) => n + m.steps.length, 0);
  const seenSteps = ready.reduce((n, m) => n + (progress.visited[m.id]?.length ?? 0), 0);

  return (
    <nav className="sidebar" aria-label="Kursuse sisukord">
      <div className="side-head">
        <span>Kursus</span>
        <span className="muted">{modules.length} moodulit</span>
      </div>
      <ul className="tree">
        {modules.map((m) => {
          const has = m.steps.length > 0;
          const expanded = open[m.id] ?? m.id === moduleId;
          const seen = progress.visited[m.id] ?? [];
          return (
            <li key={m.id} className={has ? '' : 'disabled'}>
              <button
                type="button"
                className={m.id === moduleId ? 'tree-row active' : 'tree-row'}
                onClick={() => has && setOpen({ ...open, [m.id]: !expanded })}
                aria-expanded={has ? expanded : undefined}
                disabled={!has}
              >
                <span className={expanded ? 'chev open' : 'chev'}>
                  <IconChevron />
                </span>
                <IconFolder color={MODULE_COLORS[m.number % MODULE_COLORS.length]} />
                <span className="tree-title">
                  {String(m.number).padStart(2, '0')}. {m.title}
                </span>
                <span className="tree-count">{has ? `${seen.length}/${m.steps.length}` : '—'}</span>
              </button>
              {has && expanded && (
                <ul className="tree-steps">
                  {m.steps.map((s, i) => {
                    const active = m.id === moduleId && current === i;
                    const done = seen.includes(i);
                    return (
                      <li key={i}>
                        <a href={href(m.id, i + 1)} className={active ? 'step-link active' : 'step-link'}>
                          <span className={done ? 'step-ico done' : 'step-ico'}>{done ? <IconCheck /> : <IconDoc />}</span>
                          {s.short}
                        </a>
                      </li>
                    );
                  })}
                  {m.quiz.length > 0 && (
                    <li>
                      <a
                        href={href(m.id, 'test')}
                        className={m.id === moduleId && current === 'test' ? 'step-link active' : 'step-link'}
                      >
                        <span className={progress.quiz[m.id] ? 'step-ico done' : 'step-ico'}>
                          {progress.quiz[m.id] ? <IconCheck /> : <IconQuiz />}
                        </span>
                        Enesekontroll
                        {progress.quiz[m.id] && (
                          <span className="tree-count">
                            {progress.quiz[m.id].score}/{progress.quiz[m.id].total}
                          </span>
                        )}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <div className="side-progress">
        <span>EDENEMINE</span>
        <span>
          {seenSteps} / {totalSteps}
        </span>
        <div className="mini-progress">
          <div style={{ width: `${totalSteps ? (seenSteps / totalSteps) * 100 : 0}%` }} />
        </div>
      </div>
    </nav>
  );
}

export default function Shell({ moduleId, current, children }: Props) {
  const [theme, toggleTheme] = useTheme();
  const [drawer, setDrawer] = useState(false);

  // Sulge mobiilimenüü lehe vahetumisel.
  useEffect(() => {
    setDrawer(false);
  }, [moduleId, current]);

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="icon-btn menu-btn" onClick={() => setDrawer(!drawer)} aria-label="Sisukord">
          <IconMenu />
        </button>
        <a className="brand" href={href()}>
          <img src="./favicon.svg" alt="" width={26} height={26} />
          <span>
            Drooni<mark>kursus</mark>
          </span>
        </a>
        <nav className="top-nav">
          <a href={href()} className="nav-pill active">
            Õpi
          </a>
        </nav>
        <div className="top-right">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Hele teema' : 'Tume teema'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <span className="author">
            <small>autor</small>
            {course.author}
          </span>
        </div>
      </header>
      <div className={drawer ? 'layout drawer-open' : 'layout'}>
        <Sidebar moduleId={moduleId} current={current} />
        <div className="scrim" onClick={() => setDrawer(false)} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
