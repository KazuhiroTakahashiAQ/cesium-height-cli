#!/usr/bin/env tsx
import {
  Cartographic,
  sampleTerrainMostDetailed,
  createWorldTerrainAsync,
  Ion,
} from "cesium";
import * as egm96 from "egm96-universal";

Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN ?? "";

async function main() {
  const [latStr, lonStr, pitchStr = "10", sizeStr = "50"] = process.argv.slice(2);
  if (!latStr || !lonStr) {
    console.error(
      "Usage: height-grid <lat> <lon> [pitch-m=10] [size=50]  > grid.csv",
    );
    process.exit(1);
  }

  const originLat = Number(latStr);
  const originLon = Number(lonStr);
  const pitch = Number(pitchStr);      // メートル
  const size = Number(sizeStr);        // 点数／軸

  /*―― 座標間隔 (deg) を計算 ――*/
  const metersPerDegLat = 111_320;                         // 1 °緯度 ≈ 111 km
  const metersPerDegLon = metersPerDegLat *
    Math.cos((originLat * Math.PI) / 180);                 // 経度は緯度依存
  const dLat = pitch / metersPerDegLat;
  const dLon = pitch / metersPerDegLon;

  /*―― 2 500 点ぶん Cartographic を生成 ――*/
  const positions: Cartographic[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push(
        Cartographic.fromDegrees(
          originLon + j * dLon,
          originLat + i * dLat,
        ),
      );
    }
  }

  /*―― 地形高 (楕円体高 h) を一括取得 ――*/
  const terrain = await createWorldTerrainAsync();
  await sampleTerrainMostDetailed(terrain, positions);

  /*―― CSV ヘッダー ――*/
  console.log("lat,lon,height");

  /*―― 正高 H = h − N を計算して出力 ――*/
  for (const pos of positions) {
    const lat = (pos.latitude * 180) / Math.PI;
    const lon = (pos.longitude * 180) / Math.PI;
    const h = pos.height ?? 0;                 // 楕円体高
    const N = egm96.meanSeaLevel(lat, lon);    // ジオイド高
    const H = h - N;                           // 正高
    console.log(`${lat.toFixed(8)},${lon.toFixed(8)},${H.toFixed(2)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
