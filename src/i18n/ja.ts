import type { TranslationKeys } from "./en";

export const ja: TranslationKeys = {
  common: { save: "保存", cancel: "キャンセル", delete: "削除", loading: "読み込み中...", search: "検索", noResults: "結果が見つかりません", signOut: "ログアウト", upgrade: "アップグレード" },
  nav: { dashboard: "ダッシュボード", templates: "テンプレート", envelopes: "封筒", analytics: "分析", team: "チーム", apiKeys: "APIキー", webhooks: "Webhooks", pricing: "料金", settings: "設定" },
  dashboard: { title: "ダッシュボード", subtitle: "免責事項の運用概要", setupRequired: "開始するには組織を設定してください", templates: "テンプレート", sent: "送信済み", completed: "完了", pending: "保留中" },
  envelopes: { title: "封筒", subtitle: "すべての免責事項署名を追跡", newEnvelope: "新規封筒", bulkSend: "一括送信", searchPlaceholder: "メール、名前、予約IDで検索...", allStatuses: "すべてのステータス", noEnvelopes: "封筒が見つかりません" },
  signing: { title: "免責同意書", subtitle: "以下の免責事項をよくお読みになり、下までスクロールして署名を完了してください。", scrollToEnd: "続行するには最後までスクロールしてください", fullName: "正式名称", initials: "イニシャル", signature: "署名", drawSignature: "上に署名を描いてください", clearSignature: "署名をクリア", agreeText: "この文書に電子的に署名することに同意し、これが法的拘束力のある署名であることを認めます。", submit: "完了して送信", submitting: "署名中...", submitDisclaimer: '「完了して送信」をクリックすると、上記の条件に同意し、電子署名に同意したものとみなされます。', success: "免責事項署名完了", successMessage: "ありがとうございます、{name}。署名済みの免責事項が記録されました。", notFound: "リンクが見つかりません", notFoundMessage: "この署名リンクは無効または期限切れです。", canceled: "免責事項キャンセル済み", canceledMessage: "この免責事項はキャンセルされ、署名できなくなりました。" },
  settings: { title: "設定", subtitle: "組織を管理", orgName: "組織名", retention: "PDF保持期間（年）", createOrg: "組織を作成", saveChanges: "変更を保存" },
  team: { title: "チームメンバー", subtitle: "チームを管理し、新しいメンバーを招待", invite: "メンバーを招待", sendInvite: "招待を送信", pendingInvites: "保留中の招待", currentMembers: "現在のメンバー", you: "あなた" },
  analytics: { title: "分析", subtitle: "免責事項のパフォーマンスと使用状況", exportCsv: "CSVエクスポート", totalEnvelopes: "封筒合計", completionRate: "完了率", monthlyUsage: "月間使用量", waiversOverTime: "免責事項の推移（30日間）", statusBreakdown: "ステータス内訳" },
  pricing: { title: "プランを選択", subtitle: "使用分だけお支払い — すべてのプランに{rate}/免責事項の超過料金が含まれます", manageSubscription: "サブスクリプション管理", currentPlan: "現在のプラン", getStarted: "始める", switchPlan: "プラン変更", downgrade: "ダウングレード" },
};
