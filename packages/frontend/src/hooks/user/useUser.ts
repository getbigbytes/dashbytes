import { Ability } from '@casl/ability';
import {
    type ApiError,
    type ClairdashUserWithAbilityRules,
} from '@clairdash/common';
import { useQuery } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

export type UserWithAbility = ClairdashUserWithAbilityRules & {
    ability: Ability;
};
const getUserState = async (): Promise<UserWithAbility> => {
    const user = await clairdashApi<ClairdashUserWithAbilityRules>({
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
