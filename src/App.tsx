import { useEffect } from 'react';
import { findModule, modules } from './content';
import { href, useRoute } from './router';
import Shell from './components/Shell';
import Home from './components/Home';
import Lesson from './components/Lesson';
import Quiz from './components/Quiz';

function NotFound() {
  return (
    <main className="page narrow">
      <h1>Lehte ei leitud</h1>
      <a className="btn primary" href={href()}>
        Avalehele
      </a>
    </main>
  );
}

export default function App() {
  const route = useRoute();
  const [moduleId, stepPart] = route;
  const mod = findModule(moduleId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [moduleId, stepPart]);

  if (route.length === 0) {
    return (
      <Shell>
        <Home />
      </Shell>
    );
  }

  if (!mod || mod.steps.length === 0) {
    return (
      <Shell>
        <NotFound />
      </Shell>
    );
  }

  if (stepPart === 'test' && mod.quiz.length > 0) {
    const next = modules.find((m) => m.number > mod.number && m.steps.length > 0);
    return (
      <Shell moduleId={mod.id} current="test">
        <Quiz
          key={mod.id}
          storageKey={mod.id}
          title={`${String(mod.number).padStart(2, '0')}. ${mod.title}`}
          questions={mod.quiz}
          doneHref={next ? href(next.id, 1) : href()}
          doneLabel={next ? `Järgmine: ${next.title}` : 'Avalehele'}
        />
      </Shell>
    );
  }

  const n = Number(stepPart ?? 1);
  if (!Number.isInteger(n) || n < 1 || n > mod.steps.length) {
    return (
      <Shell moduleId={mod.id}>
        <NotFound />
      </Shell>
    );
  }

  return (
    <Shell moduleId={mod.id} current={n - 1}>
      <Lesson mod={mod} index={n - 1} />
    </Shell>
  );
}
