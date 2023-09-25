'use client';

import {TabBar} from "@/app/components/TabBar";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import {useEffect, useState} from "react";
import useDarkMode from "use-dark-mode";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/atoms/agent";



export default function Root(props:any) {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [timeline, setTimeline] = useState([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState([])
    const [cursor, setCursor] = useState(null)
    const darkMode = useDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const color = darkMode.value ? 'dark' : 'light'


    const handleRefresh = () => {
        console.log('refresh')
        setTimeline(newTimeline)
        setAvailableNewTimeline(false)
    }


    const fetchTimeline = async () => {
        try{
            setLoading(true)
            const res = await agent?.getTimeline({limit:30})
            if (res) {
                const { data } = res;
                const {feed} = data
                const seenUris = new Set<string>();
                const filteredData = feed.filter(item => {
                    const uri = item.post.uri;
                    // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
                    if (!seenUris.has(uri)) {
                        seenUris.add(uri);
                        return true;
                    }
                    return false;
                });
                console.log(data);
                setCursor(data.cursor)
                setTimeline(filteredData);
                filteredData.map((post: any) => {
                    console.log(post)
                })
            } else {
                // もしresがundefinedだった場合の処理
                console.log('Responseがundefinedです。')
            }
            setLoading(false)
        }catch(e){
            setLoading(false)
            console.log(e)
        }
    }

    const checkNewTimeline = async () => {
        const res = await agent?.getTimeline({limit:30})
        if (res) {
            const { data } = res;
            const {feed} = data
            const seenUris = new Set<string>();
            const filteredData = feed.filter(item => {
                const uri = item.post.uri;
                // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
                if (!seenUris.has(uri)) {
                    seenUris.add(uri);
                    return true;
                }
                return false;
            });
            console.log(data.cursor);
            console.log(cursor)
            if(data.cursor !== cursor){
                setCursor(data.cursor)
                setAvailableNewTimeline(true)
                setNewTimeline(filteredData)
                //setTimeline(filteredData);
            }
        }
    }

    useEffect(() => {
        if(!agent) return
        fetchTimeline()
    },[agent])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 10000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval); // インターバルをクリーンアップ
        };
    },[agent, cursor])

    return(
        <>
            <main className={'max-w-[600px]'}>
                {availavleNewTimeline && (
                    <div className={' absolute top-[120px] left-[200px] right-[200px] z-[9999999999] items-center justify-center flex'}>
                        <div className={'text-black h-[30px] w-[80px] bg-blue-50 rounded-full cursor-pointer'}
                             onClick={handleRefresh}
                        >New Posts</div>
                    </div>
                )}{
                loading ? (
                    Array.from({ length: 15 }, (_, index) => (
                        <ViewPostCard
                            key={`skeleton-${index}`}
                            color={color}
                            numbersOfImage={0}
                            postJson={null}
                            isMobile={isMobile}
                            isSkeleton={true}
                        />
                    ))
                ) : (
                    timeline.map((post, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <ViewPostCard key={index} color={color} numbersOfImage={0} postJson={post.post} json={post} isMobile={isMobile}/>
                    ))
                )
            }
            </main>
        </>
    )
}