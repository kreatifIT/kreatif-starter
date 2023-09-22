import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions';
import type {
    Article,
    Clang,
    ContentType,
    NavigationItem,
    Wildcard,
} from 'redaxo-adapter';
import {RedaxoAdapter} from 'redaxo-adapter';
import {query} from 'gql-query-builder';
import {REDAXO_JWT_COOKIE_NAME} from '../utils/edit-mode.ts';
import WildcardCache from '../utils/wildcards.ts';
import {CLANG_ID_COOKIE_NAME} from '../utils/clang.ts';
import type {AstroGlobal} from 'astro';
import gql from 'graphql-tag';
import type {ProjectSettings} from './@types.ts';
import {checkForRedirects} from '../utils/redirect.ts';

const QRY_BUILDER_IMG_FRAGMENT: string[] = [
    'id',
    'filename',
    'focusPoint',
    'title',
    'alt',
    'src',
    'srcset',
    'width',
    'height',
];

const QRY_BUILDER_NAVIGATION_FRAGMENT: string[] = ['id', 'label', 'url', 'internal', 'active', 'parentId'];

const QRY_BUILDER_SLICES_FRAGMENT: string[] = [
    'id',
    'moduleCode',
    'values',
    'media',
    'mediaList',
    'link',
    'linkList',
    'online',
];
const QRY_BUILDER_ARTICLE_FRAGMENT: string[] = [
    'id',
    'name',
    'url',
    'createdAt',
    'updatedAt',
    'online',
];
export const REQUIRED_PROJECT_SETTINGS_FIELDS: IQueryBuilderOptions['fields'] =
    [
        {
            organization: [
                'name',
                'streetAddress',
                'zip',
                'city',
                'region',
                'province',
                'country',
                'isoCountryCode',
                'vatNumber',
                'chamberOfCommerce',
                'chamberOfCommerceNumber',
                'reaNumber',
                'shareholderEquity',
                {
                    images: QRY_BUILDER_IMG_FRAGMENT,
                },
            ],
            contact: [
                'phone',
                'email',
                'emailPec',
                {
                    socials: ['name', 'url'],
                },
                'coordinates',
            ],
            iubendaCookieBanner: ['bannerData', 'showLanguageSwitch'],
            tokens: [
                'googleTagManager',
                'googleAnalytics',
                'googleWebmasterId',
                'bingValidateId',
                'facebookPixelId',
                'facebookDomainVerification',
                'linkedInInsightId',
                'mapboxAccessToken',
                'recaptchaSiteKey',
            ],
        },
        'seoGeoRegion',
        'websiteName',
    ];

export function buildContentTypeFields({
                                           additionalFields = [],
                                           additionalArticleFields = [],
                                       }: {
    additionalFields?: IQueryBuilderOptions['fields'];
    additionalArticleFields?: IQueryBuilderOptions['fields'];
}): IQueryBuilderOptions['fields'] {
    return [
        'elementId',
        'type',
        {
            metadata: [
                'title',
                'description',
                'robots',
                'canonical',
                'createdAt',
                'updatedAt',
                {
                    image: QRY_BUILDER_IMG_FRAGMENT,
                    breadcrumbs: ['label', 'url'],
                },
            ],
            clangs: [
                'id',
                'name',
                'code',
                'url',
                'online',
                'active',
                'priority',
            ],
            relatedArticle: [
                ...QRY_BUILDER_ARTICLE_FRAGMENT,
                ...additionalArticleFields,
                {
                    slices: QRY_BUILDER_SLICES_FRAGMENT,
                },
            ],
        },
        ...additionalFields,
    ];
}

