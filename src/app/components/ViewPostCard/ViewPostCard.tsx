import React, {useCallback, useState, useMemo} from "react";
import { viewPostCard } from "./styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faComment } from '@fortawesome/free-regular-svg-icons'
import {faRetweet, faEllipsis, faFlag, faLink, faCode, faFont, faTrash} from '@fortawesome/free-solid-svg-icons'
import { faStar as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faStar as faHeartSolid, faHashtag, faCheckCircle, faCircleXmark, faCircleQuestion, faReply } from '@fortawesome/free-solid-svg-icons'
import {PostModal} from "../PostModal";
import 'react-circular-progressbar/dist/styles.css';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Link,
    Skeleton,
    Chip,
    Tooltip,
    ScrollShadow,
} from "@nextui-org/react";
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import {useAgent} from "@/app/_atoms/agent";
import {useRouter} from "next/navigation";
import {Modal, ModalContent, useDisclosure} from "@nextui-org/react";


interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    numbersOfImage: 0 | 1 | 2 | 3 | 4,
    postJson?: any
    isSkeleton?: boolean
    json?: any
}
export const ViewPostCard: React.FC<Props> = (props: Props) => {
    const [ agent ] = useAgent()
    const router = useRouter()
    const {className, color, isMobile, uploadImageAvailable, open, numbersOfImage, postJson, isSkeleton, json} = props;
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/;
    const [loading, setLoading] = useState(false)
    const [isHover, setIsHover] = useState<boolean>(false)
    const { PostCard, PostAuthor, PostContent, PostReactionButtonContainer, PostCardContainer, PostReactionButton,
        PostAuthorIcon, PostAuthorDisplayName, PostAuthorHandle, PostCreatedAt, dropdown,skeletonIcon, skeletonName, skeletonHandle, skeletonText1line, skeletonText2line,chip } = viewPostCard();
    const [isLiked, setIsLiked] = useState<boolean>(postJson?.viewer?.like)
    const [isReposted, setIsReposted] = useState<boolean>(postJson?.viewer?.repost)
    const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false)
    const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);
    const [postInfo, setPostInfo] = useState<any>(null)
    const [isTextSelectionInProgress, setIsTextSelectionInProgress] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const handleReply = async () => {
        //setIsPostModalOpen(true)
        console.log('open')
        onOpen()
    }

    const handleRepost = async () => {
        if(loading) return
        setLoading(true)
        if(isReposted){
            setIsReposted(!isReposted)
            const res = await agent?.deleteRepost(postJson?.viewer?.repost)
            console.log(res)
        }else{
            setIsReposted(!isReposted)
            const res = await agent?.repost(postJson?.uri, postJson?.cid)
            console.log(res)
        }
        setLoading(false)
    }

    const handleLike = async () => {
        if(loading) return
        setLoading(true)
        if(isLiked){
            setIsLiked(!isLiked)
            const res = await agent?.deleteLike(postJson?.viewer?.like)
            console.log(res)
        }else{
            setIsLiked(!isLiked)
            const res = await agent?.like(postJson?.uri, postJson?.cid)
            console.log(res)
        }
        setLoading(false)
    }

    const renderTextWithLinks = useMemo(() => {
        if(!postJson?.record) return
        const encoder = new TextEncoder();
        let decoder = new TextDecoder();
        if(!postJson.record?.facets){
            let post: any[] = []
            postJson.record.text.split('\n').map((line:any, i:number) => {
                post.push(<p key={i}>{line}</p>)
            })
            return post
        }
        const { text, facets } = postJson.record;
        const text_bytes = encoder.encode(text);
        let result: any[] = [];
        let lastOffset = 0;
        facets.forEach((facet:any, index:number) => {
            const { byteStart, byteEnd } = facet.index;

            const facetText = decoder.decode(text_bytes.slice(byteStart, byteEnd));

            // 直前のテキストを追加
            if (byteStart > lastOffset) {
                const nonLinkText = decoder.decode(text_bytes.slice(lastOffset, byteStart));
                const textChunks = nonLinkText.split('\n').map((line, index, array) => (
                    <span key={`text-${byteStart}-${index}`}>{line}{index !== array.length - 1 && <br/>}</span>
                ));
                result.push(textChunks);
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
                                className={chip({color:color})}
                                startContent={<Tooltip showArrow={true} color={'foreground'}
                                    content={facetText === facet.features[0].uri ? "リンク偽装の心配はありません。" : facet.features[0].uri.includes(facetText.replace('...', '')) ?  'URL短縮の可能性があります。' : 'リンク偽装の可能性があります。'}
                                >
                                    <FontAwesomeIcon icon={facetText === facet.features[0].uri ? faCheckCircle : facet.features[0].uri.includes(facetText.replace('...', '')) ? faCircleQuestion : faCircleXmark} />
                                </Tooltip>}
                                variant="faded"
                                color={facetText === facet.features[0].uri ? "success" : facet.features[0].uri.includes(facetText.replace('...', '')) ? 'default' : "danger"}
                            >
                                {(facet.features[0].uri).startsWith('https://bsky.app') ? (
                                    <Link key={`a-${index}-${byteStart}`} href={facet.features[0].uri.replace('https://bsky.app',`${location.protocol}//${window.location.host}`)}>{facetText}</Link>
                                ) : (
                                    <a key={`a-${index}-${byteStart}`} href={facet.features[0].uri} target={"_blank"} rel={"noopener noreferrer"}>
                                        {facetText}
                                    </a>
                                )}
                            </Chip>
                        </span>
                    )
                    break

                case "app.bsky.richtext.facet#tag":
                    result.push(
                        <span>
                            <Chip
                                className={chip({color:color})}
                                startContent={<FontAwesomeIcon icon={faHashtag} />}
                                variant="faded"
                                color="primary"
                            >
                                <a key={`a-${index}-${byteStart}`} href={`/search?word=%23${(facet.features[0].tag.replace('#', ''))}&target=posts`}>
                                   {facetText.replace('#', '')}
                                </a>
                            </Chip>
                        </span>
                    )
                    break
            }
            lastOffset = byteEnd;
        })

        if (lastOffset < text_bytes.length) {
            const nonLinkText = decoder.decode(text_bytes.slice(lastOffset));
            const textWithLineBreaks = nonLinkText.split('\n').map((line, index) => (
                <span key={`div-${lastOffset}-${index}`}>
                    {line}
                    {index !== nonLinkText.length - 1 && <br />}
                </span>
            ))
            result.push(textWithLineBreaks);
        }
        return result
    },[])

    function formatDate(inputDate: string): string {
        const date = new Date(inputDate);
        if (isNaN(date.getTime())) return "Invalid date" // 無効な日付が与えられた場合
        const now = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 月は0から始まるため+1する
        const day = date.getDate();

        if (
            year === now.getFullYear() &&
            month === now.getMonth() + 1 &&
            day === now.getDate()
        ) {
            // 今日の場合
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        } else if (year === now.getFullYear()) {
            // 今年の場合
            return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
        } else {
            // 今年以外の場合
            const shortYear = year % 100;
            return `${String(shortYear).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(
                day
            ).padStart(2, "0")}`;
        }
    }

    return (
      <>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement={isMobile ? 'top' : 'center'} className={'z-[100] max-w-[600px]'}>
              <ModalContent
              >
                  {(onClose) => (
                      <PostModal color={color} type={'Reply'} postData={postJson} onClose={onClose}/>
                  )}
              </ModalContent>
          </Modal>
          <main className={PostCard({color:color})}
              //onMouseDown={handleTextSelect}
              //onMouseUp={handleTextDeselect}
                onClick={() => {
                    router.push(`/profile/${postJson?.author.did}/post/${postJson?.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                }}

          >
              <>
                  <>

                      <div className={PostCardContainer()}
                           onMouseEnter={() => {
                               setIsHover(true)
                           }}
                           onMouseLeave={() => {
                               setIsHover(false)
                           }}
                      >
                          {json?.reason && (
                              <Link className={'text-[13px] ml-[40px] text-[#909090] text-bold'}
                                    href={`/profile/${json.reason.by.did}`}
                              >
                                  Reposted by {json.reason.by.displayName}
                              </Link>
                          )}
                          <div className={PostAuthor()}>
                              <Link className={PostAuthorIcon()} href={`/profile/${postJson?.author.did}`}>
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonIcon({color:color})}/>
                                  ) : (
                                      <img src={postJson?.author?.avatar}/>

                                  )}
                              </Link>
                              <Link className={PostAuthorDisplayName({color: color})} style={{fontSize:'13px'}} href={`/profile/${postJson?.author.did}`}>
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonName({color:color})}/>
                                  ) : (
                                      <span>{postJson?.author?.displayName}</span>
                                  )}
                              </Link>
                              <div className={'text-[#BABABA]'}>&nbsp;-&nbsp;</div>
                              <Link className={PostAuthorHandle({color: color})} href={`/profile/${postJson?.author.did}`}>
                                  {isSkeleton ? (
                                      <Skeleton className={skeletonHandle({color: color})}/>
                                  ) : (
                                      <span>{postJson?.author?.handle}</span>
                                  )}
                              </Link>
                              <div className={PostCreatedAt()} style={{fontSize:'12px'}}>
                                  {!isMobile && isHover && !isSkeleton ? (
                                      <Dropdown className={dropdown({color:color})}>
                                          <DropdownTrigger>
                                              <FontAwesomeIcon icon={faEllipsis} className={'h-[20px] mb-[4px] cursor-pointer text-[#909090]'}/>
                                          </DropdownTrigger>
                                          <DropdownMenu
                                              disallowEmptySelection
                                              aria-label="Multiple selection actions"
                                              selectionMode="multiple"
                                          >
                                              <DropdownItem key='1' startContent={<FontAwesomeIcon icon={faLink}/>}
                                                            onClick={() => {
                                                                console.log(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                                navigator.clipboard.writeText(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                            }}

                                              >
                                                  Copy Post URL
                                              </DropdownItem>
                                              <DropdownItem key='2' startContent={<FontAwesomeIcon icon={faCode}/>}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(JSON.stringify(postJson))
                                                            }}
                                              >
                                                  Copy Post JSON
                                              </DropdownItem>
                                              <DropdownSection title="Danger zone">
                                                  {agent?.session?.did !== postJson.author.did ? (
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
                                  ) : (
                                      <>
                                          {!isSkeleton && (<div>{formatDate(postJson?.indexedAt)}</div>)}
                                      </>
                                  )}
                              </div>
                          </div>
                          <div className={PostContent({isMobile:isMobile})}>
                              {isSkeleton ? (
                                  <div className="w-full flex flex-col gap-2">
                                      <Skeleton className={skeletonText1line({color: color})}/>
                                      <Skeleton className={skeletonText2line({color: color})}/>
                                  </div>
                              ) : (
                                  <>
                                      {json?.reply && (
                                          <div>
                                              <FontAwesomeIcon icon={faReply}></FontAwesomeIcon>
                                              Reply to {json.reply.parent.author?.displayName}
                                          </div>
                                      )}
                                      <div onClick={(e) => {e.stopPropagation()}}>
                                          {renderTextWithLinks}
                                      </div>
                                  </>
                              )}
                              <div className={'overflow-x-scroll'}>
                                  {postJson?.embed && (
                                      postJson?.embed?.$type === 'app.bsky.embed.images#view' ? (
                                          <ScrollShadow orientation="horizontal">
                                              <div className={`flex overflow-x-auto overflow-y-hidden w-[${postJson.embed.images.length !== 1 ? `100svw` : `100%`}]`}>
                                                  {postJson.embed.images.map((image: any, index: number) => (
                                                      <div className={`mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden ${postJson.embed.images.length !== 1 && `max-w-[600px] h-[300px] mr-[10px] bg-cover`}`}
                                                           key={`image-${index}`}
                                                      >
                                                          <img className="w-full h-full" src={image.thumb} alt={image?.alt} />
                                                      </div>
                                                  ))}
                                              </div>
                                          </ScrollShadow>
                                      ) : (
                                          postJson.embed.$type === 'app.bsky.embed.external#view' && (
                                              <a
                                                  href={postJson.embed.external?.uri}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                              >
                                                  <div className="h-[100px] w-full rounded-lg overflow-hidden border border-gray-600 flex items-center text-gray-800 hover:bg-gray-200">
                                                      <div className="h-100 w-24 border-r border-gray-600">
                                                          <img
                                                              src={postJson.embed.external?.thumb}
                                                              className="object-cover w-full h-full"
                                                              alt={postJson.embed.external?.alt}
                                                          />
                                                      </div>
                                                      <div className="flex items-center ml-2 h-full w-[calc(100%-6rem)]">
                                                          <div className="w-52 min-w-0">
                                                              <div className="text-sm font-bold text-black whitespace-nowrap overflow-hidden overflow-ellipsis">
                                                                  {postJson.embed.external?.title}
                                                              </div>
                                                              <div className="text-xs text-gray-700 mt-1 overflow-hidden" style={{WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                                                  {postJson.embed.external?.description}
                                                              </div>
                                                              <div className="text-xs text-gray-700 mt-1">
                                                                  <a href={postJson.embed.external?.uri} className="text-gray-700 underline">
                                                                      {postJson.embed.external?.uri.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1]}
                                                                  </a>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </a>

                                          )
                                      )
                                  )}
                              </div>
                          </div>
                          <div className={PostReactionButtonContainer()} style={{}}>
                              <div className={`mr-[12px]`}>
                                  {isMobile && (
                                      <>
                                          <FontAwesomeIcon icon={faComment} className={PostReactionButton()}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleReply()
                                                           }}
                                          />
                                          <FontAwesomeIcon icon={faRetweet} className={PostReactionButton()}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleRepost()
                                                           }}
                                                           style={{color:isReposted ? '#17BF63' : '#909090',}}/>
                                          <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={PostReactionButton()}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleLike()}}
                                                           style={{color:isLiked ? '#fd7e00' : '#909090',}}/>
                                      </>
                                  )}
                                  {!isMobile && (
                                      <>
                                          <FontAwesomeIcon icon={faComment} className={PostReactionButton()}
                                                           style={{display: isHover && !isSkeleton ? undefined : 'none'}}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleReply()
                                                           }}
                                          />
                                          <FontAwesomeIcon icon={faRetweet} className={PostReactionButton()}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleRepost()
                                                           }}
                                                           style={{color:isReposted ? '#17BF63' : '#909090', display: isHover && !isSkeleton ? undefined : isReposted ? undefined : 'none'}}/>
                                          <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={PostReactionButton()}
                                                           onClick={(e) => {
                                                               e.stopPropagation()
                                                               handleLike()}}
                                                           style={{color:isLiked ? '#fd7e00' : '#909090', display: isHover && !isSkeleton ? undefined : isLiked ? undefined : 'none'}}/>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </>
              </>
          </main>
      </>
  );
}

export default ViewPostCard;

