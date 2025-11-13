declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerJSX;
  }
}

interface ModelViewerJSX {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  ar?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
