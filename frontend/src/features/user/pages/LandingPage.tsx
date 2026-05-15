import { Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center relative z-10">
          <div className="flex flex-col gap-8 items-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
              <span className="text-xs font-medium text-[var(--color-primary)] tracking-wide">
                V1.0 NOW LIVE
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Master Coding Interviews{' '}
              <br className="hidden md:block" />
              With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-cyan-400">
                Real-Time Practice
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Code problems, collaborate live, and simulate real interviews in a single platform designed for developers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="h-12 px-8 rounded-md bg-[var(--color-primary)] text-white font-bold hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(45,95,255,0.3)] transition-all flex items-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="h-12 px-8 rounded-md border border-[var(--color-primary)]/50 text-white font-bold hover:bg-[var(--color-primary)]/10 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Try Practice Mode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why ZenCode Section */}
      <section className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Why <span className="text-[var(--color-primary)]">ZenCode</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to prepare for your next technical interview in a single, integrated environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Real-Time Editor */}
            <div className="group p-6 rounded-lg bg-[#0f0f0f] border border-[#272727] hover:border-[var(--color-primary)] transition-colors duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[var(--color-primary)] group-hover:text-white group-hover:bg-[var(--color-primary)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Editor</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Collaborate live in a shared environment with syntax highlighting for 20+ languages.
              </p>
            </div>

            {/* Video + Code */}
            <div className="group p-6 rounded-lg bg-[#0f0f0f] border border-[#272727] hover:border-[var(--color-primary)] transition-colors duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[var(--color-primary)] group-hover:text-white group-hover:bg-[var(--color-primary)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Video + Code</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Seamless video and code integration to simulate the pressure of remote interviews.
              </p>
            </div>

            {/* AI Hints */}
            <div className="group p-6 rounded-lg bg-[#0f0f0f] border border-[#272727] hover:border-[var(--color-primary)] transition-colors duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[var(--color-primary)] group-hover:text-white group-hover:bg-[var(--color-primary)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">AI Hints</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Get intelligent, context-aware hints when you are stuck without giving away the solution.
              </p>
            </div>

            {/* Book Mentors */}
            <div className="group p-6 rounded-lg bg-[#0f0f0f] border border-[#272727] hover:border-[var(--color-primary)] transition-colors duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[var(--color-primary)] group-hover:text-white group-hover:bg-[var(--color-primary)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Book Mentors</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Schedule mock interview practice sessions with engineers from top tech companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black relative overflow-hidden border-t border-[#1c1c1c]">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            Start Practising Like It's a{' '}
            <span className="text-[var(--color-primary)]">Real Interview</span>.
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of developers leveling up their careers.
          </p>
          <Link
  to="/register"
  className="inline-flex h-14 px-10 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-lg font-bold hover:bg-blue-600 hover:scale-105 transform transition-all shadow-[0_0_30px_rgba(45,95,255,0.4)]"
>
  Join Now
</Link>

          <p className="mt-6 text-sm text-gray-600">
            No credit card required for basic plan.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#1c1c1c] pt-16 pb-12 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="max-w-xs">
              <div className="mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">ZenCode</span>
              </div>
              <p className="text-gray-500">
                The ultimate platform for technical interview preparation.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-gray-500 font-medium">
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                About
              </a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                Problems
              </a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                Mentors
              </a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                Privacy
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-[#1c1c1c] text-center md:text-left text-gray-600">
            <p>© 2023 ZenCode Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;