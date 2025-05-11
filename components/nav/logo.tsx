import React from "react";
import Image from "next/image";

const Logo = () => {

  return (
    <div className="flex items-center gap-2 cursor-pointer md:cursor-default">
      <Image src="/darts-logo.png" alt="logo" width={42} height={24} />
      <div className="text-sm font-bold text-[14px]">Dartiau Rhieni Trisant</div>
    </div>
  );
};

export default Logo;
