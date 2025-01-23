import {
    type CreateProjectGroupAccess,
    type DeleteProjectGroupAccess,
    type ProjectGroupAccess,
    type UpdateProjectGroupAccess,
} from '@bigbytes/common';
import { bigbytesApi } from '../../../api';

export function getProjectGroupAccessList(projectUuid: string) {
    return bigbytesApi<ProjectGroupAccess[]>({
        url: `/projects/${projectUuid}/groupAccesses`,
        method: 'GET',
        body: undefined,
    });
}

export function addProjectGroupAccess({
    groupUuid,
    projectUuid,
    role,
}: CreateProjectGroupAccess) {
    return bigbytesApi<ProjectGroupAccess>({
        url: `/groups/${groupUuid}/projects/${projectUuid}`,
        method: 'POST',
        body: JSON.stringify({ role }),
    });
}

export function updateProjectGroupAccess({
    groupUuid,
    projectUuid,
    role,
}: UpdateProjectGroupAccess) {
    return bigbytesApi<ProjectGroupAccess>({
        url: `/groups/${groupUuid}/projects/${projectUuid}`,
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
}

export function removeProjectGroupAccess({
    groupUuid,
    projectUuid,
}: DeleteProjectGroupAccess) {
    return bigbytesApi<null>({
        url: `/groups/${groupUuid}/projects/${projectUuid}`,
        method: 'DELETE',
        body: undefined,
    });
}
