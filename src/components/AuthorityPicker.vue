<template>
    <el-dialog custom-class="authority-picker" title="分类选择器" :visible.sync="visible" width="50vw">
        <el-input
            class="authority-picker-search"
            size="small"
            prefix-icon="el-icon-search"
            placeholder="输入关键字进行过滤"
            v-model="search"
        />

        <el-tree
            :data="trees"
            node-key="id"
            ref="tree"
            show-checkbox
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
        />

        <span slot="footer" class="authority-picker-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="confirm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import {Tree, Button, Input, Dialog} from "element-ui";

    export default {
        name: "AuthorityPicker",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: Boolean,
                default: false
            },
            defaults: {
                type: Array,
                default: () => []
            },
            radio: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                search: "",
                authorities: [],
                authoritiesMapper: {},
                treeMapper: {},
                trees: []
            };
        },
        computed: {
            visible: {
                set(v) {
                    this.$emit("input", v);
                },
                get() {
                    return this.value;
                }
            }
        },
        watch: {
            search(val) {
                this.$refs.tree.filter(val);
            },
            defaults: {
                handler: function () {
                    this.initialize();
                },
                deep: true
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/authorities/options")
                    .then(this.convert)
                    .catch(() => {});
            },
            convert(response) {
                this.authorities = response.data;
                this.trees = [];

                // 数组转MAP
                this.authorities.forEach(v => {
                    let {id, name: label} = v;
                    this.authoritiesMapper[id] = v;
                    this.treeMapper[id] = {id, label};
                });

                // 关联父类
                this.authorities.forEach(i => {
                    let current = this.treeMapper[i.id];
                    const parent = this.treeMapper[i.parent];
                    if (parent) {
                        parent.children = (parent.children || []).concat(current);
                    } else {
                        this.trees.push(current);
                    }
                });

                // 设置默选
                this.initialize();
            },
            filterNode(value, data) {
                if (value) {
                    return data.label.indexOf(value) > -1;
                }
                return true;
            },
            initialize() {
                this.$refs.tree &&
                    this.$nextTick(() => {
                        this.$refs.tree.setCheckedKeys(this.defaults);
                    });
            },
            cancel() {
                this.visible = false;
                this.$emit("cancel", []);
            },
            confirm() {
                let nodes = this.$refs.tree.getCheckedNodes(true, false).map(v => v.id);

                // 单选判断
                if (this.radio && nodes.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能选一个节点喔~"});
                }

                // 抛出事件
                nodes = nodes.map(m => {
                    let {id, name, code} = this.authoritiesMapper[m];
                    return {id, name, code};
                });
                this.$emit("confirm", nodes);

                // 关闭窗口
                this.visible = false;
            }
        },
        created() {
            this.onload();
        },
        components: {
            "el-tree": Tree,
            "el-button": Button,
            "el-input": Input,
            "el-dialog": Dialog
        }
    };
</script>

<style lang="scss">
    .authority-picker {
        height: 68vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &-search {
            flex-shrink: 0;
            margin-bottom: 20px;
        }

        .el-dialog__body {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }

        .el-tree {
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .el-dialog__header,
        .el-dialog__footer {
            flex-shrink: 0;
        }
    }
</style>
