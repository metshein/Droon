import { useEffect, useState } from 'react';
import type { QuizQuestion } from '../types';
import { saveQuizResult } from '../progress';

interface Props {
  /** Salvestusvõti: mooduli id või "koondtest" */
  storageKey: string;
  title: string;
  questions: QuizQuestion[];
  /** Link, kuhu viib nupp pärast testi */
  doneHref: string;
  doneLabel: string;
}

/** Vastusevariantide juhuslik järjekord, et õige vastus ei oleks alati samal kohal. */
function shuffledOrders(questions: QuizQuestion[]) {
  return questions.map((q) => {
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });
}

export default function Quiz({ storageKey, title, questions, doneHref, doneLabel }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [orders, setOrders] = useState(() => shuffledOrders(questions));
  const answered = answers.filter((a) => a !== null).length;
  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const finished = answered === questions.length;

  useEffect(() => {
    if (finished) saveQuizResult(storageKey, score, questions.length);
  }, [finished, score, storageKey, questions.length]);

  const choose = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    setAnswers(answers.map((a, i) => (i === qi ? oi : a)));
  };

  return (
    <main className="page quiz">
      <header className="quiz-head">
        <p className="crumbs">Enesekontroll</p>
        <h1>{title}</h1>
        <p className="hint">
          Vastatud {answered} / {questions.length}
        </p>
      </header>

      <ol className="questions">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={qi} className="question">
              <h2>{q.question}</h2>
              <div className="options" role="group">
                {orders[qi].map((oi, pos) => {
                  let cls = 'option';
                  if (chosen !== null) {
                    if (oi === q.correct) cls += ' correct';
                    else if (oi === chosen) cls += ' wrong';
                    else cls += ' dim';
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      className={cls}
                      onClick={() => choose(qi, oi)}
                      disabled={chosen !== null}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + pos)}</span>
                      {q.options[oi]}
                    </button>
                  );
                })}
              </div>
              {chosen !== null && (
                <p className={chosen === q.correct ? 'explanation ok' : 'explanation bad'}>
                  <strong>{chosen === q.correct ? 'Õige. ' : 'Vale. '}</strong>
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {finished && (
        <section className="quiz-result">
          <h2>
            Tulemus: {score} / {questions.length}
          </h2>
          <p>
            {score === questions.length
              ? 'Suurepärane, kõik õige!'
              : score / questions.length >= 0.7
                ? 'Hea tulemus. Vaata valesti vastatud küsimuste selgitused üle.'
                : 'Tasub moodul veel kord läbi käia.'}
          </p>
          <div className="row">
            <button type="button" className="btn" onClick={() => {
                setAnswers(questions.map(() => null));
                setOrders(shuffledOrders(questions));
              }}>
              Proovi uuesti
            </button>
            <a className="btn primary" href={doneHref}>
              {doneLabel}
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
