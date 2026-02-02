var existing = document.getElementById("smiley-checkbox-script");
if (!existing) {
    var extension = document.createElement("script");
    extension.src = "";
    extension.id = "smiley-checkbox-script";
    extension.async = false;
    extension.type = "text/javascript";

    // 定义核心逻辑
    var injectSmileyFace = () => {
        // 找到所有还没有笑脸结构的复选框
        const checks = document.querySelectorAll('.check-container .checkmark');
        checks.forEach(span => {
            if (!span.querySelector('.smiley-face')) {
                // 创建代表“脸”的 i 标签
                const face = document.createElement('i');
                face.className = 'smiley-face';
                // 确保 i 标签内没有内容，避免干扰样式
                face.textContent = '';
                span.appendChild(face);
            }
        });
    };

    // 1. 立即运行一次
    injectSmileyFace();

    // 2. 监听页面变化（因为 Roam 是动态加载的）
    var observer = new MutationObserver(injectSmileyFace);
    observer.observe(document.body, { childList: true, subtree: true });

    document.getElementsByTagName("head")[0].appendChild(extension);
}