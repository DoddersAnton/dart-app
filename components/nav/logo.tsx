import React from "react";
import Image from "next/image";

const Logo = () => {

  return (
    <div className="flex items-center gap-2 cursor-pointer md:cursor-default">
      <Image src="/sgor-logo.png" alt="SGOR+" width={40} height={62} unoptimized className="h-14 w-14 object-contain dark:hidden" />
      <Image src="/sgor-logo-dark.png" alt="SGOR+" width={40} height={62} unoptimized className="h-14 w-14 object-contain hidden dark:block" />
      <div className="text-sm font-bold text-[14px]">SGOR+</div>
    </div>
  );
};

export default Logo;
