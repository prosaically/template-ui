/**
 * Vue 动态路由插件
 * 会在 Vue 全局方法
 * 方法：$loadRoutes
 *
 * @author weison
 * @since 2021-09-26
 */

const map = {
    // 流程管理 -> 决策模型
    "flow-dmn": async () => await import("@/views/flow/dmn/FlowDmnQuery.vue"),
    "flow-dmn-add": async () => await import("@/views/flow/dmn/FlowDmnAdd.vue"),
    "flow-dmn-update": async () => await import("@/views/flow/dmn/FlowDmnUpdate.vue"),

    // 流程管理 -> 表单模型
    "flow-form": async () => await import("@/views/flow/form/FlowFormQuery.vue"),
    "flow-form-add": async () => await import("@/views/flow/form/FlowFormAdd.vue"),
    "flow-form-update": async () => await import("@/views/flow/form/FlowFormUpdate.vue"),

    // 流程管理 -> 流程模型
    "flow-bpmn": async () => await import("@/views/flow/bpmn/FlowBpmnQuery.vue"),
    "flow-bpmn-add": async () => await import("@/views/flow/bpmn/FlowBpmnAdd.vue"),
    "flow-bpmn-update": async () => await import("@/views/flow/bpmn/FlowBpmnUpdate.vue"),

    // 流程管理 -> 流程实例
    "flow-instance": async () => await import("@/views/flow/instance/FlowInstanceQuery.vue"),

    // 我的办公
    "work-initiate": async () => await import("@/views/work/initiate/WorkInitiate.vue"),
    "work-own": async () => await import("@/views/work/own/WorkOwnQuery.vue"),
    "work-own-update": async () => await import("@/views/work/own/WorkOwnUpdate.vue"),
    "work-claim": async () => await import("@/views/work/claim/WorkClaimQuery.vue"),
    "work-await": async () => await import("@/views/work/await/WorkAwaitQuery.vue"),
    "work-complete": async () => await import("@/views/work/complete/WorkCompleteQuery.vue"),

    // 系统目录
    "system-group": async () => await import("@/views/system/SystemGroup.vue"),
    "system-help": async () => await import("@/views/system/SystemHelp.vue"),
    "system-notice": async () => await import("@/views/system/notice/SystemNoticeQuery.vue"),
    "system-notice-add": async () => await import("@/views/system/notice/SystemNoticeInsert.vue"),
    "system-notice-update": async () => await import("@/views/system/notice/SystemNoticeUpdate.vue"),
    "system-charts": async () => await import("@/views/system/SystemCharts.vue"),
    "system-authority": async () => await import("@/views/system/SystemAuthority.vue"),
    "system-role": async () => await import("@/views/system/SystemRole.vue"),
    "system-operator": async () => await import("@/views/system/SystemOperator.vue"),
    "system-trace": async () => await import("@/views/system/SystemTrace.vue")
};

/**
 * Vue 插件安装
 *
 * @param {Vue}    Vue
 * @param {Object} options
 */
// eslint-disable-next-line no-unused-vars
const install = function (Vue, options) {
    /**
     * 动态路由加载
     *
     * @param {Array} permissions
     */
    Vue.prototype.$loadRoutes = function (permissions) {
        // 生成子路由
        const children = permissions
            .map(i => {
                let {uri: path, code: name, name: title} = i;
                let component = map[name]
                    ? async () => {
                          let imported = await map[name]();
                          imported.default.name = name;
                          return imported;
                      }
                    : undefined;
                return {path, name, meta: {requireAuth: true, title, breadcrumb: true, closable: true}, component};
            })
            .filter(f => f.component);

        // 注册路由
        this.$router.addRoute({
            path: "/",
            meta: {requireAuth: true, title: process.env.VUE_APP_TITLE, breadcrumb: true, closable: false},
            component: () => import("@/layout/Layout.vue"),
            children: [
                {
                    path: "",
                    name: "Welcome",
                    component: () => import("@/views/Welcome.vue"),
                    meta: {requireAuth: true, title: "欢迎使用", breadcrumb: true, closable: false}
                },
                ...children,
                {
                    path: "guide",
                    name: "Guide",
                    meta: {requireAuth: true, title: "帮助手册", breadcrumb: true, closable: true},
                    component: () => import("@/views/Guide.vue")
                },
                {
                    path: "notice",
                    name: "Notice",
                    meta: {requireAuth: true, title: "通知中心", breadcrumb: true, closable: true},
                    component: () => import("@/views/Notice.vue")
                },
                {
                    path: "*",
                    name: "NotFound",
                    meta: {requireAuth: true, title: "页面走丢了", breadcrumb: true, closable: true},
                    component: () => import("@/views/NotFound.vue")
                }
            ]
        });
    };
};

export default {install};
