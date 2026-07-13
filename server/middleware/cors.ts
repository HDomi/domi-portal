import { defineEventHandler, setResponseHeader, handleCors } from "h3";

export default defineEventHandler((event) => {
  // deploy.yml 환경변수에서 주입된 https://hdomi.github.io 주소를 읽어옵니다.
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://hdomi.github.io";

  // 브라우저의 무조건적인 승인을 유도하기 위한 완벽한 CORS 응답 헤더 바인딩
  setResponseHeader(event, "Access-Control-Allow-Origin", allowedOrigin);
  setResponseHeader(event, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  setResponseHeader(
    event,
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  setResponseHeader(event, "Access-Control-Allow-Credentials", "true");

  // 브라우저가 본 요청을 보내기 전 안전을 확인하는 Preflight(OPTIONS) 요청 패스 조치
  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
    return;
  }
});
