// TDD Sidebar - 在左侧边栏添加 Todo/Doing/Done 快捷入口
(function() {
    console.log('🚀 TDD Sidebar Loading...');

    // 配置 - 可以自定义页面名称、图标和描述
    const config = {
        pages: { todo: 'TODO', done: 'Done' },
        icons: { todo: '📋', done: '✅' },
        descriptions: { todo: '待办', done: '已完成' }
    };

    // 添加 CSS 样式
    const addStyles = () => {
        if (document.getElementById('tdd-sidebar-styles')) return;
        const style = document.createElement('style');
        style.id = 'tdd-sidebar-styles';
        style.textContent = `
            .tdd-wrapper { flex: 1 1 0px; padding: 8px 20px; margin-top: 16px; }
            .tdd-divider { flex: 0 0 1px; background-color: var(--color-subtle-border, oklch(from var(--m-text, #50616D) l c h / 0.2)); opacity: 0.8; }
            .tdd-title { display: flex; align-items: center; font-size: 14px; opacity: 80%; letter-spacing: 0.04em; margin-bottom: 8px; font-weight: 600; color: var(--sidebar-star-color, var(--m-sidebar-star, #177CB0)); }
            .tdd-title .bp3-icon { margin-right: 8px; opacity: 0.7; color: inherit; }
            .tdd-buttons { display: flex; flex-direction: column; gap: 6px; }
            .tdd-button { display: flex; align-items: center; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500; background: transparent; color: var(--text-color, var(--m-text, #50616D)); transition: all 0.2s ease; border: 1px solid transparent; cursor: pointer; }
            .tdd-button:hover { background: var(--sidebar-hover-bg, oklch(from var(--m-primary, #789262) l c h / 0.1)); border-color: var(--color-subtle-border, oklch(from var(--m-text, #50616D) l c h / 0.2)); transform: translateX(2px); }
            .tdd-button .tdd-icon { margin-right: 10px; font-size: 16px; width: 20px; text-align: center; }
            .tdd-button.todo .tdd-icon { color: var(--highlight-blue, var(--m-highlight-blue, #4C8DAE)); }
            .tdd-button.done .tdd-icon { color: var(--checkbox-checked-color, var(--m-checkbox-checked, #21A675)); }
            .tdd-button .tdd-label { flex: 1; display: flex; flex-direction: column; }
            .tdd-button .tdd-name { font-size: 18px; line-height: 1.4; font-weight: 600; }
            .tdd-button .tdd-desc { font-size: 13px; opacity: 0.85; line-height: 1.3; margin-top: 4px; display: none; }
            .tdd-button:hover .tdd-desc { display: block; opacity: 1; }
        `;
        document.head.appendChild(style);
    };

    // 导航到页面
    const navigateToPage = (pageName) => {
        try {
            const result = window.roamAlphaAPI.q(`[:find ?uid :where [?page :node/title "${pageName}"] [?page :block/uid ?uid]]`);
            const uid = result.length > 0 ? result[0][0] : null;
            if (uid) {
                window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid } });
            } else {
                window.roamAlphaAPI.ui.mainWindow.openPage({ page: { title: pageName } });
            }
        } catch (error) {
            console.error('TDD: 跳转失败', error);
        }
    };

    // 创建 TDD 区块
    const createTDDSection = () => {
        const wrapper = document.createElement('div');
        wrapper.id = 'tdd-section';
        wrapper.className = 'flex-v-box tdd-wrapper';

        wrapper.innerHTML = `
            <div class="tdd-divider"></div>
            <div style="flex: 0 0 16px;"></div>
            <div class="tdd-buttons"></div>
        `;

        const buttonsContainer = wrapper.querySelector('.tdd-buttons');
        const items = [
            { key: 'todo', label: 'Todo' },
            { key: 'done', label: 'Done' }
        ];

        items.forEach(item => {
            const button = document.createElement('div');
            button.className = `tdd-button ${item.key}`;
            button.innerHTML = `
                <span class="tdd-icon">${config.icons[item.key]}</span>
                <div class="tdd-label">
                    <span class="tdd-name">${item.label}</span>
                    <span class="tdd-desc">${config.descriptions[item.key]}</span>
                </div>
            `;
            button.addEventListener('click', () => navigateToPage(config.pages[item.key]));
            buttonsContainer.appendChild(button);
        });

        return wrapper;
    };

    // 添加 TDD 到侧边栏
    const addTDDSection = () => {
        if (document.getElementById('tdd-section')) return true;
        const shortcuts = document.querySelector('.starred-pages-wrapper');
        if (!shortcuts) return false;
        shortcuts.parentNode.insertBefore(createTDDSection(), shortcuts);
        console.log('✅ TDD Sidebar Loaded');
        return true;
    };

    // 初始化
    const init = () => {
        addStyles();
        
        // 监听 DOM 变化（仅侧栏相关节点，避免输入卡顿）
        const root = document.querySelector('.roam-sidebar-container') || document.querySelector('.roam-app');
        if (root) {
            let pending = false;
            const observer = new MutationObserver((mutations) => {
                if (document.getElementById('tdd-section')) return;
                const shouldCheck = mutations.some((mutation) => {
                    if (!mutation.addedNodes || mutation.addedNodes.length === 0) return false;
                    return Array.from(mutation.addedNodes).some((node) => {
                        if (node.nodeType !== 1) return false;
                        const el = node;
                        return el.classList?.contains('starred-pages-wrapper')
                            || el.querySelector?.('.starred-pages-wrapper')
                            || el.classList?.contains('roam-sidebar-container')
                            || el.querySelector?.('.roam-sidebar-container')
                            || el.classList?.contains('roam-sidebar-content')
                            || el.querySelector?.('.roam-sidebar-content');
                    });
                });
                if (!shouldCheck || pending) return;
                pending = true;
                requestAnimationFrame(() => {
                    pending = false;
                    addTDDSection();
                });
            });
            observer.observe(root, { childList: true, subtree: true });
        }

        // 多次尝试添加
        [0, 500, 1000, 2000, 3000, 5000].forEach(delay => {
            setTimeout(addTDDSection, delay);
        });
    };

    init();
})();
