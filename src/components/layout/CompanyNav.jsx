import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CompanyNav() {
    const location = useLocation();
    
    return (
        <nav className="fixed w-full flex items-center justify-between px-8 md:px-16 py-5 top-0 z-50 bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/5 transition-all">
            <div className="flex items-center gap-3">
                <Link to="/">
                    <span className="font-display font-light text-2xl tracking-[0.1em] text-white">
                        NAVORA <span className="font-bold text-brand-gold">TECH</span>
                    </span>
                </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
                <Link 
                    to="/" 
                    className={`hover:text-brand-gold transition-colors ${location.pathname === '/' ? 'text-brand-gold' : ''}`}
                >
                    Home
                </Link>
                <a href="/#about" className="hover:text-brand-gold transition-colors">About</a>
                <a href="/#services" className="hover:text-brand-gold transition-colors">Services</a>
                <a 
                    href="mailto:jishnu3039@gmail.com" 
                    className="hover:text-brand-gold transition-colors"
                >
                    Contact
                </a>
            </div>
            
            <div className="flex items-center gap-5">
                <a 
                    href="mailto:jishnu3039@gmail.com" 
                    className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/20 hover:scale-105"
                >
                    Get in Touch
                </a>
            </div>
        </nav>
    );
}
