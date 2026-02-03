/**
 * Sidebar Expander for Roam Research
 * 悬浮侧边栏扩展
 * 
 * 功能：
 * 1. 禁用原生侧边栏（将其从文档流中移除并隐藏）
 * 2. 鼠标移到屏幕左边缘时自动展开悬浮侧边栏
 * 3. 离开后自动收回
 */

(function () {
    const CONFIG = {
        triggerWidth: 15,          // 触发区域宽度（像素）
        collapseDelay: 300,        // 鼠标离开后收回的延迟（毫秒）
        sidebarWidth: '240px',     // 侧栏宽度（与 roam.css .roam-sidebar-container 一致）
        sidebarMinWidth: '200px',  // 侧栏最小宽度
    };

    let collapseTimer = null;
    let styleElement = null;

    // 注入 CSS 样式，强制覆盖原生侧边栏样式
    const STYLES = `
        /* 
         * 强制将侧边栏设为固定定位，从而脱离文档流 (禁用原生占位)
         * 默认状态：隐藏在屏幕左侧外部
         */
        .roam-sidebar-container {
            position: fixed !important;
            top: 10% !important;
            bottom: 10% !important;
            left: 0 !important;
            height: 80% !important;
            width: ${CONFIG.sidebarWidth} !important;
            z-index: 2000 !important;
            
            /* 视觉样式 - 使用主题变量，日夜自适应 */
            background-color: var(--bg-color, #F3F9F1) !important;
            box-shadow: var(--shadow-floating, 0 10px 30px rgba(80, 97, 109, 0.16)) !important;
            border-radius: 0 16px 16px 0 !important;
            
            /* 动画与过渡 */
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            transform: translateX(-105%) !important; /* 默认隐藏 */
            opacity: 0.95;
            overflow: visible !important; /* 让图下拉 popover 能超出侧栏宽度 */
        }

        /* 展开状态 */
        .roam-sidebar-container.sidebar-floating-open {
            transform: translateX(0) !important; /* 滑入显示 */
            opacity: 1;
        }

        /* 标题行（含图下拉）提到最前，避免被同级的 shortcuts 遮住 */
        .roam-sidebar-container .roam-sidebar-content .top-row {
            z-index: 99999 !important;
            position: relative;
        }

        /* 触发区域样式 */
        .roam-sidebar-expander {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            width: ${CONFIG.triggerWidth}px;
            z-index: 2001; /* 必须高于侧边栏以便触发 */
            cursor: default;
            background: transparent;
        }
    `;

    // 移除旧的触发器
    function removeExpanders() {
        document.querySelectorAll('.roam-sidebar-expander').forEach(el => el.remove());
    }

    // 注入自定义 CSS
    function injectStyles() {
        if (!document.getElementById('roam-sidebar-fix-styles')) {
            styleElement = document.createElement('style');
            styleElement.id = 'roam-sidebar-fix-styles';
            styleElement.textContent = STYLES;
            document.head.appendChild(styleElement);
        }
    }

    // 展开侧边栏
    function expandLeftSidebar() {
        const sidebar = document.querySelector('.roam-sidebar-container');
        if (sidebar) {
            sidebar.classList.add('sidebar-floating-open');
        }
    }

    // 收回侧边栏
    function collapseLeftSidebar() {
        const sidebar = document.querySelector('.roam-sidebar-container');
        if (sidebar) {
            sidebar.classList.remove('sidebar-floating-open');
        }
    }

    // 创建触发区域
    function createExpander() {
        const expander = document.createElement('div');
        expander.className = 'roam-sidebar-expander';

        // 鼠标进入触发区 -> 展开
        expander.addEventListener('mouseenter', () => {
            if (collapseTimer) {
                clearTimeout(collapseTimer);
                collapseTimer = null;
            }
            expandLeftSidebar();
        });

        // 鼠标离开触发区 -> 延迟收回
        expander.addEventListener('mouseleave', () => {
            // 设置延迟，以便用户有时间将鼠标移动到侧边栏上
            collapseTimer = setTimeout(() => {
                collapseLeftSidebar();
            }, CONFIG.collapseDelay);
        });

        return expander;
    }

    // 设置侧边栏自身的交互 (保持展开)
    function setupSidebarInteractions() {
        const sidebar = document.querySelector('.roam-sidebar-container');
        if (sidebar) {
            // 鼠标在侧边栏上时，取消收回计时器
            sidebar.addEventListener('mouseenter', () => {
                if (collapseTimer) {
                    clearTimeout(collapseTimer);
                    collapseTimer = null;
                }
            });

            // 鼠标离开侧边栏 -> 延迟收回
            sidebar.addEventListener('mouseleave', () => {
                collapseTimer = setTimeout(() => {
                    collapseLeftSidebar();
                }, CONFIG.collapseDelay);
            });
        }
    }

    function init() {
        // 检测 Roam 是否加载完成
        const check = setInterval(() => {
            if (document.querySelector('.roam-body') || document.querySelector('.roam-main')) {
                const sidebar = document.querySelector('.roam-sidebar-container');
                if (sidebar) {
                    clearInterval(check);
                    
                    // 1. 注入样式 (禁用原生侧边栏显示)
                    injectStyles();
                    
                    // 2. 清理旧组件并添加新触发器
                    removeExpanders();
                    document.body.appendChild(createExpander());
                    
                    // 3. 绑定侧边栏交互
                    setupSidebarInteractions();
                    
                    console.log('✅ Sidebar Expander: 原生侧边栏已禁用，悬浮模式已激活。');
                }
            }
        }, 500);
        
        // 20秒后停止检测，避免死循环
        setTimeout(() => clearInterval(check), 20000);
    }

    init();
})();