import React from 'preact/compat';
import { useStore } from '@nanostores/preact';
import { useEffect, useState } from 'preact/hooks';
import { splideStore } from './splide-store.ts';
import KSplidePaginationItem from './KSplidePaginationItem.tsx';

interface Props {
    id: string;
    count: number;
}
export default function KSplidePagination({ id, count }: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const splides = useStore(splideStore);
    useEffect(() => {
        const splide = splides[id];
        if (splide) {
            splide.on('moved', (newIndex) => {
                setActiveIdx(newIndex);
            });
        }
        return () => {
            if (splide) {
                splide.off('moved');
            }
        };
    }, [id, splides]);

    return Array.from({ length: count }).map((_, idx) => (
        <KSplidePaginationItem
            active={activeIdx === idx}
            onClick={() => {
                const splide = splides[id];
                if (splide) {
                    splide.go(idx);
                }
            }}
        />
    ));
}
