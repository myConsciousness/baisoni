import React, {useState, useRef, useCallback, useEffect} from "react";
import { viewPostCard } from "./styles";
import { BrowserView, MobileView, isMobile } from "react-device-detect"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { faRetweet, faEllipsis, faFlag, faLink, faCode, faFont } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'

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
    Input,
    Link,
    Skeleton,
    Popover, PopoverTrigger, PopoverContent,
} from "@nextui-org/react";


import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import {useAgent} from "@/app/atoms/agent";

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

    const {className, color, isMobile, uploadImageAvailable, open, numbersOfImage, postJson, isSkeleton, json} = props;
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/;
    const [loading, setLoading] = useState(false)
    const [isHover, setIsHover] = useState<boolean>(false)
    const { PostCard, PostAuthor, PostContent, PostReactionButtonContainer, PostCardContainer, PostReactionButton,
        PostAuthorIcon, PostAuthorDisplayName, PostAuthorHandle, PostCreatedAt, dropdown,skeletonIcon, skeletonName, skeletonHandle, skeletonText1line, skeletonText2line } = viewPostCard();

    const [isLiked, setIsLiked] = useState<boolean>(postJson?.viewer?.like)
    const [isReposted, setIsReposted] = useState<boolean>(postJson?.viewer?.repost)
    const [postInfo, setPostInfo] = useState<any>(null)


    const leadingActions = () => (
        <LeadingActions>
            <SwipeAction onClick={() => console.info('swipe action triggered')}
            >
                <span
                    className={'h-full bg-[#17BF63] text-white flex justify-center items-center cursor-pointer'}

                >
                    {isReposted ? 'un report' : 'repost'}
                </span>
            </SwipeAction>
        </LeadingActions>
    )

    const trailingActions = () => (
        <TrailingActions>
            <SwipeAction
                onClick={() => console.info('swipe action triggered')}
            >
                <span
                    className={'h-full w-full bg-[#E0245E] text-white flex justify-center items-center '}
                >
                    {isLiked ? 'unlike' : 'like'}
                </span>
            </SwipeAction>
        </TrailingActions>
    )

    //console.log(postJson)
    const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);

    const handleTextSelect = () => {
        setIsSwipeEnabled(false);
        console.log(false)
    };

    const handleTextDeselect = () => {
        setIsSwipeEnabled(true);
        console.log(true)
    };

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
  return (
      <main className={PostCard({color:color})}
            onMouseDown={handleTextSelect}
            onMouseUp={handleTextDeselect}

      >
          <SwipeableList>
              <SwipeableListItem
                  //leadingActions={isMobile && leadingActions()}
                  //trailingActions={isMobile && trailingActions()}
                  maxSwipe={70}
              >

                  <div className={PostCardContainer()}
                       onMouseEnter={() => {
                           setIsHover(true)
                       }}
                       onMouseLeave={() => {
                           setIsHover(false)
                       }}
                  >
                      {json?.reason && (
                          <div className={'text-[13px] ml-[40px] text-[#909090]'}>
                              Reposted by {json.reason.by.displayName}
                          </div>
                      )}
                      <div className={PostAuthor()}>
                          <div className={PostAuthorIcon()}>
                              {isSkeleton ? (
                                  <Skeleton className={skeletonIcon({color:color})}/>
                              ) : (
                                  <img src={postJson?.author?.avatar}/>

                                  )}
                          </div>
                          <div className={PostAuthorDisplayName()} style={{fontSize:'13px'}}>
                                {isSkeleton ? (
                                    <Skeleton className={skeletonName({color:color})}/>
                                    ) : (
                                    <div>{postJson?.author?.displayName}</div>
                                )}
                          </div>
                          <div className={'text-[#BABABA]'}>&nbsp;-&nbsp;</div>
                          <div className={PostAuthorHandle()}>
                              {isSkeleton ? (
                                      <Skeleton className={skeletonHandle({color: color})}/>
                              ) : (
                                  <div>{postJson?.author?.handle}</div>
                              )}
                          </div>
                          <div className={PostCreatedAt()} style={{fontSize:'12px'}}>
                              {isHover && !isSkeleton ? (
                                  <Dropdown className={dropdown({color:color})}>
                                      <DropdownTrigger>
                                          <FontAwesomeIcon icon={faEllipsis} className={'h-[20px] mb-[4px] cursor-pointer text-[#909090]'}/>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                          disallowEmptySelection
                                          aria-label="Multiple selection actions"
                                          selectionMode="multiple"
                                      >
                                          <DropdownItem key='1' startContent={<FontAwesomeIcon icon={faFlag}/>}>Report Post</DropdownItem>
                                          <DropdownItem key='2' startContent={<FontAwesomeIcon icon={faLink}/>}
                                                        onClick={() => {
                                                            console.log(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                            navigator.clipboard.writeText(`https://bsky.app/profile/${postJson.author.did}/post/${postJson.uri.match(/\/(\w+)$/)?.[1] || ""}`)
                                                        }}

                                          >
                                              Copy Post URL
                                          </DropdownItem>
                                          <DropdownItem key='3' startContent={<FontAwesomeIcon icon={faCode}/>}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(postJson)
                                                        }}
                                          >
                                              Copy Post JSON
                                          </DropdownItem>
                                      </DropdownMenu>
                                  </Dropdown>
                              ) : (
                                    isSkeleton ? (
                                        <Skeleton/>
                                    ) :(
                                        <a href={'https://bsky.social/'}>1d</a>
                                    )
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
                              <div className={''}>{postJson?.record?.text}</div>
                          )}
                          {numbersOfImage > 0 && (
                              <div className={'mt-[10px] mb-[10px] rounded-[7.5px] overflow-hidden'}>
                                  {numbersOfImage === 1 && (
                                      <img className={'w-full h-full'} src={'https://av-cdn.bsky.app/img/feed_thumbnail/plain/did:plc:txandrhc7afdozk6a2itgltm/bafkreicjjy62rajw47mhgx4iaqvqywvmxdcfjttwhj3vu3y7c5spzapwwq@jpeg'}></img>
                                  )}
                              </div>
                          )}
                      </div>
                      <div className={PostReactionButtonContainer()} style={{}}>
                          <div className={`mr-[12px]`}>
                              {isMobile && (
                                  <>
                                      <FontAwesomeIcon icon={faComment} className={PostReactionButton()}/>
                                      <FontAwesomeIcon icon={faRetweet} className={PostReactionButton()}
                                                       onClick={() => {handleRepost()}}
                                                       style={{color:isReposted ? '#17BF63' : '#909090',}}/>
                                      <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={PostReactionButton()}
                                                       onClick={() => {handleLike()}}
                                                       style={{color:isLiked ? '#E0245E' : '#909090',}}/>
                                  </>
                              )}
                              {!isMobile && (
                                  <>
                                      <FontAwesomeIcon icon={faComment} className={PostReactionButton()}
                                                       style={{display: isHover && !isSkeleton ? undefined : 'none'}}/>
                                      <FontAwesomeIcon icon={faRetweet} className={PostReactionButton()}
                                                       onClick={() => {handleRepost()}}
                                                       style={{color:isReposted ? '#17BF63' : '#909090', display: isHover && !isSkeleton ? undefined : isReposted ? undefined : 'none'}}/>
                                      <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={PostReactionButton()}
                                                       onClick={() => {handleLike()}}
                                                       style={{color:isLiked ? '#E0245E' : '#909090', display: isHover && !isSkeleton ? undefined : isLiked ? undefined : 'none'}}/>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
              </SwipeableListItem>
          </SwipeableList>
      </main>
  );
}

export default ViewPostCard;

