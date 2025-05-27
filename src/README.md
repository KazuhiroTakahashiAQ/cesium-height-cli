# Exec
```
// Cesium標準の高さ（標高）を取得
$ npx tsx src/PointOrthometricHeight/cli.ts  35.6895014 139.6917337

// Cesium標準の高さ（標高）を、原点から緯度経度方向に10mピッチで合計50 * 50点取得
$ npx tsx src/GridOrthometricHeight/grid.ts 35.6895014 139.6917337

// 国土地理院APIを使ってEPSG:6697で標高取得
$ npx tsx src/6697GeoidHeigh/getGeoidHeight.ts 35.6895014 139.6917337
```