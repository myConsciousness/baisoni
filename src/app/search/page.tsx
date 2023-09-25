'use client';
import {ViewScreen} from "@/app/components/ViewScreen";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect} from "react";
import {useState} from "react";
import useDarkMode from "use-dark-mode";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/atoms/agent";
import { useSearchParams } from 'next/navigation'


export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [searchResult, setSearchResult] = useState([])
    const searchParams = useSearchParams()
    const search = searchParams.get('word')
    console.log(search)
    const [searchText, setSearchText] = useState(searchParams.get('word'))
    const darkMode = useDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const color = darkMode.value ? 'dark' : 'light'


    const fetchResult = async (query: string) => {
        try {
            console.log(agent)
            if (!agent) return;
            setLoading(true);
            if (query === '') return;
            const res = await fetch(`https://search.bsky.social/search/posts?q=${query}&offset=0`);
            const json = await res.json();

            const outputArray = json.map((item: any) => `at://${item.user.did as string}/${item.tid as string}`);

            if (outputArray.length === 0) return;

            const maxBatchSize = 25; // 1つのリクエストに許容される最大数
            const batches = [];
            for (let i = 0; i < outputArray.length; i += maxBatchSize) {
                const batch = outputArray.slice(i, i + maxBatchSize);
                batches.push(batch);
            }

            const results = [];

            for (const batch of batches) {
                const { data } = await agent?.getPosts({ uris: batch });
                const { posts } = data;
                results.push(...posts);
            }
            console.log(results)

            setSearchResult(results);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSearchText(search)
    },[search])

    useEffect(() => {
        console.log('Effect')
        console.log(searchText)
        if(searchText === '' || !searchText) return
        fetchResult(searchText);
    }, [agent, searchText]);

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
                searchResult.map((post, index) => (
                    // eslint-disable-next-line react/jsx-key
                    <ViewPostCard key={index} color={color} numbersOfImage={0} postJson={post} isMobile={isMobile}/>
                ))
            )}
        </>
    )
}