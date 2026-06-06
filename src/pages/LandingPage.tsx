import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { Target, Users, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-32 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 mb-8 border border-blue-100">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            The #1 Student Project Matching Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Find the Perfect Team for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Next Big Idea</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Connect with skilled students, build amazing projects, and win hackathons together. Don't let a great idea remain unfinished due to lack of teammates.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                Get Started
              </Button>
            </Link>
            <Link to="/projects/browse">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-slate-300 text-slate-700 hover:bg-slate-50">
                Browse Projects
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose TEAMUP?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We make finding collaborators as easy as possible so you can focus on building.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Skill-Based Matching</h3>
              <p className="text-slate-600">Find teammates with the exact technical stack and skills required for your project idea.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hackathon Ready</h3>
              <p className="text-slate-600">Quickly form multi-disciplinary teams for upcoming college contests and global hackathons.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Profiles</h3>
              <p className="text-slate-600">Connect with real students. View their GitHub, LinkedIn, and past project history.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-white" />
          <span className="text-2xl font-bold text-white">TEAMUP</span>
        </div>
        <p>© {new Date().getFullYear()} TeamUp Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
