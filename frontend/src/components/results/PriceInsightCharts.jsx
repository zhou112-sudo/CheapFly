/**
 * 最低价走势示意：等间距 Y 轴、纵轴刻度略小于横轴、无渐变、极简灰阶
 */

const VIEW_W = 400;
const VIEW_H = 96;
const PAD_L = 36;
const PAD_R = 8;
const PLOT_W = VIEW_W - PAD_L - PAD_R;
const INNER_TOP = 8;
const INNER_BOT = 14;

/** 横轴时间刻度 */
const AXIS_FONT_PX = 10;
/** 纵轴 ¥ 刻度：略小，弱化辅助读数 */
const Y_AXIS_FONT_PX = 8;
/** 辅助说明 */
const CAPTION_FONT_PX = 9;
/** 折线点：略大于轴字号的视觉权重，仍克制 */
const DOT_R = 2.4;

const STROKE_LINE = "hsl(220 6% 18%)";
const STROKE_FORECAST = "hsl(220 5% 55% / 0.75)";
const GRID = "hsl(220 6% 88% / 0.9)";
const AXIS_TEXT_Y = "hsl(220 6% 44% / 0.82)";
const SPLIT_LINE = "hsl(220 6% 82% / 0.85)";
const ZONE_PAST = "hsl(220 6% 97% / 0.65)";
const ZONE_FUTURE = "hsl(220 6% 98% / 0.55)";

/**
 * 等间距 Y 轴：相邻刻度差恒为 step；4～5 个刻度；覆盖 [dataMin,dataMax] 并留边距
 */
function computeEvenYAxis(dataMin, dataMax) {
  const span = Math.max(1, dataMax - dataMin);
  const pad = Math.max(span * 0.08, 15);
  const lo = dataMin - pad;
  const hi = dataMax + pad;
  const PREFERRED = [25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];

  const ticksFromStep = (step, extendToMinCount = false) => {
    const bottom = Math.floor(lo / step) * step;
    let top = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = bottom; v <= top + 1e-9; v += step) {
      ticks.push(Math.round(v));
    }
    if (extendToMinCount) {
      while (ticks.length > 0 && ticks.length < 4) {
        top += step;
        ticks.push(Math.round(top));
      }
    }
    ticks.sort((a, b) => b - a);
    const axisMin = ticks[ticks.length - 1];
    const axisMax = ticks[0];
    return { axisMin, axisMax, step, ticks };
  };

  for (const step of PREFERRED) {
    const bottom = Math.floor(lo / step) * step;
    const top = Math.ceil(hi / step) * step;
    const count = (top - bottom) / step + 1;
    if (count >= 4 && count <= 5) {
      return ticksFromStep(step, false);
    }
  }

  for (const step of PREFERRED) {
    const bottom = Math.floor(lo / step) * step;
    const top = Math.ceil(hi / step) * step;
    const count = (top - bottom) / step + 1;
    if (count > 5) continue;
    return ticksFromStep(step, true);
  }

  let step = PREFERRED[PREFERRED.length - 1] * 2;
  for (let g = 0; g < 40; g++) {
    const bottom = Math.floor(lo / step) * step;
    const top = Math.ceil(hi / step) * step;
    const count = (top - bottom) / step + 1;
    if (count > 5) {
      step *= 2;
      continue;
    }
    return ticksFromStep(step, true);
  }

  return ticksFromStep(100, false);
}

function buildCoords(points, axisMin, axisMax) {
  const innerH = VIEW_H - INNER_TOP - INNER_BOT;
  const span = axisMax - axisMin || 1;
  return points.map((p, i) => {
    const x = PAD_L + (i / Math.max(1, points.length - 1)) * PLOT_W;
    const t = (p.price - axisMin) / span;
    const tt = Math.min(1, Math.max(0, t));
    const y = INNER_TOP + innerH - tt * innerH;
    return { x, y, price: p.price, label: p.label };
  });
}

