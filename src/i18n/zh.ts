import type { TranslationKeys } from "./en";

export const zh: TranslationKeys = {
  common: { save: "保存", cancel: "取消", delete: "删除", loading: "加载中...", search: "搜索", noResults: "未找到结果", signOut: "退出", upgrade: "升级" },
  nav: { dashboard: "仪表板", templates: "模板", envelopes: "信封", analytics: "分析", team: "团队", apiKeys: "API密钥", webhooks: "Webhooks", pricing: "定价", settings: "设置" },
  dashboard: { title: "仪表板", subtitle: "您的免责声明操作概览", setupRequired: "设置您的组织以开始", templates: "模板", sent: "已发送", completed: "已完成", pending: "待处理" },
  envelopes: { title: "信封", subtitle: "跟踪所有免责声明签名", newEnvelope: "新信封", bulkSend: "批量发送", searchPlaceholder: "按邮箱、姓名、预订ID搜索...", allStatuses: "所有状态", noEnvelopes: "未找到信封" },
  signing: { title: "责任免除书", subtitle: "请仔细阅读以下免责声明，滚动到底部，然后完成您的签名。", scrollToEnd: "滚动到底部以继续", fullName: "法定全名", initials: "缩写", signature: "签名", drawSignature: "在上方绘制您的签名", clearSignature: "清除签名", agreeText: "我同意以电子方式签署本文件，并确认这构成具有法律约束力的签名。", submit: "完成并提交", submitting: "签名中...", submitDisclaimer: '点击"完成并提交"即表示您同意上述条款并同意电子签名。', success: "免责声明已签署", successMessage: "谢谢，{name}。您签署的免责声明已记录。", notFound: "链接未找到", notFoundMessage: "此签名链接无效或已过期。", canceled: "免责声明已取消", canceledMessage: "此免责声明已被取消，无法再签署。" },
  settings: { title: "设置", subtitle: "管理您的组织", orgName: "组织名称", retention: "PDF保留期（年）", createOrg: "创建组织", saveChanges: "保存更改" },
  team: { title: "团队成员", subtitle: "管理您的团队并邀请新成员", invite: "邀请成员", sendInvite: "发送邀请", pendingInvites: "待处理邀请", currentMembers: "当前成员", you: "您" },
  analytics: { title: "分析", subtitle: "免责声明绩效和使用洞察", exportCsv: "导出CSV", totalEnvelopes: "总信封数", completionRate: "完成率", monthlyUsage: "月度使用量", waiversOverTime: "免责声明趋势（30天）", statusBreakdown: "状态分布" },
  pricing: { title: "选择您的方案", subtitle: "按使用量付费——每个方案包含超额部分按{rate}/免责声明计费", manageSubscription: "管理订阅", currentPlan: "当前方案", getStarted: "开始使用", switchPlan: "切换方案", downgrade: "降级" },
};
