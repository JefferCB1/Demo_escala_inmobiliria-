import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PAY_URL = 'https://pagos.palomma.com/escalainmobiliariamedellin/auth/login';

const PayButton = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* ── Botón principal ── */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="group relative flex items-center gap-2 rounded-full font-semibold overflow-hidden transition-all duration-300 active:scale-95
                           px-3 py-2 text-xs
                           lg:px-4 lg:py-2.5 lg:text-sm"
                style={{
                    background: 'linear-gradient(135deg, #1a3c6e 0%, #0f6cbf 100%)',
                    color: '#fff',
                    boxShadow: open
                        ? '0 0 0 3px rgba(14,165,233,0.25), 0 4px 18px rgba(15,108,191,0.45)'
                        : '0 4px 14px rgba(15,108,191,0.35)',
                }}
                aria-haspopup="true"
                aria-expanded={open}
            >
                {/* shimmer hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }} />

                {/* Ícono tarjeta */}
                <svg className="relative w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>

                {/* Texto — oculto en móvil, visible en desktop */}
                <span className="relative hidden lg:inline whitespace-nowrap">Pagos en línea</span>

                {/* Chevron */}
                <svg className={`relative w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div className="absolute right-0 top-full mt-2.5 w-56 rounded-2xl overflow-hidden z-[200]"
                    style={{
                        boxShadow: '0 16px 48px rgba(15,108,191,0.15), 0 2px 8px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(14,165,233,0.12)',
                        background: '#fff',
                    }}>

                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg, #1a3c6e, #0f6cbf)' }}>
                        <span className="text-xs font-bold text-white tracking-wide">Selecciona tu sede</span>
                        {/* Badge PSE en el dropdown */}
                        <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest"
                            style={{ background: 'rgba(255,255,255,0.18)', color: '#bfdbfe' }}>PSE</span>
                    </div>

                    {/* Opciones */}
                    {[
                        { label: 'Pago Medellín', sub: 'Sede Laureles' },
                        { label: 'Pago Sabaneta', sub: 'Sede Parque' },
                    ].map(({ label, sub }) => (
                        <a
                            key={label}
                            href={PAY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-sky-50 transition-colors group/item border-b border-gray-50 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover/item:text-sky-700 transition-colors leading-tight">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover/item:text-sky-500 group-hover/item:translate-x-0.5 transition-all flex-shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}

                    {/* Footer seguridad */}
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
                className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
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

                    {/* Menu Footer CTA */}
                    <div className="p-5 border-t border-gray-100 space-y-2" style={{ background: '#f8fafc' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                                </svg>
                                Pagos en línea
                            </p>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest text-sky-700"
                                style={{ background: '#dbeafe' }}>PSE</span>
                        </div>
                        {[
                            { label: 'Pago Medellín', sub: 'Sede Laureles' },
                            { label: 'Pago Sabaneta', sub: 'Sede Parque' },
                        ].map(({ label, sub }) => (
                            <a
                                key={label}
                                href={PAY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-white active:scale-[0.98] transition-all"
                                style={{ background: 'linear-gradient(135deg, #1a3c6e 0%, #0f6cbf 100%)', boxShadow: '0 4px 14px rgba(15,108,191,0.3)' }}
                            >
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-sm leading-tight">{label}</p>
                                    <p className="text-[11px] text-sky-200 mt-0.5">{sub}</p>
                                </div>
                                <svg className="w-4 h-4 text-sky-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        ))}
                        <p className="text-center text-[10px] text-gray-400 pt-1 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
                            </svg>
                            Transacción segura · Palomma
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
