/**
 * Vue 权限插件
 * 会在 Vue 上注册全局指令和方法
 * 要求：在 store.state 中有 authorities: {}
 * 指令：v-authority
 * 方法：$hasAuthority | $hasAnyAuthority
 *
 * @author weison
 * @since 2021-09-26
 */

/**
 * Vue 插件安装
 *
 * @param {Vue}    Vue
 * @param {Object} options
 */
// eslint-disable-next-line no-unused-vars
const install = function (Vue, options) {
    /**
     * JS 多个权限判断
     *
     * @param {String} values 权限字符
     * @returns {boolean}
     */
    Vue.prototype.$hasAuthority = function (...values) {
        if (values) {
            return values.some(v => this.$store.getters.authorities[v]);
        }
        return false;
    };

    /**
     * 指令处理
     *
     * @param el       DOM元素
     * @param binding  绑定对象
     * @param vnode    虚拟节点
     */
    const authority = function (el, binding, vnode) {
        const values = Object.keys(binding.modifiers);
        if (vnode.context.$hasAuthority(...values)) {
            return;
        }
        el.parentNode && el.parentNode.removeChild(el);
    };

    /**
     * 指令注册：v-authority
     */
    Vue.directive("authority", {inserted: authority, update: authority});
};

export default {install};
