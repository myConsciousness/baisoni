'use client';

import {TabBar} from "@/app/components/TabBar";
import {ViewPostCard} from "@/app/components/ViewPostCard";
import React, {useEffect, useState} from "react";
import {isMobile} from "react-device-detect";
import {useAgent} from "@/app/atoms/agent";
import InfiniteScroll  from "react-infinite-scroller"
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {usePathname} from "next/navigation";
import { viewProfilePage } from "./styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faImage, faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faCopy, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button,
    Image,
    Spinner,
    Input,
    Popover, PopoverTrigger, PopoverContent,useDisclosure
} from "@nextui-org/react";


export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const pathname = usePathname()
    const username = pathname.replace('/profile/','')
    console.log(username)
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false);
    const [isProfileMine, setIsProfileMine] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [onHoverButton, setOnHoverButton] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const color = darkMode ? 'dark' : 'light'

    const { background, ProfileContainer, ProfileInfoContainer, HeaderImageContainer, ProfileHeaderImage,
        ProfileImage, ProfileDisplayName, ProfileHandle, ProfileCopyButton, ProfileActionButton,FollowButton,ProfileBio,Buttons, PropertyButton, PostContainer,
        dropdown,
    } = viewProfilePage();

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
            const {data} = await agent.getAuthorFeed({actor: username})
            if (data) {
                if(data.cursor){
                    setCursor(data.cursor)
                }
                const {feed} = data
                const filteredData = FormattingTimeline(feed)
                setTimeline(filteredData);
                /*filteredData.map((post: any) => {
                    console.log(post)
                })*/
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

    const fetchProfile = async () => {
        if(!agent) return
        try{
            const {data} = await agent.getProfile({actor: username})
            console.log(data)
            setProfile(data)
        }catch (e) {

        }
    }

    const loadMore = async (page:any) => {
        if(!agent) return
        if(!cursor) return
        if(loading) return
        if(loading2) return
        try{
            setLoading2(true)
            const {data} = await agent.getAuthorFeed({cursor: !hasCursor ? cursor : hasCursor, actor: username});
            const {feed} = data
            if(data.cursor){
                setHasCursor(data.cursor)
            }
            const filteredData = FormattingTimeline(feed)
            const diffTimeline = filteredData.filter(newItem => {
                return !timeline.some(oldItem => oldItem.post.uri === newItem.post.uri);
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
            const {data} = await agent?.getAuthorFeed({actor: username})
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
        if(!agent) return
        fetchProfile()
    },[agent, username])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval); // インターバルをクリーンアップ
        };
    },[agent, cursor])

    return profile && (
        <>
            <main className={background({color:color, isMobile:isMobile})}>
                <div className={ProfileContainer()}>
                    <div className={HeaderImageContainer()}>
                        <img className={ProfileHeaderImage()} src={profile?.banner}/>
                    </div>
                    <div className={ProfileInfoContainer({color:color})}>
                        <img className={ProfileImage()} src={profile?.avatar}/>
                        <div className={Buttons()}>
                            <Dropdown className={dropdown({color: color})}>
                                <DropdownTrigger>
                                    <div className={ProfileCopyButton()}>
                                        <FontAwesomeIcon icon={faCopy} className={PropertyButton()}/>

                                    </div>
                                </DropdownTrigger>
                                <DropdownMenu >
                                    <DropdownItem key="new"
                                        onClick={() => {
                                            navigator.clipboard.writeText(profile.did)
                                        }}>Copy DID</DropdownItem>
                                    <DropdownItem key="copy"
                                        onClick={() => {
                                            navigator.clipboard.writeText(profile.handle)
                                        }}>Copy Handle</DropdownItem>
                                    <DropdownItem key="edit" showDivider
                                                  onClick={() => {
                                                      navigator.clipboard.writeText(profile.displayName)
                                                  }}
                                    >Copy DisplayName</DropdownItem>
                                    <DropdownItem
                                        key="delete"
                                    >
                                        Delete file
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            {profile.did !== agent?.session?.did &&(
                                <Dropdown className={dropdown({color: color})}>
                                    <DropdownTrigger>
                                        <div className={ProfileActionButton()}>
                                            <FontAwesomeIcon icon={faEllipsis} className={PropertyButton()}/>
                                        </div>
                                    </DropdownTrigger>
                                    <DropdownMenu >
                                        <DropdownItem
                                            key="report"
                                        >Mute {profile.handle}</DropdownItem>
                                        <DropdownItem
                                            key="report"
                                        >Report @bisn.ucho-ten.net</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                            <Button className={FollowButton()}
                                    onMouseLeave={() => {
                                        setOnHoverButton(false)
                                    }}
                                    onMouseEnter={() => {
                                        setOnHoverButton(true)
                                    }}
                            >
                                {profile.did === agent?.session?.did ? ('Edit Profile') : isFollowing ? !onHoverButton ? ('Following') : ('Un Follow') : ('Follow')}
                            </Button>
                        </div>
                        <div className={ProfileDisplayName()}>{profile.displayName}</div>
                        <div className={ProfileHandle({isMobile:isMobile})}>@{profile.handle}</div>
                        <div className={ProfileBio({isMobile:isMobile})}>{profile?.description}</div>
                    </div>
                </div>
                <>
                    <>
                    </>
                </>
            </main>
        </>
    )
}