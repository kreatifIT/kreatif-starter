import type { Article, ArticleSlice, Clang } from 'redaxo-adapter';

export interface BaseModuleProps {
    slice: ArticleSlice;
    article: Article;
    isFooterModule: boolean;
    clang: Clang;
}

export enum MediaSource {
    MEDIA = 'M',
    MEDIA_LIST = 'ML',
    VALUES = 'V',
}

export type ModuleToMediaTypeMapping = Record<
    string,
    (
        | ModuleToMediaMappingInner
        | {
              source: MediaSource.VALUES;
              id: number;
              mediaTypes: ModuleToMediaMappingInner[];
          }
    )[]
>;

type ModuleToMediaMappingInner = {
    source: MediaSource.MEDIA | MediaSource.MEDIA_LIST;
    id: number;
    mediaType: string;
};
