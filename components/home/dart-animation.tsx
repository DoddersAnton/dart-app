"use client";
import dynamic from 'next/dynamic';

//import Lottie from "lottie-react";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import dartAinimation from "@/public/dart-animation.json"
import { useEffect, useRef } from 'react';
import { LottieRefCurrentProps } from 'lottie-react';

export function DartAnimation() {

    const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    // Go to frame 50 and pause there
    lottieRef.current?.goToAndStop(50, true);
  }, []);

    return (
    <Lottie 
    lottieRef={lottieRef}
        className="h-64" 
        animationData={dartAinimation} 
        />
    )


}


