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
            <button
                onClick={() => setOpen((v) => !v)}
                className="group relative flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm overflow-hidden transition-all duration-300 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1a3c6e 0%, #0f6cbf 60%, #0ea5e9 100%)', color: '#fff', boxShadow: open ? '0 0 0 3px rgba(14,165,233,0.3), 0 4px 18px rgba(15,108,191,0.45)' : '0 4px 14px rgba(15,108,191,0.4)' }}
                aria-haspopup="true"
                aria-expanded={open}
            >
                {/* shimmer */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)' }} />
                {/* Card icon — siempre visible */}
                <svg className="relative w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
                {/* "Pagar" solo en desktop */}
                <span className="relative hidden lg:inline tracking-wide whitespace-nowrap">Pagar</span>
                {/* PSE badge — siempre visible */}
                <span className="relative px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider" style={{ background: 'rgba(255,255,255,0.18)', color: '#bfdbfe', letterSpacing: '0.12em' }}>PSE</span>
                <svg className={`relative w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2.5 w-52 rounded-2xl overflow-hidden z-[200]"
                    style={{ boxShadow: '0 12px 40px rgba(15,108,191,0.18), 0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(14,165,233,0.15)', background: '#fff' }}>
                    {/* Header */}
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1a3c6e, #0f6cbf)' }}>
                        <svg className="w-4 h-4 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span className="text-xs font-bold text-sky-100 tracking-wide uppercase">Pago en línea seguro</span>
                    </div>
                    {/* Options */}
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
                            className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors group/item border-b border-gray-50 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover/item:text-sky-700 transition-colors">{label}</p>
                                <p className="text-xs text-gray-400">{sub}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover/item:text-sky-500 group-hover/item:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}
                    {/* Footer note */}
                    <div className="px-4 py-2 flex items-center gap-1.5" style={{ background: '#f8fafc' }}>
                        <svg className="w-3 h-3 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14.414l-3.707-3.707 1.414-1.414L11 13.586l5.293-5.293 1.414 1.414L11 16.414z"/></svg>
                        <span className="text-[10px] text-gray-400 font-medium">Transacción 100% segura · Palomma</span>
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
        { label: 'Inicio', href: '/', isPage: true, icon: '🏠' },
        { label: 'Nosotros', href: '/nosotros', isPage: true, icon: '👥' },
        { 
            label: 'Propiedades', 
            href: '/propiedades',
            isPage: true,
            icon: '🏢'
        },
        { 
            label: 'Nuestras Sedes',
            href: '#',
            icon: '📍',
            children: [
                { label: 'Sede Medellín', href: '/sede-medellin', isPage: true },
                { label: 'Sede Sabaneta', href: '/sede-sabaneta', isPage: true }
            ]
        },
        {
            label: 'Formularios',
            href: '#',
            icon: '📄',
            children: [
                { label: 'FianzaCredito', href: 'https://fianzacredito.com/index.php/formatos/' },
                { label: 'Libertador', href: 'https://www.ellibertador.co/arrendatario' }
            ]
        }
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

        const handleClick = (e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            if (link.isPage) {
                window.location.href = link.href;
            }
        };

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
                                child.isPage ? (
                                    <Link
                                        key={childIndex}
                                        to={child.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2.5 px-3 text-sm font-medium text-gray-600 hover:text-escala-accent hover:bg-orange-50 rounded-xl transition-all"
                                    >
                                        {child.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={childIndex}
                                        href={child.href}
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

        const content = (
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer ${
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

        return content;
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
                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                            Pago en Línea
                        </p>
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
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all"
                                style={{ background: 'linear-gradient(135deg, #1a3c6e 0%, #0f6cbf 100%)', boxShadow: '0 4px 14px rgba(15,108,191,0.35)' }}
                            >
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-sm leading-tight">{label}</p>
                                    <p className="text-[10px] text-sky-200 font-medium">{sub}</p>
                                </div>
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider" style={{ background: 'rgba(255,255,255,0.15)', color: '#bfdbfe' }}>PSE</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
