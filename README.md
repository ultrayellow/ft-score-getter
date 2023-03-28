# ft-coalitions-score-getter

<h1>이 저장소의 모든 코드는 테스트되지 않았으며, 잠재적 문제를 갖고 있음을 알립니다.

### 사용법

1. .env 파일을 프로젝트 루트 경로에 생성
2. docker compose up

### .env 예시

```
CLIENT_NAME=name                  // required
CLIENT_ID=id                      // required
CLIENT_SECRET=secret              // required
CLIENT_RATE_LIMIT_PER_SEC=1       // optional (defaultValue = 2)
CLIENT_RATE_LIMIT_PER_HOUR=1      // optional (defaultValue = 1200)

TZ                                // optional (recommand Asia/Seoul)

TARGET_MONTH                      // optional (defaultValue = current Month - 1)
```

### ps

- RateLimiter 와 RequestController 의 수치를 조절하면 추가적인 최적화가 가능합니다.
