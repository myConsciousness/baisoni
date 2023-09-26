'use client';

import {TabBar} from "@/app/components/TabBar";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect, useState} from "react";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/atoms/agent";
import InfiniteScroll  from "react-infinite-scroller"
import {Spinner} from "@nextui-org/react"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";



export default function Root(props:any) {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false);
    const color = darkMode ? 'dark' : 'light'

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);



    const handleRefresh = () => {
        console.log('refresh');

        // newtimelineとtimelineの差分を取得
        console.log(timeline)
        console.log(newTimeline)
        const diffTimeline = newTimeline.filter(newItem => {
            return !timeline.some(oldItem => oldItem.post.uri === newItem.post.uri);
        });
        console.log(diffTimeline);
        // timelineに差分を追加
        setTimeline([...diffTimeline, ...timeline]);
        setAvailableNewTimeline(false);
    }

    const FormattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>();
        const filteredData = timeline.filter(item => {
            const uri = item.post.uri;
            if(item.reply){
                if(item.reason) return true
                //@ts-ignore
                if((item.post.author.did === item.reply.parent.author.did) && (item.reply.parent.author.did === item.reply.root.author.did)) return true
                return false
            }
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri);
                return true;
            }
            return false;
        });
        return filteredData as FeedViewPost[];
    }


    const fetchTimeline = async () => {
        if(!agent) return
        try{
            setLoading(true)
            const {data} = await agent.getTimeline({limit:30})
            if (data) {
                if(data.cursor){
                    setCursor(data.cursor)
                }
                const {feed} = data
                const filteredData = FormattingTimeline(feed)
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

    const loadMore = async (page:any) => {
        if(!agent) return
        if(!cursor) return
        try{
            setLoading2(true)
            const {data} = await agent.getTimeline({cursor: !hasCursor ? cursor : hasCursor});
            const {feed} = data
            if(data.cursor){
                setHasCursor(data.cursor)
            }
            const filteredData = FormattingTimeline(feed)
            const diffTimeline = filteredData.filter(newItem => {
                return !timeline.some(oldItem => oldItem.post === newItem.post);
            });

            //取得データをリストに追加
            setTimeline([...timeline, ...diffTimeline])
            setLoading2(false)
        }catch(e){
            setLoading2(false)
            console.log(e)
        }
    }

    const checkNewTimeline = async () => {
        if(!agent) return
        try{
            const {data} = await agent?.getTimeline({limit:30})
            if (data) {
                const {feed} = data
                const filteredData = FormattingTimeline(feed)

                if(data.cursor && data.cursor !== cursor){
                    setNewCursor(data.cursor)
                    setAvailableNewTimeline(true)
                    setNewTimeline(filteredData)
                }
            }
        }catch (e) {

        }
    }

    useEffect(() => {
        if(!agent) return
        fetchTimeline()
    },[agent])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval); // インターバルをクリーンアップ
        };
    },[agent, cursor])

    return(
        <>
            {availavleNewTimeline && (
                <div className={' absolute top-[120px] left-[200px] right-[200px] z-[9999999999] items-center justify-center flex'}>
                    <div className={'text-black h-[30px] w-[80px] bg-blue-50 rounded-full cursor-pointer'}
                         onClick={handleRefresh}
                    >New Posts</div>
                </div>
            )}
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
                <InfiniteScroll
                    loadMore={loadMore}    //項目を読み込む際に処理するコールバック関数
                    hasMore={!loading2}         //読み込みを行うかどうかの判定
                    loader={<Spinner/>}
                    threshold={1000}
                    useWindow={true}
                >
                    {timeline.map((post, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <ViewPostCard key={index} color={color} numbersOfImage={0} postJson={post.post} json={post} isMobile={isMobile}/>
                    ))}
                </InfiniteScroll>
            )}
        </>
    )
}