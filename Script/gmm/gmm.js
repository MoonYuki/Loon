/**
 * @file G买卖自动筛选注入脚本
 * @supported Loon
 */

let enable = true;

// 检查 Loon 插件中传递的参数开关
if (typeof $argument !== "undefined") {
    // 如果插件中关闭了开关，则直接放行不处理
    if ($argument.toString().toLowerCase() === "false" || $argument.toString().toLowerCase() === "0") {
        enable = false;
    }
}

if (!enable) {
    $done({});
} else {
    let url = $request.url;

    // 拦截商品搜索接口并注入筛选条件：祭司(job=27) + 81-120级 + 价格上限500
    if (url.includes("/api/consigntradeapi/goods/searchgoodslistV2")) {
        let targetSearchProps = JSON.stringify({
            "total_price": ["", "500"],
            "p_job": ["27"],
            "p_level": ["81", "120"]
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
