export type ButtonProps = {
  title: string;
  onPress: () => void;
  reverse?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  loading?: boolean;
};

export type BackButtonProps = {
  onPress: () => void;
  style?: any;
};
