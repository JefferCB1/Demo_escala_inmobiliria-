import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BentoCard from '../components/ui/BentoCard';

gsap.registerPlugin(ScrollTrigger);

const valores = [
    {
        titulo: 'Transparencia',
        descripcion: 'Relaciones de negocio claras, argumentativas y sustantivas. Cumplimos y hacemos cumplir derechos y obligaciones.',
        icono: (
            <svg className="w-7 h-7 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
        bg: 'from-orange-100 to-orange-200'
    },
    {
        titulo: 'Calidad Humana',
        descripcion: 'A la vanguardia tecnológica sin perder la cercanía. Brindamos soluciones dialogadas y conciliatorias.',
        icono: (
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        bg: 'from-green-100 to-green-200'
    },
    {
        titulo: 'Profesionalismo',
        descripcion: 'Intermediarios y conciliadores imparciales, basados en las leyes y normativas vigentes del sector.',
        icono: (
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        bg: 'from-blue-100 to-blue-200'
    },
    {
        titulo: 'Crecimiento',
        descripcion: 'Rompemos creencias y superamos estándares del mercado. Generamos empleo, progreso y cuidamos tu patrimonio.',
        icono: (
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        bg: 'from-purple-100 to-purple-200'
    }
];

const NosotrosPage = () => {
    const mainRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.nosotros-hero-text',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out' }
            );
        }, heroRef);
        return () => ctx.revert();
    }, []);

    useGSAP(() => {
        const sections = document.querySelectorAll('.nosotros-section');
        sections.forEach((section) => {
            gsap.fromTo(section,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        end: 'top 45%',
                        scrub: 0.8,
                    },
                }
            );
        });
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="flex-1 relative z-10 w-full">
            {/* Hero */}
            <section ref={heroRef} className="relative w-full min-h-[70vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 z-0 bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-escala-dark via-slate-900 to-escala-dark"></div>
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,107,0,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,107,0,0.2) 0%, transparent 50%)'
                        }}
                    ></div>
                </div>

                <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
                    <div className="nosotros-hero-text inline-block px-4 py-1.5 bg-escala-accent/20 text-escala-accent rounded-full text-xs sm:text-sm font-bold mb-6 border border-escala-accent/30 uppercase tracking-widest">
                        Quienes Somos
                    </div>
                    <h1 className="nosotros-hero-text font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Escalando juntos hacia{' '}
                        <span className="text-escala-accent">tu mejor inversión</span>
                    </h1>
                    <p className="nosotros-hero-text text-base sm:text-lg md:text-xl text-gray-300 font-medium max-w-2xl px-4 sm:px-0">
                        Somos más que una inmobiliaria. Somos tu aliado estratégico en el Valle de Aburrá, comprometidos con la transparencia, la cercanía y el crecimiento de tu patrimonio.
                    </p>
                </div>
            </section>

            {/* Misión */}
            <section className="nosotros-section opacity-0 translate-y-8 w-full py-20 sm:py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 bg-orange-100 text-escala-accent rounded-full text-xs font-bold mb-4 border border-orange-200 uppercase tracking-widest">
                                Nuestra Misión
                            </div>
                            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-escala-dark mb-6 tracking-tight">
                                Transformar la experiencia{' '}
                                <span className="text-escala-accent">inmobiliaria</span>
                            </h2>
                            <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                                <p>
                                    Nuestra misión es dejar por lo alto el uso y función de las inmobiliarias en el Valle de Aburrá, que todos nuestros inquilinos y propietarios siempre quieran repetir su experiencia en cada relación contractual.
                                </p>
                                <p>
                                    Resolver las diferentes problemáticas que existen en los arrendamientos directos y ser parte de una solución práctica y ágil, como intermediarios y conciliadores de forma profesional, imparcial y basados en las leyes y normativas vigentes.
                                </p>
                                <p>
                                    Cumplir y hacer cumplir los derechos y obligaciones, para una relación de negocios transparente y duradera, siempre de forma argumentativa y sustantiva. Con el fin de educar e informar permanentemente a nuestros clientes.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <BentoCard className="relative overflow-hidden p-0 border-0 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
                                    alt="Misión Escala Inmobiliaria"
                                    className="w-full h-[350px] sm:h-[400px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-escala-dark/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-white font-heading font-bold text-lg">Soluciones prácticas y ágiles</p>
                                    <p className="text-white/70 text-sm font-medium">Para propietarios e inquilinos</p>
                                </div>
                            </BentoCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visión */}
            <section className="nosotros-section opacity-0 translate-y-8 w-full py-20 sm:py-24 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <BentoCard className="relative overflow-hidden p-0 border-0 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                                    alt="Visión Escala Inmobiliaria"
                                    className="w-full h-[350px] sm:h-[400px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-escala-dark/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-white font-heading font-bold text-lg">Crecimiento acelerado</p>
                                    <p className="text-white/70 text-sm font-medium">Rompiendo estándares del mercado</p>
                                </div>
                            </BentoCard>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="inline-block px-3 py-1 bg-orange-100 text-escala-accent rounded-full text-xs font-bold mb-4 border border-orange-200 uppercase tracking-widest">
                                Nuestra Visión
                            </div>
                            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-escala-dark mb-6 tracking-tight">
                                Tecnología con{' '}
                                <span className="text-escala-accent">calidad humana</span>
                            </h2>
                            <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                                <p>
                                    En la actualidad donde todo parece controlado por aplicaciones, bots e inteligencia artificial, tener una relación de negocios cercana parece una tarea imposible de lograr. En Escala Inmobiliaria podremos estar a la vanguardia con dichas tecnologías, pero sin dejar a un lado la calidad humana para nuestros clientes y colaboradores, quienes confían en nosotros su patrimonio.
                                </p>
                                <p>
                                    Queremos brindar soluciones dialogadas, conciliatorias y donde exista un punto de equilibrio para todos. Que continúe el crecimiento cada vez más acelerado, rompiendo creencias y superando estándares o estadísticas del mercado.
                                </p>
                                <p>
                                    Pero más importante, conservar la esencia de los buenos negocios, el valor de la palabra y el cumplimiento oportuno. Generar empleo y progreso, crecer y cuidar el patrimonio de nuestros clientes, de la mano, escalando juntos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="nosotros-section opacity-0 translate-y-8 w-full py-20 sm:py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 bg-orange-100 text-escala-accent rounded-full text-xs font-bold mb-4 border border-orange-200 uppercase tracking-widest">
                            Lo que nos define
                        </div>
                        <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-escala-dark mb-4 tracking-tight">
                            Nuestros <span className="text-escala-accent">Pilares</span>
                        </h2>
                        <p className="text-gray-600 font-medium max-w-2xl mx-auto">
                            Los valores que guían cada decisión y cada relación con nuestros clientes y colaboradores.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {valores.map((valor, index) => (
                            <BentoCard key={index} className="flex flex-col items-start hover:-translate-y-2 transition-transform duration-500 bg-slate-50 border border-gray-100 shadow-md">
                                <div className={`w-14 h-14 bg-gradient-to-br ${valor.bg} rounded-xl flex items-center justify-center mb-5`}>
                                    {valor.icono}
                                </div>
                                <h3 className="text-xl font-heading font-bold text-escala-dark mb-3">{valor.titulo}</h3>
                                <p className="text-gray-600 font-medium leading-relaxed text-sm">{valor.descripcion}</p>
                            </BentoCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="nosotros-section opacity-0 translate-y-8 w-full py-20 sm:py-24 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto text-center">
                    <BentoCard className="relative overflow-hidden bg-gradient-to-br from-escala-dark to-slate-900 border-0 p-10 sm:p-16">
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,107,0,0.4) 0%, transparent 50%)'
                            }}
                        ></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white mb-4 tracking-tight">
                                Confía tu patrimonio en{' '}
                                <span className="text-escala-accent">buenas manos</span>
                            </h2>
                            <p className="text-gray-300 font-medium max-w-xl mx-auto mb-8">
                                Agenda una asesoría gratuita y descubre cómo podemos ayudarte a hacer crecer tu inversión inmobiliaria.
                            </p>
                            <a
                                href="https://wa.me/573045335855?text=Hola,%20quiero%20más%20información%20sobre%20Escala%20Inmobiliaria"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-escala-accent text-white rounded-full hover:bg-[#e66000] hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm sm:text-base shadow-md"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Te Asesoramos Gratis
                            </a>
                        </div>
                    </BentoCard>
                </div>
            </section>
        </main>
    );
};

export default NosotrosPage;
