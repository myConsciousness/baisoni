import { useAgent } from '../../atoms/agent'
import { BskyAgent } from '@atproto/api'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

export const useRequiredSession = () => {
    const router = useRouter()
    const [agent, setAgent] = useAgent()

    const restoreSession = useCallback(async () => {
        const sessionJson = localStorage.getItem('session')

        if (!sessionJson) {
            if (router) {
                router.push('/login')
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
            if (router) {
                router.push('/login')
            } else {
                location.href = '/login'
            }
        }
    }, [router, setAgent])

    useEffect(() => {
        restoreSession()
    }, [restoreSession])

    return { agent }
}