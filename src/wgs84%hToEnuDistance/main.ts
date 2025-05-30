// WGS84座標系で、２点間の距離をENUで計算
import { calculate2DOffsetInMeters } from './calc';
import { Cartesian3, Ellipsoid } from 'cesium';

// 緯度経度をラジアンに変換
const toRadians = (deg: number) => deg * Math.PI / 180;

// WGS84 → ECEF
const origin = Cartesian3.fromRadians(
  toRadians(139.68970205566225),  // 経度
  toRadians(35.68915110705668),   // 緯度
  0,
  Ellipsoid.WGS84
);

const target = Cartesian3.fromRadians(
  toRadians(139.69020424905588),
  toRadians(35.68946376346555),
  0,
  Ellipsoid.WGS84
);

// 計算
const result = calculate2DOffsetInMeters({ origin, target });

console.log(`Offset in meters: x=${result.x}, y=${result.y}`);
