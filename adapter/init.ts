import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions';
import type {
    Article,
    Clang,
    ContentType,
    NavigationItem,
    Wildcard,
} from 'redaxo-adapter';
import { RedaxoAdapter } from 'redaxo-adapter';
import { query } from 'gql-query-builder';
import { REDAXO_JWT_COOKIE_NAME } from '../utils/edit-mode.ts';
import WildcardCache from '../utils/wildcards.ts';
import { CLANG_ID_COOKIE_NAME } from '../utils/clang.ts';
import type { AstroGlobal } from 'astro';
import gql from 'graphql-tag';
import type { ProjectSettings } from './@types.ts';
import { checkForRedirects } from '../utils/redirect.ts';
import type { ModuleToMediaTypeMapping } from '../utils/modules.ts';
import type { AdvancedRuntime } from '@astrojs/cloudflare';
import L2Cache from './l2-cache.ts';

export const QRY_BUILDER_IMG_FRAGMENT: string[] = [
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

export const QRY_BUILDER_NAVIGATION_FRAGMENT: string[] = [
    'id',
    'label',
    'url',
    'internal',
    'active',
    'parentId',
];

export const QRY_BUILDER_SLICES_FRAGMENT: string[] = [
    'id',
    'moduleCode',
    'values',
    'media',
    'mediaList',
    'link',
    'linkList',
    'online',
];
export const QRY_BUILDER_ARTICLE_FRAGMENT: string[] = [
    'id',
    'name',
    'url',
    'createdAt',
    'updatedAt',
    'online',
];

export function buildProjectSettingsFields({
    additionalFields = [],
}: {
    additionalFields?: IQueryBuilderOptions['fields'];
}): IQueryBuilderOptions['fields'] {
    return [
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
        ...additionalFields,
    ];
}

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
                {
                    operation: {
                        name: 'slicesWithMedia',
                        alias: 'slices',
                    },
                    fields: QRY_BUILDER_SLICES_FRAGMENT,
                    variables: {
                        mediaMapping: {
                            required: true,
                            type: 'String',
                            name: 'mapping',
                        },
                    },
                },
                ...additionalArticleFields,
            ],
        },
        ...additionalFields,
    ];
}

export function buildInitialQuery({
    additionalOperations = [],
    projectSettingsFields = buildProjectSettingsFields({}),
    contentTypeFields = buildContentTypeFields({}),
    includeFooterMenu = true,
}: {
    additionalOperations?: IQueryBuilderOptions[];
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
                    operation: {
                        name: 'slicesWithMedia',
                        alias: 'slices',
                    },
                    fields: QRY_BUILDER_SLICES_FRAGMENT,
                    variables: {
                        mediaMapping: {
                            required: true,
                            type: 'String',
                            name: 'mapping',
                        },
                    },
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
            fields: QRY_BUILDER_NAVIGATION_FRAGMENT,
            variables: {
                navigationDepth: {
                    required: true,
                    type: 'Int',
                    name: 'depth',
                },
            },
        },
        ...(includeFooterMenu
            ? [
                  {
                      operation: {
                          name: 'navigation',
                          alias: 'footerMenu',
                      },
                      fields: QRY_BUILDER_NAVIGATION_FRAGMENT,
                      variables: {
                          footerMenuName: {
                              required: true,
                              type: 'String',
                              name: 'name',
                          },
                      },
                  },
              ]
            : []),
        ...additionalOperations,
    ];
}

export async function performInitialRequest(
    variables: {
        path: string;
        navigationDepth: number;
        mediaMapping?: string;
        footerMenuName?: string;
    },
    initialQuery?: IQueryBuilderOptions[],
): Promise<{
    projectSettings: ProjectSettings;
    wildCards: Wildcard[];
    contentType: ContentType;
    redaxoLoggedIn: boolean;
    footerArticle: Article;
    siteStartArticle: Article;
    rootNavigation: NavigationItem[];
    shopContentType?: ContentType;
}> {
    const qryObject = initialQuery || buildInitialQuery({});
    const { query: _qry } = query(qryObject, undefined, {
        operationName: 'INIT',
    });
    const qry = gql(_qry);
    const { data } = await RedaxoAdapter.query(qry, variables, '1');
    return data;
}

export async function kInitRedaxoPage({
    Astro,
    variables,
    redaxo,
    initialQuery,
}: {
    Astro: AstroGlobal;
    variables: {
        path?: string;
        navigationDepth: number;
        mediaMapping: ModuleToMediaTypeMapping;
        shopRedirectPath?: string;
    } & Record<string, any>;
    redaxo: {
        endpoint: string;
        root: string;
        secret?: string;
        enableL2Cache?: boolean;
    };
    initialQuery: IQueryBuilderOptions[];
}) {
    let { path = '' } = variables;
    path = '/' + path;

    if (path === 'sitemap.xml' || path === 'robots.txt') {
        return {
            redirect: Astro.redirect(`${redaxo.root}/${path}`, 301),
        };
    }
    const redaxoJwt =
        Astro.url.searchParams.get('auth') ??
        Astro.cookies.get(REDAXO_JWT_COOKIE_NAME)?.value;
    RedaxoAdapter.init(
        redaxo.endpoint,
        redaxo.root,
        redaxoJwt ?? redaxo.secret,
        !redaxoJwt,
        redaxo.enableL2Cache && Astro.locals
            ? new L2Cache(Astro.locals as AdvancedRuntime)
            : undefined,
    );

    if (variables.shopRedirectPath) {
        initialQuery.push({
            operation: {
                name: 'contentTypeByPath',
                alias: 'shopContentType',
            },
            variables: {
                shopRedirectPath: {
                    required: true,
                    type: 'String',
                    name: 'path',
                },
            },
            fields: ['type', 'elementId'],
        });
    }

    const {
        projectSettings,
        wildCards,
        contentType,
        redaxoLoggedIn,
        shopContentType,
        ...rest
    } = await performInitialRequest(
        {
            footerMenuName: 'footer_menu',
            ...variables,
            mediaMapping: parseModuleToMediaMapping(variables.mediaMapping),
            path,
        },
        initialQuery,
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
    let redirect = await checkForRedirects(
        contentType,
        currentClang,
        contentType.clangs,
        Astro,
    );
    if (shopContentType) {
        redirect = await checkForRedirects(
            shopContentType,
            currentClang,
            contentType.clangs,
            Astro,
        );
    }
    return {
        ...rest,
        contentType,
        redirect,
        path,
        clang: currentClang,
        clangs: contentType.clangs,
        article: contentType.relatedArticle,
    };
}

function parseModuleToMediaMapping(mapping: ModuleToMediaTypeMapping): string {
    const result: Record<string, Record<string, string>> = {};
    Object.entries(mapping).forEach(([key, value]) => {
        value.forEach((item) => {
            if (!result[key]) result[key] = {};
            switch (item.source) {
                case 'M':
                case 'ML':
                    const innerKey = item.source + '_' + item.id;
                    result[key][innerKey] = item.mediaType;
                    break;
                case 'V':
                    item.mediaTypes.forEach((innerType) => {
                        const innerKey =
                            innerType.source +
                            '_' +
                            item.id +
                            '_' +
                            innerType.id;
                        result[key][innerKey] = innerType.mediaType;
                    });
            }
        });
    });
    return JSON.stringify(result);
}
