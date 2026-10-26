import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tokenService } from '../../../shared/lib/token';

interface ScriptLine {
  speaker: 'a' | 'b';
  html: string;
}

const CODE_SCRIPT: ScriptLine[] = [
  { speaker: 'a', html: '<b class="k">def</b> <b class="f">two_sum</b>(nums, target):' },
  { speaker: 'b', html: '    seen = {}' },
  { speaker: 'b', html: '    <b class="k">for</b> i, n <b class="k">in</b> <b class="f">enumerate</b>(nums):' },
  { speaker: 'a', html: '        # can you do it in one pass?' },
  { speaker: 'b', html: '        <b class="k">if</b> target - n <b class="k">in</b> seen:' },
  { speaker: 'b', html: '            <b class="k">return</b> [seen[target - n], i]' },
  { speaker: 'b', html: '        seen[n] = i' },
];

const HINT_DATA = [
  'Think about what you need to remember as you walk through the list.',
  'For each number, what other number would complete the target?',
  'A dictionary lets you check for that number in one step.',
];

const HEAT_LEVELS = [0, 1, 0, 2, 3, 1, 0, 3, 2, 1, 3, 0, 2, 3, 3, 1, 0, 2, 3, 3, 2, 1, 3, 3, 3, 0, 2, 3, 1, 3];

