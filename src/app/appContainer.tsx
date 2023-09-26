'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState, useEffect} from "react";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import {usePathname, useRouter, useSearchParams} from 'next/navigation';


export function AppConatiner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const location = usePathname();
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [value, setValue] = useState(false)
    let pathName = usePathname()
    const searchParams = useSearchParams()
    const target = searchParams.get('target')
    const tab = pathName === '/' ? 'home' : (pathName === '/search' || pathName === '/inbox' || pathName === '/post') ? pathName.replace("/",'') : 'home';
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">(tab);
    const [searchText, setSearchText] = useState("");
    const {background} = layout();
    const specificPaths = ['/post', '/login']
    const isMatchingPath = specificPaths.includes(pathName)
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
            <div className={'h-full max-w-[600px] min-w-[350px] w-full'}>
                {location !== '/post' && location !== '/login' && (
                    <ViewHeader color={color} page={'search'} tab={selectedTab} setValue={setValue} setSearchText={setSearchText} selectedTab={selectedTab}/>
                )}
                <div className={`pt-[${isMatchingPath ? `0px` : `100px`}] overflow-y-scroll`}>
                    {React.cloneElement(children as any, {
                        name: 'hoge',
                    })}
                </div>
                {location !== '/post' && location !== '/login' && (
                    <TabBar color={color} selected={'search'} setValue={setSelectedTab}/>
                )}
            </div>
        </main>
    )
}