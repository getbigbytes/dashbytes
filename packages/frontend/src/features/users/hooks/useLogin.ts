import {
    InvalidUser,
    type ApiError,
    type BigbytesUser,
    type LoginOptions,
} from '@bigbytes/common';
import {
    useMutation,
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';
import useToaster from '../../../hooks/toaster/useToaster';
import useQueryError from '../../../hooks/useQueryError';

export type LoginParams = { email: string; password: string };

const fetchLoginOptions = async (email?: string) =>
    bigbytesApi<LoginOptions>({
        url: `/user/login-options${
            email ? `?email=${encodeURIComponent(email)}` : ''
        }`,
        method: 'GET',
        body: undefined,
    });

export const useFetchLoginOptions = ({
    email,
    useQueryOptions,
}: {
    email?: string;
    useQueryOptions?: UseQueryOptions<LoginOptions, ApiError>;
}) => {
    const setErrorResponse = useQueryError();
    const { showToastError } = useToaster();

    return useQuery<LoginOptions, ApiError>({
        queryKey: ['loginOptions', email],
        queryFn: () => fetchLoginOptions(email),
        retry: false,
        onError: (result) => {
            setErrorResponse(result);
            if (
                result.error.name === InvalidUser.name &&
                window.location.pathname === '/login'
            ) {
                showToastError({
                    title: 'Your login has expired',
                    subtitle: 'Please log in again to continue.',
                });
            }
        },
        ...useQueryOptions,
    });
};

const loginQuery = async (data: LoginParams) =>
    bigbytesApi<BigbytesUser>({
        url: `/login`,
        method: 'POST',
        body: JSON.stringify(data),
    });

export const useLoginWithEmailMutation = ({
    onSuccess,
    onError,
}: {
    onSuccess: (user: BigbytesUser) => void;
    onError: (error: ApiError) => void;
}) =>
    useMutation<BigbytesUser, ApiError, LoginParams>(loginQuery, {
        mutationKey: ['login'],
        onSuccess: onSuccess,
        onError: onError,
    });
