import React, {useState, useRef, useCallback, useEffect} from "react";
import { viewHeader } from "./styles";
import { BrowserView, MobileView, isMobile } from "react-device-detect"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faImage } from '@fortawesome/free-regular-svg-icons'
import { faPlus, faChevronLeft, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import 'react-circular-progressbar/dist/styles.css';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button,
    Image,
    Spinner,
    ScrollShadow,
    Popover, PopoverTrigger, PopoverContent,
} from "@nextui-org/react";

import {Tabs, Tab, Chip} from "@nextui-org/react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAgent} from "@/app/_atoms/agent";
import {useRequiredSession} from "@/app/_lib/hooks/useRequiredSession";


interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    open?: boolean
    tab: 'home' | 'search' | 'inbox' | 'post'
    page: 'profile' | 'home' | 'post' | 'search'
    isNextPage? : boolean
    setValue?: any
    selectedTab: string
    setSearchText?: any
}
export const ViewHeader: React.FC<Props> = (props: Props) => {
    const {agent} = useRequiredSession()
    const {className, color, isMobile, open, tab, page, isNextPage, setValue, selectedTab} = props;
    const router = useRouter()
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/;
    const searchParams = useSearchParams()
    const [searchText, setSearchText] = useState('');
    const target = searchParams.get('target')
    const [loading, setLoading] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)
    const [isComposing, setComposing] = useState(false);
    const [userPrefences, setUserPrefences] = useState<any>({})
    const [pinnedFeeds, setPinnedFeeds] = useState<any>([])
    const {Header, HeaderContentTitleContainer, HeaderContentTitle,
            top,
            bottom,HeaderInputArea,
    } = viewHeader();
    const AppearanceColor = color

    const fetchUserPrefences = async () => {
        try{
            console.log('fetch prefences')
            if(!agent) return
            const res = await agent.getPreferences()
            if (res) {
                //const { preferences } = res;
                //console.log(data);
                console.log(res)
                setUserPrefences(res)
                const {data} = await agent.app.bsky.feed.getFeedGenerators({feeds: res.feeds.pinned as string[]})
                console.log(data)
                setPinnedFeeds(data.feeds)
            } else {
                // もしresがundefinedだった場合の処理
                console.log('Responseがundefinedです。')
            }
        }catch(e){
            console.log(e)
        }
    }

    useEffect(() => {
        fetchUserPrefences()
    },[agent])

    useEffect(() => {
        const search = searchParams.get('word')
        if(!search) return
        setSearchText(search)
    },[])

    return (
        <main className={Header()}>
            <div className={top()}>
                <Button
                    className={'absolute left-[0px] p-[20px] text-white'}
                    variant="light"
                    startContent={<FontAwesomeIcon
                        className={'h-[20px]'}
                        icon={isNextPage ? faChevronLeft : faBars}/>}
                    onClick={() => {
                        setIsSideBarOpen(!isSideBarOpen)
                        //console.log(setValue)
                        props.setValue(true)
                    }}
                />
                {selectedTab === 'search' ? (
                    <div
                        className={'h-[40px] w-[60%] rounded-[10px] overflow-hidden relative'}

                    >
                        <input
                            id={'searchBar'}
                            className={HeaderInputArea({color:color})}
                            value={searchText}
                            autoFocus={true}
                            onChange={(e) => {
                                setSearchText(e.target.value)
                            }}
                            placeholder={'search word'}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter" || isComposing) return; //1
                                props.setSearchText(searchText)
                                document.getElementById("searchBar")?.blur()
                                router.push(`/search?word=${encodeURIComponent(searchText)}&target=${target}`)
                            }}
                            onCompositionStart={() => setComposing(true)}
                            onCompositionEnd={() => setComposing(false)}
                        />
                        {searchText && searchText.length > 0 && (
                            <button
                                className={'absolute right-[8px] top-[8px] bg-black bg-opacity-30 rounded-full h-[25px] w-[25px] flex items-center justify-center'}
                                onClick={() => {
                                    setSearchText("")
                                    props.setSearchText("")
                                }}
                            >
                                <FontAwesomeIcon className={'h-[20px]'} icon={faXmark}/>
                            </button>
                        )}
                    </div>
                ) : (
                    <img
                        className={'h-[100%] w-[145px]'}
                        src={'https://raw.githubusercontent.com/hota1024/ucho-ten/190ebcbd9619eb94c85d81d64285b16f36508a47/public/images/Logo/ucho-ten.svg'}/>
                )}
                {selectedTab === 'single' && (
                    <Button
                        variant="light"
                        className={'absolute right-[0px] p-[20px] text-white'}
                        startContent={
                            <FontAwesomeIcon
                                className={'h-[20px]'}
                                icon={faPlus}
                            />
                        }
                    />
                )}

            </div>
            <ScrollShadow className={bottom({page:page})}
                          style={{overflowX:'scroll', overflowY:'hidden'}}
                          orientation="horizontal"
                          hideScrollBar>
                {selectedTab === 'home'  && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white"
                        }}
                        style={{marginLeft:'40px'}}
                    >
                        {Object.keys(userPrefences).length > 0 && (
                            <Tab key="following"
                                 title={
                                     <div className="flex items-center pl-[15px] pr-[15px]">
                                         <span>Following</span>
                                     </div>
                                 }
                            />
                        )}
                        {pinnedFeeds.map((feed:any, index:number) => (
                            <Tab key={feed.uri}
                                 title={
                                        <div className="flex items-center pl-[15px] pr-[15px]">
                                            <span>{feed.displayName}</span>
                                        </div>
                                 }
                            />
                        ))}
                    </Tabs>
                )}
                {selectedTab === 'inbox' && (
                    <div className={HeaderContentTitle({page:page})}>Inbox</div>
                )}
                {selectedTab === 'post' && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white"
                        }}
                    >
                        <Tab key="1"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     {/* eslint-disable-next-line react/no-unescaped-entities */}
                                     <span>Author's</span>
                                 </div>
                             }
                        />
                        <Tab key="2"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     {/* eslint-disable-next-line react/no-unescaped-entities */}
                                     <span>Other's</span>
                                 </div>
                             }
                        />
                    </Tabs>
                )}
                {selectedTab === 'search'  && (
                    target ? (
                        <Tabs
                            aria-label="Options"
                            color="primary"
                            variant="underlined"
                            classNames={{
                                tabList: "w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-[#6A52FF]",
                                tab: "max-w-fit px-0 h-[100%]",
                                tabContent: "group-data-[selected=true]:text-white"
                            }}
                            onSelectionChange={(e) => {
                                router.push(`/search?word=${encodeURIComponent(searchText)}&target=${e}`)
                            }}
                            selectedKey={searchParams.get('target') || 'posts'}
                        >
                            <Tab key="posts"
                                 title={
                                     <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                         <span>Posts</span>
                                     </div>
                                 }
                            />
                            <Tab key="feeds"
                                 title={
                                     <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                         <span>Feeds</span>
                                     </div>
                                 }
                            />
                            <Tab key="users"
                                 title={
                                     <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                         <span>Users</span>
                                     </div>
                                 }
                            />
                        </Tabs>
                    ):(
                        <div>Search</div>
                    )
                )}
                {selectedTab === 'profile'  && (
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-[#6A52FF]",
                            tab: "max-w-fit px-0 h-[100%]",
                            tabContent: "group-data-[selected=true]:text-white"
                        }}
                    >
                        <Tab key="1"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     <span>Posts</span>
                                 </div>
                             }
                        />
                        <Tab key="2"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     <span>Replies</span>
                                 </div>
                             }
                        />
                        <Tab key="3"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     <span>Media</span>
                                 </div>
                             }
                        />
                        <Tab key="4"
                             title={
                                 <div className="flex items-center pl-[15px] pr-[15px] w-[50%]">
                                     <span>Feeds</span>
                                 </div>
                             }
                        />
                    </Tabs>
                )}
            </ScrollShadow>
        </main>
    );
}

export default ViewHeader;