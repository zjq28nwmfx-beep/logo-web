"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("精品咖啡");
  const [elements, setElements] = useState("大象, 云朵");
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [resultImage, setResultImage] = useState("");

  const statusMessages = [
    "正在分配 GPT-Image-2 云端算力...",
    "正在解析品牌调性与行业特征...",
    "正在构建极简线稿基础轮廓...",
    "正在巧妙融合定制化设计元素...",
    "正在进行最终的光影与细节打磨...",
    "图片即将生成，请稍候..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 85) return prev + 5; 
          if (prev < 99) return prev + 1; 
          return 99; 
        });
      }, 500);
      
      let msgIndex = 0;
      setStatusText(statusMessages[0]);
      const textInterval = setInterval(() => {
        msgIndex++;
        if (msgIndex < statusMessages.length) {
          setStatusText(statusMessages[msgIndex]);
        }
      }, 2200);

      return () => {
        clearInterval(interval);
        clearInterval(textInterval);
      };
    }
  }, [loading]);

  const handleGenerate = async () => {
    if (!brandName) return alert("请输入品牌名称");
    setLoading(true);
    setResultImage(""); 
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry, elements }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress(100); 
        setStatusText("生成完毕！");
        setTimeout(() => {
          setLoading(false);
          setResultImage(data.image);
        }, 400); 
      } else {
        alert("生成失败: " + data.error);
        setLoading(false);
      }
    } catch (e) {
      alert("网络错误，请重试");
      setLoading(false);
    }
  };

  // 一键下载 PNG 的核心函数
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `${brandName || "logo"}.png`; // 强制保存为带有品牌名的 png 文件
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main style={{ 
      minHeight: "100vh", backgroundColor: "#000", color: "#fff", 
      padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    }}>
      {/* 顶部钱包 */}
      <div style={{ background: "#1a1a1a", padding: "15px 20px", borderRadius: "16px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#888", fontSize: "14px" }}>💎 账户余额</span>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>50 积分</span>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>创作中心</h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "30px" }}>由 GPT-Image-2 驱动的商业级 Logo 引擎</p>

      {/* 表单 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "auto" }}>
        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>品牌名称</label>
          <input 
            placeholder="例如：云象咖啡"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>所属行业</label>
          <input 
            placeholder="例如：精品咖啡、科技初创、服装品牌"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>设计元素（选填）</label>
          <input 
            placeholder="大象, 云朵, 咖啡豆"
            value={elements}
            onChange={(e) => setElements(e.target.value)}
            style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }}
          />
        </div>

        <button 
          onClick={handleGenerate}
          style={{ 
            marginTop: "20px", padding: "18px", borderRadius: "12px", background: "#fff", 
            color: "#000", border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          🚀 开始生成 (消耗 10 积分)
        </button>
      </div>

      {/* 生成结果展示区 */}
      {resultImage && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "10px", display: "inline-block", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <img src={resultImage} style={{ width: "100%", maxWidth: "300px", borderRadius: "14px" }} alt="Result" />
          </div>
          
          {/* 📥 专属 PNG 下载按钮 */}
          <button 
            onClick={handleDownload}
            style={{
              display: "block", margin: "20px auto 0 auto", padding: "14px 28px", 
              background: "#161616", color: "#fff", border: "1px solid #333", 
              borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer"
            }}
          >
            📥 下载高清 PNG 格式
          </button>
          <p style={{ marginTop: "12px", color: "#555", fontSize: "12px" }}>（手机端用户点击按钮或长按图片均可直接保存 PNG）</p>
        </div>
      )}

      {/* 🚀 升级版：大数字百分比进度条遮罩层 */}
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
          background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", 
          justifyContent: "center", alignItems: "center", zIndex: 999, padding: "20px"
        }}>
          <div style={{ width: "85%", maxWidth: "400px", textAlign: "center" }}>
            
            {/* 巨大醒目的百分比数字 */}
            <div style={{ fontSize: "64px", fontWeight: "bold", color: "#fff", marginBottom: "10px", fontFamily: "monospace", letterSpacing: "-2px" }}>
              {progress}%
            </div>
            
            {/* 状态播报文本 */}
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "30px", height: "20px" }}>
              {statusText}
            </p>
            
            {/* 极简进度条 */}
            <div style={{ background: "#222", height: "6px", borderRadius: "3px", overflow: "hidden", width: "100%" }}>
              <div style={{ 
                height: "100%", background: "#fff", width: `${progress}%`, 
                transition: "width 0.4s ease-out" 
              }}></div>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}