import { tv } from "@nextui-org/react";

export const viewHeader = tv({
    slots: {
        Header:'h-[100px] w-full min-w-[350px] max-w-[600px] text-white backdrop-blur-[5px] bg-black/40 fixed top-0 z-10 select-none',
            HeaderContentTitleContainer: '',
            HeaderContentTitle: '',
            HeaderContent: 'w-full h-[100%-86px] max-h-[400px] relative flex items-center flex-wrap overflow-y-scroll',
            HeaderInputArea: 'h-full w-full outline-none pl-[20px] pr-[40px]',
        top: 'h-[73px] w-full flex justify-center items-center',
        bottom: 'h-[27px] relative bottom-0 font-bold align-start',
    },
    variants: {
        color:{
            light: {
                footer: 'bg-[#DADADA]',
                HeaderInputArea: 'text-black',
            },
            dark: {
                footer: 'bg-[#2C2C2C]',
                HeaderInputArea: 'text-white bg-[#1C1C1C]',
            },
        },
        isMobile: {
            true: {
                background: "",
            },
            false: {
                background: "",
            },
        },
        page:{
            single:{
                bottom:'flex justify-center items-center',
                HeaderContentTitle: 'justify-center items-center',
            },
            profile:{
                bottom:'flex justify-end items-baseline',
                HeaderContentTitle: 'w-[20%] flex justify-center items-center',
            },
            home:{
                HeaderContentTitleContainer:'flex ml-[40px] overflow-hidden overflow-x-scroll',
                HeaderContentTitle: 'justify-center items-center pl-[15px] pr-[15px]',
            },
            post:{
                bottom:'flex justify-center items-center',
                HeaderContentTitle: 'w-[50%] flex justify-center items-center',
            },
            search:{
                bottom:'flex justify-center items-baseline',
                HeaderContentTitle: 'w-[33.3%] flex justify-center items-center',
            }
        },
        isNextPage:{
            true:{

            },
            false:{

            }
        },

    }
});