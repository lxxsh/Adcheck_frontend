import { useEffect, useRef, useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import Home from "./Home";

const DESIGN_WIDTH = 2048;
const DESIGN_HEIGHT = 1280;

function getServiceScale() {
  if (typeof window === "undefined") return 1;

  const viewportWidth =
    window.visualViewport?.width ||
    document.documentElement.clientWidth ||
    window.innerWidth;

  return viewportWidth / DESIGN_WIDTH;
}

function ServicePage() {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(getServiceScale);
  const [canvasHeight, setCanvasHeight] = useState(DESIGN_HEIGHT);

  useEffect(() => {
    const updateLayoutScale = () => {
      setScale(getServiceScale());
      setCanvasHeight(canvasRef.current?.scrollHeight || DESIGN_HEIGHT);
    };

    updateLayoutScale();
    window.addEventListener("resize", updateLayoutScale);

    const resizeObserver = new ResizeObserver(updateLayoutScale);
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);

    return () => {
      window.removeEventListener("resize", updateLayoutScale);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="service-scale-viewport"
      style={{
        height: `${canvasHeight * scale}px`,
      }}
    >
      <div
        className="service-scale-canvas"
        ref={canvasRef}
        style={{ transform: `scale(${scale})` }}
      >
        <ServiceTopbar />
        <Home />
      </div>
    </div>
  );
}

export default ServicePage;
