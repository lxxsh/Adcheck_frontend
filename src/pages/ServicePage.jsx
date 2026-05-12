import { useEffect, useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import Home from "./Home";

const DESIGN_WIDTH = 1565;
const DESIGN_HEIGHT = 1070;

function getServiceScale() {
  if (typeof window === "undefined") return 1;

  return Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT,
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
      style={{ "--service-scale": scale }}
    >
      <div className="service-scale-canvas">
        <ServiceTopbar />
        <Home />
      </div>
    </div>
  );
}

export default ServicePage;
