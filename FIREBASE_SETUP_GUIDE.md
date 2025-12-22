# Firebase 조회수 기능 설정 가이드

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. Google 계정으로 로그인
3. "프로젝트 추가" 클릭

### 1-2. 프로젝트 생성
1. 프로젝트 이름 입력: `jys0615-blog` (원하는 이름)
2. Google Analytics 활성화 (선택사항)
3. "프로젝트 만들기" 클릭

## 2. Realtime Database 설정

### 2-1. Database 생성
1. 왼쪽 메뉴에서 "빌드" → "Realtime Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치 선택: `asia-southeast1` (싱가포르 - 한국과 가까움)
4. 보안 규칙: "잠금 모드에서 시작" 선택
5. "사용 설정" 클릭

### 2-2. 보안 규칙 설정
데이터베이스가 생성되면 "규칙" 탭으로 이동하여 다음 규칙을 입력:

```json
{
  "rules": {
    "viewCounts": {
      ".read": true,
      "$postId": {
        ".write": true,
        ".validate": "newData.isNumber() && newData.val() >= 0"
      }
    }
  }
}
```

**설명:**
- 조회수는 누구나 읽을 수 있음 (`.read: true`)
- 조회수는 누구나 쓸 수 있지만, 숫자만 가능 (`.write: true` with validation)
- 음수 방지 (`.validate`)

"게시" 버튼 클릭하여 규칙 저장

## 3. 웹 앱 설정

### 3-1. 앱 추가
1. 프로젝트 설정 (톱니바퀴 아이콘) → "프로젝트 설정" 클릭
2. "내 앱" 섹션에서 웹 아이콘 (`</>`) 클릭
3. 앱 닉네임 입력: `Blog Website`
4. "Firebase Hosting도 설정" 체크 해제
5. "앱 등록" 클릭

### 3-2. Firebase Config 복사
다음과 같은 형식의 설정이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

**이 정보를 복사해두세요!**

## 4. 코드에 Firebase 설정 적용

### 4-1. firebase-view-counter.js 수정

`assets/js/firebase-view-counter.js` 파일을 열고,
`firebaseConfig` 객체를 복사한 설정으로 교체:

```javascript
// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // ← 여기를 복사한 값으로 변경
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4-2. HTML 파일에 Firebase SDK 추가

**blog-post.html** 파일의 `</body>` 태그 직전에 추가:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<!-- Firebase View Counter -->
<script src="assets/js/firebase-view-counter.js"></script>
```

**blog.html**에도 동일하게 추가

**index.html**에도 동일하게 추가

### 4-3. 초기화 코드 수정

**blog-post.js**에서:

```javascript
// 기존 코드
if (typeof initViewCounter === 'function') {
  initViewCounter(postId);
}

// Firebase 버전으로 변경
if (typeof initFirebaseViewCounter === 'function') {
  initFirebaseViewCounter(postId);
}
```

**blog.js**에서:

```javascript
// 기존 코드
if (typeof displayViewCounts === 'function') {
  displayViewCounts(postIds);
}

// Firebase 버전으로 변경
if (typeof displayFirebaseViewCounts === 'function') {
  displayFirebaseViewCounts(postIds);
}
```

## 5. 테스트

### 5-1. 로컬 테스트
1. GitHub Pages 사이트 열기
2. 블로그 포스트 열기
3. 브라우저 개발자 도구 (F12) → Console 확인
   - "Firebase initialized successfully" 메시지 확인
   - 에러가 없는지 확인

### 5-2. Firebase Console에서 확인
1. Firebase Console → Realtime Database → 데이터 탭
2. `viewCounts` 노드 확인
3. 블로그 포스트 ID별로 조회수가 증가하는지 확인

## 6. 문제 해결

### Firebase 초기화 실패
- **원인**: firebaseConfig가 잘못됨
- **해결**: Firebase Console에서 설정을 다시 복사

### 조회수가 증가하지 않음
- **원인**: 보안 규칙 문제
- **해결**: 규칙 탭에서 위의 보안 규칙을 정확히 입력했는지 확인

### CORS 에러
- **원인**: authDomain 설정 문제
- **해결**: Firebase Console → 프로젝트 설정에서 승인된 도메인에 `jys0615.github.io` 추가

## 7. 비용 관리

### 무료 플랜 한도
- **동시 연결**: 100개
- **저장 용량**: 1GB
- **다운로드**: 10GB/월

### 한도 초과 방지
- 개인 블로그는 무료 한도 내에서 충분
- Firebase Console → 사용량 탭에서 모니터링 가능
- 알림 설정: 80% 도달 시 이메일 받기

## 8. 보안 강화 (선택사항)

현재 규칙은 누구나 조회수를 증가시킬 수 있습니다.
더 안전하게 하려면:

```json
{
  "rules": {
    "viewCounts": {
      ".read": true,
      "$postId": {
        ".write": "newData.isNumber() &&
                   newData.val() == data.val() + 1 &&
                   newData.val() >= 0"
      }
    }
  }
}
```

이렇게 하면 한 번에 1씩만 증가 가능 (악의적인 대량 증가 방지)

## 완료!

이제 모든 사용자가 공유하는 진짜 조회수 시스템이 작동합니다! 🎉
