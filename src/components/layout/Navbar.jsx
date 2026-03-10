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

    const darkHeroPages = ['/nosotros', '/sede-medellin', '/sede-sabaneta'];
    const isDarkHero = darkHeroPages.includes(location.pathname);
    const useLightText = isDarkHero && !scrolled;

    const navLinks = [
        { label: 'Inicio', href: '/', isPage: true },
        { label: 'Nosotros', href: '/nosotros', isPage: true },
        { label: 'Propiedades', href: '/propiedades', isPage: true },
        {
            label: 'Nuestras Sedes',
            children: [
                { label: 'Sede Medellín', href: '/sede-medellin', isPage: true },
                { label: 'Sede Sabaneta', href: '/sede-sabaneta', isPage: true },
            ]
        },
        {
            label: 'Formularios',
            children: [
                { label: 'FianzaCredito', href: 'https://fianzacredito.com/index.php/formatos/' },
                { label: 'Libertador', href: 'https://www.ellibertador.co/arrendatario' },
            ]
        },
    ];

    const renderLink = (link) => {
        if (link.isPage) {
            return <Link to={link.href} className="hover:text-escala-accent transition-colors py-2 inherit">{link.label}</Link>;
        }
        return <a href={link.href} className="hover:text-escala-accent transition-colors py-2 inherit">{link.label}</a>;
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
                <div>
                    <button
                        onClick={() => toggleAccordion(index)}
                        className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                            isOpen ? 'bg-orange-50 text-escala-accent' : 'text-escala-dark hover:bg-gray-50'
                        }`}
                    >
                        <span className="font-semibold text-[15px] flex-1 text-left">{link.label}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-escala-accent' : 'text-gray-400'}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 mr-2 mt-1 mb-2 space-y-0.5 border-l-2 border-orange-200 pl-4">
                            {link.children.map((child, childIndex) => (
                                child.isPage ? (
                                    <Link
                                        key={childIndex}
                                        to={child.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block py-2.5 px-3 text-sm font-medium rounded-xl transition-all ${
                                            location.pathname === child.href
                                                ? 'text-escala-accent bg-orange-50'
                                                : 'text-gray-600 hover:text-escala-accent hover:bg-orange-50'
                                        }`}
                                    >
                                        {child.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={childIndex}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:text-escala-accent hover:bg-orange-50 rounded-xl transition-all"
                                    >
                                        {child.label}
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                    isActive
                        ? 'bg-escala-accent text-white shadow-md shadow-orange-200'
                        : 'text-escala-dark hover:bg-gray-50'
                }`}
            >
                <span className="font-semibold text-[15px] flex-1">{link.label}</span>
                {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
            </Link>
        );
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
                <div className={`hidden lg:flex gap-6 xl:gap-8 font-medium items-center transition-colors duration-700 ${useLightText ? 'text-white' : 'text-escala-dark'}`}>
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
                    {/* Mobile Menu Button */}
                    <button
                        className={`lg:hidden p-2 transition-colors duration-700 ${useLightText ? 'text-white' : 'text-escala-dark'}`}
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
                className={`fixed inset-0 z-40 lg:hidden pointer-events-auto ${mobileMenuOpen ? 'block' : 'hidden'}`}
            >
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
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

                </div>
            </div>
        </div>
    );
};

export default Navbar;
