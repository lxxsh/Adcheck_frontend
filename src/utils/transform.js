export function transformResult(apiData) {
  const sentences = Array.isArray(apiData.sentence_results)
    ? apiData.sentence_results.map((item) => ({
        text: item.sentence || "",
        label: item.suspicion_level || "?뺤긽",
        reason: item.reason || "?먮떒 ?댁쑀 ?뺣낫媛 ?놁뒿?덈떎.",
        detail: item.reason || "?곸꽭 ?ㅻ챸 ?뺣낫媛 ?놁뒿?덈떎.",
        keywords: Array.isArray(item.matched_keywords)
          ? item.matched_keywords
          : [],
        rules: [],
      }))
    : [];

  // Some API responses may not include a dedicated evidences array.
  // Derive a safe default from sentence reasons so ResultSection can render without crashing.
  const evidences = Array.isArray(apiData.evidences)
    ? apiData.evidences
    : sentences
        .filter((item) => item.reason || item.text)
        .map((item) => item.reason || item.text);

  return {
    originalText: apiData.original_text || "",
    overallResult: apiData.overall_suspicion_level || "?뺤긽",
    overallScore: Math.round((apiData.overall_score || 0) * 100),
    summary: apiData.summary || "?붿빟 ?뺣낫媛 ?놁뒿?덈떎.",
    isMock: Boolean(apiData.__mock),
    evidences,
    sentences,
  };
}