export function buildInitialQuery({
                                      additionalOptions = [],
                                      projectSettingsFields = REQUIRED_PROJECT_SETTINGS_FIELDS,
                                      contentTypeFields = buildContentTypeFields({}),
                                      includeFooterMenu = true,
                                  }: {
    additionalOptions?: IQueryBuilderOptions[];
    projectSettingsFields?: IQueryBuilderOptions['fields'];
    contentTypeFields?: IQueryBuilderOptions['fields'];
    includeFooterMenu?: boolean;
}): IQueryBuilderOptions[] {
    return [
        {
            operation: {
                name: 'contentTypeByPath',
                alias: 'contentType',
            },
            fields: contentTypeFields,
            variables: {
                path: {
                    required: true,
                    type: 'String',
                },
            },
        },
        {
            operation: 'redaxoLoggedIn',
        },
        {
            operation: 'wildCards',
            fields: ['id', 'wildcard', 'replace'],
        },
        {
            operation: 'projectSettings',
            fields: projectSettingsFields,
        },
        {
            operation: 'footerArticle',
            fields: [
                'id',
                {
                    slices: QRY_BUILDER_SLICES_FRAGMENT,
                },
            ],
        },
        {
            operation: 'siteStartArticle',
            fields: QRY_BUILDER_ARTICLE_FRAGMENT,
        },
        {
            operation: {
                name: 'rootNavigation',
                alias: 'navigation',
            },
            fields:,
            variables: {
                navigationDepth: {
                    required: true,
                    type: 'Int',
                    name: 'depth',
                },
            },
        },
        ...(includeFooterMenu ? [{
            operation: 'footerMenu', fields: QRY_BUILDER_NAVIGATION_FRAGMENT,
        }] : []),
        ...additionalOptions,
    ];
}

export async function performInitialRequest(
    variables: {
        path: string;
        navigationDepth: number;
    },
    getQueryOptions?: () => IQueryBuilderOptions,
): Promise<{
    projectSettings: ProjectSettings;
    wildCards: Wildcard[];
    contentType: ContentType;
    redaxoLoggedIn: boolean;
    footerArticle: Article;
    siteStartArticle: Article;
    rootNavigation: NavigationItem[];
}> {
    const qryObject = getQueryOptions?.() || buildInitialQuery({});
    const {query: _qry} = query(qryObject, undefined, {
        operationName: 'INIT',
    });
    const qry = gql(_qry);
    const {data} = await RedaxoAdapter.query(qry, variables, '1');
    return data;
}

//todo: rethink name
export async function initRedaxoPage({
                                         Astro,
                                         variables,
                                         redaxoEndpoint,
                                         redaxoRoot,
                                         redaxoSecret,
                                         getQueryOptions,
                                     }: {
    Astro: AstroGlobal;
    variables: {
        path?: string;
        navigationDepth: number;
    };
    redaxoEndpoint: string;
    redaxoRoot: string;
    redaxoSecret?: string;
    getQueryOptions?: () => IQueryBuilderOptions;
}) {
    let {path = ''} = variables;
    path = '/' + path;

    if (
        path.substring(path.lastIndexOf('/') + 1).includes('.') ||
        path.startsWith('node_modules/')
    ) {
        return {
            redirect: new Response(),
        };
    }

    if (path === 'sitemap.xml' || path === 'robots.txt') {
        return {
            redirect: Astro.redirect(`${redaxoRoot}/${path}`, 301),
        };
    }
    const redaxoJwt =
        Astro.url.searchParams.get('auth') ??
        Astro.cookies.get(REDAXO_JWT_COOKIE_NAME)?.value;
    RedaxoAdapter.init(redaxoEndpoint, redaxoRoot, redaxoJwt ?? redaxoSecret);
    const {projectSettings, wildCards, contentType, redaxoLoggedIn, ...rest} =
        await performInitialRequest(
            {
                ...variables,
                path,
            },
            getQueryOptions,
        );

    const currentClang = contentType.clangs.find((c) => c.active) as Clang;
    WildcardCache.prepareCache(wildCards, projectSettings, currentClang.id);
    Astro.cookies.set(CLANG_ID_COOKIE_NAME, currentClang.id, {
        sameSite: 'lax',
        path: '/',
    });
    if (redaxoLoggedIn) {
        Astro.cookies.set(REDAXO_JWT_COOKIE_NAME, redaxoJwt || '', {
            sameSite: 'lax',
            path: '/',
        });
    } else {
        Astro.cookies.delete(REDAXO_JWT_COOKIE_NAME);
    }
    const redirect = await checkForRedirects(
        contentType,
        currentClang,
        contentType.clangs,
        Astro,
    );
    return {
        ...rest,
        contentType,
        redirect,
        clang: currentClang,
        clangs: contentType.clangs,
        article: contentType.relatedArticle,
    };
}
