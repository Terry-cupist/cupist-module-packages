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
    userId: string | null;
    userProperties: Record<string, any>;
  }) => void;
  putUserProperties?: (props: { userProperties: Record<string, any> }) => void;
}

export interface IUserEventClassModule<
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> {
  log?: (
    props: FunctionParameter<IUserEventModule["log"]> &
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
  putUserProperties?: (
    props: FunctionParameter<IUserEventModule["putUserProperties"]>,
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
  //   modules: TUserEventTarget;
  defaultTargets: {
    [K in keyof IUserEventModule]?: AllCombinations<
      TupleUnion<`${string & keyof TUserEventTarget}`>
    >;
  };
};

export class UserEventModule<
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> implements IUserEventClassModule<TUserEventTarget>
{
  private modules;
  private defaultTargets;

  constructor({ modules, defaultTargets }: ConstructorProps<TUserEventTarget>) {
    this.modules = modules;
    this.defaultTargets = defaultTargets;
  }

  log({
    eventName,
    params,
    targets = this.defaultTargets?.log ?? ([] as any),
  }: FunctionParameter<IUserEventClassModule<TUserEventTarget>["log"]>) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) =>
      this.modules?.[target]?.log?.({ eventName, params }),
    );
  }

  logPurchase({
    transactionId,
    orderId, // orderId --- transactionId
    productId,
    signature, // signature --- productId
    price,
    priceOrigin, // 안씀
    currency,
    receiptDetail,
    params,
    targets = this.defaultTargets?.logPurchase ?? ([] as any),
  }: FunctionParameter<
    IUserEventClassModule<TUserEventTarget>["logPurchase"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) =>
      this.modules?.[target]?.logPurchase?.({
        transactionId,
        orderId,
        productId,
        signature,
        price,
        priceOrigin,
        currency,
        receiptDetail,
        params,
      }),
    );
  }

  logPurchasePG({
    gather_id,
    price,
    source,
    targets = this.defaultTargets?.logPurchasePG ?? ([] as any),
  }: FunctionParameter<
    IUserEventClassModule<TUserEventTarget>["logPurchasePG"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) =>
      this.modules?.[target]?.logPurchase?.({
        orderId: undefined,
        productId: "pg_purchase",
        price,
        currency: "KRW",
        receiptDetail: "",
        params: {
          gather_id,
          source,
          context: "pg",
        },
      }),
    );
  }

  conversion({
    code,
    targets = this.defaultTargets?.conversion ?? ([] as any),
  }: FunctionParameter<IUserEventClassModule<TUserEventTarget>["conversion"]>) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) =>
      this.modules?.[target]?.conversion?.({ code }),
    );
  }

  updateUserProperties({
    userId,
    userProperties,
  }: FunctionParameter<
    IUserEventClassModule<TUserEventTarget>["updateUserProperties"]
  >) {
    if (userId) {
      Object.values(this.modules).forEach((module) =>
        (module as IUserEventModule).updateUserProperties?.({
          userId,
          userProperties,
        }),
      );
    } else {
      Object.values(this.modules).forEach((module) =>
        (module as IUserEventModule).logout?.(),
      );
    }
  }

  putUserProperties({
    userProperties,
  }: FunctionParameter<
    IUserEventClassModule<TUserEventTarget>["putUserProperties"]
  >) {
    Object.values(this.modules).forEach((module) =>
      (module as IUserEventModule).putUserProperties?.({ userProperties }),
    );
  }
}
