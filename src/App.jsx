import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import PropertyGrid from './components/sections/PropertyGrid';
import PropertyExplorer from './components/sections/PropertyExplorer';
import Testimonials from './components/sections/Testimonials';
import GlobalLayout from './components/layout/GlobalLayout';
import PortalLinks from './components/ui/PortalLinks';
import { StickyBottomBar } from './components/ui/StickyBottomBar';
import { ExitIntentModal } from './components/ui/ExitIntentModal';
import FloatingChatbot from './components/ui/FloatingChatbot';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetail from './pages/PropertyDetail';

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
    const mainRef = useRef(null);

    useGSAP(() => {
        const sections = document.querySelectorAll('.page-section');
        
        sections.forEach((section, i) => {
            if (i === 0) return;
            
            gsap.fromTo(section, 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        end: "top 45%",
                        scrub: 0.8,
                    },
                }
            );
        });
    }, { scope: mainRef });

    return (
        <>
            <main ref={mainRef} className="flex-1 relative z-10 w-full md:mb-0">
                <div className="page-section"><Hero /></div>
                <div className="page-section opacity-0 translate-y-8"><PropertyGrid /></div>
                <div className="page-section opacity-0 translate-y-8"><PropertyExplorer /></div>
                <div className="page-section opacity-0 translate-y-8"><PortalLinks /></div>
                <div className="page-section opacity-0 translate-y-8"><Testimonials /></div>
            </main>
        </>
    );
}

function App() {
    return (
        <Router>
            <GlobalLayout>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/propiedades" element={<PropertiesPage />} />
                    <Route path="/propiedad/:id" element={<PropertyDetail />} />
                </Routes>
                <Footer />
                <StickyBottomBar />
                <FloatingChatbot />
                <ExitIntentModal />
            </GlobalLayout>
        </Router>
    );
}

export default App;
