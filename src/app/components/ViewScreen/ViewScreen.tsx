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
interface Props {
    className?: string;
    color: "light" | "dark";
    isMobile?: boolean;
    uploadImageAvailable?: boolean;
    isDragActive?: boolean;
    open?: boolean;
}
import { useAgent } from '../../atoms/agent'
import { useRequiredSession } from '../../lib/hooks/useRequiredSession'


export const ViewScreen: React.FC<Props> = (props: Props) => {
    const { agent } = useRequiredSession()
    const { className, color, isMobile, uploadImageAvailable, open } = props;
    const { background, tabbar } = viewScreen();
    const [loading, setLoading] = useState(true);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [value, setValue] = useState(false)
    const [selectedTab, setSelectedTab] = useState<"home" | "search" | "inbox" | "post">("search");
    const [searchText, setSearchText] = useState("");


    const fetchResult = async (query:string) => {
        try {
            console.log(agent)
            if(!agent) return;
            setLoading(true);
            if(query === '') return;
            const res = await fetch(`https://search.bsky.social/search/posts?q=${query}&offset=0`)
            const json = await res.json()
            //setSearchResult(json);
            console.log(json)
            const outputArray = json.map((item:any) => `at://${item.user.did as string}/${item.tid as string}`);

            if(outputArray.length === 0) return;
            if(outputArray.length >= 26) {
                outputArray.splice(1,6)
            }
            const {data} = await agent?.getPosts({uris: outputArray});
            const {posts} = data
            console.log(await posts)
            setSearchResult(posts);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        fetchResult(searchText);
    }, [searchText]);

    return (
        <main className={background({ color: color, isMobile: isMobile })}>
            <div className={'h-full max-w-[600px] min-w-[350px] w-full overflow-y-scroll'}>
                <ViewSideBar color={color} isBarOpen={value} />
                <div className={''}>
                    <ViewHeader color={color} page={"search"} setValue={setValue} setSearchText={setSearchText} selectedTab={selectedTab}/>
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
                                searchResult.map((post) => (
                                    // eslint-disable-next-line react/jsx-key
                                    <ViewPostCard color={color} numbersOfImage={0} postJson={post} isMobile={isMobile}/>
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
