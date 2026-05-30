'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { Users } from "../db";

const userContext = createContext({
    user: {} as Omit<Users, "password" | "createdAt" | "updatedAt"> | null,
    setUser: (data: any) => {}
})

export const UserContext = ({ children }: { children: any;}) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log("Context Data: ", user)
    }, [user])

    return (
        <userContext.Provider value={{user, setUser}}>
            {children}
        </userContext.Provider>
    )
}

export const useUserContext = () => {
    return useContext(userContext)
}