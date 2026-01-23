const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APP_ID = 'app-8pw7ulesxiip';
const API_ENDPOINT = 'https://api-integrations.appmiaoda.com/app-8pw7ulesxiip/api-eLMlJvr1AwV9/v2/chat/completions';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ message: "缺少图片数据" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 构建系统提示词
    const systemPrompt = `你是一位精通面部特征分析的专家。请分析用户上传的面部照片，提取关键面部特征信息，用于后续的数据分析。

要求：
1. 检查照片是否为正面免冠照片
2. 检查面部、头部、耳朵等是否清晰可见
3. 提取面部特征：额头、眉毛、眼睛、鼻子、嘴巴、下巴、耳朵等
4. 分析面部特征与性格、趋势的关联
5. 给出简要的面部分析结论（100-200字）

如果照片不符合要求，请返回错误信息。
如果照片符合要求，请返回JSON格式的分析结果：
{
  "valid": true,
  "features": {
    "forehead": "...",
    "eyebrows": "...",
    "eyes": "...",
    "nose": "...",
    "mouth": "...",
    "chin": "...",
    "ears": "..."
  },
  "analysis": "面部分析结论..."
}`;

    const userPrompt = '请分析这张面部照片';

    // 调用文心一言多模态API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt + '\n\n' + userPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    }

    // 提取JSON数据
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // 如果没有JSON格式，返回纯文本分析
      return new Response(JSON.stringify({
        valid: true,
        analysis: fullContent
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resultData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(resultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('面部分析错误:', error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
