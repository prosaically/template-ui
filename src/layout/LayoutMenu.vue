<script>
    import {Menu, Submenu, MenuItem} from "element-ui";
    import {mapGetters} from "vuex";
    import mascot from "@/assets/img/mascot.jpg";

    export default {
        name: "LayoutMenu",
        data() {
            return {
                active: ""
            };
        },
        computed: mapGetters(["isCollapse", "menus"]),
        watch: {
            $route() {
                this.active = this.$route.name;
            }
        },
        created() {
            this.active = this.$route.name;
        },
        components: {
            "el-menu": Menu,
            "el-menu-item": MenuItem,
            "el-submenu": Submenu
        },
        render(createElement) {
            let {isCollapse: collapse, active: defaultActive, menus} = this;
            const builder = buildNode => {
                let {children = [], code: index, icon, name, uri: path} = buildNode;
                if (children.length) {
                    return createElement("el-submenu", {props: {index}}, [
                        createElement("template", {slot: "title"}, [
                            createElement("i", {class: icon}),
                            createElement("span", {}, name)
                        ]),
                        ...children.map(builder)
                    ]);
                }
                return createElement("el-menu-item", {props: {index, route: {path}}}, [
                    createElement("i", {class: icon}),
                    createElement("span", {slot: "title"}, name)
                ]);
            };

            return createElement("div", {class: {"layout-menu": true, "layout-menu-close": collapse}}, [
                createElement("div", {class: "layout-menu-logo"}, [
                    createElement("img", {class: "layout-menu-logo-img", attrs: {src: mascot}}),
                    createElement("div", {class: "layout-menu-logo-txt"}, process.env.VUE_APP_TITLE)
                ]),
                createElement(
                    "el-menu",
                    {
                        class: "layout-menu-container",
                        props: {
                            router: true,
                            defaultActive,
                            collapse,
                            collapseTransition: false,
                            textColor: "#fff",
                            activeTextColor: "#ffd04b",
                            backgroundColor: "#545c64"
                        }
                    },
                    menus.map(builder)
                )
            ]);
        }
    };
</script>

<style lang="scss">
    .layout-menu {
        flex-shrink: 0;
        width: 240px;
        height: 100%;
        transition: width 0.6s;
        display: flex;
        flex-direction: column;

        @media print {
            display: none;
        }

        &-close {
            width: 64px;
        }

        .el-menu {
            border-right: 0;
        }

        &-logo {
            flex-shrink: 0;
            width: 100%;
            display: flex;
            align-items: center;
            height: 50px;
            border-bottom: 1px solid $text-secondary;
            color: #fff;
            overflow: hidden;
            background-color: #545c64;

            &-img {
                width: 64px;
                height: 50px;
                padding: 8px 15px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            &-txt {
                flex-grow: 1;
                flex-shrink: 0;
                font-size: 14px;
            }
        }

        &-container {
            width: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            flex: 1;
            overflow-scrolling: touch;
            -webkit-overflow-scrolling: touch;

            // 隐藏滚动条
            scrollbar-width: none;
            -ms-overflow-style: none;
            &::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .el-menu [class^="eui-icon-"] {
        vertical-align: middle;
        margin-right: 5px;
        width: 24px;
        text-align: center;
        font-size: 18px;
    }
</style>
