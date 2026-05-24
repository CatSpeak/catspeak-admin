import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ResponsiveChoropleth } from "@nivo/geo";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import worldCountriesUrl from "./world_countries.json?url";

interface CountryData {
  id: string;
  value: number;
}

interface WorldFeature {
  id?: string;
  properties: {
    name?: string;
  };
}

interface WorldMapCardProps {
  data?: CountryData[];
}

const DEFAULT_COUNTRY_DATA: CountryData[] = [
  { id: "VNM", value: 3451 },
  { id: "USA", value: 1500 },
  { id: "BRA", value: 800 },
  { id: "CHN", value: 5000 },
  { id: "THA", value: 500 },
];

export default function WorldMapCard({
  data = DEFAULT_COUNTRY_DATA,
}: WorldMapCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [features, setFeatures] = useState<WorldFeature[]>([]);

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

  useEffect(() => {
    let cancelled = false;

    const loadMapData = async () => {
      const response = await fetch(worldCountriesUrl);
      const payload = (await response.json()) as { features?: WorldFeature[] };
      if (cancelled) return;

      setFeatures(
        (payload.features ?? []).filter((feature) => feature.id !== "ATA"),
      );
    };

    loadMapData().catch((error: unknown) => {
      console.error("Failed to load world map data:", error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const projectionScale = Math.max(containerWidth / 10, 40);
  const mapHeight = Math.max(containerWidth * 0.5, 200);

  return (
    <div className="h-full" ref={containerRef}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Customers Demographic
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
            <TransformComponent
              wrapperClass="!w-full !overflow-hidden border border-gray-200"
              contentClass="!w-full !h-full"
            >
              <div
                className="w-full mx-auto"
                style={{ height: `${mapHeight}px` }}
              >
                {features.length > 0 ? (
                  <ResponsiveChoropleth
                    data={data}
                    features={features}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    colors="oranges"
                    domain={[0, 5000]}
                    unknownColor="#E5E7EB"
                    label="properties.name"
                    valueFormat=".2s"
                    projectionType="mercator"
                    projectionScale={projectionScale}
                    projectionTranslation={[0.5, 0.65]}
                    projectionRotation={[0, 0, 0]}
                    borderWidth={0.5}
                    borderColor="#D1D5DB"
                    enableGraticule={false}
                    graticuleLineColor="#dddddd"
                    legends={[]}
                    tooltip={({ feature }) => {
                      const featureData = feature.data as unknown as {
                        id?: string;
                      };
                      const countryData = data.find(
                        (d) => d.id === featureData.id,
                      );
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <div className="font-semibold text-gray-900">
                            {feature.label}
                          </div>
                          {countryData && (
                            <div className="text-sm text-gray-600 mt-1 font-semibold">
                              {countryData.value.toLocaleString()} users
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                )}
              </div>
            </TransformComponent>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-6 text-xs text-gray-600">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                  title="Reset Zoom"
                  aria-label="Reset zoom"
                >
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
