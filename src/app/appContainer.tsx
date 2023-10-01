'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState, useEffect} from "react";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";
import {ViewSideBar} from "@/app/components/ViewSideBar";
//import { useSpring, animated, interpolate } from '@react-spring/web'
//import { useDrag } from '@use-gesture/react';
import './sidebar.css'

export function AppConatiner({ children }: { children: React.ReactNode }) {
    //ここでsession作っておかないとpost画面を直で行った時にpostできないため
    const {agent} = useRequiredSession()
    const router = useRouter()
    let pathName = usePathname()
    const searchParams = useSearchParams()
    const target = searchParams.get('target')
    const [value, setValue] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
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

    /*const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
    const bind = useDrag(({ down, offset: [ox, oy] }) => api.start({ x: ox, y: oy, immediate: down }), {
        bounds: { left: 0, right: 300, top: 0, bottom: 0 }
    })*/
    console.log(isMatchingPath)
    return (

        <main className={background({ color: color, isMobile: isMobile })}>
            {agent ? (
                <div className={'h-full max-w-[600px] min-w-[350px] w-full overflow-x-hidden relative'}>
                    {!isMatchingPath && (
                        <ViewHeader color={color} page={'search'} tab={selectedTab} setSideBarOpen={setIsSideBarOpen} setSearchText={setSearchText} selectedTab={selectedTab}/>
                    )}
                    <div className={`z-[11] bg-black bg-opacity-50 absolute h-full w-full ${!isSideBarOpen && `hidden`}`}
                         onClick={() => setIsSideBarOpen(false)}
                    >
                        {/*<animated.div
                            className={`${isSideBarOpen && `openSideBar`} absolute h-full w-[70svw] min-w-[210px] max-w-[350px] bg-black z-[12] left-[-300px]`}
                            style={{x: x}}
                        >
                            <ViewSideBar color={color} setSideBarOpen={setIsSideBarOpen} isMobile={isMobile}/>
                        </animated.div>*/}
                        <div className={`${isSideBarOpen && `openSideBar`} absolute h-[calc(100%-50px)] w-[70svw] min-w-[210px] max-w-[350px] bg-black bg-opacity-90 z-[12] left-[-300px]`}>
                            <ViewSideBar color={color} setSideBarOpen={setIsSideBarOpen} isMobile={isMobile}/>
                        </div>
                    </div>
                    <div className={`pt-[${isMatchingPath ? `0px` : `100px`}] h-[calc(100%-50px)] overflow-y-scroll`}>
                        {children}
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

