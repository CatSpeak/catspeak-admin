import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { useLanguage } from "../../../stores/languageStore";
import {
  getDashboardStats,
  type DashboardStats,
} from "../api/getDashboardStats";
import { formatAmount } from "../../../lib/utils";

interface MonthlyTargetProps {
  percentage?: number | null;
  targetAmount?: number | null;
  revenueAmount?: number | null;
  todayAmount?: number | null;
  stats?: DashboardStats | null;
}

function formatCompactCurrency(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "0 ₫";
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(val % 1_000_000_000 === 0 ? 0 : 1)}B ₫`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M ₫`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(val % 1_000 === 0 ? 0 : 1)}k ₫`;
  }
  return `${val} ₫`;
}

export default function MonthlyTarget({
  percentage,
  targetAmount,
  revenueAmount,
  todayAmount,
  stats,
}: MonthlyTargetProps) {
  const { t } = useLanguage();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    stats || null,
  );

  useEffect(() => {
    if (stats) {
      setDashboardStats(stats);
      return;
    }
    let isMounted = true;
    getDashboardStats()
      .then((data) => {
        if (isMounted) {
          setDashboardStats(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats in MonthlyTarget:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [stats]);

  const hasPercentage = typeof percentage === "number" && !isNaN(percentage);
  const displayValue = hasPercentage ? `${percentage}%` : "?";
  const seriesValue = hasPercentage ? percentage : 0;
  const series = useMemo(() => [seriesValue], [seriesValue]);

  // Derived currency metrics
  const totalRevenue = revenueAmount ?? dashboardStats?.totalRevenueVnd ?? 0;

  const todayRevenue = useMemo(() => {
    if (typeof todayAmount === "number") return todayAmount;
    if (
      !dashboardStats?.dailyRevenue ||
      dashboardStats.dailyRevenue.length === 0
    ) {
      return 0;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayItem = dashboardStats.dailyRevenue.find((item) =>
      item.date.startsWith(todayStr),
    );
    if (todayItem) return todayItem.revenueVnd;

    return dashboardStats.dailyRevenue[dashboardStats.dailyRevenue.length - 1]
      .revenueVnd;
  }, [todayAmount, dashboardStats]);

  const calcTargetRevenue = useMemo(() => {
    if (typeof targetAmount === "number") return targetAmount;
    if (hasPercentage && percentage > 0 && totalRevenue > 0) {
      return Math.round(totalRevenue / (percentage / 100));
    }
    if (totalRevenue > 0) {
      return Math.round(totalRevenue * 1.25);
    }
    return 20000000;
  }, [targetAmount, hasPercentage, percentage, totalRevenue]);

  const earnText = useMemo(() => {
    const formattedToday = formatAmount(todayRevenue);
    if (todayRevenue > 0 && hasPercentage && percentage >= 0) {
      return (
        t.dashboard.earnSummary ||
        "You earn {amount} today, higher than last month. Keep up your good work!"
      ).replace("{amount}", formattedToday);
    }
    return (
      t.dashboard.earnSummaryStandard ||
      "You earn {amount} today. Keep up your good work!"
    ).replace("{amount}", formattedToday);
  }, [todayRevenue, hasPercentage, percentage, t]);

  const options: ApexOptions = useMemo(
    () => ({
      colors: ["#465FFF"],
      chart: {
        fontFamily: "Noto Sans, sans-serif",
        type: "radialBar",
        height: 330,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -85,
          endAngle: 85,
          hollow: {
            size: "80%",
          },
          track: {
            background: "#E4E7EC",
            strokeWidth: "100%",
            margin: 5,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              fontSize: "36px",
              fontWeight: "600",
              offsetY: -40,
              color: "#1D2939",
              formatter: function () {
                return displayValue;
              },
            },
          },
        },
      },
      fill: {
        type: "solid",
        colors: ["#465FFF"],
      },
      stroke: {
        lineCap: "round",
      },
      labels: [t.dashboard.progress],
    }),
    [displayValue, t.dashboard.progress],
  );

  const [isOpen, setIsOpen] = useState(false);

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl bg-gray-100 border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-6 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base sm:text-lg font-semibold text-gray-800 truncate"
              title={t.dashboard.monthlyTarget}
            >
              {t.dashboard.monthlyTarget}
            </h3>
            <p
              className="mt-1 text-gray-500 text-xs sm:text-theme-sm truncate"
              title={t.dashboard.targetSetForMonth}
            >
              {t.dashboard.targetSetForMonth}
            </p>
          </div>
          <div className="relative inline-block shrink-0">
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 "
              >
                {t.dashboard.viewMore}
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 "
              >
                {t.common.delete}
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-success-600 whitespace-nowrap">
            {hasPercentage
              ? `${percentage >= 0 ? "+" : ""}${percentage}%`
              : "?"}
          </span>
        </div>

        <p
          className="mx-auto mt-6 w-full max-w-[380px] text-center text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis px-2"
          title={earnText}
        >
          {earnText}
        </p>
      </div>

      <div className="flex items-center justify-around gap-2 px-3 py-3.5 sm:gap-6 sm:px-6 sm:py-5 bg-gray-50/60 border-t border-gray-200/60 min-w-0">
        <div
          title={formatAmount(calcTargetRevenue)}
          className="min-w-0 flex-1 text-center"
        >
          <p className="mb-1 text-center text-gray-500 text-[11px] sm:text-sm whitespace-nowrap truncate">
            {t.dashboard.target || "Target"}
          </p>
          <p className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-base font-semibold text-gray-800 md:text-lg whitespace-nowrap">
            <span className="truncate">
              {formatCompactCurrency(calcTargetRevenue)}
            </span>
            <svg
              className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                fill="#D92D20"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 shrink-0"></div>

        <div
          title={formatAmount(totalRevenue)}
          className="min-w-0 flex-1 text-center"
        >
          <p className="mb-1 text-center text-gray-500 text-[11px] sm:text-sm whitespace-nowrap truncate">
            {t.dashboard.revenue || "Revenue"}
          </p>
          <p className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-base font-semibold text-gray-800 md:text-lg whitespace-nowrap">
            <span className="truncate">
              {formatCompactCurrency(totalRevenue)}
            </span>
            <svg
              className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 shrink-0"></div>

        <div
          title={formatAmount(todayRevenue)}
          className="min-w-0 flex-1 text-center"
        >
          <p className="mb-1 text-center text-gray-500 text-[11px] sm:text-sm whitespace-nowrap truncate">
            {t.dashboard.today || "Today"}
          </p>
          <p className="flex items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-base font-semibold text-gray-800 md:text-lg whitespace-nowrap">
            <span className="truncate">
              {formatCompactCurrency(todayRevenue)}
            </span>
            <svg
              className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
}
