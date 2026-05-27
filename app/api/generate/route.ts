import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { brandName, industry, elements } = await req.json();

    // 🚀 商业级黄金提示词模板隔离架构
    const goldenPrompt = `A professional, clean, and minimalist vector logo design for a ${industry} named '${brandName}'. 
    The design should subtly incorporate the following elements: ${elements}. 
    Style constraints: Flat vector graphic, clean and minimalist lines. Solid pure white background, no gradients, 
    highly scalable, centered composition, no photo-realistic details, no complex backgrounds. 
    The text '${brandName}' must be visually prominent and elegantly integrated into the overall aesthetic.`;

    const response = await openai.images.generate({
      model: "gpt-image-2", 
      prompt: goldenPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium"
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "AI 未返回图片链接" }, { status: 500 });
    }

    // 🚀 核心黑科技：服务器在后端抓取图片并将其强转为 Base64 PNG 编码
    // 这样能彻底消除跨域问题，并确保用户下载、长按保存下来的绝对是标准的 PNG 格式
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    return NextResponse.json({ 
      success: true, 
      image: base64Image 
    });

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}