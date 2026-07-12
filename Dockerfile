# 1단계: 빌드 환경 구성
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Firebase 빌드 시 필요한 Arguments 정의 및 환경 변수 주입
ARG FIREBASE_SERVICE_ACCOUNT_JSON
ARG FIREBASE_DATABASE_URL
ENV FIREBASE_SERVICE_ACCOUNT_JSON=$FIREBASE_SERVICE_ACCOUNT_JSON
ENV FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL

# Nuxt 정적 사이트 빌드 실행
RUN pnpm run generate

# 2단계: Nginx 실행 환경 구성
FROM nginx:alpine

# Nginx 커스텀 설정 적용
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 정적 파일 복사
COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
