"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userPhone, setUserPhone] = useState("");      
  const [credits, setCredits] = useState(0);           
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
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
      alert("【演示模式】验证码已发送，测试请输入：1234"); 
    }, 800);
  };

  const handleVerifyLogin = async () => {
    if (!phoneInput || !smsInput) return alert("请完整填写");
    if (smsInput !== "1234") return alert("验证码错误，请输入 1234");
    
    try {
      const { data: user } = await supabase.from('users').select('*').eq('phone', phoneInput).single();

      let finalCredits = 0;
      if (user) {
        finalCredits = user.credits;
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
      if (e.code !== 'PGRST116') alert("数据库异常: " + (e.message || JSON.stringify(e)));
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

  // 提取复用的输入框样式
  const inputStyle = { width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px", color: "#fff", fontSize: "15px", outline: "none", transition: "all 0.3s ease", backdropFilter: "blur(10px)", letterSpacing: "0.5px" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#030303", backgroundImage: "radial-gradient(circle at 50% 0%, rgba(30, 30, 35, 1) 0%, rgba(3, 3, 3, 1) 70%)", color: "#fff", padding: "40px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif", position: "relative", overflow: "hidden" }}>
      
      {/* 环境光晕背景饰品 */}
      <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(234, 179, 8, 0.05) 0%, transparent 70%)", filter: "blur(40px)", zIndex: 0, pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", top: "20%", right: "-150px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }}></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto" }}>
        
        {/* 顶部钱包卡片 (高奢毛玻璃) */}
        <div style={{ background: "rgba(25, 25, 25, 0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "18px 24px", borderRadius: "20px", marginBottom: "50px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#a1a1aa", fontSize: "12px", letterSpacing: "1px" }}>
                {isLoggedIn ? `📱 ${userPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}` : "未登录"}
              </span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "0.5px", background: "linear-gradient(135deg, #fff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isLoggedIn ? `💎 ${credits} 算力` : "💎 -- 算力"}
            </span>
          </div>
          
          {isLoggedIn ? (
            <button onClick={() => setShowPayModal(true)} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #E6C27A 0%, #C79A42 100%)", color: "#111", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", boxShadow: "0 4px 15px rgba(199, 154, 66, 0.2)", cursor: "pointer", letterSpacing: "0.5px" }}>
              补充算力
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "13px", fontWeight: "500", cursor: "pointer", backdropFilter: "blur(10px)" }}>
              登录 / 注册
            </button>
          )}
        </div>

        {/* 标题区域 */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "12px", letterSpacing: "1px", background: "linear-gradient(135deg, #fff 0%, #888 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>灵感创构</h1>
          <p style={{ color: "#71717a", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase" }}>Powered by GPT-Image-2 Engine</p>
        </div>

        {/* 表单区域 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "auto" }}>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "13px", marginBottom: "10px", marginLeft: "4px", letterSpacing: "0.5px" }}>品牌名称</label>
            <input placeholder="例如：云象咖啡" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "13px", marginBottom: "10px", marginLeft: "4px", letterSpacing: "0.5px" }}>所属行业</label>
            <input placeholder="例如：精品咖啡、科技初创" value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "13px", marginBottom: "10px", marginLeft: "4px", letterSpacing: "0.5px" }}>核心意象 (选填)</label>
            <input placeholder="大象, 云朵, 极简线条" value={elements} onChange={(e) => setElements(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleGenerate} style={{ marginTop: "16px", padding: "20px", borderRadius: "16px", background: "linear-gradient(135deg, #ffffff 0%, #e4e4e7 100%)", color: "#000", border: "none", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "1px", boxShadow: "0 8px 25px rgba(255,255,255,0.15)", transition: "all 0.3s ease" }}>
            {isLoggedIn ? "开始生成 (消耗 10 算力)" : "✨ 开启创作 (首单免费)"}
          </button>
        </div>

        {resultImage && !loading && (
          <div style={{ marginTop: "50px", textAlign: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "16px", display: "inline-block", backdropFilter: "blur(10px)" }}>
              <img src={resultImage} style={{ width: "100%", maxWidth: "340px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} alt="Result" />
            </div>
            <button onClick={handleDownload} style={{ display: "block", margin: "30px auto 0 auto", padding: "16px 32px", background: "rgba(25,25,25,0.8)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer", backdropFilter: "blur(10px)" }}>
              📥 下载专属母本 (PNG)
            </button>
          </div>
        )}

        {isLoggedIn && !loading && (
          <div style={{ textAlign: "center", marginTop: "100px", paddingBottom: "30px" }}>
            <span onClick={handleLogout} style={{ color: "#52525b", fontSize: "12px", cursor: "pointer", transition: "color 0.3s ease", letterSpacing: "0.5px" }}>退出当前账号</span>
          </div>
        )}

      </div>

      {/* 极简登录弹窗 */}
      {showAuthModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "rgba(20,20,20,0.8)", border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: "380px", padding: "40px 30px", borderRadius: "28px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: "#71717a", fontSize: "24px", cursor: "pointer" }}>×</button>
            <h3 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "8px", letterSpacing: "0.5px" }}>身份验证</h3>
            <p style={{ color: "#71717a", fontSize: "13px", marginBottom: "32px", letterSpacing: "0.5px" }}>未注册手机号验证后将自动分配算力账户</p>
            <input type="tel" placeholder="输入手机号码" value={phoneInput} maxLength={11} onChange={(e) => setPhoneInput(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
              <input placeholder="验证码" value={smsInput} maxLength={4} onChange={(e) => setSmsInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={handleSendCode} disabled={countdown > 0 || isSendingSms} style={{ width: "110px", borderRadius: "16px", background: countdown > 0 ? "rgba(255,255,255,0.05)" : "#fff", color: countdown > 0 ? "#71717a" : "#000", border: "none", fontSize: "13px", fontWeight: "600", cursor: countdown > 0 ? "default" : "pointer" }}>{countdown > 0 ? `${countdown}s` : "获取验证码"}</button>
            </div>
            <button onClick={handleVerifyLogin} style={{ width: "100%", padding: "18px", borderRadius: "16px", background: "#fff", color: "#000", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", letterSpacing: "1px" }}>立即验证</button>
          </div>
        </div>
      )}

      {/* 高奢收银台弹窗 */}
      {showPayModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 1000 }}>
          <div style={{ background: "rgba(20,20,22,0.95)", width: "100%", maxWidth: "600px", padding: "40px 24px 60px 24px", borderTopLeftRadius: "32px", borderTopRightRadius: "32px", borderTop: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
            <button onClick={() => setShowPayModal(false)} style={{ position: "absolute", top: "24px", right: "28px", background: "none", border: "none", color: "#71717a", fontSize: "28px", cursor: "pointer" }}>×</button>
            <h3 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "6px", letterSpacing: "1px" }}>补充算力网络</h3>
            <p style={{ color: "#71717a", fontSize: "13px", marginBottom: "32px", letterSpacing: "0.5px" }}>企业级 GPU 专属通道，保障灵感不间断</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              <div style={{ border: "1px solid rgba(230, 194, 122, 0.3)", background: "rgba(230, 194, 122, 0.03)", borderRadius: "20px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: "17px", fontWeight: "600", color: "#E6C27A", marginBottom: "6px", letterSpacing: "0.5px" }}>初创体验包 (5次)</div><div style={{ fontSize: "13px", color: "#71717a" }}>包含 50 算力积分</div></div>
                <div style={{ display: "flex", gap: "10px" }}><button onClick={() => handleMockPay("微信", 9.9, 50)} style={{ background: "#05c160", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>微信 ￥9.9</button><button onClick={() => handleMockPay("支付宝", 9.9, 50)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>支付宝</button></div>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", borderRadius: "20px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: "17px", fontWeight: "600", color: "#fff", marginBottom: "6px", letterSpacing: "0.5px" }}>商业标准版 (20次)</div><div style={{ fontSize: "13px", color: "#71717a" }}>包含 200 算力积分</div></div>
                <div style={{ display: "flex", gap: "10px" }}><button onClick={() => handleMockPay("微信", 29.9, 200)} style={{ background: "#05c160", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>微信 ￥29.9</button><button onClick={() => handleMockPay("支付宝", 29.9, 200)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>支付宝</button></div>
              </div>
            </div>
            <p style={{ color: "#52525b", fontSize: "12px", textAlign: "center", letterSpacing: "0.5px" }}>购买即同意《云象数字服务协议》，虚拟算力资产不支持退款</p>
          </div>
        </div>
      )}

      {/* 成功状态高奢弹窗 */}
      {successMsg && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001, padding: "20px" }}>
          <div style={{ background: "rgba(20,20,20,0.8)", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: "320px", padding: "40px 30px", borderRadius: "28px", textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: "44px", marginBottom: "20px" }}>✨</div>
            <h3 style={{ fontSize: "19px", fontWeight: "600", marginBottom: "16px", color: "#fff", letterSpacing: "1px" }}>系统已确认</h3>
            <p style={{ color: "#a1a1aa", fontSize: "14px", marginBottom: "36px", lineHeight: "1.6", letterSpacing: "0.5px" }}>{successMsg}</p>
            <button onClick={() => setSuccessMsg("")} style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg, #fff 0%, #e4e4e7 100%)", color: "#000", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", letterSpacing: "1px", boxShadow: "0 4px 15px rgba(255,255,255,0.1)" }}>
              开启创作之旅
            </button>
          </div>
        </div>
      )}

      {/* 进度条遮罩层 */}
      {loading && (<div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 999 }}><div style={{ width: "85%", maxWidth: "400px", textAlign: "center" }}><div style={{ fontSize: "72px", fontWeight: "300", color: "#fff", marginBottom: "16px", fontFamily: "monospace", letterSpacing: "-2px" }}>{progress}%</div><p style={{ color: "#a1a1aa", fontSize: "15px", marginBottom: "40px", height: "20px", letterSpacing: "1px" }}>{statusText}</p><div style={{ background: "rgba(255,255,255,0.1)", height: "4px", borderRadius: "2px", overflow: "hidden" }}><div style={{ height: "100%", background: "#fff", width: `${progress}%`, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 0 10px rgba(255,255,255,0.5)" }}></div></div></div></div>)}
    </main>
  );
}