import { type AstroGlobal } from 'astro';
import { parseCookieData } from './cookies.ts';

export const CLANG_ID_COOKIE_NAME = 'clang_id';

export function getClangId(Astro?: AstroGlobal): string {
    if (Astro) return Astro.cookies.get(CLANG_ID_COOKIE_NAME)?.value || '1';
    if (typeof window === 'undefined')
        throw new Error(
            'Please provide AstroGlobal or run this function on client side',
        );
    return parseCookieData(CLANG_ID_COOKIE_NAME) || '';
}
