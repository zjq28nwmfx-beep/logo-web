import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { brandName, industry, elements } = await req.json();

    // 🚀 核心：商业级黄金提示词模板隔离架构
    const goldenPrompt = `A professional, clean, and minimalist vector logo design for a ${industry} named '${brandName}'. 
    The design should subtly incorporate the following elements: ${elements}. 
    Style constraints: Flat vector graphic, clean and minimalist lines. Solid pure white background, no gradients, 
    highly scalable, centered composition, no photo-realistic details, no complex backgrounds. 
    The text '${brandName}' must be visually prominent and elegantly integrated into the overall aesthetic.`;

    // 调用 AI 引擎，去除了会报错的 response_format 参数
    const response = await openai.images.generate({
      model: "gpt-image-2", 
      prompt: goldenPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium"
    });

    // ✅ 完美兼容：无论官方返回 URL 还是 Base64 数据流，我们都能稳稳接住
    const imgData = response.data?.[0];
    const finalImage = imgData?.url || (imgData?.b64_json ? `data:image/png;base64,${imgData.b64_json}` : "");

    return NextResponse.json({ 
      success: true, 
      image: finalImage 
    });

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}