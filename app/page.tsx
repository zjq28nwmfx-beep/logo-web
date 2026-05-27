"use client";
import { useState } from "react";

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("精品咖啡");
  const [elements, setElements] = useState("大象, 云朵");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState("");

  const handleGenerate = async () => {
    if (!brandName) return alert("请输入品牌名称");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry, elements }),
      });
      const data = await res.json();
      if (data.success) {
        setResultImage(data.image);
      } else {
        alert("生成失败: " + data.error);
      }
    } catch (e) {
      alert("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: "100vh", backgroundColor: "#000", color: "#fff", 
      padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    }}>
      {/* 顶部钱包卡片 */}
      <div style={{ background: "#1a1a1a", padding: "15px 20px", borderRadius: "16px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#888", fontSize: "14px" }}>💎 账户余额</span>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>50 积分</span>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>创作中心</h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "30px" }}>由 GPT-Image-2 驱动的商业级 Logo 引擎</p>

      {/* 表单区域 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
          disabled={loading}
          style={{ 
            marginTop: "20px", padding: "18px", borderRadius: "12px", background: loading ? "#333" : "#fff", 
            color: "#000", border: "none", fontSize: "16px", fontWeight: "bold", transition: "all 0.3s" 
          }}
        >
          {loading ? "✨ 正在呼叫云象引擎..." : "🚀 开始生成 (消耗 10 积分)"}
        </button>
      </div>

      {/* 结果展示区 */}
      {resultImage && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "10px", display: "inline-block", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <img src={resultImage} style={{ width: "100%", maxWidth: "300px", borderRadius: "14px" }} alt="Result" />
          </div>
          <p style={{ marginTop: "15px", color: "#888", fontSize: "12px" }}>长按图片保存至相册</p>
        </div>
      )}
    </main>
  );
}