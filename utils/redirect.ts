import { getClangId } from './clang';
import type { ContentType, Clang } from 'redaxo-adapter';
import { getArticleRedirect, getForward } from 'redaxo-adapter';
import type { AstroGlobal, ValidRedirectStatus } from 'astro';

export async function checkForRedirects(
    contentType: ContentType,
    clang: Clang,
    clangs: Clang[],
    Astro: AstroGlobal,
): Promise<Response | null> {
    const clangId = getClangId(Astro);
    let result = null;

    switch (contentType.type) {
        case 'forward':
            const forward = await getForward(contentType.elementId, clangId);
            if (forward) {
                result = forward;
            }
            break;
        case 'article_redirect':
            const redirect = await getArticleRedirect(
                contentType.elementId,
                clangId,
            );
            if (redirect) {
                result = redirect;
            }
            break;
    }

    if (result) {
        setLangRedirectCookie(Astro);
        return Astro.redirect(result.url, result.status as ValidRedirectStatus);
    }
    const langRedirect = performLangRedirect(Astro, clang, clangs);
    if (langRedirect) {
        return langRedirect;
    }
    return null;
}

function performLangRedirect(
    Astro: AstroGlobal,
    currentClang: Clang,
    clangs: Clang[],
): Response | false {
    const hasRedirected = Astro.cookies.get('lang_redirect')?.boolean();
    setLangRedirectCookie(Astro);
    if (hasRedirected) return false;

    const browserLangCodes = Astro.request.headers
        .get('accept-language')
        ?.split(',')
        .map((lang) => lang.split(';')[0].trim());

    if (!browserLangCodes) return false;

    const browserLangCode = browserLangCodes
        .map((lang) => lang.split('-')[0].toLowerCase())
        .find((lang) =>
            clangs.some((clang) => clang.code.toLowerCase() === lang),
        );
    if (!browserLangCode) return false;

    const browserClang = clangs.find(
        (clang) => clang.code.toLowerCase() === browserLangCode.toLowerCase(),
    );
    if (!browserClang) return false;

    if (browserClang.id !== currentClang.id) {
        return Astro.redirect(browserClang.url, 302);
    }
    return false;
}

export function setLangRedirectCookie(Astro: AstroGlobal) {
    Astro.cookies.set('lang_redirect', '1', {
        maxAge: 60 * 60 * 24,
        path: '/',
    });
}
