import type { Article, ArticleSlice, Clang } from 'redaxo-adapter';

export interface BaseModuleProps {
    slice: ArticleSlice;
    article: Article;
    isFooterModule: boolean;
    clang: Clang;
}
