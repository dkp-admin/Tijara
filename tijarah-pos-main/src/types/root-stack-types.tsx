import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Auth: undefined;
  Authenticated: undefined;
  LocationNavigator: undefined;
  PackageDetail: undefined;
  ServiceDetail: undefined;
  SelectCar: undefined;
  GuestSelectCar: undefined;
  Login: undefined;
  BookingDetails: undefined;
  SubscriptionDetails: undefined;
  EditProfile: undefined;
  Address: undefined;
  OrderHistory: undefined;
  MyGarageDetail: undefined;
  Notifications: undefined;
  AddGarageCar: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    StackScreenProps<RootStackParamList>
  >;
