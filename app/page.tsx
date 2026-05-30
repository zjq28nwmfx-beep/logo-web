"use client";
import { useState, useEffect } from "react";

export default function Home() {
  // --- 商业化核心状态 ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 模拟用户登录状态
  const [userPhone, setUserPhone] = useState("");      // 沉淀的用户手机号
  const [credits, setCredits] = useState(0);           // 真实的动态积分钱包
  
  // --- 登录弹窗相关状态 ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [smsInput, setSmsInput] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSendingSms, setIsSendingSms] = useState(false);

  // --- 创作台表单状态 ---
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("精品咖啡");
  const [elements, setElements] = useState("大象, 云朵");
  
  // --- 引擎运转状态 ---
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

  // 验证码倒计时计数器
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 模拟生图进度条
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

  // --- 核心商业函数：发送验证码 ---
  const handleSendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phoneInput)) {
      return alert("请输入正确的11位中国大陆手机号码");
    }
    setIsSendingSms(true);
    // 💡 提示：这里未来将调用 Phase 3 的阿里云/腾讯云短信 API 路由
    setTimeout(() => {
      setIsSendingSms(false);
      setCountdown(60); // 触发60秒倒计时
      alert("【演示模式】验证码已发送，测试请输入：1234");
    }, 800);
  };

  // --- 核心商业函数：登录验证 ---
  const handleVerifyLogin = () => {
    if (!phoneInput || !smsInput) return alert("请完整填写手机号和验证码");
    if (smsInput !== "1234") return alert("验证码错误，演示请输入 1234");
    
    // 登录成功逻辑
    setUserPhone(phoneInput);
    setIsLoggedIn(true);
    setCredits(10); // 🚀 触发绑定钩子：新用户注册自动赠送10积分（可免费体验1次）
    setShowAuthModal(false);
  };

  // --- 核心商业函数：触发画图鉴权 ---
  const handleGenerate = async () => {
    // 1. 拦截未登录用户
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    // 2. 拦截积分不足用户
    if (credits < 10) {
      return alert("💎 账户积分不足，请先充值购买套餐");
    }
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
        setCredits(prev => prev - 10); // 🚀 扣除真实积分
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

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `${brandName || "logo"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main style={{ 
      minHeight: "100vh", backgroundColor: "#000", color: "#fff", 
      padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    }}>
      {/* 顶部钱包卡片 */}
      <div style={{ background: "#1a1a1a", padding: "15px 20px", borderRadius: "16px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: "#888", fontSize: "12px", display: "block" }}>
            {isLoggedIn ? `📱 ${userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}` : "未登录账户"}
          </span>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {isLoggedIn ? `💎 ${credits} 积分` : "💎 -- 积分"}
          </span>
        </div>
        {!isLoggedIn && (
          <button 
            onClick={() => setShowAuthModal(true)}
            style={{ padding: "8px 16px", background: "#fff", color: "#000", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "bold" }}
          >
            登录/注册
          </button>
        )}
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
            placeholder="例如：精品咖啡、科技初创"
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
          🚀 开始生成 {isLoggedIn ? "(消耗 10 积分)" : "(新用户首单免费)"}
        </button>
      </div>

      {/* 结果展示区 */}
      {resultImage && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "10px", display: "inline-block" }}>
            <img src={resultImage} style={{ width: "100%", maxWidth: "300px", borderRadius: "14px" }} alt="Result" />
          </div>
          <button onClick={handleDownload} style={{ display: "block", margin: "20px auto 0 auto", padding: "14px 28px", background: "#161616", color: "#fff", border: "1px solid #333", borderRadius: "12px", fontSize: "15px", fontWeight: "bold" }}>
            📥 下载高清 PNG 格式
          </button>
        </div>
      )}

      {/* 🚀 升级版 1：手机号验证码登录弹窗 */}
      {showAuthModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#161616", border: "1px solid #222", width: "100%", maxWidth: "360px", padding: "30px 24px", borderRadius: "24px", position: "relative" }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "#666", fontSize: "20px" }}>×</button>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>手机号快捷登录</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>未注册手机号验证后将自动创建账户</p>
            
            <input 
              type="tel" placeholder="请输入手机号码" value={phoneInput} maxLength={11}
              onChange={(e) => setPhoneInput(e.target.value)}
              style={{ width: "100%", background: "#000", border: "1px solid #333", borderRadius: "12px", padding: "14px", color: "#fff", marginBottom: "16px", fontSize: "15px" }}
            />

            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <input 
                placeholder="短信验证码" value={smsInput} maxLength={4}
                onChange={(e) => setSmsInput(e.target.value)}
                style={{ flex: 1, background: "#000", border: "1px solid #333", borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "15px" }}
              />
              <button 
                onClick={handleSendCode} disabled={countdown > 0 || isSendingSms}
                style={{ width: "120px", borderRadius: "12px", background: countdown > 0 ? "#222" : "#fff", color: countdown > 0 ? "#666" : "#000", border: "none", fontSize: "13px", fontWeight: "bold" }}
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>

            <button onClick={handleVerifyLogin} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#fff", color: "#000", border: "none", fontSize: "16px", fontWeight: "bold" }}>
              立即登录验证
            </button>
          </div>
        </div>
      )}

      {/* 🚀 升级版 2：大数字百分比生图遮罩层 */}
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ width: "85%", maxWidth: "400px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", fontWeight: "bold", color: "#fff", marginBottom: "10px", fontFamily: "monospace" }}>{progress}%</div>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "30px", height: "20px" }}>{statusText}</p>
            <div style={{ background: "#222", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#fff", width: `${progress}%`, transition: "width 0.4s ease-out" }}></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}