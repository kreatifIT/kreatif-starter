import { useEffect, useRef } from 'preact/hooks';
import type Ukiyo from 'ukiyojs';

interface Props {
    children?: any;
}

export default function ParallaxBanner({ children }: Props) {
    const image = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (image.current) {
            let item: Ukiyo;
            import('ukiyojs').then(
                (module) =>
                    (item = new module.default(
                        image.current!.querySelector('img'),
                        {
                            speed: 2,
                            scale: 1.05,
                        },
                    )),
            );
            return () => {
                item?.destroy();
            };
        }
    }, [image.current]);

    return <div ref={image}>{children}</div>;
}
