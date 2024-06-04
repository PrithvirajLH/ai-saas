"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () =>{
    useEffect(()=>{
        Crisp.configure("cf25b96a-2ef7-43fc-aa19-d350bc8fbfe5");
    },[]);

    return null;
}