<template>
    <div class="system-authority">
        <!-- 权限树 -->
        <div class="system-authority-tree">
            <div class="system-authority-tree-head">
                <div class="system-authority-tree-head-title">权限</div>
                <el-button size="mini" @click="add" v-authority.system-authority-add>增加</el-button>
            </div>

            <el-input
                v-model="keyword"
                class="system-authority-tree-search"
                size="small"
                prefix-icon="el-icon-search"
                placeholder="输入关键字进行过滤"
                clearable
            />

            <el-tree
                :data="trees"
                node-key="id"
                ref="tree"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
            >
                <span class="system-authority-tree-node" slot-scope="{node, data}">
                    <span class="system-authority-tree-node-label" v-text="node.label"></span>
                    <span class="system-authority-tree-node-opt">
                        <span
                            class="el-icon-view"
                            title="查看"
                            @click="show(data.id)"
                            v-authority.system-authority-query
                        ></span>
                        <span
                            class="el-icon-plus"
                            title="增加"
                            @click="add(data.id)"
                            v-authority.system-authority-add
                        ></span>
                        <span
                            class="el-icon-edit"
                            title="修改"
                            @click="edit(data.id)"
                            v-authority.system-authority-update
                        ></span>
                        <span
                            class="el-icon-delete"
                            title="删除"
                            @click="remove(data.id)"
                            v-authority.system-authority-delete
                        ></span>
                    </span>
                </span>
            </el-tree>
        </div>

        <!-- 功能框 -->
        <transition name="el-zoom-in-center">
            <div class="system-authority-ability">
                <div class="system-authority-ability-head" v-text="title"></div>
                <el-form
                    class="system-authority-ability-body"
                    ref="form"
                    :model="form"
                    :rules="rules"
                    label-width="88px"
                >
                    <el-form-item label="权限名称" prop="name">
                        <el-input v-model="form.name" placeholder="请输入权限名称" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="权限图标" prop="icon">
                        <InputIconFontPicker v-model="form.icon" placeholder="请选择权限图标" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="权限路径" prop="uri">
                        <el-input v-model="form.uri" placeholder="请输入权限路径" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="权限标识" prop="code">
                        <el-input v-model="form.code" placeholder="请输入权限标识" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="上级权限" v-if="parent">
                        <el-input v-model="parent.name" disabled />
                    </el-form-item>
                    <el-form-item label="排列顺序" prop="sort">
                        <el-input v-model="form.sort" placeholder="请输入排序" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="目录展示" prop="catalog">
                        <el-switch v-model="form.catalog" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="修改时间" v-if="disabled">
                        <el-input v-model="form.latest" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="新增时间" v-if="disabled">
                        <el-input v-model="form.inTime" :disabled="disabled" />
                    </el-form-item>
                    <el-form-item v-if="button">
                        <el-button type="primary" @click="validate">立即保存</el-button>
                        <el-button @click="reset">复位</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </transition>
    </div>
</template>

<script>
    import {Tree, Form, FormItem, Input, Switch, Button} from "element-ui";
    import InputIconFontPicker from "../../components/InputIconFontPicker";
    import {diff, isEmptyObject} from "@/utils/index.js";

    export default {
        name: "SystemPermission",
        data() {
            return {
                permissionsMapper: {},
                treeMapper: {},
                trees: [],
                mode: 1,
                source: undefined,
                form: this.defaultForm(),
                parent: undefined,
                keyword: "",
                rules: {
                    name: [
                        {required: true, message: "请您输入权限名称", trigger: "blur"},
                        {min: 2, max: 8, message: "长度在2到8个字符", trigger: "blur"}
                    ],
                    icon: [{required: true, message: "请选择权限图标", trigger: "change"}],
                    code: [
                        {required: true, message: "请输入权限标识", trigger: "blur"},
                        {min: 2, max: 99, message: "长度在2到99个字符", trigger: "blur"},
                        {
                            pattern: /^[a-zA-Z]+(-[a-zA-Z]+)*$/,
                            message: "由半角字母组成，用 - 分隔",
                            trigger: "blur"
                        }
                    ],
                    sort: [{pattern: /^-?[0-9]+$/, message: "仅支持整数", trigger: "blur"}]
                }
            };
        },
        computed: {
            title() {
                return {
                    0: "查看权限",
                    1: "增加权限",
                    2: "修改权限"
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
            keyword() {
                this.$debounce(this.search, 500);
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/authorities")
                    .then(this.convert)
                    .catch(() => {});
            },
            convert(response) {
                let {data: permissions = []} = response;
                this.trees = [];

                // 数组转MAP
                permissions.forEach(v => {
                    let {id, name: label} = v;
                    this.permissionsMapper[id] = v;
                    this.treeMapper[id] = {id, label};
                });

                // 关联父类
                permissions.forEach(i => {
                    let current = this.treeMapper[i.id];
                    let parent = this.treeMapper[i.parent];
                    current.parent = parent;
                    if (parent) {
                        parent.children = (parent.children ?? []).concat(current);
                    } else {
                        this.trees.push(current);
                    }
                });
            },
            show(id) {
                this.reset();
                this.mode = 0;
                this.form = this.permissionsMapper[id];
                this.parent = this.permissionsMapper[this.form.parent];
            },
            add(id) {
                this.reset();
                this.mode = 1;
                this.source = undefined;
                this.form = this.defaultForm();
                this.parent = this.permissionsMapper[id];

                // 设置父级
                if (this.parent) {
                    this.form.parent = this.parent.id;
                    this.form.code = this.parent.code + "-";
                }
            },
            edit(id) {
                this.reset();
                this.mode = 2;
                this.source = this.permissionsMapper[id];
                this.form = this.$clone(this.source);
                this.parent = this.permissionsMapper[this.form.parent];
            },
            remove(id) {
                this.$confirm("你确定要删除该权限项吗？将会删除当前权限项和子权限项喔~", "重要提示", {type: "warning"})
                    .then(() => {
                        this.$http
                            .delete("/system/authorities/" + id + "?notify=")
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
                    icon: "",
                    uri: "",
                    code: "",
                    parent: 0,
                    sort: 0,
                    catalog: false,
                    latest: undefined,
                    inTime: undefined
                };
            },
            search() {
                if (this.keyword) {
                    return this.$refs.tree.filter(this.keyword);
                }
                let trees = this.trees;
                this.trees = [];
                this.$nextTick(() => (this.trees = trees));
            },
            filterNode(value, data) {
                // 空值或匹配
                if (value === undefined) {
                    return true;
                }

                // 匹配父节点
                let current = data;
                do {
                    if (current.label.indexOf(value) > -1) {
                        return true;
                    }
                    current = current.parent;
                } while (current);
                return false;
            },
            validate() {
                this.$refs.form.validate(valid => valid && this.submit());
            },
            submit() {
                let diffForm = diff(this.source, this.form);
                if (isEmptyObject(diffForm)) {
                    return this.$notify.error("没有可提交的内容~");
                }
                let http = {
                    1: () => this.$http.post("/system/authorities?notify=", diffForm),
                    2: () => this.$http.put("/system/authorities/" + this.form.id + "?notify=", diffForm)
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
            InputIconFontPicker,
            "el-tree": Tree,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-switch": Switch,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .system-authority {
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
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                &-opt {
                    flex-shrink: 0;
                    width: 0;
                    transition: width 0.6s;
                    white-space: nowrap;
                    overflow: hidden;

                    span {
                        font-size: 16px;
                        color: $text-primary;
                        padding: 6px;

                        &:hover {
                            color: $color-primary;
                        }
                    }
                }

                &:hover .system-authority-tree-node-opt {
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
