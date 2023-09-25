'use client';
import {ViewHeader} from "@/app/components/ViewHeader";
import React, {useState} from "react";
import useDarkMode from "use-dark-mode";
import {layout} from "@/app/styles";
import {TabBar} from "@/app/components/TabBar";
import {isMobile} from "react-device-detect";
import { usePathname } from 'next/navigation';
import {useRequiredSession} from "@/app/lib/hooks/useRequiredSession";


export function AppConatiner({ children }: { children: React.ReactNode }) {
    const { agent } = useRequiredSession()

    const darkMode = useDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const color = darkMode.value ? 'dark' : 'light'
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [value, setValue] = useState(false)
    const pathname = usePathname();
    const tab = pathname === '/' ? 'home' : pathname;
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">("home");
    const [searchText, setSearchText] = useState("");
    const {background} = layout();
    const [ count, setCount ] = useState(0)


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