'use client'
import {useEffect, useState, useMemo, useCallback} from "react";
import {createLoginPage} from "./styles";
import {BskyAgent} from "@atproto/api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLink, faList, faLock, faUser} from '@fortawesome/free-solid-svg-icons'
//import { CircularProgressbar } from 'react-circular-progressbar';
//import 'react-circular-progressbar/dist/styles.css';
import {Button, Spinner,} from "@nextui-org/react";
import {useSearchParams} from "next/navigation";
import {isMobile} from "react-device-detect";

export default function CreateLoginPage() {
  const [loading, setLoading] = useState(false)
  const [server, setServer] = useState<string>('bsky.social')
  const [user, setUser] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoginFailed, setIsLoginFailed] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const toRedirect = searchParams.get('toRedirect')
  const [identifierIsByAutocomplete, setIdentifierByAutocomplete] = useState<boolean>(false)
  const [passwordIsByAutocomplete, setPasswordByAutocomplete] = useState<boolean>(false)

  const { background,
    LoginForm, LoginFormConnectServer,
    LoginFormHandle, LoginFormPassword,
    LoginFormLoginButton
  } = createLoginPage();

  const agent = new BskyAgent({ service: `https://${server}` })

  const handleLogin = async () => {
    setLoading(true)
    try{
      if(user.trim() !== '' && password.trim() !== '') {
        const res = await agent.login({
          identifier: user,
          password: password });
        const {data} = res
        console.log(data)
      }
      setLoading(false)
      console.log(agent)
      //const postres= await agent.post({text:'test'})

      if (agent.session) {
        //現在使っているアカウントをsessionに格納
        const json = {
          server: server,
          session: agent.session
        }
        localStorage.setItem('session', JSON.stringify(json))
        // 既存のlocalStorageからデータを取得
        const storedData = localStorage.getItem('Accounts');

        // データが存在する場合はパースしてオブジェクトに変換、存在しない場合は空のオブジェクトを作成
        const accountsData: Record<string, any> = storedData ? JSON.parse(storedData) : {};

        // サーバーキーを指定（例：bsky.social, ucho-ten.net）
        const serverKey = server; // 任意のサーバーキー

        // サーバーキーごとにデータを分けて保存
        if (!accountsData.service) {
          accountsData.service = {};
        }
        if (!accountsData.service[serverKey]) {
          accountsData.service[serverKey] = [];
        }

        // 新しいデータを追加
        accountsData.service[serverKey].push(agent.session);

        // 更新されたデータをlocalStorageに保存
        localStorage.setItem('Accounts', JSON.stringify(accountsData));
      }

      if(toRedirect){
        const url = `/${toRedirect}${searchParams ? `&${searchParams}` : ``}`
        const paramName = 'toRedirect';
        location.href = url.replace(
            new RegExp(`[?&]${paramName}=[^&]*(&|$)`, 'g'), // パラメータを正確に一致させる正規表現
            '?')
      }else{
        location.href = '/'
      }

    } catch(e) {
        console.log(e)
        setLoading(false)
        setIsLoginFailed(true)
    }

  }

  useEffect(() => {
    const resumesession = async () => {
      try{
        const storedData = localStorage.getItem('session');
        if(storedData) {

          const {session} = JSON.parse(storedData)
          await agent.resumeSession(session)

          if(toRedirect){

            const url = `/${toRedirect}${searchParams ? `&${searchParams}` : ``}`
            const paramName = 'toRedirect';
            location.href = url.replace(
                new RegExp(`[?&]${paramName}=[^&]*(&|$)`, 'g'), // パラメータを正確に一致させる正規表現
                '?')
          }else{
            location.href = '/'
          }
        }
      }catch (e) {
        console.log(e)
      }

    }
    resumesession()

  },[])

  useEffect(() => {
    if(!isMobile) return
    if((identifierIsByAutocomplete || passwordIsByAutocomplete) && user.trim() !== '' && password.trim() !== ''){
      handleLogin()
    }

  },[identifierIsByAutocomplete, passwordIsByAutocomplete, user, password])

  return (
      <main className={background()}>
        <div className={LoginForm()}>
          <div className={LoginFormConnectServer()}>
            <FontAwesomeIcon className={'ml-[4px] text-xl'} icon={faLink}/>
            <FontAwesomeIcon className={"absolute right-[10px] text-xl"} icon={faList}/>
            <input
                onChange={(e) => {
                  const isKeyboardInput = e.nativeEvent instanceof InputEvent
                  if(!isKeyboardInput) {
                    setIdentifierByAutocomplete(true)
                    console.log('input by autocomplete')
                  }
                  setServer(e.target.value)
                }}
                className={'h-full w-full bg-transparent ml-[12.5px] text-base font-bold outline-none'} placeholder={'bsky.social (default)'}/>
          </div>
          <div className={LoginFormHandle()}>
            <FontAwesomeIcon className={'ml-[8px] text-xl'} icon={faUser}/>
            <input
                type={'text'}
                value={user}
                autoComplete={'username'}
                onChange={(e) => {
                  const isKeyboardInput = e.nativeEvent instanceof InputEvent
                  if(!isKeyboardInput) {
                    setPasswordByAutocomplete(true)
                    console.log('input by autocomplete')
                  }
                  setUser(e.target.value)
                }}
                className={'h-full w-full bg-transparent ml-[16.5px] text-base font-bold outline-none'} placeholder={'handle, did, e-mail'}></input>
          </div>
          <div className={LoginFormHandle()}>
            <FontAwesomeIcon className={'ml-[8px] text-xl'} icon={faLock}/>
            <input
                type={'password'}
                value={password}
                onChange={(e) => {setPassword(e.target.value)}}
                autoComplete={'current-password'}
                className={'h-full w-full bg-transparent ml-[16.5px] text-base font-bold outline-none'} placeholder={'password'}></input>
          </div>
          <Button className={LoginFormLoginButton()}
                    onClick={handleLogin}
                  isDisabled={loading || user.trim() === '' || password.trim() === ''}
          >
            <div className="text-zinc-400 text-xl font-bold">
              {loading ? <Spinner size={'md'} className={'text-white'}/> : 'Sign In'}
            </div>
          </Button>
        </div>
      </main>

  );
}

const localstorage = {
  Accounts: {
    service: {
        'bsky.social': [
            {identifier: 'bisn.ucho-ten.net', jwt: 'みたいな感じでlocalStorageを扱いたい'},
        ]
    }
  }
}