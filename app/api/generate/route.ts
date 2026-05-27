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

    const response = await openai.images.generate({
      model: "gpt-image-2", // 确保使用最新的 2026 模型
      prompt: goldenPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
      response_format: "b64_json" // 直接返回数据流，更安全
    });

    const base64Data = response.data?.[0]?.b64_json;

    return NextResponse.json({ 
      success: true, 
      image: `data:image/png;base64,${base64Data}` 
    });

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}