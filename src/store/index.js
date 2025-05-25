import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/**
 * 写出数据
 */
window.addEventListener("beforeunload", function () {
    let value = JSON.stringify(window.$vm.$store.state.visitedViews);
    window.sessionStorage.setItem("visitedViews", value);
});

/**
 * 加载数据
 */
let visitedViewsValue = window.sessionStorage.getItem("visitedViews") ?? "[]";
let visitedViews = JSON.parse(visitedViewsValue);

/**
 * 树型模块
 */
const treeModule = () => ({
    namespaced: true,
    state: {
        loading: false,
        mappers: {},
        trees: []
    },
    mutations: {
        setLoading(state, value) {
            state.loading = value;
        },
        setMappers(state, value) {
            state.mappers = value;
        },
        setTrees(state, value) {
            state.trees = value;
        }
    }
});

/**
 * 创建对象
 */
export default new Vuex.Store({
    state: {
        authorities: undefined,
        menubarCollapse: false,
        visitedViews,
        cachedViews: [],
        caches: {}
    },
    getters: {
        authorities({authorities = []}) {
            const map = {};
            for (let permission of authorities) {
                map[permission.code] = permission;
            }
            return map;
        },
        menus({authorities = []}) {
            const mappers = {};
            const catalogs = authorities
                .filter(f => f.catalog)
                .map(item => {
                    let newObj = {...item};
                    mappers[item.id] = newObj;
                    return newObj;
                });

            const first = [];
            for (let catalog of catalogs) {
                const parent = mappers[catalog.parent];
                if (parent) {
                    parent.children = (parent.children ?? []).concat(catalog);
                } else {
                    first.push(catalog);
                }
            }
            return first;
        },
        isCertified: state => Boolean(state.authorities),
        isCollapse: state => state.menubarCollapse
    },
    mutations: {
        setAuthorities(state, value) {
            state.authorities = value;
        },
        toggleMenubarCollapse(state) {
            state.menubarCollapse = !state.menubarCollapse;
        },
        setCache(state, {key, value}) {
            Vue.set(state.caches, key, value);
        },
        delCache(state, {key}) {
            Vue.delete(state.caches, key);
        },

        // 增加视图
        addVisitedView(state, view) {
            const {path, fullPath, query, params, name, meta} = view;
            if (!state.visitedViews.some(v => v.path === path)) {
                state.visitedViews.push({path, fullPath, query, params, name, meta});
            }
        },
        addCachedView(state, view) {
            if (state.cachedViews.indexOf(view.name) < 0) {
                state.cachedViews.push(view.name);
            }
        },
        // 删除视图
        delVisitedView(state, view) {
            for (let i = 0; i < state.visitedViews.length; i++) {
                if (state.visitedViews[i].path === view.path) {
                    state.visitedViews.splice(i, 1);
                    break;
                }
            }
        },
        delCachedView(state, view) {
            const index = state.cachedViews.indexOf(view.name);
            index > -1 && state.cachedViews.splice(index, 1);
        },
        // 删除全部视图
        delAllVisitedViews(state) {
            state.visitedViews.splice(0);
        },
        delAllCachedViews(state) {
            state.cachedViews.splice(0);
        },
        // 更新视图
        updateVisitedView(state, view) {
            for (let i = 0; i < state.visitedViews.length; i++) {
                if (state.visitedViews[i].path === view.path) {
                    const {path, fullPath, query, params, name, meta} = view;
                    state.visitedViews[i] = {path, fullPath, query, params, name, meta};
                    break;
                }
            }
        }
    },
    actions: {
        addView({commit, state}, view) {
            return new Promise(resolve => {
                commit("addVisitedView", view);
                commit("addCachedView", view);
                resolve(state.visitedViews);
            });
        },
        delView({commit, state}, view) {
            return new Promise(resolve => {
                commit("delCachedView", view);
                commit("delVisitedView", view);
                resolve(state.visitedViews);
            });
        },
        delOthersViews({dispatch, state}, view) {
            return new Promise(resolve => {
                dispatch("delAllViews");
                dispatch("addView", view);
                resolve(state.visitedViews);
            });
        },
        delAllViews({commit, state}) {
            return new Promise(resolve => {
                commit("delAllCachedViews");
                commit("delAllVisitedViews");
                resolve(state.visitedViews);
            });
        },
        updateView({commit, state}, view) {
            return new Promise(resolve => {
                commit("updateVisitedView", view);
                resolve(state.visitedViews);
            });
        },
        getAuthority({getters}, name) {
            return new Promise((resolve, reject) => {
                let authority = getters.authorities[name];
                authority ? resolve(authority) : reject();
            });
        }
    },
    modules: {
        CardCatalogPicker: treeModule(),
        DeliveryRegion: treeModule()
    }
});
