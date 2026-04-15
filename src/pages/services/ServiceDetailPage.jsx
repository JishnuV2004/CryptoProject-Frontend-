import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CompanyNav from '../../components/layout/CompanyNav';

const servicesData = {
    'cctv-installation': {
        title: 'CCTV Installation & Service',
        description: 'Professional CCTV camera installation, maintenance, and repair services for commercial and residential properties ensuring 24/7 security.',
        charges: 'Starting from $199/camera',
        features: ['High-definition 4K Cameras', 'Remote viewing on Mobile', 'Night Vision & Motion Detection', '1-Year Free Maintenance'],
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1200'
    },
    'networking': {
        title: 'Networking Solutions',
        description: 'Robust and scalable networking infrastructure design, implementation, and troubleshooting for seamless business operations.',
        charges: 'Custom pricing based on scope',
        features: ['Structured Cabling', 'Wi-Fi Setup & Optimization', 'Firewall & Security Configuration', 'Server Rack Management'],
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200'
    },
    'software-development': {
        title: 'Software Development',
        description: 'Custom software, web applications, and mobile app development tailored exactly to your business needs.',
        charges: 'Starting from $1,500/project',
        features: ['UI/UX Design', 'Full-stack Web Apps', 'iOS & Android Development', 'Cloud Deployment & DevOps'],
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200'
    },
    'telecalling': {
        title: 'Telecalling Services',
        description: 'Expert outbound and inbound telecalling services for lead generation, customer care, and market research.',
        charges: 'Starting from $15/hour per agent',
        features: ['Lead Generation', 'Customer Support (24/7)', 'Telemarketing', 'Multilingual Support'],
        image: 'https://images.unsplash.com/photo-1534536281715-e28d76589b26?auto=format&fit=crop&q=80&w=1200'
    },
    'study-abroad': {
        title: 'Study Abroad Consultancy',
        description: 'End-to-end guidance for students aspiring to pursue higher education in top universities worldwide.',
        charges: 'Consultation starts at $99',
        features: ['University Selection', 'Visa Assistance', 'SOP & Resume Building', 'Pre-departure Briefing'],
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200'
    }
};

export default function ServiceDetailPage() {
    const { id } = useParams();
    const service = servicesData[id];

    if (!service) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-body">
                <CompanyNav />
                <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
                <Link to="/" className="text-brand-gold hover:underline">Go back Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-body selection:bg-white/30">
            <CompanyNav />
            
            <main className="pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                        <span>←</span> Back to Services
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight">
                            {service.title}
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {service.description}
                        </p>
                        
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-xl font-medium text-white mb-4">Service Details</h3>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-gray-400">Pricing / Charges</span>
                                <span className="font-bold text-[#E5B842]">{service.charges}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-3">Key Features:</span>
                                <ul className="space-y-2">
                                    {service.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <span className="text-[#E5B842]">✓</span> {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <a 
                            href="mailto:jishnu3039@gmail.com" 
                            className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                        >
                            Enquire Now
                        </a>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative rounded-3xl overflow-hidden aspect-square border border-white/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <img 
                            src={service.image} 
                            alt={service.title} 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
