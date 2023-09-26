import React, {useState, useRef, useCallback, useEffect} from "react";
import { tabBar } from "./styles";
import { BrowserView, MobileView, isMobile } from "react-device-detect"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faImage, faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faHome, faSearch, faInbox, faPenToSquare} from '@fortawesome/free-solid-svg-icons'
import {Badge,} from "@nextui-org/react";
import { useRouter } from 'next/navigation'
import {useRequiredSession} from "@/app/lib/hooks/useRequiredSession";
import {useAgent} from "@/app/atoms/agent";


interface Props {
    className?: string
    color: 'light' | 'dark'
    isMobile?: boolean
    uploadImageAvailable?: boolean
    isDragActive?: boolean
    open?: boolean
    selected: 'home' | 'search' | 'inbox' | 'post'
    setValue?: any
}
export const TabBar: React.FC<Props> = (props: Props) => {
    const [agent, setAgent] = useAgent()
    const route = useRouter()
    const {className, color, isMobile, uploadImageAvailable, open, selected} = props;
    const reg = /^[\u0009-\u000d\u001c-\u0020\u11a3-\u11a7\u1680\u180e\u2000-\u200f\u202f\u205f\u2060\u3000\u3164\ufeff\u034f\u2028\u2029\u202a-\u202e\u2061-\u2063\ufeff]*$/;
    const [selectedTab, setSelectedTab] = useState<'home' | 'search' | 'inbox' | 'post'>('home');
    const [unreadNotification, setUnreadNotification] = useState<number>(0)
    const { TabBar, Container, Icon,
    } = tabBar();

    const checkNewNotification = async () => {
        if (!agent) {
            return
        }
        try {
            const {data} = await agent.countUnreadNotifications()
            const notifications = await agent.listNotifications()
            const {count} = data
            const reason = ['follow', 'mention', 'reply', 'post']
            let notify_num = 0
            for (let i = 0; i < data.count; i++) {
                const notificationReason = notifications.data.notifications[i].reason;
                if (reason.some(item => notificationReason.includes(item))) {
                    notify_num++;
                }
            }
            if(notify_num !== unreadNotification && unreadNotification === 0){
                setUnreadNotification(count)
            }
        }catch (e) {
            console.log(e)
        }
    }
    const handleUpdateSeen = async () => {
        if(!agent)return
        try{
            const res = await agent.updateSeenNotifications()
            console.log(res)
        }catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewNotification()
        }, 10000)
        // クリーンアップ関数
        return () => {
            clearInterval(interval); // インターバルをクリーンアップ
        };
    },[agent])

  return (
      <main className={TabBar({color:color, isMobile:isMobile})}>
          <div className={Container({selected:selected==='home'})}
               onClick={() => {
                    route.push('/')
                    setSelectedTab('home')
                    props.setValue('home')
               }}
          >
              <FontAwesomeIcon icon={faHome} className={Icon({color:color, selected:selected})}/>
          </div>
          <div className={Container({selected:selected==='search'})}
               onClick={() => {
                   route.push('/search')
                   setSelectedTab('search')
                   props.setValue('search')
               }}
          >
                <FontAwesomeIcon icon={faSearch} className={Icon({color:color, selected:selected})}/>
          </div>
          <div className={Container({selected:selected==='inbox'})}
               onClick={() => {
                   route.push('/inbox')
                   setSelectedTab('inbox')
                   props.setValue('inbox')
                   handleUpdateSeen()
                   setUnreadNotification(0)
               }}
          >
              <Badge content={''} color={'primary'}
                  isInvisible={unreadNotification == 0}>
                  <FontAwesomeIcon icon={faInbox} className={Icon({color:color, selected:selected})}/>
              </Badge>
          </div>
          <div className={Container({selected:selected==='post'})}
               onClick={() => {
                   route.push('/post')
                   setSelectedTab('post')
                   props.setValue('post')
               }}
          >
                <FontAwesomeIcon icon={faPenToSquare} className={Icon({color:color, selected:selected})}/>
          </div>
      </main>
  );
}

export default TabBar;