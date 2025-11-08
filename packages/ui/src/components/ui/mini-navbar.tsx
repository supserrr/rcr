"use client";

import React, { useState } from 'react';
import { RCRLogo } from '../rcr-logo';

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a href={href} className="group relative inline-block overflow-hidden h-5 flex items-center text-sm">
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className="text-foreground/70">{children}</span>
        <span className="text-primary font-medium">{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoElement = (
    <RCRLogo variant="simple" width={28} height={28} className="flex-shrink-0" />
  );

  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'Counselors', href: '/counselors' },
    { label: 'About', href: '/about' },
  ];

  const loginButtonElement = (
    <a href="/signin" className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-primary/30 bg-background/80 text-foreground rounded-full hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full sm:w-auto whitespace-nowrap text-center">
      LogIn
    </a>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
       <div className="absolute inset-0 -m-2 rounded-full
                     hidden sm:block
                     bg-primary
                     opacity-30 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-50 group-hover:blur-xl group-hover:-m-3"></div>
       <a href="/signup/patient" className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 w-full sm:w-auto whitespace-nowrap text-center block">
         Signup
       </a>
    </div>
  );

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20
                       flex flex-col items-center
                       px-6 py-3 backdrop-blur-md
                       rounded-2xl sm:rounded-full
                       border border-primary/20 bg-background/90
                       shadow-lg shadow-primary/10
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-all duration-300 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center">
           {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-foreground/70 hover:text-primary transition-colors focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <a key={link.href} href={link.href} className="text-foreground/70 hover:text-primary font-medium transition-colors w-full text-center">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
