"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation, useConvex } from 'convex/react'
import React, { createContext, useEffect, useState } from 'react'

function ProviderInner({ children }: any) {
    const { user } = useUser();
    const createUser = useMutation(api.users.CreateNewUser);
    const [userDetail, setUserDetail] = useState<any>();

    useEffect(() => {
        if (user) {
            createUser({
                email: user?.primaryEmailAddress?.emailAddress ?? '',
                imageUrl: user?.imageUrl ?? '',
                name: user?.fullName ?? ''
            }).then((result: any) => {
                setUserDetail(result);
            }).catch((err: any) => {
                console.warn("Convex user creation warning:", err);
            });
        }
    }, [user]);

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <div>{children}</div>
        </UserDetailContext.Provider>
    );
}

function FallbackProvider({ children }: any) {
    const [userDetail, setUserDetail] = useState<any>(null);
    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <div>{children}</div>
        </UserDetailContext.Provider>
    );
}

function Provider({ children }: any) {
    return <ProviderInner>{children}</ProviderInner>;
}

export default Provider

export const useUserDetailContext = () => {
    return createContext(UserDetailContext);
}