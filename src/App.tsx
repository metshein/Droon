import { useEffect } from 'react';
import { course, findModule, modules } from './content';
import { href, useRoute } from './router';
import Home from './components/Home';
import Lesson from './components/Lesson';
import Quiz from './components/Quiz';

function NotFound() {
  return (
    <main className="notfound">
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

  let view;
  let crumb: string | null = null;
  if (route.length === 0) {
    view = <Home />;
  } else if (!mod || mod.steps.length === 0) {
    view = <NotFound />;
  } else if (stepPart === 'test' && mod.quiz.length > 0) {
    crumb = `${mod.number}. ${mod.title}`;
    const next = modules.find((m) => m.number > mod.number && m.steps.length > 0);
    view = (
      <Quiz
        key={mod.id}
        storageKey={mod.id}
        title={`${mod.number}. ${mod.title}`}
        questions={mod.quiz}
        doneHref={next ? href(next.id, 1) : href()}
        doneLabel={next ? `Järgmine: ${next.title} →` : 'Avalehele'}
      />
    );
  } else {
    const n = Number(stepPart ?? 1);
    if (!Number.isInteger(n) || n < 1 || n > mod.steps.length) {
      view = <NotFound />;
    } else {
      crumb = `${mod.number}. ${mod.title}`;
      view = <Lesson mod={mod} index={n - 1} />;
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href={href()}>
          <img src="./favicon.svg" alt="" width={24} height={24} />
          {course.title}
        </a>
        {crumb && <span className="crumb">{crumb}</span>}
      </header>
      {view}
      <footer className="site-footer">© {new Date().getFullYear()} {course.author}</footer>
    </div>
  );
}
