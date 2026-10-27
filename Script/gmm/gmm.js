/**
 * @file G买卖自动筛选注入脚本
 * @supported Loon
 */

let enable = true;
let jobCode = "27";
let minLevel = "81";
let maxLevel = "120";
let maxPrice = "500";

// 解析 Loon 传递的高级 DSL 参数对象
if (typeof $argument !== "undefined" && typeof $argument === "object" && $argument !== null) {
    if ($argument.enable !== undefined) {
        let argEnable = $argument.enable;
        if (argEnable === false || argEnable === "false" || argEnable === "0") {
            enable = false;
        }
    }
    if ($argument.jobCode !== undefined) {
        jobCode = String($argument.jobCode);
    }
    if ($argument.minLevel !== undefined) {
        minLevel = String($argument.minLevel);
    }
    if ($argument.maxLevel !== undefined) {
        maxLevel = String($argument.maxLevel);
    }
    if ($argument.maxPrice !== undefined) {
        maxPrice = String($argument.maxPrice);
    }
}

if (!enable) {
    $done({});
} else {
    let url = $request.url;

    // 拦截商品搜索接口并根据插件参数动态注入筛选条件
    if (url.includes("/api/consigntradeapi/goods/searchgoodslistV2")) {
        let targetSearchProps = JSON.stringify({
            "total_price": ["", maxPrice],
            "p_job": [jobCode],
            "p_level": [minLevel, maxLevel]
        });
        
        let encodedProps = encodeURIComponent(targetSearchProps);

        // 动态替换或拼接 searchProperties 参数
        if (!url.includes("searchProperties")) {
            url = url + "&searchProperties=" + encodedProps;
        } else {
            url = url.replace(/searchProperties=[^&]*/, "searchProperties=" + encodedProps);
        }
        
        $done({ url: url });
    } else {
        $done({});
    }
}
