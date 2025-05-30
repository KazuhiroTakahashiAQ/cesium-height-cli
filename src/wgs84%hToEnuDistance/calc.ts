import { Point2D } from './types/Point2D';
import { Cartesian3, Matrix4, Transforms } from 'cesium';

type Props = {
  origin: Cartesian3;
  target: Cartesian3;
};

export const calculate2DOffsetInMeters = ({ origin, target }: Props): Point2D => {
  const enuTransform = Transforms.eastNorthUpToFixedFrame(origin);

  const originENU = Matrix4.inverseTransformation(enuTransform, new Matrix4());
  const localDestination = Matrix4.multiplyByPoint(originENU, target, new Cartesian3());

  return { x: localDestination.x, y: localDestination.y };
};