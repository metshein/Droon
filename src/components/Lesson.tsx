import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CourseModule } from '../types';
import { href, navigate } from '../router';
import { markVisited, useProgress } from '../progress';
import Scene from '../scenes';
import { PlaybackContext } from '../scenes/playback';
import RichText from './RichText';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconLevel,
  IconPause,
  IconPlay,
  IconReplay,
  IconSpark,
  IconSteps,
} from './Icons';

/** Kas klahvivajutus on mõeldud mõnele sisendile (liugur, kang), mitte sammude vahetamiseks. */
function isControl(el: EventTarget | null) {
  return el instanceof Element && el.closest('input, textarea, select, [contenteditable], [data-stick]') !== null;
}

export default function Lesson({ mod, index }: { mod: CourseModule; index: number }) {
  const step = mod.steps[index];
  const total = mod.steps.length;
  const last = index === total - 1;
  const hasQuiz = mod.quiz.length > 0;
  const progress = useProgress();
  const seen = progress.visited[mod.id] ?? [];
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);

  const nextHref = !last ? href(mod.id, index + 2) : hasQuiz ? href(mod.id, 'test') : href();
  const nextLabel = !last ? `Edasi: ${mod.steps[index + 1].short}` : hasQuiz ? 'Enesekontroll' : 'Valmis';
  const restart = () => {
    setPaused(false);
    setReplay((r) => r + 1);
  };

  useEffect(() => {
    markVisited(mod.id, index);
    setPaused(false);
  }, [mod.id, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isControl(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        window.location.hash = nextHref;
      } else if (e.key === 'ArrowLeft' && index > 0) {
        navigate(mod.id, index);
      } else if (e.key === 'r' || e.key === 'R') {
        restart();
      } else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mod.id, index, nextHref]);

  return (
    <div className="lesson">
      <section className="lesson-main">
        <header className="lesson-head">
          <p className="crumbs">
            {String(mod.number).padStart(2, '0')}. {mod.title}
            <span>/</span>
            Samm {index + 1} / {total}
          </p>
          <div className="title-row">
            <h1>{mod.title}</h1>
            <div className="badges">
              {mod.minutes && (
                <span className="badge tan">
                  <IconClock /> {mod.minutes} min
                </span>
              )}
              {mod.level && (
                <span className="badge green">
                  <IconLevel /> {mod.level}
                </span>
              )}
              <span className="badge lilac">
                <IconSteps /> {total} sammu
              </span>
            </div>
          </div>
          <p className="subtitle">{mod.summary}</p>
        </header>

        <div className="canvas">
          <div className="canvas-top">
            <div className="metrics">
              {step.metrics?.map((m, i) => (
                <div key={`${index}-${i}`} className={i === step.metrics!.length - 1 ? 'metric last' : 'metric'}>
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                </div>
              ))}
            </div>
            <div className="canvas-actions">
              <button type="button" className="btn small" onClick={restart}>
                <IconReplay /> Uuesti
              </button>
              <button type="button" className="btn small" onClick={() => setPaused(!paused)} aria-pressed={paused}>
                {paused ? <IconPlay /> : <IconPause />} {paused ? 'Jätka' : 'Paus'}
              </button>
            </div>
          </div>
          <div className="canvas-stage">
            <PlaybackContext.Provider value={{ paused }}>
              {/* Sama tüüpi skeem jääb samaks komponendiks, et sammude vahel saaks animeerida. */}
              <Scene key={`${step.scene.type}-${replay}`} spec={step.scene} />
            </PlaybackContext.Provider>
          </div>
        </div>

        <nav className="stepper" aria-label="Selle mooduli sammud">
          <div className="stepper-head">
            <span>SELLES MOODULIS</span>
            <span>
              Samm {index + 1} / {total}
            </span>
          </div>
          <ol>
            {mod.steps.map((s, i) => (
              <li key={i} className={i < index ? 'done' : i === index ? 'active' : ''}>
                <a href={href(mod.id, i + 1)} aria-current={i === index ? 'step' : undefined}>
                  <span className="num">{i + 1}</span>
                  <span className="lbl">{s.short}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <aside className="step-panel">
        <div className="panel-card main">
          <div className="panel-top">
            <span className="step-no">
              SAMM {index + 1} / {total}
            </span>
            {step.tag && <span className="tag">{step.tag}</span>}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="panel-body"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <h2>{step.title}</h2>
              <div className="rich">
                <RichText text={step.text} />
              </div>
              {step.keyIdea && (
                <div className="key-idea">
                  <span className="key-ico">
                    <IconSpark />
                  </span>
                  <div>
                    <span className="small-cap">PÕHIMÕTE</span>
                    <p>{step.keyIdea}</p>
                  </div>
                </div>
              )}
              {step.changes && step.changes.length > 0 && (
                <div className="changes">
                  <span className="small-cap">MIS MUUTUS</span>
                  <ul>
                    {step.changes.map((c, i) => (
                      <li key={i}>
                        <span className={`chg ${c.kind === '+' ? 'add' : c.kind === '~' ? 'mod' : 'del'}`}>
                          {c.kind === '-' ? '−' : c.kind}
                        </span>
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="panel-nav">
            {index > 0 ? (
              <a className="btn" href={href(mod.id, index)}>
                <IconArrowLeft /> Tagasi
              </a>
            ) : (
              <a className="btn" href={href()}>
                <IconArrowLeft /> Moodulid
              </a>
            )}
            <a className="btn primary grow" href={nextHref}>
              <span>{nextLabel}</span>
              <IconArrowRight />
            </a>
          </div>
          <p className="kbd-hint">
            <kbd>←</kbd>
            <kbd>→</kbd> samm · <kbd>R</kbd> uuesti · <kbd>Tühik</kbd> paus
          </p>
        </div>

        {mod.learn && mod.learn.length > 0 && (
          <div className="panel-card learn">
            <span className="small-cap strong">ÕPID</span>
            <ul>
              {mod.learn.map((l, i) => {
                const done = seen.includes(l.step - 1);
                return (
                  <li key={i} className={done ? 'done' : ''}>
                    <span className="box">{done && <IconCheck />}</span>
                    {l.text}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
