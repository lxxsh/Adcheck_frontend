const BASE_URL = "http://localhost:8080";

function buildMockApiResponse(type, value) {
  const preview =
    typeof value === "string" && value.trim()
      ? value.trim()
      : type === "image"
      ? "업로드한 광고 이미지"
      : "분석 대상 광고";

  return {
    __mock: true,
    original_text: preview,
    overall_suspicion_level: "의심",
    overall_score: 0.72,
    sentence_results: [
      {
        sentence:
          type === "text"
            ? preview
            : "7일 만에 피부가 눈에 띄게 개선됩니다.",
        suspicion_level: "주의",
        matched_keywords: ["7일 만에", "개선"],
        reason:
          "짧은 기간 안에 효과를 단정적으로 보장하는 표현으로 해석될 수 있습니다.",
      },
      {
        sentence: "단 1회 사용만으로도 탄력이 살아납니다.",
        suspicion_level: "의심",
        matched_keywords: ["1회 사용", "탄력"],
        reason:
          "즉각적인 효능을 강하게 암시하는 표현으로 소비자 오인을 유발할 가능성이 있습니다.",
      },
      {
        sentence: "피부에 촉촉한 보습감을 줍니다.",
        suspicion_level: "정상",
        matched_keywords: ["보습감"],
        reason:
          "일반적인 사용감 설명 수준의 표현으로 보이며 직접적인 위반 가능성은 낮습니다.",
      },
    ],
    summary:
      "백엔드 서버가 꺼져 있어 데모 결과를 표시하고 있습니다. 실제 서버 연결 시 Spring Boot 분석 결과로 대체됩니다.",
  };
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  return { error: "서버 응답 형식이 올바르지 않습니다." };
}

export async function analyzeText(content) {
  try {
    const res = await fetch(`${BASE_URL}/analyze/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "텍스트 분석에 실패했습니다.");
    }

    return data;
  } catch (error) {
    return buildMockApiResponse("text", content);
  }
}

export async function analyzeUrl(content) {
  try {
    const res = await fetch(`${BASE_URL}/analyze/url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "URL 분석에 실패했습니다.");
    }

    return data;
  } catch (error) {
    return buildMockApiResponse("url", content);
  }
}

export async function analyzeImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/analyze/image`, {
      method: "POST",
      body: formData,
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "이미지 분석에 실패했습니다.");
    }

    return data;
  } catch (error) {
    return buildMockApiResponse("image", file?.name || "이미지 파일");
  }
}