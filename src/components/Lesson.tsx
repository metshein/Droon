import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CourseModule } from '../types';
import { href, navigate } from '../router';
import { markVisited } from '../progress';
import Scene from '../scenes';
import RichText from './RichText';

function isTyping(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.closest('input, textarea, select, [contenteditable]') !== null);
}

export default function Lesson({ mod, index }: { mod: CourseModule; index: number }) {
  const step = mod.steps[index];
  const total = mod.steps.length;
  const last = index === total - 1;
  const hasQuiz = mod.quiz.length > 0;

  useEffect(() => {
    markVisited(mod.id, index);
  }, [mod.id, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        if (!last) navigate(mod.id, index + 2);
        else if (hasQuiz) navigate(mod.id, 'test');
      } else if (e.key === 'ArrowLeft' && index > 0) {
        navigate(mod.id, index);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mod.id, index, last, hasQuiz]);

  return (
    <main className="lesson">
      <div className="progress-bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
        <motion.div className="progress-fill" animate={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="lesson-grid">
        <section className="scene-card" aria-label="Skeem">
          {/* Sama tüüpi skeem jääb samaks komponendiks, et sammude vahel saaks animeerida. */}
          <Scene key={step.scene.type} spec={step.scene} />
        </section>

        <section className="text-card">
          <p className="step-count">
            Samm {index + 1} / {total}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2>{step.title}</h2>
              <RichText text={step.text} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <nav className="step-nav" aria-label="Sammud">
        {index > 0 ? (
          <a className="btn" href={href(mod.id, index)}>
            ← Tagasi
          </a>
        ) : (
          <a className="btn ghost" href={href()}>
            ← Moodulid
          </a>
        )}

        <span className="step-counter">
          {index + 1} / {total}
        </span>
        <div className="dots">
          {mod.steps.map((s, i) => (
            <a
              key={i}
              href={href(mod.id, i + 1)}
              className={i === index ? 'dot active' : 'dot'}
              aria-label={`Samm ${i + 1}: ${s.title}`}
              aria-current={i === index ? 'step' : undefined}
            />
          ))}
        </div>

        {!last ? (
          <a className="btn primary" href={href(mod.id, index + 2)}>
            Edasi →
          </a>
        ) : hasQuiz ? (
          <a className="btn primary" href={href(mod.id, 'test')}>
            Enesekontroll →
          </a>
        ) : (
          <a className="btn primary" href={href()}>
            Valmis ✓
          </a>
        )}
      </nav>
    </main>
  );
}
