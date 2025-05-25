<template>
    <div class="layout-tabs">
        <div
            v-for="v in views"
            :key="v.path"
            class="layout-tabs-item"
            :class="{'layout-tabs-active': isActive(v)}"
            @click.prevent.stop="toCurrent(v, $event)"
            @contextmenu.prevent="openMenu(v, $event)"
        >
            {{ v.meta.title }}
            <span v-if="v.meta.closable" class="layout-tabs-item-close" @click.stop.prevent="close(v)">×</span>
        </div>

        <div v-show="visible" :style="{left: left + 'px', top: top + 'px'}" class="layout-tabs-menus">
            <div v-if="isClosable(selected)" @click="close(selected)">关闭</div>
            <div v-if="isClosable(selected)" @click="refresh">刷新</div>
            <div @click="closeOthers">关闭其它</div>
            <div @click="closeAll">关闭所有</div>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations, mapActions} from "vuex";

    export default {
        name: "LayoutTabs",
        data() {
            return {
                visible: false,
                top: 0,
                left: 0,
                selected: {}
            };
        },
        computed: mapState({
            views: state => state.visitedViews
        }),
        watch: {
            $route(nv, ov) {
                this.addTags();
                this.updateView(ov);
            }
        },
        methods: {
            ...mapMutations(["delCachedView"]),
            ...mapActions(["addView", "delView", "delOthersViews", "delAllViews", "updateView"]),
            isActive(route) {
                return route.path === this.$route.path;
            },
            isClosable(tag) {
                return tag.meta?.closable;
            },
            toCurrent(tag) {
                const {path, query, params, fullPath} = tag;
                if (fullPath === this.$route.fullPath) {
                    return;
                }
                this.$router.push({path, query, params});
                this.$nextTick(() => this.updateView(this.$route));
            },
            addTags() {
                this.$route.name && this.addView(this.$route);
            },
            close(view) {
                this.delView(view).then(views => this.isActive(view) && this.toLastView(views));
            },
            refresh() {
                this.delCachedView(this.selected);
                const {fullPath} = this.selected;
                this.$nextTick(() => {
                    this.$router.replace({path: "/redirect" + fullPath});
                });
            },
            closeOthers() {
                this.delOthersViews(this.selected).then(() => this.toCurrent(this.selected));
            },
            closeAll() {
                this.delAllViews().then(this.toLastView);
            },
            toLastView(views) {
                const {fullPath} = views[views.length - 1] ?? {fullPath: "/"};
                this.$router.push(fullPath);
            },
            openMenu(tag, e) {
                const {clientX, clientY, menuWidth = 106} = e;
                const {left: rootLeft, top} = this.$el.getBoundingClientRect();
                const boundary = this.$el.offsetWidth - menuWidth;
                const left = clientX - rootLeft;

                if (left > boundary) {
                    this.left = boundary;
                } else {
                    this.left = left;
                }

                this.top = clientY - top;
                this.visible = true;
                this.selected = tag;
            },
            closeMenu() {
                this.visible = false;
            }
        },
        mounted() {
            this.addTags();
            window.addEventListener("click", this.closeMenu);
        },
        beforeDestroy() {
            window.removeEventListener("click", this.closeMenu);
        }
    };
</script>

<style lang="scss" scoped>
    .layout-tabs {
        flex-shrink: 0;
        padding: 10px;
        background: #fff;
        border-bottom: 1px solid $border-base;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        position: relative;

        @media print {
            display: none;
        }

        &-item {
            border: 1px solid $border-base;
            border-radius: 0;
            height: 28px;
            display: flex;
            align-items: center;
            user-select: none;
            padding: 0 6px;
            font-size: 14px;
            flex-shrink: 0;

            &:hover {
                cursor: pointer;
                color: $color-primary;
                border-color: $color-primary;
            }

            &-close {
                margin-left: 6px;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                font-size: 14px;

                &:hover {
                    background-color: $text-placeholder;
                    border-radius: 50%;
                    color: #fff;
                }
            }
        }

        &-active {
            color: $color-primary;
            border-color: $color-primary;
        }

        &-menus {
            background: #fff;
            z-index: $z-index-middle;
            position: absolute;
            padding: 5px 0;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 400;
            color: $text-primary;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.5);

            div {
                padding: 7px 16px;
                cursor: pointer;
                text-align: justify;
                text-align-last: justify;

                &:hover {
                    background: #eee;
                }
            }
        }
    }
</style>
