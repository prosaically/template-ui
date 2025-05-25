<template>
    <div class="system-help">
        <!-- 菜单树 -->
        <div class="system-help-tree">
            <div class="system-help-tree-head">
                <div class="system-help-tree-head-title">菜单</div>
                <el-button size="mini" type="primary" @click="reload">刷新</el-button>
            </div>

            <el-input v-model="search" class="system-help-tree-search" placeholder="输入关键字进行过滤" clearable>
                <el-button slot="append" icon="el-icon-search" @click="filter" />
            </el-input>

            <el-tree
                :data="trees"
                node-key="id"
                ref="tree"
                highlight-current
                :default-expanded-keys="defaultKeys"
                :current-node-key="currentNode"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                @node-click="nodeClick"
            />
        </div>

        <!-- 功能框 -->
        <div class="system-help-ability">
            <div class="system-help-ability-head">
                <div class="system-help-ability-head-title" v-text="title"></div>
                <el-button size="mini" type="primary" @click="update" v-authority.system-help-update>更新</el-button>
            </div>

            <el-alert
                title="帮助文档的编辑是基于权限菜单的，因此不支持删除和新增子项。"
                type="warning"
                :closable="false"
            />

            <!-- 表单数据 -->
            <div class="system-help-ability-body">
                <RichTextEditor v-if="form" v-model="form.remark" placeholder="敬请发挥你的创作~" />

                <!-- 加载动画 -->
                <div class="system-help-ability-loading" v-if="isLoading" v-loading="true"></div>

                <!-- 没有商品 -->
                <el-empty class="system-help-ability-empty" v-if="isEmpty" description="没有内容喔~" />
            </div>
        </div>
    </div>
</template>

