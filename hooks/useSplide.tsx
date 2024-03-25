import { useStore } from '@nanostores/preact';
import { splideStore } from '../components/utils/splide/splide-store';
import { useMemo } from 'preact/hooks';


export default function useSplide(id: string) {
    const splides = useStore(splideStore);
    const splide = useMemo(() => splides[id], [id])
    return splide;
}