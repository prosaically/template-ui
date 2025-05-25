<template>
    <el-dialog
        class="icon-font-picker"
        title="图标选择器"
        :visible.sync="visible"
        append-to-body
        top="25vh"
        width="48vw"
    >
        <el-collapse v-model="active">
            <el-collapse-item :title="v.name" :name="v.name" v-for="v in group" :key="v.name">
                <div class="icon-font-picker-icons" @click="click">
                    <i :class="icon" :data-val="icon" v-for="icon in v.icons" :key="icon"></i>
                </div>
            </el-collapse-item>
        </el-collapse>
    </el-dialog>
</template>

<script>
    import {Dialog, Collapse, CollapseItem} from "element-ui";

    export default {
        name: "IconFontPicker",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                paths: [
                    {
                        name: "自定义图标库",
                        path: require("!../assets/icon/iconfont.css?asset=resource"),
                        regexp: /\.eui-icon-(.+?):before/gi
                    },
                    {
                        name: "Element 图标",
                        path: require("!element-ui/lib/theme-chalk/icon.css?asset=resource"),
                        regexp: /\.el-icon-(.+?):before/gi
                    }
                ],
                group: [],
                active: ""
            };
        },
        computed: {
            visible: {
                set(val) {
                    this.$emit("input", val);
                },
                get() {
                    return this.value;
                }
            }
        },
        methods: {
            onload() {
                let config = {baseURL: this.$origin(), responseType: "text"};
                let gets = this.paths.map(i => this.$http.get(i.path, config));
                Promise.all(gets)
                    .then(results => {
                        this.group = results.map((v, i) => {
                            let {data = ""} = v;
                            let {name, regexp} = this.paths[i];
                            let icons = data.match(regexp).map(key => key.substring(1, key.length - 7));
                            return {name, icons};
                        });
                    })
                    .catch(() => (this.group = []));
            },
            click(e) {
                let {val} = e.target.dataset;
                if (val) {
                    this.visible = false;
                    this.$emit("choose", val);
                }
            }
        },
        created() {
            this.onload();
        },
        components: {"el-dialog": Dialog, "el-collapse": Collapse, "el-collapse-item": CollapseItem}
    };
</script>

<style lang="scss">
    .icon-font-picker {
        .el-dialog {
            height: 50vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            &__header {
                flex-shrink: 0;
            }

            &__body {
                flex: 1;
                overflow-y: auto;
            }
        }

        &-icons {
            display: flex;
            flex-wrap: wrap;

            i {
                width: 44px;
                height: 44px;
                line-height: 44px;
                text-align: center;
                font-size: 30px;
                cursor: pointer;

                &:hover {
                    color: $color-primary;
                }
            }
        }
    }
</style>
