import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PayButton = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const location = useLocation();

    const paymentOptions = [
        { label: 'Pago Medellín', sub: 'Sede Laureles', url: 'https://pagos.palomma.com/escalainmobiliariamedellin/auth/login' },
        { label: 'Pago Sabaneta', sub: 'Sede Parque', url: 'https://pagos.palomma.com/escalainmobiliariasabaneta/auth/login' },
    ];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="group relative flex items-center gap-2 rounded-full font-semibold overflow-hidden transition-all duration-300 active:scale-95 px-3 py-2 text-xs lg:px-4 lg:py-2.5 lg:text-sm"
                style={{
                    background: 'linear-gradient(135deg, #1a3c6e 0%, #0f6cbf 100%)',
                    color: '#fff',
                    boxShadow: open
                        ? '0 0 0 3px rgba(14,165,233,0.25), 0 4px 18px rgba(15,108,191,0.45)'
                        : '0 4px 14px rgba(15,108,191,0.35)',
                }}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label="Pagos en línea"
            >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }} />
                <svg className="relative w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
                <span className="relative whitespace-nowrap">
                    <span className="lg:hidden">Pagos</span>
                    <span className="hidden lg:inline">Pagos en línea</span>
                </span>
                <svg className={`relative w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2.5 w-56 rounded-2xl overflow-hidden z-[200]"
                    style={{
                        boxShadow: '0 16px 48px rgba(15,108,191,0.15), 0 2px 8px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(14,165,233,0.12)',
                        background: '#fff',
                    }}>
                    <div className="px-4 py-3 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg, #1a3c6e, #0f6cbf)' }}>
                        <span className="text-xs font-bold text-white tracking-wide">Selecciona tu sede</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest"
                            style={{ background: 'rgba(255,255,255,0.18)', color: '#bfdbfe' }}>PSE</span>
                    </div>
                    {paymentOptions.map(({ label, sub, url }) => (
                        <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-sky-50 transition-colors group/item border-b border-gray-50 last:border-0">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover/item:text-sky-700 transition-colors leading-tight">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover/item:text-sky-500 transition-all flex-shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}
                    <div className="px-4 py-2.5 flex items-center gap-1.5 bg-slate-50">
                        <svg className="w-3 h-3 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
                        </svg>
                        <span className="text-[10px] text-gray-400 font-medium">Transacción segura · Palomma</span>
                    </div>
                </div>
            )}
        </div>
    );
};

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

        // passive:true le dice a iOS que NO vamos a llamar preventDefault,
        // así el navegador no espera nuestro handler y el scroll fluye.
        window.addEventListener('scroll', handleScroll, { passive: true });
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
                            isOpen
                                ? 'bg-escala-accent text-white shadow-md shadow-orange-200'
                                : 'text-escala-dark hover:bg-escala-accent hover:text-white focus:bg-escala-accent focus:text-white focus:outline-none'
                        }`}
                    >
                        <span className="font-semibold text-[15px] flex-1 text-left">{link.label}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                                                ? 'bg-escala-accent text-white'
                                                : 'text-gray-600 hover:bg-escala-accent hover:text-white focus:bg-escala-accent focus:text-white focus:outline-none'
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
                                        className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:bg-escala-accent hover:text-white focus:bg-escala-accent focus:text-white focus:outline-none rounded-xl transition-all"
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
                        : 'text-escala-dark hover:bg-escala-accent hover:text-white focus:bg-escala-accent focus:text-white focus:outline-none'
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
                    ? 'max-w-6xl bg-white/90 md:bg-white/80 backdrop-blur-sm md:backdrop-blur-3xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-3 px-4 sm:px-6 md:px-8 rounded-[40px] translate-y-4 w-[95%]'
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
                    <PayButton />
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

                        {/* Redes sociales — siempre al final del menú móvil */}
                        <div className="pt-6 mt-4 border-t border-gray-100">
                            <p className="px-4 mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                Síguenos
                            </p>
                            <div className="flex gap-3 px-4">
                                <a
                                    href="https://www.instagram.com/escalainmobiliariamedellin/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label="Instagram de Escala Inmobiliaria"
                                    className="group flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-escala-accent hover:border-escala-accent hover:text-white focus:bg-escala-accent focus:border-escala-accent focus:text-white focus:outline-none active:scale-95 transition-all"
                                >
                                    <svg className="w-5 h-5 text-escala-accent group-hover:text-white group-focus:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                    Instagram
                                </a>
                                <a
                                    href="https://www.tiktok.com/@escala_inmobiliaria"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label="TikTok de Escala Inmobiliaria"
                                    className="group flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-escala-accent hover:border-escala-accent hover:text-white focus:bg-escala-accent focus:border-escala-accent focus:text-white focus:outline-none active:scale-95 transition-all"
                                >
                                    <svg className="w-5 h-5 text-escala-accent group-hover:text-white group-focus:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                                    </svg>
                                    TikTok
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Navbar;
