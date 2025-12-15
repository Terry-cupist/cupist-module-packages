// Union -> Tuple (순서는 TS 내부 결정이라 '고정'은 되지만, 사람이 기대하는 알파벳 순서 보장은 X)
type UnionToIntersection<U> = (U extends any ? (x: U) => 0 : never) extends (
  x: infer I,
) => 0
  ? I
  : never;

type LastOf<U> =
  UnionToIntersection<U extends any ? (x: U) => 0 : never> extends (
    x: infer L,
  ) => 0
    ? L
    : never;

type UnionToTuple<U, R extends any[] = []> = [U] extends [never]
  ? R
  : UnionToTuple<Exclude<U, LastOf<U>>, [LastOf<U>, ...R]>;

// "순서 무시" 조합 = (고정 순서 튜플의) 부분집합들만 생성
type UnorderedCombinations<T extends readonly any[]> = T extends readonly [
  infer F,
  ...infer R,
]
  ? UnorderedCombinations<R> | [F, ...UnorderedCombinations<R>]
  : [];

// 최종: keyof TUserEventTarget 의 부분집합 (순열 X)
type PossibleTargetCombinations<T extends Record<string, any>> =
  UnorderedCombinations<UnionToTuple<Extract<keyof T, string>>>;

type RestrictClassProperties<T, U> = {
  [K in keyof U]: K extends keyof T ? T[K] : never;
};

type FunctionParameter<T> = T extends (props: infer P, ...args: any[]) => any
  ? P
  : never;

type TargetProps<
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> = {
  targets?: PossibleTargetCombinations<TUserEventTarget>;
};

export interface IUserEventModule {
  init?: () => void | Promise<void>;
  log?: (props: { eventName: string; params?: Record<string, any> }) => void;
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
    [TEventName in `${string & TEventNames}`]?: TEventParams[TEventName];
  },
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> {
  init?: () => void | Promise<void>;
  log?: (
    props: {
      [TEventName in `${string & TEventNames}`]: {
        eventName: TEventName;
      } & (TEventName extends `${string & keyof TEventParams}`
        ? { params: TEventParams[TEventName] }
        : { params?: any });
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
    [K in keyof IUserEventModule]?: PossibleTargetCombinations<TUserEventTarget>;
  };
};

// Re-export utility types for internal use
export type { FunctionParameter, RestrictClassProperties, TargetProps };
