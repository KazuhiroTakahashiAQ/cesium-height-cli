import {
  Cartographic,
  sampleTerrainMostDetailed,
  createWorldTerrainAsync,
} from "cesium";
import * as egm96 from "egm96-universal";

let terrainPromise: Promise<import("cesium").TerrainProvider> | undefined;

/** ジオイド 0 m 基準の正高 (m) を返す */
export async function getOrthometricHeight(lat: number, lon: number) {
  // TerrainProvider をシングルトン化
  if (!terrainPromise) terrainPromise = createWorldTerrainAsync();
  const terrain = await terrainPromise;

  const pos = Cartographic.fromDegrees(lon, lat);
  await sampleTerrainMostDetailed(terrain, [pos]);      // 楕円体高 h
  const h = pos.height ?? 0;

  const N = egm96.meanSeaLevel(lat, lon);               // ジオイド高 N

  console.log({ h, N, H: h - N });

  return h - N;                                         // 正高 H
}
