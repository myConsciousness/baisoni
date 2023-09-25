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
    const darkMode = useDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const color = darkMode.value ? 'dark' : 'light'

    const fetchTimeline = async () => {
        try{
            setLoading(true)
            const res = await agent?.getTimeline()
            if (res) {
                const { data } = res;
                console.log(data);
                setTimeline(data?.feed);
                data.feed.map((post: any) => {
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

    useEffect(() => {
        if(!agent) return
        fetchTimeline()
    },[agent])

    return(
        <>
            {
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
        </>
    )
}