function smoothPathD(coords) {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  if (coords.length === 2) {
    return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
  }
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y} ${mx} ${my}`;
  }
  const last = coords[coords.length - 1];
  const prev = coords[coords.length - 2];
  d += ` Q ${prev.x} ${prev.y} ${last.x} ${last.y}`;
  return d;
}

function yForAxisValue(value, axisMin, axisMax) {
  const innerH = VIEW_H - INNER_TOP - INNER_BOT;
  const span = axisMax - axisMin || 1;
  const t = (value - axisMin) / span;
  const tt = Math.min(1, Math.max(0, t));
  return INNER_TOP + innerH - tt * innerH;
}

export function PriceInsightCharts({ insight }) {
  const trend = insight?.trend ?? [];
  const forecast = insight?.forecast ?? [];
  if (!trend.length && !forecast.length) return null;

  const merged = [...trend, ...forecast];
  const hasTrend = trend.length > 0;
  const hasForecast = forecast.length > 0;
  const todayIdx = hasTrend ? trend.length - 1 : -1;

  const vals = merged.map((p) => p.price);
  const dataMin = Math.min(...vals);
  const dataMax = Math.max(...vals);
  const { axisMin, axisMax, ticks: yTicks } = computeEvenYAxis(dataMin, dataMax);

  const coords = buildCoords(merged, axisMin, axisMax);
  const todayX = todayIdx >= 0 ? coords[todayIdx].x : null;
  const lowPrice = insight?.current_price_cny ?? dataMin;

  const pastCoords = todayIdx >= 0 ? coords.slice(0, todayIdx + 1) : [];
  const futureCoords = hasForecast && todayIdx >= 0 ? coords.slice(todayIdx) : hasForecast && !hasTrend ? coords : [];

  const pastD = pastCoords.length >= 2 ? smoothPathD(pastCoords) : pastCoords.length === 1 ? `M ${pastCoords[0].x} ${pastCoords[0].y}` : "";
  const futureD = futureCoords.length >= 2 ? smoothPathD(futureCoords) : "";

  const showSplit = todayIdx >= 0 && hasForecast;
  const onlyForecast = !hasTrend && hasForecast;

  return (
    <div className="mt-1 rounded-lg border border-border/60 bg-muted/10 p-4">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm font-normal leading-snug tracking-tight text-foreground md:text-[0.9375rem]">
          <span className="font-semibold">最低价</span>
          走势预测
        </p>
        <p className="leading-none text-muted-foreground/65" style={{ fontSize: CAPTION_FONT_PX }}>
          示意
        </p>
      </div>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full max-w-full" role="img" aria-label="最低价走势预测示意">
        {yTicks.map((tv) => {
          const y = yForAxisValue(tv, axisMin, axisMax);
          return (
            <g key={`yt-${tv}`}>
              <line x1={PAD_L} y1={y} x2={VIEW_W - PAD_R} y2={y} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <text
                x={PAD_L - 5}
                y={y + Y_AXIS_FONT_PX * 0.35}
                textAnchor="end"
                fill={AXIS_TEXT_Y}
                style={{ fontSize: Y_AXIS_FONT_PX }}
                fontWeight="400"
              >
                ¥{tv}
              </text>
            </g>
          );
        })}

        {showSplit && todayX != null ? (
          <>
            <rect x={PAD_L} y="0" width={Math.max(0, todayX - PAD_L)} height={VIEW_H} fill={ZONE_PAST} />
            <rect x={todayX} y="0" width={VIEW_W - todayX} height={VIEW_H} fill={ZONE_FUTURE} />
            <line
              x1={todayX}
              x2={todayX}
              y1={INNER_TOP}
              y2={VIEW_H - INNER_BOT - 1}
              stroke={SPLIT_LINE}
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </>
        ) : null}

        {onlyForecast && <rect x={PAD_L} y="0" width={PLOT_W} height={VIEW_H} fill={ZONE_FUTURE} />}

        {pastD ? (
          <path d={pastD} fill="none" stroke={STROKE_LINE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {futureD && hasForecast ? (
          <path
            d={futureD}
            fill="none"
            stroke={STROKE_FORECAST}
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 3"
          />
        ) : null}

        {!pastD && !futureD && onlyForecast ? (
          <path d={smoothPathD(coords)} fill="none" stroke={STROKE_FORECAST} strokeWidth="1.35" strokeLinecap="round" strokeDasharray="4 3" />
        ) : null}

        {coords.map((c, i) => {
          const isToday = i === todayIdx;
          const isLow = Number(c.price) === Number(lowPrice);
          const fill = isToday ? "hsl(220 6% 12%)" : isLow ? "hsl(220 5% 28%)" : "hsl(220 5% 34%)";
          return (
            <circle
              key={`${c.label}-${i}`}
              cx={c.x}
              cy={c.y}
              r={DOT_R}
              fill={fill}
              stroke={isToday ? "none" : "hsl(0 0% 100% / 0.55)"}
              strokeWidth={isToday ? 0 : 0.65}
              className={isToday ? undefined : "dark:stroke-background/80"}
            />
          );
        })}
      </svg>
      <div className="mt-2 border-t border-border/30 pt-2">
        <div
          className="flex flex-wrap justify-between gap-x-0.5 gap-y-1 text-center leading-tight text-muted-foreground"
          style={{ fontSize: AXIS_FONT_PX }}
        >
          {merged.map((p, i) => (
            <span key={`axis-${i}`} className="min-w-0 flex-1 basis-[2.75rem] truncate">
              {p.label}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1.5 leading-snug text-muted-foreground/80" style={{ fontSize: CAPTION_FONT_PX }}>
        示意可订最低价变化；均价见上方卡片。
      </p>
    </div>
  );
}
