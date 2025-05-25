<template>
    <div class="layout">
        <LayoutMenu :class="{'layout-iframe': isIframe}" />
        <div class="layout-container">
            <div class="layout-container-header" :class="{'layout-iframe': isIframe}">
                <Navbar />
                <LayoutTabs />
            </div>
            <div class="layout-container-content">
                <transition name="fade-transform" mode="out-in">
                    <keep-alive :include="cachedViews">
                        <router-view :key="key" />
                    </keep-alive>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import Navbar from "@/layout/navbar/Navbar.vue";
    import LayoutMenu from "@/layout/LayoutMenu.vue";
    import LayoutTabs from "@/layout/LayoutTabs.vue";
    import {mapState} from "vuex";

    export default {
        name: "Layout",
        data() {
            return {
                isIframe: false
            };
        },
        components: {
            Navbar,
            LayoutMenu,
            LayoutTabs
        },
        computed: {
            ...mapState({
                cachedViews: state => state.cachedViews
            }),
            key() {
                return this.$route.path;
            }
        },
        methods: {
            isIframeView() {
                return window.self !== window.top;
            }
        },
        watch: {
            $route() {
                this.isIframe = this.isIframeView();
            }
        },
        created() {
            this.isIframe = this.isIframeView();
        }
    };
</script>

<style lang="scss">
    .layout {
        height: 100%;
        width: 100%;
        display: flex;
        overflow: hidden;

        &-iframe {
            width: 0;
            height: 0;
            overflow: hidden;
        }

        &-container {
            flex: 1;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;

            &-header {
                width: 100%;
                flex-shrink: 0;
                position: relative;
            }

            &-content {
                flex: 1;
                overflow-x: hidden;
                overflow-y: auto;
                position: relative;
                overflow-scrolling: touch;
                -webkit-overflow-scrolling: touch;
                background-color: $background-color;

                // 隐藏滚动条
                scrollbar-width: none;
                -ms-overflow-style: none;

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }
    }
</style>
