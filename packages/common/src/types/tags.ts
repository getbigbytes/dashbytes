import type { ClairdashUser } from './user';

export type Tag = {
    tagUuid: string;
    projectUuid: string;
    name: string;
    color: string;
    createdAt: Date;
    createdBy: Pick<
        ClairdashUser,
        'userUuid' | 'firstName' | 'lastName'
    > | null;
};

export type ApiGetTagsResponse = {
    status: 'ok';
    results: Tag[];
};

export type ApiCreateTagResponse = {
    status: 'ok';
    results: { tagUuid: string };
};
