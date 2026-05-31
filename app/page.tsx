"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userPhone, setUserPhone] = useState("");      
  const [credits, setCredits] = useState(0);           
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  
  // 🚀 新增：高级成功状态弹窗
  const [successMsg, setSuccessMsg] = useState(""); 
  
  const [phoneInput, setPhoneInput] = useState("");
  const [smsInput, setSmsInput] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("精品咖啡");
  const [elements, setElements] = useState("大象, 云朵");
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [resultImage, setResultImage] = useState("");

  const statusMessages = ["正在分配云端算力...", "正在解析品牌调性...", "正在构建基础轮廓...", "正在融合定制元素...", "正在进行细节打磨...", "图片即将生成，请稍候..."];

  useEffect(() => {
    const checkLoginState = async () => {
      const savedPhone = localStorage.getItem("yunxiang_user_phone");
      const loginTime = localStorage.getItem("yunxiang_login_time");
      
      if (savedPhone && loginTime) {
        const isExpired = new Date().getTime() - parseInt(loginTime) > 3 * 24 * 60 * 60 * 1000;
        if (!isExpired) {
          setUserPhone(savedPhone);
          setIsLoggedIn(true);
          const { data } = await supabase.from('users').select('credits').eq('phone', savedPhone).single();
          if (data) setCredits(data.credits);
        } else {
          localStorage.removeItem("yunxiang_user_phone");
          localStorage.removeItem("yunxiang_login_time");
        }
      }
    };
    checkLoginState();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
        if (msgIndex < statusMessages.length) setStatusText(statusMessages[msgIndex]);
      }, 2200);
      return () => {
        clearInterval(interval);
        clearInterval(textInterval);
      };
    }
  }, [loading]);

  const handleSendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phoneInput)) return alert("请输入正确的11位手机号码");
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setCountdown(60); 
      // 这里的验证码提示保留原生，因为很快会接真实短信
      alert("【演示模式】验证码已发送，测试请输入：1234"); 
    }, 800);
  };

  const handleVerifyLogin = async () => {
    if (!phoneInput || !smsInput) return alert("请完整填写");
    if (smsInput !== "1234") return alert("验证码错误，请输入 1234");
    
    try {
      const { data: user, error: fetchError } = await supabase.from('users').select('*').eq('phone', phoneInput).single();

      let finalCredits = 0;
      if (user) {
        finalCredits = user.credits;
        // 🚀 替换丑陋的 alert，使用高级文案
        setSuccessMsg(`欢迎归来，您当前拥有 ${user.credits} 算力积分`);
      } else {
        const { data: newUser, error: insertError } = await supabase.from('users').insert([{ phone: phoneInput, credits: 10 }]).select().single();
        if (insertError) throw insertError;
        finalCredits = newUser.credits;
        setSuccessMsg("账号创建成功，已为您奉上 10 积分体验金");
      }

      setUserPhone(phoneInput);
      setCredits(finalCredits);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      localStorage.setItem("yunxiang_user_phone", phoneInput);
      localStorage.setItem("yunxiang_login_time", new Date().getTime().toString());

    } catch (e: any) {
      if (e.code !== 'PGRST116') {
        alert("数据库异常: " + (e.message || JSON.stringify(e)));
      }
    }
  };

  const handleLogout = () => {
    if(confirm("确定要退出当前账号吗？")) {
      localStorage.removeItem("yunxiang_user_phone");
      localStorage.removeItem("yunxiang_login_time");
      setIsLoggedIn(false);
      setUserPhone("");
      setCredits(0);
    }
  };

  const handleMockPay = (channel: string, amount: number, addCredits: number) => {
    // 充值成功也用高级弹窗
    setTimeout(async () => {
      const newBalance = credits + addCredits;
      setCredits(newBalance);
      await supabase.from('users').update({ credits: newBalance }).eq('phone', userPhone);
      setShowPayModal(false);
      setSuccessMsg(`支付成功！${addCredits} 积分已实时到账`);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!isLoggedIn) return setShowAuthModal(true);
    if (credits < 10) return setShowPayModal(true);
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
        const newBalance = credits - 10;
        setCredits(newBalance); 
        await supabase.from('users').update({ credits: newBalance }).eq('phone', userPhone);
        setTimeout(() => {
          setLoading(false);
          setResultImage(data.image);
        }, 400); 
      } else {
        alert("生成失败: " + data.error);
        setLoading(false);
      }
    } catch (e) {
      alert("网络错误");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `${brandName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", position: "relative" }}>
      
      {/* 顶部钱包卡片 */}
      <div style={{ background: "#1a1a1a", padding: "15px 20px", borderRadius: "16px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ color: "#888", fontSize: "12px" }}>
              {isLoggedIn ? `📱 ${userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}` : "未登录账户"}
            </span>
            {/* 🚀 删除了这里显眼的退出按钮 */}
          </div>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            {isLoggedIn ? `💎 ${credits} 积分` : "💎 -- 积分"}
          </span>
        </div>
        
        {isLoggedIn ? (
          <button onClick={() => setShowPayModal(true)} style={{ padding: "8px 16px", background: "#eab308", color: "#000", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "bold" }}>
            充值积分
          </button>
        ) : (
          <button onClick={() => setShowAuthModal(true)} style={{ padding: "8px 16px", background: "#fff", color: "#000", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "bold" }}>
            登录/注册
          </button>
        )}
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>创作中心</h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "30px" }}>由 GPT-Image-2 驱动的商业级 Logo 引擎</p>

      {/* 表单区域 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "auto" }}>
        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>品牌名称</label>
          <input placeholder="例如：云象咖啡" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }} />
        </div>
        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>所属行业</label>
          <input placeholder="例如：精品咖啡、科技初创" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }} />
        </div>
        <div>
          <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", marginLeft: "4px" }}>设计元素（选填）</label>
          <input placeholder="大象, 云朵" value={elements} onChange={(e) => setElements(e.target.value)} style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "16px", color: "#fff", fontSize: "16px" }} />
        </div>
        <button onClick={handleGenerate} style={{ marginTop: "20px", padding: "18px", borderRadius: "12px", background: "#fff", color: "#000", border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>🚀 开始生成 {isLoggedIn ? "(消耗 10 积分)" : "(新用户首单免费)"}</button>
      </div>

      {resultImage && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "10px", display: "inline-block" }}><img src={resultImage} style={{ width: "100%", maxWidth: "300px", borderRadius: "14px" }} alt="Result" /></div>
          <button onClick={handleDownload} style={{ display: "block", margin: "20px auto 0 auto", padding: "14px 28px", background: "#161616", color: "#fff", border: "1px solid #333", borderRadius: "12px", fontSize: "15px", fontWeight: "bold" }}>📥 下载高清 PNG 格式</button>
        </div>
      )}

      {/* 🚀 新增：页面最底部的低调退出按钮 */}
      {isLoggedIn && !loading && (
        <div style={{ textAlign: "center", marginTop: "80px", paddingBottom: "20px" }}>
          <span onClick={handleLogout} style={{ color: "#333", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>退出账号</span>
        </div>
      )}

      {/* 登录弹窗 */}
      {showAuthModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#161616", border: "1px solid #222", width: "100%", maxWidth: "360px", padding: "30px 24px", borderRadius: "24px", position: "relative" }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "#666", fontSize: "20px" }}>×</button>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>手机号快捷登录</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>未注册手机号验证后将自动创建账户</p>
            <input type="tel" placeholder="请输入手机号码" value={phoneInput} maxLength={11} onChange={(e) => setPhoneInput(e.target.value)} style={{ width: "100%", background: "#000", border: "1px solid #333", borderRadius: "12px", padding: "14px", color: "#fff", marginBottom: "16px", fontSize: "15px" }} />
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <input placeholder="验证码" value={smsInput} maxLength={4} onChange={(e) => setSmsInput(e.target.value)} style={{ flex: 1, background: "#000", border: "1px solid #333", borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "15px" }} />
              <button onClick={handleSendCode} disabled={countdown > 0 || isSendingSms} style={{ width: "120px", borderRadius: "12px", background: countdown > 0 ? "#222" : "#fff", color: countdown > 0 ? "#666" : "#000", border: "none", fontSize: "13px", fontWeight: "bold" }}>{countdown > 0 ? `${countdown}s` : "获取验证码"}</button>
            </div>
            <button onClick={handleVerifyLogin} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#fff", color: "#000", border: "none", fontSize: "16px", fontWeight: "bold" }}>立即登录验证</button>
          </div>
        </div>
      )}

      {/* 充值收银台弹窗 */}
      {showPayModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 1000 }}>
          <div style={{ background: "#161616", width: "100%", maxWidth: "500px", padding: "30px 20px 50px 20px", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", position: "relative" }}>
            <button onClick={() => setShowPayModal(false)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "#666", fontSize: "24px" }}>×</button>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>💎 补充算力积分</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>高昂的 GPU 算力成本，需要您的支持</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ border: "1px solid #eab308", background: "rgba(234, 179, 8, 0.1)", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: "16px", fontWeight: "bold", color: "#eab308", marginBottom: "4px" }}>新人体验包 (5次)</div><div style={{ fontSize: "12px", color: "#888" }}>包含 50 积分</div></div>
                <div style={{ display: "flex", gap: "8px" }}><button onClick={() => handleMockPay("微信", 9.9, 50)} style={{ background: "#05c160", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }}>微信 ￥9.9</button><button onClick={() => handleMockPay("支付宝", 9.9, 50)} style={{ background: "#1677ff", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }}>支付宝</button></div>
              </div>
              <div style={{ border: "1px solid #333", background: "#0a0a0a", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>创业标准版 (20次)</div><div style={{ fontSize: "12px", color: "#888" }}>包含 200 积分，高性价比</div></div>
                <div style={{ display: "flex", gap: "8px" }}><button onClick={() => handleMockPay("微信", 29.9, 200)} style={{ background: "#05c160", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }}>微信 ￥29.9</button><button onClick={() => handleMockPay("支付宝", 29.9, 200)} style={{ background: "#1677ff", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }}>支付宝</button></div>
              </div>
            </div>
            <p style={{ color: "#555", fontSize: "11px", textAlign: "center" }}>支付即代表同意《云象服务协议》，虚拟商品购买后不支持退款。</p>
          </div>
        </div>
      )}

      {/* 🚀 新增：高级成功状态弹窗 (代替原生 alert) */}
      {successMsg && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001, padding: "20px" }}>
          <div style={{ background: "#111", border: "1px solid #333", width: "100%", maxWidth: "300px", padding: "30px 24px", borderRadius: "20px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✨</div>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px", color: "#fff" }}>登录成功</h3>
            <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "28px", lineHeight: "1.5" }}>{successMsg}</p>
            <button onClick={() => setSuccessMsg("")} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#fff", color: "#000", border: "none", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>
              开启创作之旅
            </button>
          </div>
        </div>
      )}

      {/* 进度条遮罩层 */}
      {loading && (<div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 999 }}><div style={{ width: "85%", maxWidth: "400px", textAlign: "center" }}><div style={{ fontSize: "64px", fontWeight: "bold", color: "#fff", marginBottom: "10px", fontFamily: "monospace" }}>{progress}%</div><p style={{ color: "#888", fontSize: "14px", marginBottom: "30px", height: "20px" }}>{statusText}</p><div style={{ background: "#222", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ height: "100%", background: "#fff", width: `${progress}%`, transition: "width 0.4s ease-out" }}></div></div></div></div>)}
    </main>
  );
}