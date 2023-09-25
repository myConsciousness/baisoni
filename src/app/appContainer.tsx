'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState, useEffect} from "react";
import useDarkMode from "use-dark-mode";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import {usePathname, useRouter} from 'next/navigation';
import {useRequiredSession} from "@/app/lib/hooks/useRequiredSession";


export function AppConatiner({ children }: { children: React.ReactNode }) {
    const { agent } = useRequiredSession()
    const router = useRouter()
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [value, setValue] = useState(false)
    const [pathName, setPathName] = useState<string>(usePathname())
    const tab = pathName === '/' ? 'home' : (pathName === '/search' || pathName === '/inbox' || pathName === '/post') ? pathName.replace("/",'') : 'home';
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">(tab);
    const [searchText, setSearchText] = useState("");
    const {background} = layout();
    const [ count, setCount ] = useState(0)

    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'

    const modeMe = (e) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        console.log(searchText)
        if(searchText === '' || !searchText) return
        router.push('/search?word='+searchText)
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
                {selectedTab !== 'post' && (
                    <ViewHeader color={color} page={'search'} tab={selectedTab} setValue={setValue} setSearchText={setSearchText} selectedTab={selectedTab}/>
                )}
                <div className={'pt-[100px] h-[calc(100%-50px)] overflow-y-scroll'}>
                    {React.cloneElement(children as any, {
                        name: 'hoge',
                    })}
                </div>
                {selectedTab !== 'post' && (
                    <TabBar color={color} selected={'search'} setValue={setSelectedTab}/>
                )}
            </div>
        </main>
    )
}