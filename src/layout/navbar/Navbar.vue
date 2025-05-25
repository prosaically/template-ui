<template>
    <div class="navbar">
        <!-- 菜单收缩 -->
        <el-icon class="navbar-menubar" :title="title" :name="icon" @click.native="toggleMenubar" />

        <!-- 面包屑 -->
        <el-breadcrumb class="navbar-breadcrumb" separator="/">
            <el-breadcrumb-item v-for="v in hierarchy" :key="v.key" :to="v.path">
                {{ v.title }}
            </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 菜单搜索 -->
        <div class="navbar-search" title="菜单搜索">
            <el-icon class="navbar-search-icon" name="search" />
            <el-cascader
                class="navbar-search-cascader"
                placeholder="输入关键词搜索菜单"
                filterable
                clearable
                :props="{value: 'authority', label: 'name', children: 'children'}"
                :options="menus"
                @change="search"
            />
        </div>

        <!-- 全屏功能 -->
        <div
            class="navbar-full-screen"
            :class="['eui-icon-' + (isFullScreen ? 'shrink' : 'fullscreen')]"
            title="缩放全屏"
            @click="toggle"
        ></div>

        <!-- 帮助文档 -->
        <router-link to="/guide" class="navbar-help eui-icon-help" title="帮助手册" />

        <!-- 未读通知 -->
        <el-badge :value="unread" :max="9" :hidden="unread < 1" class="navbar-notice">
            <router-link to="/notice" class="el-icon-bell" title="通知中心" />
        </el-badge>

        <!-- 头像组件 -->
        <NavbarAvatar />
    </div>
</template>

<script>
    import {Icon, Breadcrumb, BreadcrumbItem} from "element-ui";
    import {mapMutations, mapState, mapGetters} from "vuex";
    import ScreenFull from "screenfull";
    import NavbarAvatar from "@/layout/navbar/NavbarAvatar.vue";

    export default {
        name: "Navbar",
        data() {
            return {
                hierarchy: [],
                isFullScreen: false,
                unread: 0,
                heartbeat: Date.now()
            };
        },
        computed: {
            ...mapState({
                icon: state => ["s-fold", "s-unfold"][state.menubarCollapse >> 0],
                title: state => ["菜单缩放", "菜单展开"][state.menubarCollapse >> 0]
            }),
            ...mapGetters(["menus", "authorities"])
        },
        watch: {
            $route() {
                this.parser();
            }
        },
        methods: {
            ...mapMutations({toggleMenubar: "toggleMenubarCollapse"}),
            parser() {
                this.hierarchy = this.$route.matched
                    .filter(v => v?.meta?.breadcrumb)
                    .map((v, k) => ({key: "breadcrumb:" + k, path: v.path || "/", title: v.meta.title}));
            },
            keeper() {
                let callback = () => {
                    if (Date.now() - this.heartbeat > 10000) {
                        return;
                    }
                    this.$http
                        .get("/principal/notices/count/unread")
                        .then(response => (this.unread = response.data ?? 0))
                        .catch(() => (this.unread = 0));
                };
                callback();
                setInterval(callback, 10000);
            },
            toggle() {
                if (ScreenFull.isEnabled) {
                    return ScreenFull.toggle();
                }
                this.$message.warning("您的浏览器不支持全屏功能喔~");
            },
            fullScreenChange() {
                this.isFullScreen = ScreenFull.isFullscreen;
            },
            search(e) {
                if (e === undefined || e.length < 1) {
                    return;
                }
                this.$router.push({name: e[e.length - 1]});
            },
            heart() {
                this.heartbeat = Date.now();
            }
        },
        created() {
            this.parser();
            this.keeper();
        },
        mounted() {
            ScreenFull.on("change", this.fullScreenChange);
            document.addEventListener("mouseup", this.heart);
        },
        beforeDestroy() {
            ScreenFull.off("change", this.fullScreenChange);
            document.removeEventListener("mouseup", this.heart);
        },
        components: {
            "el-icon": Icon,
            "el-breadcrumb": Breadcrumb,
            "el-breadcrumb-item": BreadcrumbItem,
            NavbarAvatar
        }
    };
</script>

<style lang="scss" scoped>
    .navbar {
        width: 100%;
        height: 50px;
        overflow: hidden;
        position: relative;
        background: #fff;
        border-bottom: 1px solid $border-base;
        display: flex;
        align-items: center;

        @media print {
            display: none;
        }

        &-menubar {
            width: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 20px;
            color: $text-primary;
            cursor: pointer;
            flex-shrink: 0;
        }

        &-breadcrumb {
            flex-grow: 1;
            flex-shrink: 0;
            flex-basis: auto;
        }

        &-search {
            position: relative;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            padding: 0 10px;

            &-icon {
                cursor: pointer;
                font-weight: bold;
                font-size: 20px;
                color: $text-primary;
                flex-shrink: 0;
            }

            ::v-deep .el-input .el-input__inner {
                border-radius: 0;
                border: 0;
                padding-left: 0;
                padding-right: 0;
                border-bottom: 1px solid $border-base;
            }

            &-cascader {
                width: 210px;
                margin-left: 10px;
            }
        }

        &-full-screen {
            flex-shrink: 0;
            padding: 0 10px;
            font-size: 23px;
            cursor: pointer;
        }

        &-help {
            flex-shrink: 0;
            padding: 0 10px;
            font-size: 25px;
            cursor: pointer;
        }

        &-notice {
            flex-shrink: 0;
            padding: 0 10px;
            font-size: 25px;
            cursor: pointer;

            ::v-deep .el-badge__content {
                top: 10px;
                right: 22px;
            }
        }
    }
</style>
