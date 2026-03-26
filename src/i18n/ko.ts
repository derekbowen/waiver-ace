import type { TranslationKeys } from "./en";

export const ko: TranslationKeys = {
  common: { save: "저장", cancel: "취소", delete: "삭제", loading: "로딩 중...", search: "검색", noResults: "결과를 찾을 수 없습니다", signOut: "로그아웃", upgrade: "업그레이드" },
  nav: { dashboard: "대시보드", templates: "템플릿", envelopes: "봉투", analytics: "분석", team: "팀", apiKeys: "API 키", webhooks: "Webhooks", pricing: "요금", settings: "설정" },
  dashboard: { title: "대시보드", subtitle: "면책 조항 운영 개요", setupRequired: "시작하려면 조직을 설정하세요", templates: "템플릿", sent: "발송됨", completed: "완료됨", pending: "대기 중" },
  envelopes: { title: "봉투", subtitle: "모든 면책 조항 서명 추적", newEnvelope: "새 봉투", bulkSend: "일괄 발송", searchPlaceholder: "이메일, 이름, 예약 ID로 검색...", allStatuses: "모든 상태", noEnvelopes: "봉투를 찾을 수 없습니다" },
  signing: { title: "면책 동의서", subtitle: "아래 면책 조항을 주의 깊게 읽고 맨 아래로 스크롤한 다음 서명을 완료하세요.", scrollToEnd: "계속하려면 끝까지 스크롤하세요", fullName: "정식 이름", initials: "이니셜", signature: "서명", drawSignature: "위에 서명을 그리세요", clearSignature: "서명 지우기", agreeText: "이 문서에 전자적으로 서명하는 것에 동의하며, 이것이 법적 구속력이 있는 서명임을 인정합니다.", submit: "완료 및 제출", submitting: "서명 중...", submitDisclaimer: '"완료 및 제출"을 클릭하면 위의 약관에 동의하고 전자 서명에 동의하는 것입니다.', success: "면책 조항 서명 완료", successMessage: "감사합니다, {name}. 서명된 면책 조항이 기록되었습니다.", notFound: "링크를 찾을 수 없음", notFoundMessage: "이 서명 링크가 유효하지 않거나 만료되었습니다.", canceled: "면책 조항 취소됨", canceledMessage: "이 면책 조항은 취소되었으며 더 이상 서명할 수 없습니다." },
  settings: { title: "설정", subtitle: "조직 관리", orgName: "조직 이름", retention: "PDF 보관 기간(년)", createOrg: "조직 만들기", saveChanges: "변경 사항 저장" },
  team: { title: "팀원", subtitle: "팀을 관리하고 새 멤버를 초대하세요", invite: "멤버 초대", sendInvite: "초대 보내기", pendingInvites: "대기 중인 초대", currentMembers: "현재 멤버", you: "나" },
  analytics: { title: "분석", subtitle: "면책 조항 성과 및 사용 현황", exportCsv: "CSV 내보내기", totalEnvelopes: "총 봉투", completionRate: "완료율", monthlyUsage: "월간 사용량", waiversOverTime: "면책 조항 추이 (30일)", statusBreakdown: "상태 분류" },
  pricing: { title: "플랜 선택", subtitle: "사용한 만큼 지불 — 모든 플랜에 {rate}/면책 조항 초과 요금 포함", manageSubscription: "구독 관리", currentPlan: "현재 플랜", getStarted: "시작하기", switchPlan: "플랜 변경", downgrade: "다운그레이드" },
};
