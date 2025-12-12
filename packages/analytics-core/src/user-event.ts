import type {
  ConstructorProps,
  FunctionParameter,
  IUserEventClassModule,
  IUserEventModule,
  RestrictClassProperties,
} from "./user-event.types";

export type {
  IUserEventClassModule,
  IUserEventModule,
} from "./user-event.types";

export class UserEventModule<
  TEventNames,
  TEventParams extends {
    [TEventName in `${string & TEventNames}`]: TEventParams[TEventName];
  },
  TUserEventTarget extends Record<
    `${string & keyof TUserEventTarget}`,
    IUserEventModule
  >,
> implements
    RestrictClassProperties<
      IUserEventClassModule<TEventNames, TEventParams, TUserEventTarget>,
      UserEventModule<TEventNames, TEventParams, TUserEventTarget>
    >
{
  private modules;
  private defaultTargets;
  private isInitialized = false;

  constructor({ modules, defaultTargets }: ConstructorProps<TUserEventTarget>) {
    this.modules = modules;
    this.defaultTargets = defaultTargets;

    this.log = this.withInitCheck("log", this.log);
    this.logPurchase = this.withInitCheck("logPurchase", this.logPurchase);
    this.logPurchasePG = this.withInitCheck(
      "logPurchasePG",
      this.logPurchasePG,
    );
    this.conversion = this.withInitCheck("conversion", this.conversion);
    this.updateUserProperties = this.withInitCheck(
      "updateUserProperties",
      this.updateUserProperties,
    );
  }

  private withInitCheck<T extends (...args: any[]) => any>(
    methodName: string,
    method: T,
  ): T {
    return ((...args: any[]) => {
      try {
        if (!this.isInitialized) {
          console.error(
            `[UserEventModule] ${methodName}() called before init(). Please call init() first.`,
          );
          return;
        }
        return method.apply(this, args);
      } catch (error) {
        console.error(`[UserEventModule] Error in ${methodName}():`, error);
      }
    }) as T;
  }

  async init() {
    console.log("[UserEventModule] init start");
    await Promise.all(
      Object.entries(this.modules).map(async ([moduleName, moduleTarget]) => {
        try {
          console.log(`[UserEventModule] <${moduleName}> initializing...`);
          await (moduleTarget as IUserEventModule).init?.();
          console.log(`[UserEventModule] <${moduleName}> initialized`);
        } catch (error) {
          console.error(
            `[UserEventModule] Error in <${moduleName}> init():`,
            error,
          );
        }
      }),
    );
    this.isInitialized = true;
  }

  log({
    eventName,
    params,
    targets = this.defaultTargets?.log ?? ([] as any),
  }: FunctionParameter<
    IUserEventClassModule<TEventNames, TEventParams, TUserEventTarget>["log"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) => {
      console.log(`[UserEventModule] <${target.toString()}> log`);
      this.modules?.[target]?.log?.({ eventName, params });
    });
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
    IUserEventClassModule<
      TEventNames,
      TEventParams,
      TUserEventTarget
    >["logPurchase"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) => {
      console.log(`[UserEventModule] <${target.toString()}> logPurchase`);
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
      });
    });
  }

  logPurchasePG({
    gather_id,
    price,
    source,
    targets = this.defaultTargets?.logPurchasePG ?? ([] as any),
  }: FunctionParameter<
    IUserEventClassModule<
      TEventNames,
      TEventParams,
      TUserEventTarget
    >["logPurchasePG"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) => {
      console.log(`[UserEventModule] <${target.toString()}> logPurchasePG`);
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
      });
    });
  }

  conversion({
    code,
    targets = this.defaultTargets?.conversion ?? ([] as any),
  }: FunctionParameter<
    IUserEventClassModule<
      TEventNames,
      TEventParams,
      TUserEventTarget
    >["conversion"]
  >) {
    (targets as (keyof TUserEventTarget)[]).forEach((target) => {
      console.log(`[UserEventModule] <${target.toString()}> conversion`);
      this.modules?.[target]?.conversion?.({ code });
    });
  }

  updateUserProperties({
    userId,
    userProperties,
  }: FunctionParameter<
    IUserEventClassModule<
      TEventNames,
      TEventParams,
      TUserEventTarget
    >["updateUserProperties"]
  >) {
    Object.entries(this.modules).forEach(([moduleName, module]) => {
      console.log(
        `[UserEventModule] <${moduleName}> updateUserProperties with userId: ${userId}`,
      );
      (module as IUserEventModule).updateUserProperties?.({
        userId,
        userProperties,
      });
    });
  }

  logout() {
    Object.entries(this.modules).forEach(([moduleName, module]) => {
      console.log(`[UserEventModule] <${moduleName}> logout`);
      (module as IUserEventModule).logout?.();
    });
  }
}

export function getUserEventModuleMaker<
  TEventNames,
  TEventParams extends {
    [TEventName in `${string & TEventNames}`]: TEventParams[TEventName];
  },
>() {
  return <
    TUserEventTarget extends Record<
      `${string & keyof TUserEventTarget}`,
      IUserEventModule
    >,
  >(
    config: ConstructorProps<TUserEventTarget>,
  ) => {
    return new UserEventModule<TEventNames, TEventParams, TUserEventTarget>(
      config,
    );
  };
}
