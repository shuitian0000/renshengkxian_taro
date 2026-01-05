const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APP_ID = 'app-8pw7ulesxiip';
const API_ENDPOINT = 'https://api-integrations.appmiaoda.com/app-8pw7ulesxiip/api-Xa6JZMByJlDa/v2/chat/completions';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, birthDate, birthTime, birthRegion, calendarType, faceAnalysis } = await req.json();

    if (!name || !birthDate || !birthTime || !birthRegion || !calendarType) {
      return new Response(JSON.stringify({ message: "缺少必要参数" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 构建系统提示词
    const systemPrompt = `你是一位精通中国传统命理学的大师，擅长八字命理、易经占卜、阴阳五行等传统文化。
你需要根据用户提供的姓名、出生日期、出生时辰、出生地区等信息，综合运用传统命理理论，生成详细的人生K线图数据和命理报告。

要求：
1. K线图数据：从5岁到85岁，每年一个数据点，包含开盘、收盘、最高、最低、得分（0-10分）、吉凶趋势描述
2. 大运周期：每10年一个大运，标注大运干支
3. 命理报告：包含命理总评、性格分析、事业分析、风水建议、财富分析、婚姻分析、健康分析、六亲分析等维度
4. 每个维度包含详细分析文案（200-300字）和评分（0-10分）
5. 综合考虑出生地区的地域特点和未来发展趋势
${faceAnalysis ? `6. 结合面相分析结果：${faceAnalysis}` : ''}

请以JSON格式返回数据，格式如下：
{
  "klineData": [
    {
      "age": 5,
      "open": 5.5,
      "close": 6.0,
      "high": 6.5,
      "low": 5.0,
      "score": 5.8,
      "trend": "平稳起步，童年无忧"
    }
  ],
  "dayunPeriods": [
    {
      "startAge": 5,
      "endAge": 14,
      "ganZhi": "甲子"
    }
  ],
  "report": {
    "summary": { "content": "...", "score": 7.5 },
    "personality": { "content": "...", "score": 8.0 },
    "career": { "content": "...", "score": 7.0 },
    "fengshui": { "content": "...", "score": 7.5 },
    "wealth": { "content": "...", "score": 6.5 },
    "marriage": { "content": "...", "score": 7.0 },
    "health": { "content": "...", "score": 8.0 },
    "family": { "content": "...", "score": 7.5 }
  }
}`;

    const userPrompt = `请为以下信息生成人生K线图和命理报告：
姓名：${name}
出生日期：${birthDate}
出生时辰：${birthTime}
出生地区：${birthRegion}
历法类型：${calendarType === 'solar' ? '公历' : '农历'}`;

    // 调用文心一言API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
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
      throw new Error('无法从AI响应中提取JSON数据');
    }

    const resultData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(resultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('生成报告错误:', error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
