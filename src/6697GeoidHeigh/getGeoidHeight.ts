#!/usr/bin/env -S node --loader ts-node/esm
/**
 * get-msl-height.ts
 * 任意座標の平均海面高（東京湾平均海面）を取得
 *
 * 使い方:
 *   ts-node get-msl-height.ts 35.681236 139.767125
 *   # または
 *   npx esbuild get-msl-height.ts --bundle --platform=node --outfile=get-msl-height.js
 */

import { argv, exit } from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

// ------------------------------- 設定 -------------------------------
const ELEV_URL =
  "https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php";
const GEOID_URL =
  "https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh/cgi/geoidcalc.pl";
const HEADERS = { "User-Agent": "msl-height-ts/1.0 (+https://gsi.go.jp)" };
// API 制限回避用（10 秒 10 回）：必要に応じて delay を挟む
const REQUEST_DELAY_MS = 0;
// --------------------------------------------------------------------

interface ElevationResponse {
  elevation: string;
}

interface GeoidResponse {
  OutputData: { geoidHeight: string };
}

async function getElevation(lat: number, lon: number): Promise<number> {
  console.log(`標高データを取得中: (${lat.toFixed(8)}, ${lon.toFixed(8)})`);
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    outtype: "JSON",
  });
  const res = await fetch(`${ELEV_URL}?${params.toString()}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Elevation API error: ${res.statusText}`);
  const json = (await res.json()) as ElevationResponse;
  const value = Number(json.elevation);
  if (value === -9999) throw new Error("標高データが存在しません");
  await sleep(REQUEST_DELAY_MS);
  console.log(`取得した標高: ${value} m`);
  return value;
}

async function getGeoidHeight(lat: number, lon: number): Promise<number> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    outputType: "json",
    select: "0", // 0 = 最新 (ジオイド2024)
    tanni: "1", // 1 = metre
  });
  const res = await fetch(`${GEOID_URL}?${params.toString()}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Geoid API error: ${res.statusText}`);
  const json = (await res.json()) as GeoidResponse;
  const value = Number(json.OutputData.geoidHeight);
  await sleep(REQUEST_DELAY_MS);
  return value;
}

async function main() {
  if (argv.length !== 4) {
    console.error("Usage: ts-node get-msl-height.ts <lat> <lon>");
    return exit(1);
  }
  const lat = Number(argv[2]);
  const lon = Number(argv[3]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    console.error("経緯度は数値（10進度）で指定してください");
    return exit(1);
  }

  try {
    const [elev, geoid] = await Promise.all([
      getElevation(lat, lon),
      getGeoidHeight(lat, lon),
    ]);
    console.log(`地点 (${lat.toFixed(8)}, ${lon.toFixed(8)})`);
    console.log(`  平均海面からの標高 (H):  ${elev.toFixed(3)} m`);
    console.log(`  ジオイド高 (N)        :  ${geoid.toFixed(3)} m`);
    console.log(`  楕円体高  (h = H + N):  ${(elev + geoid).toFixed(3)} m`);
  } catch (err) {
    console.error((err as Error).message);
    exit(1);
  }
}

// if (import.meta.url === `file://${process.argv[1]}`) main();
/* --- 末尾だけ置き換え --- */
main().catch((err) => {
  console.error((err as Error).message);
  exit(1);
});
