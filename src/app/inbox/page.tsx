'use client';
import {ViewScreen} from "@/app/components/ViewScreen";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect} from "react";
import {useState} from "react";
import useDarkMode from "use-dark-mode";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/atoms/agent";

export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState([])
    const [searchText, setSearchText] = useState('ブルスコ')
    const darkMode = useDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const color = darkMode.value ? 'dark' : 'light'

    const fetchNotification = async () => {
        try{
            setLoading(true)
            const res = await agent?.listNotifications()
            if (res) {
                const { data } = res;
                console.log(data);
                const replyNotifications = data.notifications.filter(notification => notification.reason === 'reply' || notification.reason === 'mention')
                console.log(replyNotifications)
                const hoge = await agent?.getPosts({ uris: replyNotifications.map((notification: any) => notification.uri) })
                console.log(hoge)
                setNotification(hoge?.data?.posts)

            } else {
                // もしresがundefinedだった場合の処理
                console.log('Responseがundefinedです。')
            }
            setLoading(false)
            console.log(notification)
        }catch(e){
            setLoading(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if(!agent) return
        console.log('Effect')
        fetchNotification();
    }, [agent]);

    return(
        <>
            {loading ? (
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
                notification.map((post, index) => (
                    // eslint-disable-next-line react/jsx-key
                    <ViewPostCard key={index} color={color} numbersOfImage={0} postJson={post} isMobile={isMobile}/>
                ))
            )}
        </>
    )
}