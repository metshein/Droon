import type { SceneSpec } from '../types';
import QuadTop from './QuadTop';
import QuadSide from './QuadSide';
import ThrustCurve from './ThrustCurve';
import Mixer from './Mixer';

// Valib sammu andmetes kirjeldatud skeemile vastava komponendi.
export default function Scene({ spec }: { spec: SceneSpec }) {
  switch (spec.type) {
    case 'quadTop':
      return <QuadTop {...spec} />;
    case 'quadSide':
      return <QuadSide {...spec} />;
    case 'thrustCurve':
      return <ThrustCurve {...spec} />;
    case 'mixer':
      return <Mixer />;
  }
}
