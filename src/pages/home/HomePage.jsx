import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import CompanyNav from '../../components/layout/CompanyNav';

const services = [
    { id: 'cctv-installation', title: 'CCTV Installation', icon: '📹', desc: 'Secure your premises with our high-definition 4K camera setups.' },
    { id: 'networking', title: 'Networking', icon: '🌐', desc: 'Robust and scalable networking infrastructure design and implementation.' },
    { id: 'software-development', title: 'Software Development', icon: '💻', desc: 'Custom software, web applications, and mobile app development.' },
    { id: 'telecalling', title: 'Telecalling', icon: '📞', desc: 'Expert outbound and inbound telecalling services for your business.' },
    { id: 'study-abroad', title: 'Study Abroad', icon: '✈️', desc: 'End-to-end guidance for students aspiring to pursue higher education.' }
];

// 3D Tilt Card Component
function TiltCard({ service }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useTransform(x, [-0.5, 0.5], ["15deg", "-15deg"]);
    const mouseYSpring = useTransform(y, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Link to={`/service/${service.id}`}>
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateY: mouseXSpring,
                    rotateX: mouseYSpring,
                    transformStyle: "preserve-3d",
                }}
                className="relative h-64 bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center group hover:border-[#E5B842]/50 transition-colors cursor-pointer"
            >
                {/* Glossy inner glow effect */}
                <div 
                    style={{ transform: "translateZ(30px)" }}
                    className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl pointer-events-none"
                />

                <div 
                    style={{ transform: "translateZ(50px)" }}
                    className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
                >
                    {service.icon}
                </div>
                
                <h3 
                    style={{ transform: "translateZ(40px)" }}
                    className="text-xl font-bold text-white mb-2"
                >
                    {service.title}
                </h3>
                
                <p 
                    style={{ transform: "translateZ(30px)" }}
                    className="text-sm text-gray-400 px-2"
                >
                    {service.desc}
                </p>

                 {/* Hover Glow Behind */}
                 <div className="absolute inset-0 bg-[#E5B842] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </motion.div>
        </Link>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-body selection:bg-brand-gold/30 scroll-smooth">
            <CompanyNav />

            {/* Hero Section with Background Image */}
            <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Premium Dark Background Image Overlay */}
                <div 
                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
                    style={{ 
                        backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
                    }}
                />
                {/* Gradient fade out to bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-0" />
                
                <div className="relative z-10 max-w-5xl mx-auto pt-20">
                     <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8">
                            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Welcome to Navora Tech 🚀</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-8xl font-semibold tracking-tight leading-[1.05] mb-8">
                            Empowering Your <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#E5B842]">Digital Future</span>
                        </h1>
                        
                        <p className="text-gray-400 text-lg md:text-xl font-normal max-w-2xl mx-auto mb-12 leading-relaxed">
                            Premium services in CCTV installation, seamless networking, innovative software development, and professional telecalling.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <a href="#services" className="px-8 py-4 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Explore Services
                            </a>
                            <a href="#about" className="px-8 py-4 border border-white/20 bg-black/40 backdrop-blur-md text-white text-sm font-bold rounded-full hover:border-white hover:bg-white/10 transition-all">
                                Learn More
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">
                            Beyond Expectations.
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            At Navora Tech, we're dedicated to delivering world-class technology solutions. Whether securing your premises with state-of-the-art CCTV systems, building scalable infrastructure, or developing cutting-edge software, we bring precision and reliability to everything we do.
                        </p>
                        <ul className="space-y-4 mb-8 text-sm font-medium text-gray-300">
                            <li className="flex items-center gap-3"><span className="text-[#E5B842]">✦</span> 24/7 Expert Support</li>
                            <li className="flex items-center gap-3"><span className="text-[#E5B842]">✦</span> Enterprise-Grade Solutions</li>
                            <li className="flex items-center gap-3"><span className="text-[#E5B842]">✦</span> Global Study Abroad Network</li>
                        </ul>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Glow Behind */}
                        <div className="absolute inset-0 bg-[#E5B842]/20 blur-[100px] rounded-full pointer-events-none" />
                        <img 
                            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800" 
                            alt="About Navora Tech" 
                            className="relative z-10 w-full h-[400px] object-cover rounded-3xl border border-white/10"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Services Section (3D Tilt Effect) */}
            <section id="services" className="py-24 px-6 bg-[#090909] relative border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4">Our Services</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Hover over our service offerings below to interact with them and click to view detailed information and pricing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
                        {services.map((service) => (
                            <TiltCard key={service.id} service={service} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA / Contact Section */}
            <section id="contact" className="py-32 px-6 text-center border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-display font-semibold mb-6">
                        Ready to elevate your business?
                    </h2>
                    <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                        Get in touch with us today to discuss your next big project or service requirement.
                    </p>
                    <a 
                        href="mailto:jishnu3039@gmail.com" 
                        className="inline-block px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/20"
                    >
                        Contact jishnu3039@gmail.com
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black text-center relative z-10">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
                    NAVORA TECH
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-[0.1em]">
                    © {new Date().getFullYear()} All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}
