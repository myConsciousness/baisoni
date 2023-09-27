import { useAgent } from '@/app/_atoms/agent'
import { BskyAgent } from '@atproto/api'
import {useRouter, useSearchParams} from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation';


export const useRequiredSession = () => {
    const router = useRouter()
    const [agent, setAgent] = useAgent()
    const searchParams = useSearchParams()
    const toRedirect = searchParams.get('toRedirect')
    const pathname = usePathname()

    const restoreSession = useCallback(async () => {
        const sessionJson = localStorage.getItem('session')

        if (!sessionJson) {
            if(pathname === '/login') return
            if (router) {
                router.push(`/login${pathname? `?toRedirect=${pathname.replace('/', '')}${searchParams ? `&${searchParams}` : ``}` : ``}`)
            } else {
                location.href = '/login'
            }
            return
        }

        const session = JSON.parse(sessionJson).session
        const agent = new BskyAgent({ service: `https://${JSON.parse(sessionJson).server}` })

        try {
            await agent.resumeSession(session)

            setAgent(agent)
        } catch (error) {
            console.error(error)
            if(pathname === '/login') return
            if (router) {
                router.push(`/login${pathname? `?toRedirect=${pathname.replace('/', '')}${searchParams ? `&${searchParams}` : ``}` : ``}`)
            } else {
                location.href = '/login'
            }
        }
    }, [router, setAgent])

    useEffect(() => {
        restoreSession()
    }, [restoreSession])
    console.log(agent)
    return { agent }
}