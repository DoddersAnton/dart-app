"use client";
import dynamic from 'next/dynamic';

//import Lottie from "lottie-react";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import dartAinimation from "@/public/dart-animation.json"

export function DartAnimation() {

    return (
    <Lottie className="h-64" animationData={dartAinimation} />
    )


}


