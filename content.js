(function () {
    // URLの変更を監視する関数
    function watchUrlChange(callback) {
        let lastUrl = location.href;

        // MutationObserver を使って URL 変更を監視
        const observer = new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                callback(); // URLが変わったときにコールバックを実行
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 対象のURLかどうかをチェックする関数
    function isTargetUrl(url) {
        const pattern = /^https:\/\/admin\.shopify\.com\/store\/umeboys\/orders\/\d+\/fulfillment_orders\/\d+\/fulfill.*/;
        return pattern.test(url);
    }

    // URL変更時や初期ロード時に処理を実行
    function applySettings() {
        // URLが対象のパターンでなければ処理を中断
        if (!isTargetUrl(window.location.href)) {
            console.log("not fulfillment page")
            return;
        }

        // URLパラメータから "carrier" の値を取得
        const urlParams = new URLSearchParams(window.location.search);
        const urlCarrierName = urlParams.get("carrier");

        // chrome.storage.sync からデフォルトキャリアを取得
        chrome.storage.sync.get("defaultCarrier", function (data) {
            const defaultCarrier = data.defaultCarrier || "";
            const carrierName = urlCarrierName || defaultCarrier;
            console.log("carrier:", { carrierName });

            if (carrierName) {
                // 要素が動的に生成される場合に備えて MutationObserver を使用
                const observer = new MutationObserver(function (mutations, observerInstance) {
                    const carrierInput = document.querySelector('input[name="trackingCarrierId"]');
                    console.log(carrierInput);
                    const trackingNumberInput = document.querySelector('input[name="trackingInfoFields[0].number"]');

                    if (carrierInput && trackingNumberInput) {

                        selectCarrierOption(carrierInput, carrierName).then(() => {
                            focusTrackingNumber(trackingNumberInput);
                        });
                        
                        observerInstance.disconnect(); // 観察を停止
                    }
                });

                // 観察を開始
                observer.observe(document.body, { childList: true, subtree: true });

                // 既に要素が存在する場合はすぐに設定
                const existingCarrierInput = document.querySelector('input[name="trackingCarrierId"]');
                const existingTrackingNumberInput = document.querySelector('input[name="trackingInfoFields[0].number"]');
                if (existingCarrierInput && existingTrackingNumberInput) {
                    selectCarrierOption(existingCarrierInput, carrierName).then(() => {
                        focusTrackingNumber(existingTrackingNumberInput);
                    });
                    observer.disconnect(); // 観察を停止
                }
            }
        });
    }

    // キャリアを選択する関数
    function selectCarrierOption(inputElement, carrierName) {
        return new Promise((resolve) => {

            const observeDropdown = () => {
                const dropdownList = document.querySelector('.Polaris-Combobox__Listbox');
                if (dropdownList) {
                    console.log("Dropdown list detected.", dropdownList);
                    const trySelectOption = () => {
                        const dropdownOptions = dropdownList.querySelectorAll('.Polaris-Listbox-TextOption__Content');
                        console.log("DropdownOption:", { dropdownOptions });
                        for (let option of dropdownOptions) {
                            const optionText = option.innerText.trim();
                            if (optionText === carrierName) {
                                // オプションをクリックして選択
                                option.click();
                                resolve();
                            }
                        }
                    }
                    
                    setTimeout(trySelectOption, 100); // 再帰的にチェック


                } else {
                    console.log("waiting for dropdown list...");
                    setTimeout(observeDropdown, 100); // 再帰的にチェック

                    // フォーカスを当ててドロップダウンを開く
                    inputElement.focus();

                    // キャリア入力フィールドをクリックしてドロップダウンを開く
                    inputElement.click();
                }
            };

            // ドロップダウンのリストボックスをチェック
            observeDropdown();
        });
    }


    // フォーカスを合わせる関数
    function focusTrackingNumber(inputElement) {
        console.log("tracking")
        inputElement.focus();
        inputElement.click();
    }



    // URLの変更を監視して applySettings を実行
    watchUrlChange(applySettings);

    // 初回ロード時にも applySettings を実行
    applySettings();
})();
