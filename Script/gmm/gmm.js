/**
 * @file G买卖自动监控与弹窗提醒脚本
 * @supported Loon
 */

let enable = true;
let jobCode = "27";
let minLevel = "81";
let maxLevel = "120";
let maxPrice = "500";

// 解析 Loon 传递的参数
if (typeof $argument !== "undefined" && typeof $argument === "object" && $argument !== null) {
    if ($argument.enable !== undefined) {
        let argEnable = $argument.enable;
        if (argEnable === false || argEnable === "false" || argEnable === "0") {
            enable = false;
        }
    }
    if ($argument.jobCode !== undefined) { jobCode = String($argument.jobCode); }
    if ($argument.minLevel !== undefined) { minLevel = String($argument.minLevel); }
    if ($argument.maxLevel !== undefined) { maxLevel = String($argument.maxLevel); }
    if ($argument.maxPrice !== undefined) { maxPrice = String($argument.maxPrice); }
}

if (!enable || typeof $response === "undefined") {
    $done({});
} else {
    let body = $response.body;
    if (body) {
        try {
            let jsonObj = JSON.parse(body);
            // 检查返回的数据结构
            if (jsonObj && jsonObj.data && jsonObj.data.goodsList) {
                let goodsList = jsonObj.data.goodsList;
                let matchedCount = 0;

                for (let i = 0; i < goodsList.length; i++) {
                    let goods = goodsList[i];
                    let price = parseFloat(goods.price);
                    let title = goods.goods_list_title || "";

                    // 从标题中正则匹配等级，例如 "[祭司 83级]"
                    let levelMatch = title.match(/(\d+)级/);
                    if (levelMatch) {
                        let level = parseInt(levelMatch[1]);

                        // 判断是否同时满足：价格 <= maxPrice 且 等级在 minLevel 和 maxLevel 之间
                        if (price <= parseFloat(maxPrice) && level >= parseInt(minLevel) && level <= parseInt(maxLevel)) {
                            matchedCount++;
                            let subTitle = goods.goods_list_sub_title || "";
                            let bookId = goods.book_id || "";
                            
                            // 生成商品的 H5 详情页直达链接
                            let goodsUrl = `https://www.gmmsj.com/h5/goods/detail/index.html?book_id=${bookId}&game_id=791001093`;

                            let notifTitle = "🚨 发现符合条件的账号！";
                            let notifSub = `价格: ￥${price} | 等级: ${level}级`;
                            let notifBody = `${title}\n${subTitle}\n👉 点击或复制查看详情`;

                            // 通过 Loon 弹出通知，并附加跳转链接（支持点击直达商品详情）
                            $notification.post(notifTitle, notifSub, notifBody, { "open-url": goodsUrl });
                            console.log(`[G买卖命中] 价格: ￥${price}, 等级: ${level} | 标题: ${title}`);
                        }
                    }
                }

                if (matchedCount > 0) {
                    console.log(`[G买卖监控] 本次扫描到 ${goodsList.length} 件商品，成功命中 ${matchedCount} 个目标！`);
                }
            }
        } catch (e) {
            console.log("[G买卖监控] 解析响应 JSON 失败: " + e.message);
        }
    }
    
    $done({ body });
}
