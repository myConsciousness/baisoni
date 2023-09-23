'use client';

export default function Root() {
    //const agent = new BskyAgent({ service: `https://bsky.social`})
    const checkSession = async () => {
        const storedData = window.localStorage.getItem('session');
        if(!storedData) {
            location.href = '/login'
        }else if(storedData){
            location.href = '/home'
        }
    }
    checkSession()

    return
}