'use client';

import {TabBar} from "@/app/components/TabBar";
export default function Root() {
    //const agent = new BskyAgent({ service: `https://bsky.social`})
    const checkSession = async () => {
        const storedData = window.localStorage.getItem('session');
        if(!storedData) {
            location.href = '/login'
        }
    }
    checkSession()

    return(
        <>
            <TabBar color={'dark'} selected={'home'}/>
        </>
    )
}