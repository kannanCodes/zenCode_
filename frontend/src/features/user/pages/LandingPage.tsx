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

      {/* Why zenCode Section */}
      <section className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Why <span className="text-[var(--color-primary)]">zenCode</span>?
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
      <footer className="bg-[#111111] border-t border-[#1c1c1c] pt-16 pb-8 text-sm">
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
                <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="hover:text-[#1DA1F2] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="hover:text-[#0A66C2] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-white font-semibold mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Problems</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mock Interviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compiler</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-6">Legal</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
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