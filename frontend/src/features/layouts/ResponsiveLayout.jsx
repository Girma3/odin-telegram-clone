import { useEffect, useState } from "react";
import DesktopLayout from "./DeskTopLayout";
import MobileLayout from "./MobileLayout";
function ResponsiveLayout() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return <>{screenWidth > 800 ? <DesktopLayout /> : <MobileLayout />}</>;
}

export default ResponsiveLayout;
