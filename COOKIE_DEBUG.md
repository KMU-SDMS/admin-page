# 쿠키 설정 디버깅 가이드

## 배포 환경에서 쿠키가 설정되지 않는 문제

### 1. 브라우저 콘솔 확인

배포 환경에서 로그인 시 다음 로그를 확인:

- `API 요청`: 요청 URL과 메서드
- `API 응답 상태`: HTTP 상태 코드
- `응답 헤더`: Set-Cookie 헤더 확인

### 2. 브라우저 Network 탭 확인

1. 개발자 도구 열기 (F12)
2. Network 탭으로 이동
3. `/auth/callback` 요청 찾기
4. Response Headers에서 다음 확인:
   ```
   Set-Cookie: sid=<session-id>; SameSite=None; Secure; HttpOnly; Path=/; Domain=api.yourdomain.com
   ```

### 3. 백엔드 API 서버 쿠키 설정 확인

백엔드 API에서 `/auth/callback` 엔드포인트의 응답이 다음을 포함해야 합니다:

```javascript
// Node.js/Express 예시
res.cookie("sid", sessionId, {
  httpOnly: true, // JavaScript에서 접근 불가 (보안)
  secure: true, // HTTPS에서만 전송
  sameSite: "none", // Cross-Origin 요청 허용
  maxAge: 86400000, // 24시간 (ms)
  domain: ".yourdomain.com", // 모든 서브도메인에서 접근 가능
  path: "/",
});
```

### 4. CORS 설정 확인

백엔드 API의 CORS 설정에서 다음을 확인:

```javascript
// CORS 설정 예시
app.use(
  cors({
    origin: "https://your-frontend-domain.com",
    credentials: true, // 쿠키 전송 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### 5. 환경 변수 확인

`.env` 또는 배포 플랫폼의 환경 변수에 다음이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 6. 가능한 문제들

#### 문제 1: SameSite 속성 누락

Cross-Origin 환경에서는 반드시 `SameSite=None`이 필요합니다.

#### 문제 2: Secure 속성 누락

HTTPS 환경에서는 `Secure=true`가 필요합니다.

#### 문제 3: Domain 설정 오류

예: `Domain=yourdomain.com` → `.yourdomain.com` (점 포함)

#### 문제 4: CORS credentials 미설정

백엔드에서 `Access-Control-Allow-Credentials: true`를 보내지 않음

### 7. 디버깅 단계별 확인

1. ✅ 프론트엔드에서 `credentials: "include"` 설정 확인 (lib/api.ts:72)
2. ✅ 백엔드 응답에 `Set-Cookie` 헤더 확인 (Network 탭)
3. ✅ `Set-Cookie` 헤더에 `SameSite=None; Secure` 포함 확인
4. ✅ 브라우저 콘솔에서 쿠키 로그 확인
5. ✅ CORS 응답 헤더에 `Access-Control-Allow-Credentials: true` 확인

### 8. 임시 해결책

만약 Cross-Origin 쿠키 설정이 불가능하다면:

- JWT 토큰을 localStorage에 저장
- Authorization 헤더로 전송
- (이 방법은 XSS 취약점이 있으므로 보안을 신경써야 함)

