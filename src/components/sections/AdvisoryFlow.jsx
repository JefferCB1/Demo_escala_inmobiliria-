import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BentoCard from '../ui/BentoCard';

gsap.registerPlugin(ScrollTrigger);

const AdvisoryFlow = () => {
    const container = useRef(null);
    const cardsRef = useRef([]);

    useGSAP(() => {
        const triggers = [];
        
        cardsRef.current.forEach((card, i) => {
            const trigger = ScrollTrigger.create({
                trigger: card,
                start: "center center",
                end: () => "+=" + window.innerHeight,
                pin: true,
                pinSpacing: false,
            });
            triggers.push(trigger);

            if (i > 0) {
                gsap.to(cardsRef.current[i - 1], {
                    scale: 0.9,
                    filter: "blur(10px)",
                    opacity: 0.6,
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top center",
                        end: "center center",
                        scrub: true,
                    },
                });
            }
        });

        return () => {
            triggers.forEach(t => t.kill());
        };
    }, { scope: container });

    const data = [
        {
            title: "Medellín: La Ciudad de las Oportunidades",
            text: "¿Estás pensando en invertir en bienes raíces? Medellín se perfila como uno de los destinos más prometedores este octubre. Medellín no solo encanta a quienes buscan hogar, sino también a...",
            image: "https://escalainmobiliaria.com.co/wp-content/uploads/logo-escala.png",
        },
        {
            title: "Nuestras Sedes Estratégicas",
            text: "Con sede en Laureles (Calle 35 No 81 09 interior 201) y sede Sur en Sabaneta (carrera 45 # 72 sur - 07 interior 302). Siempre cerca para brindarte la mejor asesoría.",
            image: "https://escalainmobiliaria.com.co/wp-content/uploads/escala-logo-blancos.png",
        },
        {
            title: "Contactanos Hoy Mismo",
            text: "Comunícate al 3009122101 para conectar con nuestros asesores para propietarios y arrendatarios en Escala Inmobiliaria.",
            image: "https://escalainmobiliaria.com.co/wp-content/uploads/WhatsApp-Image-2025-02-14-at-3.55.03-PM-2-800x1024.jpeg",
        }
    ];

    return (
        <div ref={container} className="relative w-full py-20 bg-escala-dark">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col items-center gap-[50vh] pb-[50vh]">
                    {data.map((item, i) => (
                        <div
                            key={i}
                            ref={el => cardsRef.current[i] = el}
                            className="w-full max-w-2xl bg-[#070707]/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-center"
                        >
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-4xl font-heading font-semibold text-escala-accent mb-4">{item.title}</h3>
                                <p className="text-escala-warm1 pb-2 leading-relaxed">{item.text}</p>
                            </div>
                            <div className="w-full md:w-1/3 flex justify-center">
                                <img src={item.image} alt="Sede o Logo" className="w-full h-auto object-contain rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvisoryFlow;
