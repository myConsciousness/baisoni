'use client';
import {isMobile} from "react-device-detect";

import {ViewScreen} from "@/app/components/ViewScreen";

export default function Root() {

    return(
        <>
            <ViewScreen color={"dark"} isMobile={isMobile}/>
        </>
    )
}