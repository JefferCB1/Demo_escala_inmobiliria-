import { useEffect, useRef, useState } from 'react';

// Entrada animada palabra a palabra (o letra a letra) con desenfoque.
//
// Implementado con CSS puro a propósito: la versión anterior usaba `motion`
// (Framer), que se llevaba toda la librería al chunk crítico del arranque para
// este único efecto — y el componente solo se renderiza en desktop, así que en
// móvil se descargaba para nada. Los keyframes viven en src/styles/global.css.
const BlurText = ({
    text = '',
    delay = 200,              // ms de retardo entre segmentos
    className = '',
    animateBy = 'words',      // 'words' | 'letters'
    direction = 'top',        // 'top' | 'bottom'
    threshold = 0.1,
    rootMargin = '0px',
    onAnimationComplete,
    as: Component = 'p',
}) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const nodo = ref.current;
        if (!nodo) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(nodo);
                }
            },
            { threshold, rootMargin }
        );
        observer.observe(nodo);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    // Sustituye al onAnimationComplete de motion: se dispara cuando termina
    // la animación del último segmento.
    const handleAnimationEnd = (index) => {
        if (index === elements.length - 1) onAnimationComplete?.();
    };

    return (
        <Component
            ref={ref}
            className={`blur-text blur-text--${direction} ${inView ? 'blur-text--in' : ''} ${className} flex flex-wrap`}
        >
            {elements.map((segment, index) => (
                <span
                    key={index}
                    className="blur-text__seg"
                    style={{ animationDelay: `${(index * delay) / 1000}s` }}
                    onAnimationEnd={() => handleAnimationEnd(index)}
                >
                    {segment === ' ' ? ' ' : segment}
                    {animateBy === 'words' && index < elements.length - 1 && ' '}
                </span>
            ))}
        </Component>
    );
};

export default BlurText;
