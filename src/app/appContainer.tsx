'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState, useEffect} from "react";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";


export function AppConatiner({ children }: { children: React.ReactNode }) {
    //ここでsession作っておかないとpost画面を直で行った時にpostできないため
    const {agent} = useRequiredSession()
    const router = useRouter()
    let pathName = usePathname()
    const searchParams = useSearchParams()
    const target = searchParams.get('target')
    const [value, setValue] = useState(false)
    const tab = pathName === '/' ? 'home' : (pathName === '/search' || pathName === '/inbox' || pathName === '/post') ? pathName.replace("/",'') : 'home';
    //@ts-ignore
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">(tab);
    const [searchText, setSearchText] = useState("");
    const specificPaths = ['/post', '/login']
    const isMatchingPath = specificPaths.includes(pathName)
    const {background} = layout();

    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        console.log(searchText)
        if(searchText === '' || !searchText) return
        router.push(`/search?word=${searchText}&target=${target || 'posts'}`)
    },[searchText])

    useEffect(() => {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);
    return (

        <main className={background({ color: color, isMobile: isMobile })}>
            {agent ? (
                <div className={'h-full max-w-[600px] min-w-[350px] w-full'}>
                    {!isMatchingPath && (
                        <ViewHeader color={color} page={'search'} tab={selectedTab} setValue={setValue} setSearchText={setSearchText} selectedTab={selectedTab}/>
                    )}
                    <div className={`pt-[${isMatchingPath ? `0px` : `100px`}] h-[calc(100%-50px)] overflow-y-scroll`}>
                        {React.cloneElement(children as any, {
                            name: 'hoge',
                        })}
                    </div>
                    {!isMatchingPath && (
                        <TabBar color={color} selected={selectedTab} setValue={setSelectedTab}/>
                    )}
                </div>
            ) : (
                <div className={'h-full max-w-[600px] min-w-[350px] w-full'}>
                    {children}
                </div>
            )}
        </main>
    )
}

