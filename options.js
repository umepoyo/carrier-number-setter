// 保存ボタンのクリックイベント
document.getElementById("saveButton").addEventListener("click", function() {
    const defaultCarrier = document.getElementById("defaultCarrier").value;
    chrome.storage.sync.set({ defaultCarrier: defaultCarrier }, function() {
        alert("配送業者を登録しました");
    });
});

// ページ読み込み時にデフォルト値を表示
document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.sync.get("defaultCarrier", function(data) {
        if (data.defaultCarrier) {
            document.getElementById("defaultCarrier").value = data.defaultCarrier;
        }
    });
});