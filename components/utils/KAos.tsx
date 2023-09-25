import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
    inActiveClass?: string;
    activeClass?: string;
    class?: string;
    children: any;
    showEffect?: boolean;
}

export default function KAos({
    inActiveClass = 'opacity-0 translate-y-[5vh]',
    activeClass = 'opacity-100 translate-y-0',
    class: className = 'transition-all duration-1000 delay-200 ease',
    children,
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (ref.current) {
            const observer = new IntersectionObserver(
                (entries) => {
                    setVisible(entries[0].isIntersecting);
                },
                {
                    rootMargin: '300px 0px 300px 0px',
                },
            );
            observer.observe(ref.current);

            return () => observer.disconnect();
        }
    }, [ref]);
    return (
        <div
            class={[className, visible ? activeClass : inActiveClass].join(' ')}
            ref={ref}
        >
            {children}
        </div>
    );
}
