import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

Vue.config.productionTip = false;

// 常量对象
const constants = {
    BASE_URL: process.env.VUE_APP_BASE_URL,
    MEDIA_TYPE: {
        X_WWW_FORM_URLENCODED: "application/x-www-form-urlencoded",
        APPLICATION_JSON: "application/json"
    },
    HISTORIC_PROCESS_INSTANCE: {
        ACTIVE: "进行中",
        SUSPENDED: "已挂起",
        COMPLETED: "已完成",
        EXTERNALLY_TERMINATED: "外部终止",
        INTERNALLY_TERMINATED: "内部终止"
    },
    UN_SEND_KEY: "egu.no.send.area"
};
Vue.prototype.$consts = constants;

// Object 转 Query
import Qs from "qs";
Vue.prototype.$qs = Qs;

// http ajax
import Axios, {AxiosError} from "axios";

const serialize = params =>
    Qs.stringify(params, {indices: false, arrayFormat: "repeat", allowDots: true, encode: true});

Vue.prototype.$http = Axios.create({
    withCredentials: true,
    baseURL: constants.BASE_URL,
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    paramsSerializer: {encode: encodeURIComponent, serialize, indexes: null},
    formSerializer: {dots: true, metaTokens: true, indexes: null}
});
Vue.prototype.$http.interceptors.response.use(
    response => response,
    error => {
        let handler = {
            [AxiosError.ERR_BAD_OPTION_VALUE]: () => "请检查您的属性值",
            [AxiosError.ERR_BAD_OPTION]: () => "请检查您的属性",
            [AxiosError.ECONNABORTED]: () => "您的请求已被取消",
            [AxiosError.ETIMEDOUT]: () => "您的请求已超时",
            [AxiosError.ERR_NETWORK]: () => "请检查您的网络是否可用",
            [AxiosError.ERR_FR_TOO_MANY_REDIRECTS]: () => "请求重定向次数过多",
            [AxiosError.ERR_DEPRECATED]: () => "存在弃用的属性",
            [AxiosError.ERR_BAD_RESPONSE]: () => "请求响应解析失败",
            [AxiosError.ERR_BAD_REQUEST]: () => {
                if (error.response?.status === 401) {
                    clearTimeout(window.UNAUTHORIZED_ID);
                    window.UNAUTHORIZED_ID = setTimeout(() => window.location.reload(), 3000);
                    error.config.url += (error.config.url.includes("?") ? "&" : "?") + "notify=";
                }
                return error.response?.data?.msg ?? error.response?.data ?? "请检查您的表单";
            },
            [AxiosError.ERR_CANCELED]: () => "取消请求异常",
            [AxiosError.ERR_NOT_SUPPORT]: () => "不支持的类型",
            [AxiosError.ERR_INVALID_URL]: () => "无效路径地址"
        }[error.code];
        let facade = handler ? handler() : "未知错误信息";

        if (/[?&]notify=?/.test(error.config.url)) {
            window.$vm.$notify.error({title: "错误", message: facade});
        }
        return Promise.reject({...error, facade});
    }
);

// Element UI
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI, {size: "medium", zIndex: 1000});

// 权限插件
import Authority from "./authority";

Vue.use(Authority);

// 动态路由
import RouterMapper from "./mapper";

Vue.use(RouterMapper);

// 精度插件
import NumberPrecision from "number-precision";

NumberPrecision.enableBoundaryChecking(false);
Vue.prototype.$number = NumberPrecision;

// 动态表单
import VueForm from "@lljj/vue-json-schema-form";
Vue.component("VueForm", VueForm);

/**
 * 获取一级域名
 *
 * @returns {string|*}
 */
Vue.prototype.$tld = function () {
    let hostname = window.location.hostname;
    let matches = /^.+?\.(\w+\.[a-z]+)$/.exec(hostname);
    return matches ? matches[1] : undefined;
};

// Cookie 工具
// age: ｛0: 临时会话, -1: 永久会话, >0: 期限会话｝
import VueCookies from "vue-cookies";

VueCookies.config("0", "/", Vue.prototype.$tld());
Vue.use(VueCookies);

