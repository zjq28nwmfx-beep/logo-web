import OpenAI from "openai";
import { NextResponse } from "next/server";

// 初始化 OpenAI（稍后我们在 Vercel 后台配置 API Key，这里它会自动读取）
const openai = new OpenAI();

export async function GET() {
  const brandName = "云象咖啡";
  const industry = "精品咖啡店";
  const style = "极简线稿";

  // 核心 Prompt
  const goldenPrompt = `A professional and creative logo design for a ${industry} named '${brandName}'. 
  Style: ${style}, flat vector graphic, clean and minimalist lines. 
  Solid pure white background, no gradients, highly scalable, centered composition, no photo-realistic details, no complex backgrounds. 
  The text '${brandName}' should be visually prominent and elegantly integrated into the design.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: goldenPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });

    // 成功后，返回包含图片链接的 JSON
    return NextResponse.json({ 
      success: true, 
      logo_url: response.data[0]?.url 
    });

  } catch (error: any) {
    // 如果失败，返回具体的报错信息，方便我们排查
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}