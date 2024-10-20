import React from 'preact/compat';
import { useStore } from '@nanostores/preact';
import type { JSX } from 'preact';
import { splideStore } from './splide-store.ts';

interface Props {
    children: JSX.Element;
    next?: boolean;
    prev?: boolean;
    id: string;
}

export default function KSplideArrow({ children, next, prev, id }: Props) {
    const sliders = useStore(splideStore);
    return (
        <button
            onClick={() => {
                const slider = sliders[id];
                if (slider) {
                    if (next) {
                        slider.go('+');
                    } else if (prev) {
                        slider.go('-');
                    }
                }
            }}
        >
            {children}
        </button>
    );
}
