import { useEffect, useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import Home from "./Home";

const DESIGN_WIDTH = 1460;
const DESIGN_HEIGHT = 980;
const TOPBAR_HEIGHT = 64;

function getServiceScale() {
  if (typeof window === "undefined") return 1;

  const availableHeight = Math.max(window.innerHeight - TOPBAR_HEIGHT, 1);

  return Math.min(
    window.innerWidth / DESIGN_WIDTH,
    availableHeight / DESIGN_HEIGHT,
    1
  );
}

function ServicePage() {
  const [scale, setScale] = useState(getServiceScale);

  useEffect(() => {
    const handleResize = () => {
      setScale(getServiceScale());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="service-scale-viewport"
      style={{
        "--service-scale": scale,
        "--service-design-width": `${DESIGN_WIDTH}px`,
        "--service-design-height": `${DESIGN_HEIGHT}px`,
      }}
    >
      <ServiceTopbar />
      <div className="service-scale-stage">
        <div className="service-scale-canvas">
          <Home />
        </div>
      </div>
    </div>
  );
}

export default ServicePage;
