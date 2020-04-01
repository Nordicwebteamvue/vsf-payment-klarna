import { KlarnaOrder } from './KlarnaOrder'
import KlarnaState from './KlarnaState'
import { KlarnaResult } from './KlarnaResult'
import { KlarnaEvents } from './KlarnaEvents'

export interface KlarnaPlugin {
  name: string;
  beforeCreate?: (arg0: BeforeCreate) => KlarnaOrder;
  afterCreate?: (arg0: AfterCreate) => void;
  onConfirmation?: (arg0: OnConfirmation) => void;
  on?: {
    [key in KlarnaEvents]?: (arg0: any) => void;
  };
}

export interface BeforeCreate {
  order: KlarnaOrder;
  getters: any;
  state: KlarnaState;
  config: any;
}

export interface AfterCreate {
  order: KlarnaOrder;
  result: KlarnaResult;
}

export interface OnConfirmation {
  getters: any;
  dispatch: Function;
  result: KlarnaResult;
}