/**
 * 请求结果校验
 *
 * @param ret 请求响应对象
 * @returns {{status: boolean}}
 */
Vue.prototype.$success = function (ret) {
    const {data = {}} = ret || {};
    const {state, status} = data;
    const code = state || status || 500;
    return {...data, status: /^2[0-9]{2}$/.test(code)};
};

/**
 * Promise allSettled 分组器
 * @param {Array} values 响应数组
 * @returns {Promise<{readonly rejected: [], readonly values: [], readonly fulfilled: [], readonly messages: []}>}
 */
Vue.prototype.$grouper = function (values) {
    return Promise.resolve({
        get values() {
            return values;
        },
        get fulfilled() {
            return this.values.filter(f => f.status === "fulfilled").map(m => m.value);
        },
        get rejected() {
            return this.values.filter(f => f.status === "rejected").map(m => m.reason);
        },
        get notify() {
            return {
                success: message => {
                    let scope = this.fulfilled.length === this.values.length ? "全部" : "部分";
                    window.$vm.$notify.success({title: "提示", message: scope + message});
                },
                error: separator => {
                    let message = this.rejected.map(m => m?.facade ?? m).join(separator);
                    return window.$vm.$notify.error({title: "错误", dangerouslyUseHTMLString: true, message});
                }
            };
        }
    });
};

/**
 * 登出方法
 * @returns {Promise<void>}
 */
Vue.prototype.$logout = async function () {
    try {
        await this.$http.get("/logout");
        this.$store.commit("setAuthorities", []);
        await this.$store.dispatch("delAllViews");
        window.location.reload();
        // eslint-disable-next-line no-empty
    } catch (ignore) {}
};

/**
 *  获取起源
 * @returns {string}
 */
Vue.prototype.$origin = function () {
    let {origin, href, pathname, search} = location;
    return origin || href.replace(pathname + search, "");
};

/**
 * 手机号验证
 * @param mobile 手机号
 * @returns {{msg: string, status: boolean}}
 */
Vue.prototype.$verifyMobile = function (mobile) {
    mobile = mobile ?? "";
    if (mobile.length < 1) {
        return {status: false, msg: "请输入手机号"};
    }
    if (/^1[3-9]\d{9}$/.test(mobile)) {
        return {status: true, msg: "手机号验证成功"};
    }
    return {status: false, msg: "手机号格式错误"};
};

/**
 * 邮箱号验证
 * @param email 手机号
 * @returns {{msg: string, status: boolean}}
 */
Vue.prototype.$verifyEmail = function (email) {
    email = email ?? "";
    if (email.length < 1) {
        return {status: false, msg: "请输入邮箱号"};
    }
    if (/^\w+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+$/.test(email)) {
        return {status: true, msg: "邮箱号验证成功"};
    }
    return {status: false, msg: "邮箱号格式错误"};
};

/**
 * 密码验证
 * @param password
 * @returns {{msg: string, status: boolean}}
 */
Vue.prototype.$verifyPassword = function (password) {
    if (password === undefined || password == null || password === "") {
        return {status: false, msg: "请输入密码"};
    }
    if (password.length < 8 || password.length > 20) {
        return {status: false, msg: "密码长度8-20位"};
    }
    if (/^\d+$/.test(password)) {
        return {status: false, msg: "密码不能全数字"};
    }
    if (/^[a-zA-Z]+$/.test(password)) {
        return {status: false, msg: "密码不能全字母"};
    }
    if (/^\w+$/.test(password)) {
        return {status: true, msg: "密码验证成功"};
    }
    return {status: false, msg: "只能输入半角数字/字母/下划线"};
};

/**
 * 验证码倒计时
 * @param target   验证码对象
 * @param duration 间隔时间
 */
Vue.prototype.$captchaCountdown = function (target, duration) {
    target.id = setInterval(() => {
        if (duration.asSeconds() < 1) {
            clearInterval(target.id);
            target.txt = "发送验证码";
            target.maimed = false;
        } else {
            target.maimed = true;
            duration = duration.subtract({seconds: 1});
            target.txt = "剩余" + duration.asSeconds() + "秒";
        }
    }, 1000);
};

