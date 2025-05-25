import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

// 路由列表：写法请参与README.md
const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/redirect/:path(.*)",
            name: "Redirect",
            meta: {requireAuth: false, title: process.env.VUE_APP_TITLE, breadcrumb: false},
            component: () => import("@/views/Redirect.vue")
        },
        {
            path: "/login",
            name: "Login",
            meta: {requireAuth: false, title: "欢迎登录", breadcrumb: false},
            component: () => import("@/views/Login.vue"),
            beforeEnter: (to, from, next) => {
                if (Date.now() - (to.query?.tried >> 0) < 5000) {
                    next();
                    return;
                }
                router.app
                    .$initialize()
                    .then(() => next({path: "/", replace: true}))
                    .catch(() => next());
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (router.app.$store.getters.isCertified) {
        next();
        return;
    }

    if (to.matched.length < 1 || to.matched.some(r => r.meta.requireAuth)) {
        router.app
            .$initialize()
            .then(() => next({...to, replace: true}))
            .catch(() => next({query: {redirect: to.fullPath, tried: Date.now()}, name: "Login"}));
        return;
    }

    next();
});

// 最终守卫
router.beforeResolve((to, from, next) => {
    // 设置 title
    document.title = to.meta.title;

    next();
});

export default router;
