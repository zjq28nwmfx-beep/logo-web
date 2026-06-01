import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 font-sans">
      
      {/* 顶部导航区：左侧问候语 + 右侧返回按钮 */}
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light tracking-widest text-gray-100">
            欢迎归来，<span className="font-medium text-white">创构者</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm tracking-wider">大梦如鸿 · 您的专属数字资产中枢</p>
        </div>
        
        {/* 返回主岛的任意门 */}
        <Link 
          href="/" 
          className="px-6 py-2 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white transition-all backdrop-blur-md flex items-center space-x-2"
        >
          <span>&larr;</span>
          <span>返回创构台</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 左侧：资产黑卡 */}
        <section className="col-span-1">
          <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* 装饰性光晕 */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 border-2 border-white/20"></div>
                <div>
                  <h2 className="text-xl font-medium">User_8842</h2>
                  <p className="text-xs text-gray-400 mt-1">免费计划</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-1">当前灵感算力</p>
                <div className="text-5xl font-light tracking-tighter">
                  128 <span className="text-lg text-gray-500 font-normal tracking-normal">点</span>
                </div>
              </div>

              <button className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                补充算力
              </button>
            </div>
          </div>
        </section>

        {/* 右侧：创构画廊 (历史记录) */}
        <section className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-medium tracking-wide">历史创构</h3>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              查看全部账单 &rarr;
            </button>
          </div>

          {/* 画廊网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 占位图卡片 1 */}
            <div className="group relative aspect-video rounded-2xl bg-gray-900 border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-6">
                <p className="text-sm text-white font-medium mb-2">极简几何 · 科技感</p>
                <div className="flex space-x-3">
                  <button className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-xs hover:bg-white hover:text-black transition-colors">下载</button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-xs hover:bg-white/30 transition-colors">咒语</button>
                </div>
              </div>
            </div>

            {/* 占位图卡片 2 */}
            <div className="group relative aspect-video rounded-2xl bg-gray-900 border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-6">
                <p className="text-sm text-white font-medium mb-2">东方赛博 · 幻境</p>
                <div className="flex space-x-3">
                  <button className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-xs hover:bg-white hover:text-black transition-colors">下载</button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-xs hover:bg-white/30 transition-colors">咒语</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}