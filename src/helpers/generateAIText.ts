import axios from "axios";

export const generateAIText = async (
  apiKey: string,
  AIModel: string,
  prompt: string
): Promise<string> => {
  return axios({
    url: "https://openrouter.ai/api/v1/chat/completions",
    method: "post",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      model: AIModel,
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    }),
  })
    .then((response) => {
      const text = response.data.choices[0].message.content;

      return text;
    })
    .catch((error) => {
      console.error("Error fetching API info:", error);
    });
};
