<template>
    <div class="system-group">
        <!-- 分组树 -->
        <div class="system-group-tree">
            <div class="system-group-tree-head">
                <div class="system-group-tree-head-title">分组</div>
                <el-button size="mini" @click="add">增加</el-button>
            </div>

            <el-input
                class="system-group-tree-search"
                size="small"
                prefix-icon="el-icon-search"
                placeholder="输入关键字进行过滤"
                v-model="search"
            />

            <el-tree
                :data="trees"
                node-key="id"
                ref="tree"
                default-expand-all
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
            >
                <span class="system-group-tree-node" slot-scope="{node, data}">
                    <span class="system-group-tree-node-label" v-text="node.label"></span>
                    <span class="system-group-tree-node-opt" :data-id="data.id">
                        <el-icon name="view" title="查看" @click.native="show" v-authority.system-group-query />
                        <el-icon name="plus" title="增加" @click.native="add" v-authority.system-group-add />
                        <el-icon name="edit" title="修改" @click.native="edit" v-authority.system-group-update />
                        <el-icon name="delete" title="删除" @click.native="remove" v-authority.system-group-delete />
                    </span>
                </span>
            </el-tree>
        </div>

        <!-- 功能框 -->
        <div class="system-group-ability">
            <div class="system-group-ability-head" v-text="title"></div>
            <el-form class="system-group-ability-body" ref="form" :model="form" :rules="rules" label-width="88px">
                <el-form-item label="分组编号" v-if="form.id">
                    <el-input v-model="form.id" disabled />
                </el-form-item>
                <el-form-item label="分组名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入分组名称" :disabled="disabled" />
                </el-form-item>
                <el-form-item label="分组描述" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入分组描述" :disabled="disabled" />
                </el-form-item>
                <el-form-item label="上级分组" v-if="parent">
                    <el-input v-model="parent.name" disabled />
                </el-form-item>
                <el-form-item label="分组领导">
                    <OperatorPicker v-model="form.leaderId" :disabled="disabled" />
                </el-form-item>
                <el-form-item label="更新时间" v-if="form.latest">
                    <el-input v-model="form.latest" disabled />
                </el-form-item>
                <el-form-item label="新增时间" v-if="form.inTime">
                    <el-input v-model="form.inTime" disabled />
                </el-form-item>
                <el-form-item v-if="button">
                    <el-button type="primary" @click="validate">立即保存</el-button>
                    <el-button @click="reset">复位</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import {Icon, Tree, Form, FormItem, Input, Button} from "element-ui";
    import OperatorPicker from "@/components/OperatorPicker";

    export default {
        name: "SystemGroup",
        data() {
            return {
                groups: [],
                groupsMapper: {},
                treeMapper: {},
                trees: [],
                mode: 1,
                form: this.defaultForm(),
                parent: undefined,
                search: "",
                rules: {
                    name: [
                        {required: true, message: "请您输入分组名称", trigger: "blur"},
                        {min: 2, max: 20, message: "长度在2到20个字符", trigger: "blur"}
                    ]
                }
            };
        },
        computed: {
            title() {
                return {
                    0: "查看分组",
                    1: "增加分组",
                    2: "修改分组"
                }[this.mode];
            },
            button() {
                return [1, 2].indexOf(this.mode) > -1;
            },
            disabled() {
                return this.mode === 0;
            }
        },
        watch: {
            search(val) {
                this.$refs.tree.filter(val);
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/groups")
                    .then(this.convert)
                    .catch(() => {});
            },
            convert(response) {
                let {data: groups = []} = response;
                this.groups = groups;
                this.trees = [];

                // 数组转MAP
                this.groups.forEach(v => {
                    let {id, name: label} = v;
                    this.groupsMapper[id] = v;
                    this.treeMapper[id] = {id, label};
                });

                // 关联父类
                this.groups.forEach(i => {
                    let current = this.treeMapper[i.id];
                    const parent = this.treeMapper[i.parent];
                    if (parent) {
                        parent.children = (parent.children || []).concat(current);
                    } else {
                        this.trees.push(current);
                    }
                });
            },
            show(e) {
                let {id} = e.target.parentNode.dataset;
                this.reset();
                this.mode = 0;
                this.form = this.groupsMapper[id];
                this.parent = this.groupsMapper[this.form.parent];
            },
            add(e) {
                let {id} = e.target.parentNode.dataset;
                this.reset();
                this.mode = 1;
                this.form = this.defaultForm();
                this.parent = this.groupsMapper[id];

                // 设置父级
                if (this.parent) {
                    this.form.parent = this.parent.id;
                }
            },
            edit(e) {
                let {id} = e.target.parentNode.dataset;
                this.reset();
                this.mode = 2;
                this.form = this.groupsMapper[id];
                this.parent = this.groupsMapper[this.form.parent];
            },
            remove(e) {
                let {id} = e.target.parentNode.dataset;
                this.$confirm("你确定要删除该分组项吗？将会删除当前分组项和子分组项喔~", "重要提示", {type: "warning"})
                    .then(() => {
                        this.$http
                            .delete("/system/groups/" + id + "?notify=")
                            .then(() => {
                                this.$notify.success({title: "提示", message: "删除成功~"});
                                this.onload();
                                this.reset();
                            })
                            .catch(() => {});
                    })
                    .catch(() => {});
            },
            reset() {
                this.mode = 1;
                this.form = this.defaultForm();
                this.parent = undefined;
            },
            defaultForm() {
                return {
                    id: undefined,
                    name: "",
                    parent: 0,
                    leaderId: undefined,
                    inTime: undefined,
                    remark: ""
                };
            },
            filterNode(value, data) {
                if (value) {
                    return data.label.indexOf(value) > -1;
                }
                return true;
            },
            validate() {
                this.$refs.form.validate(valid => valid && this.submit());
            },
            submit() {
                let http = {
                    1: () => this.$http.post("/system/groups?notify=", this.form),
                    2: () => this.$http.put("/system/groups/" + this.form.id + "?notify=", this.form)
                }[this.mode];
                http()
                    .then(() => {
                        this.$notify.success({title: "提示", message: "保存成功~"});
                        this.onload();
                        this.reset();
                    })
                    .catch(() => {});
            }
        },
        created() {
            this.onload();
        },
        components: {
            OperatorPicker,
            "el-icon": Icon,
            "el-tree": Tree,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .system-group {
        width: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        padding: 20px;
        height: 100%;
        overflow: hidden;
        background-color: #fff;

        &-tree {
            padding: 0 10px 10px 10px;
            width: 420px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;

            &-head {
                height: 44px;
                display: flex;
                align-items: center;
                flex-shrink: 0;

                &-title {
                    flex: 1;
                    color: $text-primary;
                    font-size: 16px;
                    font-weight: bold;
                }
            }

            &-search {
                margin-top: 8px;
                margin-bottom: 14px;
                flex-shrink: 0;
            }

            .el-tree {
                flex: 1;
                overflow-y: auto;

                &-node {
                    &__content {
                        height: 30px;
                        font-size: 14px;
                    }

                    &__expand-icon {
                        font-size: 14px;
                        padding: 8px;
                    }
                }
            }

            &-node {
                flex: 1;
                overflow: hidden;
                display: flex;
                align-items: center;
                padding-right: 8px;

                &-label {
                    flex: 1;
                    color: $text-primary;
                }

                &-opt {
                    flex-shrink: 0;
                    width: 0;
                    transition: width 0.6s;
                    white-space: nowrap;
                    overflow: hidden;

                    [class*=" el-icon-"],
                    [class^="el-icon-"] {
                        font-size: 16px;
                        color: $text-primary;
                        padding: 6px;

                        &:hover {
                            color: $color-primary;
                        }
                    }
                }

                &:hover .system-group-tree-node-opt {
                    width: 120px !important;
                    transition: width 0.6s;
                }
            }
        }

        &-ability {
            position: relative;
            border-left: 1px solid $border-base;
            flex: 1;
            padding: 0 20px 10px 20px;
            display: flex;
            flex-direction: column;

            &-head {
                height: 44px;
                line-height: 44px;
                color: $text-primary;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                flex-shrink: 0;
            }

            &-body {
                background-color: $background-color;
                border-radius: 6px;
                padding: 20px;
                max-height: 100%;
                overflow-y: auto;

                .el-input.is-disabled .el-input__inner {
                    background-color: #fff;
                    color: $text-secondary;
                }
            }
        }
    }
</style>
