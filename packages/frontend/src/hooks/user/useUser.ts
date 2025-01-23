import { Ability } from '@casl/ability';
import {
    type ApiError,
    type BigbytesUserWithAbilityRules,
} from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

export type UserWithAbility = BigbytesUserWithAbilityRules & {
    ability: Ability;
};
const getUserState = async (): Promise<UserWithAbility> => {
    const user = await bigbytesApi<BigbytesUserWithAbilityRules>({
        url: `/user`,
        method: 'GET',
        body: undefined,
    });

    return {
        ...user,
        ability: new Ability(user.abilityRules),
    };
};

const useUser = (isAuthenticated: boolean) => {
    return useQuery<UserWithAbility, ApiError>({
        queryKey: ['user'],
        queryFn: getUserState,
        enabled: isAuthenticated,
        retry: false,
    });
};

export default useUser;
