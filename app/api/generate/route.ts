import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function GET() {
  const brandName = "云象咖啡";
  const industry = "精品咖啡店";
  const style = "极简线稿";

  const goldenPrompt = `A professional and creative logo design for a ${industry} named '${brandName}'. 
  Style: ${style}, flat vector graphic, clean and minimalist lines. 
  Solid pure white background, no gradients, highly scalable, centered composition, no photo-realistic details, no complex backgrounds. 
  The text '${brandName}' should be visually prominent and elegantly integrated into the design.`;

  try {
    const response = await openai.images.generate({
        model: "gpt-image-2",     // 👈 换成 2026 最新一代图像模型
        prompt: goldenPrompt,
        n: 1,
        size: "1024x1024",
        quality: "medium"         // 👈 配合新版模型，将画质改为 medium
      });

    return NextResponse.json({ 
      success: true, 
      logo_url: response.data?.[0]?.url // ✅ 修复：data 后面加上了 ?.
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}