const LandingPage = () => {
  const navigate = useNavigate();
  const preRef = useRef<HTMLPreElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const runRef = useRef<HTMLSpanElement>(null);

  const [hintIndex, setHintIndex] = useState(0);

  const isAuthenticated = !!tokenService.getAccessToken();

  useEffect(() => {
    const token = tokenService.getAccessToken();
    if (token) {
      const payload = tokenService.getTokenPayload();
      const role = payload?.role as string | undefined;
      if (role === 'mentor') {
        navigate('/mentor/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  // Code editor typewriter simulation
  useEffect(() => {
    const pre = preRef.current;
    const status = statusRef.current;
    const run = runRef.current;
    if (!pre || !status || !run) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Helper to strip HTML tags for typing
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || '';
    };

    const runSimulation = () => {
      pre.innerHTML = '';
      if (run) run.textContent = '';
      if (status) status.textContent = 'Live session';

      const rows = CODE_SCRIPT.map(() => {
        const span = document.createElement('span');
        span.className = 'ln';
        pre.appendChild(span);
        return span;
      });

      const finish = () => {
        rows.forEach((r, idx) => {
          r.className = 'ln';
          r.innerHTML = CODE_SCRIPT[idx].html;
        });
        if (run) run.textContent = '✓ 2 of 2 tests passed';
        if (status) status.textContent = 'Live session';

        // Pause before looping to keep the hero lively
        timeoutId = setTimeout(() => {
          if (!isCancelled) runSimulation();
        }, 7000);
      };

      if (reduceMotion) {
        finish();
        return;
      }

      let lineIdx = 0;
      let charIdx = 0;

      const tick = () => {
        if (isCancelled) return;
        if (lineIdx >= CODE_SCRIPT.length) {
          finish();
          return;
        }

        const currentLine = CODE_SCRIPT[lineIdx];
        const plainText = stripHtml(currentLine.html);

        rows.forEach((r) => {
          r.className = 'ln';
        });

        if (status) {
          status.textContent = currentLine.speaker === 'a' ? 'Mentor is typing' : 'You are typing';
        }

        charIdx++;
        rows[lineIdx].className = 'ln ' + currentLine.speaker;

        if (charIdx < plainText.length) {
          rows[lineIdx].textContent = plainText.slice(0, charIdx);
          timeoutId = setTimeout(tick, 28 + Math.random() * 30);
        } else {
          rows[lineIdx].innerHTML = currentLine.html;
          lineIdx++;
          charIdx = 0;
          timeoutId = setTimeout(tick, 260);
        }
      };

      tick();
    };

    runSimulation();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleHintClick = () => {
    if (hintIndex >= HINT_DATA.length) {
      setHintIndex(0);
    } else {
      setHintIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="zen-landing" data-theme="light">
      {/* Navigation */}
      <div className="wrap">
        <nav>
          <a className="logo" href="#top">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M30 9a14 14 0 1 0 5 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            zenCode
          </a>
          <div className="links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            {isAuthenticated ? (
              <>
                <Link to="/problems">Problems</Link>
                <Link to="/dashboard" className="btn">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/register" className="btn">
                  Start practicing
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="hero" id="top">
          <div>
            <h1>
              Practice interviews like the{' '}
              <span className="enso">
                real
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M262 22C220 -4 110 -6 56 30 8 62 14 100 76 108c70 9 170 -4 204 -48 14 -18 8 -34 -8 -46" />
                </svg>
              </span>{' '}
              thing.
            </h1>
            <p className="lead">
              Solve problems, then book a mentor for a live mock interview with video, a shared editor and chat. All
              in one place, built for developers.
            </p>
            <div className="cta">
              <Link to={isAuthenticated ? '/problems' : '/register'} className="btn">
                Start practicing
              </Link>
              <a className="btn ghost" href="#how">
                See how it works
              </a>
            </div>
            <p className="fine">Practice in JavaScript or Python 3.</p>
          </div>

          <div
            className="editor"
            role="img"
            aria-label="A mentor and a candidate typing in the same code editor during a live session"
          >
            <div className="bar">
              <span>two_sum.py</span>
              <span className="who">
                <i className="a">Mentor</i>
                <i className="b">You</i>
              </span>
            </div>
            <pre ref={preRef} id="code" aria-hidden="true"></pre>
            <div className="ed-foot">
              <span ref={statusRef} id="status">
                Live session
              </span>
              <span ref={runRef} className="ok" id="run"></span>
            </div>
          </div>
        </header>
      </div>

      {/* How it works Section */}
      <section id="how">
        <div className="wrap">
          <h2>From first problem to mock interview</h2>
          <div className="steps">
            <div className="step">
              <h3>Practice problems</h3>
              <p>Work through the library, run your code against test cases, and submit when you are ready.</p>
            </div>
            <div className="step">
              <h3>Book a mentor</h3>
              <p>Browse mentor profiles and pick a slot from their available times.</p>
            </div>
            <div className="step">
              <h3>Go live</h3>
              <p>Join the session room, solve together, then leave a rating and review.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <div className="wrap">
          <h2>Everything you need to get interview-ready</h2>
          <div className="feat">
            {/* AI Hints Bento Card */}
            <div className="f big">
              <div>
                <h3>Hints that don’t spoil it</h3>
                <p>
                  Stuck? Ask the AI for a nudge. Hints build up one at a time, so you get unblocked without seeing the
                  full solution.
                </p>
              </div>
              <div>
                <div className="hints" id="hints" aria-live="polite">
                  {hintIndex === 0 ? (
                    <div className="hints-empty" id="he">
                      Two Sum: no hints yet. Try solving it first.
                    </div>
                  ) : (
                    HINT_DATA.slice(0, hintIndex).map((hint, idx) => (
                      <div key={idx} className="hint">
                        {hint}
                      </div>
                    ))
                  )}
                </div>
                <div className="hint-row" style={{ marginTop: '14px' }}>
                  <button className="btn" id="hb" type="button" onClick={handleHintClick}>
                    {hintIndex >= HINT_DATA.length ? 'Start over' : 'Get a hint'}
                  </button>
                  <output id="hc">
                    {hintIndex} of {HINT_DATA.length} hints used
                  </output>
                </div>
              </div>
            </div>

            {/* Run in browser */}
            <div className="f sm">
              <h3>Run it in your browser</h3>
              <p>Write code in the same editor VS Code uses. Run it in a sandbox and see which test cases pass or fail.</p>
              <div className="chips">
                <span>JavaScript</span>
                <span>Python 3</span>
              </div>
            </div>

            {/* Habit Heatmap */}
            <div className="f sm">
              <h3>Build a daily habit</h3>
              <p>Keep your streak alive and watch your activity fill in over time.</p>
              <div className="heat" id="heat" aria-label="Sample activity heatmap">
                {HEAT_LEVELS.map((lvl, idx) => (
                  <i key={idx} className={lvl > 0 ? `l${lvl}` : undefined} />
                ))}
              </div>
            </div>

            {/* Full width feature */}
            <div className="f" style={{ gridColumn: '1 / -1', borderRadius: '22px 22px 80px 22px' }}>
              <h3>A live room that feels like the real interview</h3>
              <p style={{ maxWidth: '70ch' }}>
                Video call, screen sharing, a code editor you both type in, and chat that keeps its history. Either of
                you can run the code, and mentors can swap the problem mid-session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="end" id="start">
        <div className="wrap">
          <h2>Pick a problem and start</h2>
          <Link to={isAuthenticated ? '/problems' : '/register'} className="btn">
            Start practicing
          </Link>
        </div>
      </section>

      {/* Retained Original Footer */}
      <footer className="bg-[#111111] border-t border-[#1c1c1c] pt-16 pb-8 text-sm font-mono text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="text-2xl font-bold text-white tracking-wide">zenCode</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                Elevate your coding skills with our comprehensive platform designed for developers.
              </p>
              <div className="flex items-center gap-4 text-gray-500">
                <a
                  href="https://github.com/kannanCodes/zenCode_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary)] transition-colors"
                  aria-label="zenCode GitHub Repository"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#1DA1F2] transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#0A66C2] transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-white font-semibold mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <Link to="/problems" className="hover:text-white transition-colors">
                    Problems
                  </Link>
                </li>
                <li>
                  <Link to="/candidate/mentors" className="hover:text-white transition-colors">
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compiler
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-6">Legal</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1c1c1c] text-center text-gray-500">
            <p>© 2026 zenCode. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;