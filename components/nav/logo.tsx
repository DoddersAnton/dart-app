import React from "react";
import Image from "next/image";

const Logo = () => {

  return (
    <div className="flex items-center gap-2 cursor-pointer md:cursor-default">
      <Image src="/DRT-logo.png" alt="logo" width={40} height={62} className="h-14 w-14 object-contain" />
      <div className="text-sm font-bold text-[14px]">Dartiau Rhieni Trisant</div>
    </div>
  );
};

export default Logo;
