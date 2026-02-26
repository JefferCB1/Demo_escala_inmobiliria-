import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);
    const location = useLocation();

    useEffect(() => {
        setMobileMenuOpen(false);
        setOpenAccordion(null);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const navLinks = [
        { label: 'Inicio', href: '/', isPage: true, icon: '🏠' },
        { label: 'Nosotros', href: '#', icon: '👥' },
        { 
            label: 'Propiedades', 
            href: '/propiedades',
            isPage: true,
            icon: '🏢'
        },
        { 
            label: 'Propietarios', 
            href: '#',
            icon: '🔑',
            children: [
                { label: 'Sede Medellín', href: '#' },
                { label: 'Sede Sabaneta', href: '#' }
            ]
        },
        { 
            label: 'Arrendatarios', 
            href: '#',
            icon: '📋',
            children: [
                { label: 'Sede Medellín', href: '#' },
                { label: 'Sede Sabaneta', href: '#' }
            ]
        },
        { 
            label: 'Formularios', 
            href: '#',
            icon: '📄',
            children: [
                { label: 'FinanzaCredito', href: '#' },
                { label: 'Libertador', href: '#' }
            ]
        }
    ];

    const renderLink = (link) => {
        if (link.isPage) {
            return <Link to={link.href} className="hover:text-escala-accent transition-colors py-2">{link.label}</Link>;
        }
        return <a href={link.href} className="hover:text-escala-accent transition-colors py-2">{link.label}</a>;
    };

    const renderChildLink = (child) => {
        if (child.isPage) {
            return <Link to={child.href} className="block px-4 py-2 hover:bg-gray-50 hover:text-escala-accent">{child.label}</Link>;
        }
        return <a href={child.href} className="block px-4 py-2 hover:bg-gray-50 hover:text-escala-accent">{child.label}</a>;
    };

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const MobileLink = ({ link, index }) => {
        const hasChildren = link.children && link.children.length > 0;
        const isOpen = openAccordion === index;
        const isActive = location.pathname === link.href;

        if (hasChildren) {
            return (
                <div className="overflow-hidden">
                    <button
                        onClick={() => toggleAccordion(index)}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                            isOpen ? 'bg-orange-50 text-escala-accent' : 'text-escala-dark hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-semibold text-[15px] flex-1 text-left">{link.label}</span>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-escala-accent' : 'text-gray-400'}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="ml-10 mr-2 mb-2 space-y-1 border-l-2 border-orange-200 pl-3">
                            {link.children.map((child, childIndex) => (
                                <a
                                    key={childIndex}
                                    href={child.href}
                                    className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:text-escala-accent hover:bg-orange-50 rounded-xl transition-all"
                                >
                                    {child.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        const content = (
            <div
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                    isActive 
                        ? 'bg-escala-accent text-white shadow-md shadow-orange-200' 
                        : 'text-escala-dark hover:bg-gray-50'
                }`}
            >
                <span className="text-xl">{link.icon}</span>
                <span className="font-semibold text-[15px]">{link.label}</span>
                {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                )}
            </div>
        );

        if (link.isPage) {
            return <Link to={link.href}>{content}</Link>;
        }
        return <a href={link.href}>{content}</a>;
    };

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-700 pointer-events-none">
            <nav className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] w-full flex justify-between items-center
                ${scrolled
                    ? 'max-w-6xl bg-white/80 backdrop-blur-3xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-3 px-4 sm:px-6 md:px-8 rounded-[40px] translate-y-4 w-[95%]'
                    : 'max-w-7xl bg-transparent py-4 sm:py-6 px-4 sm:px-6 md:px-12 translate-y-0 w-full'
                }`}>
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <img src="/Logo_inmboliaria.png" alt="Escala Inmobiliaria Logo" className={`w-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 ${scrolled ? 'h-[35px] sm:h-[40px]' : 'h-[50px] sm:h-[70px]'}`} />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex gap-6 xl:gap-8 text-escala-dark font-medium items-center">
                    {navLinks.map((link, index) => (
                        <div key={index} className="relative group">
                            {link.children ? (
                                <>
                                    <button className="hover:text-escala-accent transition-colors flex items-center gap-1 py-2">
                                        {link.label}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        {link.children.map((child, childIndex) => (
                                            <React.Fragment key={childIndex}>
                                                {renderChildLink(child)}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                renderLink(link)
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 sm:gap-4 items-center">
                    <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 bg-escala-accent text-white rounded-full hover:bg-[#e66000] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 font-semibold text-xs sm:text-sm shadow-md whitespace-nowrap">
                        Te Asesoramos
                    </button>
                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden text-escala-dark p-2" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                        mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                />
                
                {/* Menu Panel */}
                <div 
                    className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
                        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                            <img src="/Logo_inmboliaria.png" alt="Escala" className="h-8" />
                        </Link>
                        <button 
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navLinks.map((link, index) => (
                            <MobileLink key={index} link={link} index={index} />
                        ))}
                    </div>

                    {/* Menu Footer CTA */}
                    <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                        <button className="w-full bg-gradient-to-r from-escala-accent to-orange-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all active:scale-[0.98]">
                            📞 Te Asesoramos Gratis
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            Llámanos al <span className="font-semibold text-gray-500">304 533 5855</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