/**
 * 对象克隆
 * @param tar     目标对象
 * @returns {any} 新对象
 */
Vue.prototype.$clone = function (tar) {
    if (tar === undefined) {
        return undefined;
    }
    let json = JSON.stringify(tar);
    return JSON.parse(json);
};

/**
 * 获取 Vue-Router 组件名
 * @returns {*}
 */
Vue.prototype.$routeComponentName = function () {
    let names = this.$route.matched.map(m => m.components.default.name);
    return names[names.length - 1];
};

/**
 * 初始化一年的月份
 */
Vue.prototype.$monthOptions = function () {
    let options = [];
    for (let i = 1; i <= 12; i++) {
        let month = {value: i, label: i + "月份"};
        options.push(month);
    }
    return options;
};

/**
 * 关闭指定视图
 *
 * @param view        视图
 * @param returnValue 返回值
 */
Vue.prototype.$closeView = async function (view, returnValue) {
    await this.$store.dispatch("delView", view);
    return returnValue;
};

/**
 * 拉取用户权限
 * @returns {Promise<void>}
 */
Vue.prototype.$initialize = function () {
    if (this.$store.getters.isCertified) {
        return Promise.resolve();
    }
    return Axios.get("/principal/authorities", {
        withCredentials: true,
        baseURL: this.$consts.BASE_URL
    }).then(response => {
        const {data: permissions} = response;
        this.$store.commit("setAuthorities", permissions);
        this.$loadRoutes(permissions);
        return Promise.resolve();
    });
};

/**
 * 处理金额小数点
 *
 * @param value 数值
 * @returns {string}
 */
Vue.prototype.$dec = function (value) {
    return this.$number.round(value ?? 0, 2).toFixed(2);
};

/**
 * 默认商品图片
 */
Vue.prototype.$goodsImages = function () {
    return [
        "https://oss.egu365.com/upload/ec8b121580c24284927a275ce0f9c959.jpg",
        "https://oss.egu365.com/upload/be4c6b22ef8d4a7aa3335ae77754fd02.jpg",
        "https://oss.egu365.com/upload/98b8c3d2734e4c5d84b123782a07fad5.jpg",
        "https://oss.egu365.com/upload/cc0e5353952d49c2b871e10d8c616965.jpg",
        "https://oss.egu365.com/upload/895c451067c143f1a8312ba59e0a41f2.jpg",
        "https://oss.egu365.com/upload/e1b44b860fcc49e1b24a99848bd793bd.jpg",
        "https://oss.egu365.com/upload/40ba9bc106cf417aa24b361460924369.jpg"
    ];
};

/**
 * 商品促销提示信息
 */
Vue.prototype.$salesTips = function () {
    return [
        {key: "jk", value: "进口"},
        {key: "xp", value: "新品"},
        {key: "cx", value: "促销"},
        {key: "fp", value: "扶贫特产"}
    ];
};

/**
 * 商品存储方式
 */
Vue.prototype.$storeOption = function () {
    return [
        "存储：常温干净干燥处",
        "存储：冷藏（0-4℃）",
        "存储：冷冻（-18℃以下）",
        "存储：恒温（15-18℃）",
        "存储：冷冻（-30℃以下）",
        "提示：不运作时请断电，谨防触电漏电"
    ];
};

/**
 * 商品保质期/材质
 */
Vue.prototype.$expireOption = function () {
    return ["保质期：详见包装", "材质：", "额定功率：", "包邮范围："];
};

/**
 * 防抖执行器
 *
 * @param callback     处理函数
 * @param millisecond  防抖时间
 */
Vue.prototype.$debounce = function (callback, millisecond) {
    if (window.$timeoutIds === undefined) {
        window.$timeoutIds = new WeakMap();
    }
    let timeoutId = window.$timeoutIds.get(callback);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, millisecond ?? 500);
    window.$timeoutIds.set(callback, timeoutId);
};

window.$vm = new Vue({
    store,
    router,
    render: h => h(App)
}).$mount("#app");
