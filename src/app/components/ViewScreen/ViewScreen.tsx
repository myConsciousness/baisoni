import React, { useState, useEffect } from "react";
import { viewScreen } from "./styles";
import { ViewHeader } from "../ViewHeader";
import { TabBar } from "../TabBar";
import {ViewPostCard} from "../ViewPostCard";
import {Spinner} from "@nextui-org/react";
import {ViewSideBar} from "../ViewSideBar";
import {Navbar} from "@nextui-org/react";
import {SearchTabtPage} from "../SearchTabPage";
//import {Swiper} from "swiper/react"
//import useDarkMode from "use-dark-mode";

interface Props {
    className?: string;
    color: "light" | "dark";
    isMobile?: boolean;
    uploadImageAvailable?: boolean;
    isDragActive?: boolean;
    open?: boolean;
    tab: "home" | "search" | "inbox" | "post";
}
import { useAgent } from '../../atoms/agent'


export const ViewScreen: React.FC<Props> = (props: Props) => {
    const [agent, setAgent] = useAgent()
    const { className, isMobile, uploadImageAvailable, tab } = props;
    const { background, tabbar } = viewScreen();
    const [loading, setLoading] = useState(true);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [value, setValue] = useState(false)
    const [selectedTab, setSelectedTab] = useState(tab);
    const [searchText, setSearchText] = useState("");
    const darkMode = true
    const color = darkMode ? 'dark' : 'light'



    const fetchResult = async (query: string) => {
        try {
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

            setSearchResult(results);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Effect')
        fetchResult(searchText);
    }, [searchText]);

    return (
        <main className={background({ color: color, isMobile: isMobile })}>
            <div className={'h-full max-w-[600px] min-w-[350px] w-full overflow-y-scroll'}>
                <ViewSideBar color={color} isBarOpen={value} />
                <div className={''}>
                    <ViewHeader color={color} page={'search'} tab={selectedTab} setValue={setValue} setSearchText={setSearchText} selectedTab={selectedTab}/>
                    <div className={'pt-[100px] h-full'}>
                        {selectedTab === 'search' && searchText !== '' && (
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
                                searchResult.map((post, index) => (
                                    // eslint-disable-next-line react/jsx-key
                                    <ViewPostCard key={`search-${index}-${post.uri}`} color={color} numbersOfImage={0} postJson={post} isMobile={isMobile}/>
                                ))
                            )
                        )}
                        {selectedTab === 'search' && searchText === '' && (
                            <SearchTabtPage color={color} isMobile={isMobile} />
                        )}
                    </div>
                </div>
                <TabBar
                    className={tabbar()}
                    color={color}
                    selected={'search'}
                    setValue={setSelectedTab}
                />
            </div>
        </main>
    );
};

export default ViewScreen;
