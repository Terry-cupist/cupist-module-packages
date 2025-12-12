type RestrictClassProperties<T, U> = {
  [K in keyof U]: K extends keyof T ? T[K] : never;
};

type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

type AllCombinations<T extends readonly any[]> = T extends [infer F, ...infer R]
  ? AllCombinations<R> | [F, ...AllCombinations<R>]
  : [];

type FunctionParameter<T> = T extends (props: infer P, ...args: any[]) => any
  ? P
  : never;

type TargetProps<
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> = {
  targets?: AllCombinations<TupleUnion<`${string & keyof TUserEventTarget}`>>;
};

export interface IUserEventModule {
  init?: () => void | Promise<void>;
  log?: (props: { eventName: string; params: Record<string, any> }) => void;
  logout?: () => void;
  logPurchase?: (props: {
    transactionId?: string;
    orderId?: string;
    productId: string;
    signature?: string;
    price: number;
    priceOrigin?: string;
    currency: string;
    receiptDetail: string;
    params: Record<string, any>;
  }) => void;
  logPurchasePG?: (props: {
    gather_id: string;
    price: number;
    source: string;
  }) => void;
  conversion?: (props: { code: string }) => void;
  updateUserProperties?: (props: {
    userId?: string;
    userProperties: Record<string, any>;
  }) => void;
}

export interface IUserEventClassModule<
  TEventNames,
  TEventParams extends {
    [TEventName in `${string & TEventNames}`]: TEventParams[TEventName];
  },
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> {
  init?: () => void | Promise<void>;
  log?: (
    props: {
      [EventName in `${string & TEventNames}`]: {
        eventName: EventName;
        params: TEventParams[EventName];
      };
    }[`${string & TEventNames}`] &
      TargetProps<TUserEventTarget>,
  ) => void;
  logout?: () => void;
  logPurchase?: (
    props: FunctionParameter<IUserEventModule["logPurchase"]> &
      TargetProps<TUserEventTarget>,
  ) => void;
  logPurchasePG?: (
    props: FunctionParameter<IUserEventModule["logPurchasePG"]> &
      TargetProps<TUserEventTarget>,
  ) => void;
  conversion?: (
    props: FunctionParameter<IUserEventModule["conversion"]> &
      TargetProps<TUserEventTarget>,
  ) => void;
  updateUserProperties?: (
    props: FunctionParameter<IUserEventModule["updateUserProperties"]>,
  ) => void;
}

export type ConstructorProps<
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> = {
  modules: {
    [K in keyof TUserEventTarget]: IUserEventModule;
  };
  defaultTargets: {
    [K in keyof IUserEventModule]?: AllCombinations<
      TupleUnion<`${string & keyof TUserEventTarget}`>
    >;
  };
};

// Re-export utility types for internal use
export type {
  AllCombinations,
  FunctionParameter,
  RestrictClassProperties,
  TargetProps,
  TupleUnion,
};
