import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ResponsiveChoropleth } from "@nivo/geo";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import worldCountries from "./world_countries.json";

interface CountryData {
  id: string;
  value: number;
}

interface WorldMapCardProps {
  data?: CountryData[];
}

export default function WorldMapCard({
  data = [
    { id: "VNM", value: 3451 },
    { id: "USA", value: 1500 },
    { id: "BRA", value: 800 },
    { id: "CHN", value: 5000 },
    { id: "THA", value: 500 },
  ],
}: WorldMapCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerWidth(width);
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  const projectionScale = Math.max(containerWidth / 8, 40);

  const getMapHeight = () => {
    if (containerWidth < 640) return containerWidth * 0.75;
    if (containerWidth < 1024) return containerWidth * 0.6;
    return Math.min(containerWidth * 1, 700);
  };

  const mapHeight = getMapHeight();

  return (
    <div className="h-full" ref={containerRef}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        User in the world
      </h3>

      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        centerOnInit={true}
        limitToBounds={true}
        panning={{ velocityDisabled: true }}
        wheel={{ smoothStep: 0.005 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                onClick={() => zoomOut()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => zoomIn()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <TransformComponent
              wrapperClass="!w-full !overflow-hidden border border-gray-200"
              contentClass="!w-full !h-full"
            >
              <div
                className="w-full mx-auto"
                style={{ height: `${mapHeight}px` }}
              >
                <ResponsiveChoropleth
                  data={data}
                  features={worldCountries.features}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  colors="oranges"
                  domain={[0, 5000]}
                  unknownColor="#E5E7EB"
                  label="properties.name"
                  valueFormat=".2s"
                  projectionScale={projectionScale}
                  projectionTranslation={[0.5, 0.5]}
                  projectionRotation={[0, 0, 0]}
                  borderWidth={0.5}
                  borderColor="#D1D5DB"
                  enableGraticule={false}
                  graticuleLineColor="#dddddd"
                  legends={[]}
                  tooltip={({ feature }: any) => {
                    const countryData = data.find((d) => d.id === feature.id);
                    return (
                      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
                        <div className="font-semibold text-gray-900">
                          {feature.properties.name}
                        </div>
                        {countryData && (
                          <div className="text-sm text-gray-600 mt-1">
                            Total users:{" "}
                            <span className="font-semibold">
                              {countryData.value.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      <div className="flex items-center gap-6 mt-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>&lt; 1K</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-300"></div>
          <span>1K - 1M</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>&gt; 1M</span>
        </div>
      </div>
    </div>
  );
}
