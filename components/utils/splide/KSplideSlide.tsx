import React from 'preact/compat';
import { useStore } from '@nanostores/preact';
import KImage from '../KImage.tsx';
import useIubendaPreferences from '../iubenda/useIubendaPreferences.tsx';
import type { JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import { splideStore } from './splide-store.ts';
import type { Media } from 'redaxo-adapter';

export interface Props {
    id: string;
    youtubeUrl?: string;
    video?: string;
    image?: Media;
    children: JSX.Element;
}

export default function KSplideSlide({
    id,
    youtubeUrl,
    video,
    image,
    children,
}: Props) {
    const iubendaPreferences = useIubendaPreferences();
    const splides = useStore(splideStore);
    useEffect(() => {
        if (iubendaPreferences && iubendaPreferences[3]) {
            splides[id]?.refresh();
        }
    }, [iubendaPreferences, id]);
    const youtubeId = youtubeUrl?.split('v=')[1];
    return (
        <li
            class={'splide__slide'}
            data-splide-youtube={
                iubendaPreferences && iubendaPreferences[3] ? youtubeId : null
            }
            data-splide-html-video={video}
        >
            {children}
            {
                (youtubeId || video || image) && (
                    <div className="splide__slide__container">
                        {image && <KImage {...image} />}
                    </div>
                )
            }
        </li>
    );
}
