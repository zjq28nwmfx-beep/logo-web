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
      model: "gpt-image-2",
      prompt: goldenPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium"
    });

    // 读取最新版模型返回的 raw base64 图像数据
    const base64Data = response.data?.[0]?.b64_json;

    // 直接生成一个漂亮的深色画廊网页，把图片嵌进去！
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>云象咖啡 Logo</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; background-color:#111; margin:0;">
          <img src="data:image/png;base64,${base64Data}" style="max-width:600px; width:90%; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.8);" />
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}