<script>
    import {Tree, Alert, Input, Button, Empty} from "element-ui";
    import RichTextEditor from "@/components/RichTextEditor";
    import {diff, isUndefined, isEmptyObject} from "@/utils";

    export default {
        name: "SystemHelp",
        data() {
            return {
                helpsMapper: {},
                treeMapper: {},
                trees: [],
                search: "",
                nodeId: undefined,
                currentNode: undefined,
                defaultKeys: [],
                form: undefined,
                source: undefined,
                rules: {
                    goodsNum: [
                        {required: true, message: "请输入数量", trigger: "blur"},
                        {pattern: /^-?\d+$/, message: "只能输入整数", trigger: "blur"}
                    ],
                    classId: [{required: true, message: "请选择分类", trigger: "change"}],
                    startDate: [{required: true, message: "请选择日期", trigger: "change"}],
                    times: [
                        {required: true, message: "请输入次数", trigger: "blur"},
                        {pattern: /^[1-9]\d*$/, message: "只能输入正整数", trigger: "blur"}
                    ],
                    interval: [
                        {required: true, message: "请输入间隔", trigger: "blur"},
                        {pattern: /^(0|[1-9]\d*)$/, message: "只能输入整数", trigger: "blur"}
                    ],
                    sort: [
                        {required: true, message: "请输入排序", trigger: "blur"},
                        {pattern: /^-?\d+$/, message: "只能输入整数", trigger: "blur"}
                    ]
                },

                visible: false,
                loading: false,
                leaving: false,
                initial: true,
                history: ""
            };
        },
        computed: {
            title() {
                let node = this.treeMapper[this.nodeId];
                return node ? node.label : "点击菜单选中";
            },
            button() {
                return [1, 2].indexOf(this.mode) > -1;
            },
            disabled() {
                return this.mode === 0;
            },
            isLoading() {
                if (this.source) {
                    return false;
                }
                return this.loading;
            },
            isEmpty() {
                if (this.loading) {
                    return false;
                }
                return isUndefined(this.source);
            }
        },
        watch: {
            $route: {
                handler: function () {
                    if (this.leaving) {
                        return;
                    }
                    this.onload();
                },
                deep: true
            }
        },
        methods: {
            writer() {
                let query = this.$clone(this.$route.query);
                query.search = this.search;
                query.nodeId = this.nodeId;
                query.afresh = Math.random();
                this.$router.replace({path: this.$route.path, query});
            },
            reload() {
                this.trees = [];
                this.helpsMapper = {};
                this.treeMapper = {};
                this.$nextTick(this.onload);
            },
            onload() {
                let {search = "", nodeId} = this.$clone(this.$route.query);
                this.search = search;
                this.nodeId = parseInt(nodeId) ? parseInt(nodeId) : undefined;

                if (this.nodeId) {
                    if (typeof this.currentNode === "undefined") {
                        this.currentNode = this.nodeId;
                    }
                    if (this.defaultKeys.length < 1) {
                        this.defaultKeys = [this.nodeId];
                    }
                }

                if (this.loading) {
                    return;
                }

                let requests = [];
                let handlers = [];
                if (this.trees.length < 1) {
                    requests.push(this.$http.get("/system/helps"));
                    handlers.push(this.convert);
                }

                if (nodeId) {
                    this.form = undefined;
                    this.source = undefined;

                    requests.push(this.$http.get("/system/helps/" + nodeId));
                    handlers.push(response => {
                        let {data: source} = response;
                        this.source = source;
                        this.form = this.$clone(source);
                    });
                }

                this.loading = true;
                Promise.all(requests)
                    .then(responses => responses.forEach((v, i) => handlers[i](v)))
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            convert(response) {
                let {data: helps = []} = response;
                this.trees = [];

                // 数组转MAP
                helps.forEach(v => {
                    let {id, name: label} = v;
                    this.helpsMapper[id] = v;
                    this.treeMapper[id] = {id, label};
                });

                // 关联父类
                helps.forEach(i => {
                    let current = this.treeMapper[i.id];
                    const parent = this.treeMapper[i.parent];
                    if (parent) {
                        parent.children = (parent.children ?? []).concat(current);
                    } else {
                        this.trees.push(current);
                    }
                });
            },
            async filter() {
                let {search, trees} = this;
                let value = search.trim();

                if (value.length < 1) {
                    this.trees = [];
                    this.$nextTick(() => (this.trees = trees));
                } else {
                    this.$refs.tree.filter(value);
                }
                this.writer();
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
            nodeClick(e) {
                this.nodeId = e.id;
                this.$debounce(this.writer, 500);
            },
            update() {
                if (this.loading) {
                    return;
                }

                // 修改检查
                let diffForm = diff(this.source, this.form);
                if (isEmptyObject(diffForm) || diffForm.remark === undefined) {
                    return this.$notify.error({title: "错误", message: "没有可提交的内容~"});
                }

                // 执行请求
                this.loading = true;
                this.$http
                    .put("/system/helps/" + this.nodeId + "?notify=", {remark: diffForm.remark})
                    .then(() => {
                        this.$notify.success({title: "提示", message: "保存成功~"});
                        this.onload();
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            queries() {
                let {fullPath, hash, path, params, query} = this.$route;
                return JSON.stringify({fullPath, hash, path, params, query});
            }
        },
        activated() {
            if (this.initial) {
                return;
            }
            this.leaving = false;
            if (this.queries() === this.history) {
                return;
            }
            this.onload();
        },
        deactivated() {
            this.leaving = true;
        },
        beforeRouteLeave(to, from, next) {
            this.history = this.queries();
            next();
        },
        created() {
            this.initial = false;
            this.onload();
        },
        components: {
            RichTextEditor,
            "el-tree": Tree,
            "el-alert": Alert,
            "el-input": Input,
            "el-button": Button,
            "el-empty": Empty
        }
    };
</script>

<style lang="scss">
    .system-help {
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
            width: 390px;
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
        }

        &-ability {
            position: relative;
            border-left: 1px solid $border-base;
            flex: 1;
            padding: 0 20px 10px 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;

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

            .el-alert {
                flex-shrink: 0;
                margin-top: 8px;
            }

            &-body {
                flex: 1;
                overflow: auto;
                margin-top: 10px;
            }

            &-loading,
            &-empty {
                width: 100%;
                height: 80%;
                min-height: 300px;
            }
        }
    }
</style>
