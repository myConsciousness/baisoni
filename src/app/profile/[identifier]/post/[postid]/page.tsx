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
import { postOnlyPage } from "./styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBookmark as faRegularBookmark,
    faComment,
    faImage,
    faSquare as faRegularSquare,
    faTrashCan
} from '@fortawesome/free-regular-svg-icons'
import {
    faArrowUpFromBracket,
    faBookmark as faSolidBookmark, faCheckCircle, faCircleQuestion, faCircleXmark, faCode,
    faCopy,
    faEllipsis, faFlag, faHashtag, faLanguage,
    faQuoteLeft,
    faRetweet,
    faSquare as faSolidSquare, faTrash, faU, faUser
} from '@fortawesome/free-solid-svg-icons'
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
    Popover, PopoverTrigger, PopoverContent, useDisclosure, Link, Chip, Tooltip
} from "@nextui-org/react";

import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';


export default function Root() {
    const [agent, setAgent] = useAgent()
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const pathname = usePathname()
    const username = pathname.replace('/profile/','')
    console.log(username)
    const atUri1 = pathname.replace('/profile/','at://')
    const atUri = atUri1.replace('/post/','/app.bsky.feed.post/')
    const [timeline, setTimeline] = useState<FeedViewPost[]>([])
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [post, setPost] = useState<any>(null)
    const [newCursor, setNewCursor] = useState<string | null>(null)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasCursor, setHasCursor] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(false);
    const [isTranslated, setIsTranslated] = useState(false)
    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [viewTranslatedText, setViewTranslatedText] = useState<boolean>(true)
    const [translateError, setTranslateError] = useState<boolean>(false)
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
    const [isPostMine, setIsPostMine] = useState<boolean>(false)
    const color = darkMode ? 'dark' : 'light'

    const { Container,AuthorPost,Author, AuthorIcon, AuthorDisplayName,AuthorHandle,PostContent,PostCreatedAt,ReactionButtonContainer,ReactionButton,dropdown
    } = postOnlyPage();

    const modeMe = (e:any) => {
        setDarkMode(!!e.matches);
    };

    useEffect(() => {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        setDarkMode(matchMedia.matches);
        matchMedia.addEventListener("change", modeMe);

        return () => matchMedia.removeEventListener("change", modeMe);
    }, []);

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


    const fetchPost = async () => {
        if(!agent) return
        try{
            const {data} = await agent.getPostThread({uri: atUri})
            console.log(data)
            setPost(data.thread)
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


    useEffect(() => {
        if(!agent) return
        fetchPost()
    },[agent, atUri])


    const renderTextWithLinks = () => {
        const encoder = new TextEncoder();
        let decoder = new TextDecoder();
        if(!post.post.record?.facets){
            let memo: any[] = []
            post.post.record.text.split('\n').map((line:any, i:number) => {
                memo.push(<p key={i}>{line}<br/></p>)
            })
            return memo
        }
        const { text, facets } = post.post.record;
        const text_bytes = encoder.encode(text);
        let result: any[] = [];
        let lastOffset = 0;

        facets.forEach((facet:any, index:number) => {
            const { byteStart, byteEnd } = facet.index;
            const facetText = decoder.decode(text_bytes.slice(byteStart, byteEnd));

            // 直前のテキストを追加
            if (byteStart > lastOffset) {
                const nonLinkText = decoder.decode(text_bytes.slice(lastOffset, byteStart));
                nonLinkText.split('\n').map((line:any, i:number) => {
                    result.push(<span key={`text-${i}-${byteStart}`}>{line}</span>)

                })
            }

            switch (facet.features[0].$type) {
                case "app.bsky.richtext.facet#mention":
                    result.push(
                        <Link key={`link-${index}-${byteStart}`} href={`/profile/${facet.features[0].did}`}>
                            {facetText}
                        </Link>
                    )
                    break

                case "app.bsky.richtext.facet#link":
                    result.push(
                        <span>
                            <Chip
                                className={color}
                                startContent={<Tooltip showArrow={true} color={'foreground'}
                                                       content={facetText === facet.features[0].uri ? "リンク偽装の心配はありません。" : facet.features[0].uri.includes(facetText.replace('...', '')) ?  'URL短縮の可能性があります。' : 'リンク偽装の可能性があります。'}
                                >
                                    <FontAwesomeIcon icon={facetText === facet.features[0].uri ? faCheckCircle : facet.features[0].uri.includes(facetText.replace('...', '')) ? faCircleQuestion : faCircleXmark} />
                                </Tooltip>}
                                variant="faded"
                                color={facetText === facet.features[0].uri ? "success" : facet.features[0].uri.includes(facetText.replace('...', '')) ? 'default' : "danger"}
                            >
                            <a key={`a-${index}-${byteStart}`} href={facet.features[0].uri} target={"_blank"} rel={"noopener noreferrer"}>
                                {facetText}
                            </a>
                            </Chip>
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#tag":
                    result.push(
                        <span>
                            <Chip
                                className={color}
                                startContent={<FontAwesomeIcon icon={faHashtag} />}
                                variant="faded"
                                color="primary"
                            >
                            <a key={`a-${index}-${byteStart}`} href={`/search?searchWord=${(facet.features[0].tag.replace('#', '%23'))}&target=posts`}>
                                {facetText.replace('#', '')}
                            </a>
                        </Chip>
                        </span>
                    )
                    break
            }

            lastOffset = byteEnd;
        });

        // 最後のテキストを追加
        if (lastOffset < text_bytes.length) {
            const nonLinkText = decoder.decode(text_bytes.slice(lastOffset));
            nonLinkText.split('\n').map((line:any, i:number) => {
                result.push(<span key={`div-${i}-${lastOffset}`}>{line}</span>)
            })
        }

        return result
    }


    return post && (
        <main className={Container({color:color})}>
            <div className={AuthorPost()}>
                <div className={Author()}>
                    <div className={AuthorIcon()}>
                        <img src={post.post.author?.avatar}></img>
                    </div>
                    <div>
                        <div className={AuthorDisplayName()}>{post.post.author?.displayName}</div>
                        <div className={AuthorHandle()}>{post.post.author?.handle}</div>
                    </div>
                </div>
                <div className={PostContent()}>
                    {renderTextWithLinks()}
                    {translateError && (
                        <div className={'text-red-500'}>
                            Translation error
                        </div>
                    )}
                    {translatedText !== null && viewTranslatedText && (
                        <>
                            <div className={'select-none'}>
                                Translated by Google
                            </div>
                            <div>
                                {translatedText}
                                <span
                                    onClick={() => {
                                        setViewTranslatedText(false)
                                    }}
                                    className={'cursor-pointer'}
                                > - View original text </span>
                            </div>
                        </>

                    )}
                </div>
                <div className={PostCreatedAt()}>
                    {post.post.indexedAt}
                </div>
                <div className={ReactionButtonContainer()}>
                    <FontAwesomeIcon icon={faComment} className={ReactionButton()}></FontAwesomeIcon>
                    <FontAwesomeIcon icon={faQuoteLeft} className={ReactionButton()}></FontAwesomeIcon>
                    <FontAwesomeIcon icon={faRetweet} className={ReactionButton()}></FontAwesomeIcon>
                    <FontAwesomeIcon icon={!isLiked ? faRegularSquare : faSolidSquare} className={ReactionButton()}></FontAwesomeIcon>
                    <FontAwesomeIcon icon={!isBookmarked ? faRegularBookmark: faSolidBookmark} className={ReactionButton()}></FontAwesomeIcon>
                    <Dropdown className={dropdown({color:color})}>
                        <DropdownTrigger>
                            <FontAwesomeIcon icon={faEllipsis} className={ReactionButton()}/>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownSection title="Actions" showDivider>
                                <DropdownItem key="share"
                                              startContent={<FontAwesomeIcon icon={faArrowUpFromBracket} />}
                                >
                                    Share
                                </DropdownItem>
                                {post.post.record?.text && (
                                    <DropdownItem key="translate"
                                                  startContent={<FontAwesomeIcon icon={faLanguage} />}
                                                  onClick={async() => {
                                                      setIsTranslated(true)
                                                      setViewTranslatedText(true)
                                                      const res = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=auto&dt=t&q=' + encodeURIComponent(post.post.record.text))
                                                      if(res.status === 200) {
                                                          const json = await res.json()
                                                          if(json[0] !== undefined) {
                                                              const combinedText = json[0].reduce((acc: string, item: any[]) => {
                                                                  if (item[0]) {
                                                                      return acc + item[0];
                                                                  }
                                                                  return acc;
                                                              }, '');
                                                              setTranslatedText(combinedText)
                                                          }

                                                      } else {
                                                          setTranslateError(true)
                                                      }
                                                  }}
                                    >
                                        Translate
                                    </DropdownItem>
                                )}
                            </DropdownSection>
                            <DropdownSection title="Copy" showDivider={isPostMine}>
                                <DropdownItem key="json" startContent={<FontAwesomeIcon icon={faCode} />}
                                              onClick={() => {
                                                  navigator.clipboard.writeText(JSON.stringify(post.post))
                                              }}
                                >
                                    JSON
                                </DropdownItem>
                                <DropdownItem key="uri" startContent={<FontAwesomeIcon icon={faU} />}
                                              onClick={() => {
                                                  navigator.clipboard.writeText(atUri)
                                              }}
                                >
                                    Post URI
                                </DropdownItem>
                                <DropdownItem key="did" startContent={<FontAwesomeIcon icon={faUser} />}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(post.post.author.did)
                                                }}
                                >
                                    Author DID
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Danger zone">
                                {agent?.session?.did !== post.post.author.did ? (
                                    <DropdownItem
                                        key="delete"
                                        className="text-danger"
                                        color="danger"
                                        startContent={<FontAwesomeIcon icon={faFlag} />}
                                    >
                                        Report
                                    </DropdownItem>
                                ) : (
                                    <DropdownItem
                                        key="delete"
                                        className="text-danger"
                                        color="danger"
                                        startContent={<FontAwesomeIcon icon={faTrash} />}
                                    >
                                        Delete
                                    </DropdownItem>
                                )
                                }
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </main>
    )
}