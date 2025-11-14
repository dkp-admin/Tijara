import { requireNativeView } from 'expo';
import * as React from 'react';

import { TijarahUtilsViewProps } from './TijarahUtils.types';

const NativeView: React.ComponentType<TijarahUtilsViewProps> =
  requireNativeView('TijarahUtils');

export default function TijarahUtilsView(props: TijarahUtilsViewProps) {
  return <NativeView {...props} />;
}
