## UserEventModule 간단 사용 예시

`UserEventModule`을 활용하여 여러 Analytics 모듈(amplitude, firebase 등)을 한 번에 제어할 수 있습니다.

아래는 기본 사용 방법 예시입니다.

```ts
import { UserEventModule } from "@cupist/analytics-core";

// 각 타겟(예: amplitude, firebase)에 맞는 analytics 모듈 정의
const analytics = new UserEventModule({
  modules: {
    amplitude: {
      log: (props) => {
        /* Amplitude 로깅 처리 */
      },
      logPurchase: (props) => {},
      logPurchasePG: (props) => {},
      conversion: (props) => {},
      updateUserProperties: (props, actions) => {},
    },
    firebase: {
      log: (props) => {
        /* Firebase 로깅 처리 */
      },
      logPurchase: (props) => {},
      logPurchasePG: (props) => {},
      conversion: (props) => {},
      updateUserProperties: (props, actions) => {},
    },
  },
  defaultTargets: {
    // 기본적으로 log는 amplitude와 firebase 모두에 전송
    log: ["firebase", "amplitude"],
  },
  getStoredObject: (key) => Promise.resolve(undefined),
  removeStored: (key) => Promise.resolve(),
  setStoredObject: (key, value) => Promise.resolve(),
});

// 이벤트 전송 방법 (타겟 지정도 가능)
analytics.log({
  eventName: "test",
  params: { test: "test" },
  targets: ["firebase"], // firebase에만 이벤트 전송
});
```

위와 같이 설정하면 `analytics.log` 호출시 원하는 타겟(모듈)만 지정하거나, defaultTargets에 명시한 모든 모듈에 이벤트를 보낼 수 있습니다.
