import * as React from 'react';

import { TijarahUtilsViewProps } from './TijarahUtils.types';

export default function TijarahUtilsView(props: TijarahUtilsViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
