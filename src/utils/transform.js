function normalizeScore(value) {
  const score = Number(value) || 0;
  const percentage = score <= 1 ? score * 100 : score;
  return Math.round(Math.max(0, Math.min(percentage, 100)));
}

export function transformResult(apiData) {
  return {
    originalText: apiData.original_text || "",
    overallResult: apiData.overall_suspicion_level || "정상",
    overallScore: normalizeScore(apiData.overall_score),
    summary: apiData.summary || "요약 정보가 없습니다.",
    isMock: Boolean(apiData.__mock),
    sentences: Array.isArray(apiData.sentence_results)
      ? apiData.sentence_results.map((item) => ({
          text: item.sentence || "",
          label: item.suspicion_level || "정상",
          reason: item.reason || "판단 이유 정보가 없습니다.",
          detail: item.reason || "상세 설명 정보가 없습니다.",
          keywords: Array.isArray(item.matched_keywords)
            ? item.matched_keywords
            : [],
          rules: [],
        }))
      : [],
  };
}
