import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { brandName, industry, elements } = await req.json();

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

    const imgData = response.data?.[0];
    if (!imgData) {
      return NextResponse.json({ success: false, error: "AI 未返回任何数据" }, { status: 500 });
    }

    let finalBase64Image = "";

    // 🚀 智能兼容逻辑：无论 AI 给的是底层数据还是链接，统统接得住！
    if (imgData.b64_json) {
      // 1. 如果 AI 直接给了底层数据，直接拼成 PNG 格式
      finalBase64Image = `data:image/png;base64,${imgData.b64_json}`;
    } else if (imgData.url) {
      // 2. 如果 AI 给的是网址链接，就在服务器后台下载并强转成 PNG 格式
      const imageRes = await fetch(imgData.url);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      finalBase64Image = `data:image/png;base64,${buffer.toString("base64")}`;
    } else {
      return NextResponse.json({ success: false, error: "AI 返回格式异常" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      image: finalBase64Image 
    });

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}