import gql from 'graphql-tag';
import {
    REX_ARTICLE_SLICE_FRAGMENT,
    RedaxoAdapter,
    type ArticleSlice,
} from 'redaxo-adapter';

export interface PopupUserInformation {
    closed: boolean;
    shownOnce: boolean;
    currentArticleId: string;
    lastModified: number;
}

export interface PopupData {
    visible: boolean;
    showReopenButton: boolean;
    newData: PopupUserInformation;
    slice: ArticleSlice;
}

const POPUP_QRY = gql`
    query Popup($data: [PopupUserInformationInput!]!) {
        popups(data: $data) {
            visible
            newData {
                closed
                shownOnce
                lastModified
            }
            showReopenButton
            slice {
                ...ArticleSliceFragment
            }
        }
    }
    ${REX_ARTICLE_SLICE_FRAGMENT}
`;

export async function getPopups(
    data: PopupUserInformation[],
    clangId: string,
): Promise<PopupData[]> {
    const { data: _data } = await RedaxoAdapter.query(
        POPUP_QRY,
        {
            data,
        },
        clangId,
    );
    return _data.popups;
}
