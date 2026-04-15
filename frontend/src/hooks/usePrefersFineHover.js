import { useEffect, useState } from "react";

/** 精细指针且支持 hover 的设备（桌面鼠标）；触屏为主时为 false */
export function usePrefersFineHover() {
  const [yes, setYes] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const fn = () => setYes(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return yes;
}
