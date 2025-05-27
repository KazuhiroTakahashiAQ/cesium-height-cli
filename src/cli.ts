#!/usr/bin/env -S node --loader ts-node/esm
import { getOrthometricHeight } from "./getOrthometricHeight.js";
import { Ion } from "cesium";

Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN ?? "";

const [latStr, lonStr] = process.argv.slice(2);
if (!latStr || !lonStr) {
  console.error("Usage: height <lat> <lon>");
  process.exit(1);
}
const lat = Number(latStr);
const lon = Number(lonStr);

getOrthometricHeight(lat, lon).then((h) =>
  console.log(`${h.toFixed(2)} m (orthometric)`),
);
