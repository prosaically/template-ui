<template>
    <div class="flow-form-query">
        <!-- 功能按键 -->
        <div class="flow-form-query-search">
            <el-input v-model="definitionKey" placeholder="请输入键值" clearable>
                <template #prepend>定义键值</template>
            </el-input>
            <el-input v-model="definitionName" placeholder="请输入名称" clearable>
                <template #prepend>定义名称</template>
            </el-input>
            <el-button-group>
                <el-button :loading="loading" v-authority.flow-form-query @click="search">查询</el-button>
                <el-button :loading="loading" v-authority.flow-form-query @click="viewer">查看</el-button>
                <el-button :loading="loading" v-authority.flow-form-add @click="insert">新增</el-button>
                <el-button :loading="loading" v-authority.flow-form-update @click="update">修改</el-button>
                <el-button :loading="loading" v-authority.flow-form-delete @click="remove">删除</el-button>
            </el-button-group>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe height="100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="deploymentTime" label="部署时间" />
            <el-table-column label="校验结构">
                <template #default="{row}">{{ row.validatingSchema ? "校验" : "跳过" }}</template>
            </el-table-column>
        </el-table>

        <!-- 分页插件 -->
        <el-pagination
            background
            layout="total, prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="pageNo"
            @current-change="pageChange"
        />

        <!-- 编辑窗口 -->
        <el-dialog
            custom-class="flow-form-query-form"
            :title="title"
            :visible.sync="dialog"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            top="20vh"
            width="44vw"
        >
            <FlowFormViewer :deployment-id="viewerId" />
        </el-dialog>
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, ButtonGroup, Dialog, Input} from "element-ui";
    import QueryExtend from "@/extends/query-extend";
    import FlowFormViewer from "@/views/flow/form/FlowFormViewer.vue";

    export default {
        name: "FlowFormQuery",
        extends: QueryExtend,
        data() {
            return {
                url: "/flows/form",
                definitionKey: "",
                definitionName: "",

                viewerId: undefined,
                title: "查看表单模型",
                dialog: false
            };
        },
        computed: {
            observes() {
                let {definitionKey, definitionName} = this;
                return {definitionKey, definitionName};
            }
        },
        watch: {},
        methods: {
            viewer() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要查看的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时查看一条喔！"});
                }
                this.viewerId = this.selections[0].id;
                this.dialog = true;
            },
            insert() {
                if (this.loading) {
                    return;
                }
                this.$router.push({name: "flow-form-add"});
            },
            update() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要修改记录~"});
                    return;
                }
                if (this.selections.length > 1) {
                    this.$notify.error({title: "错误", message: "只能选择一条记录喔~"});
                    return;
                }
                let [current] = this.selections;
                let {id: deploymentId} = current;
                this.$router.push({name: "flow-form-update", query: {deploymentId}});
            },
            remove() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要删除记录~"});
                    return;
                }
                this.$confirm("你确定要删除该表单模型吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.loading = true;
                        let requests = this.selections.map(form => {
                            return this.$http.delete("/flows/form/" + form.id);
                        });
                        Promise.allSettled(requests)
                            .then(this.$grouper)
                            .then(results => {
                                if (results.fulfilled.length) {
                                    results.notify.success("删除成功~");
                                    return this.search();
                                }
                                results.notify.error("<br/>");
                            })
                            .finally(() => (this.loading = false));
                    })
                    .catch(() => {});
            },
            cancel() {
                this.dialog = false;
            }
        },
        components: {
            FlowFormViewer,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-button-group": ButtonGroup,
            "el-dialog": Dialog,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .flow-form-query {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 20px;
        overflow: hidden;
        background-color: #fff;

        &-search {
            flex-shrink: 0;
            display: flex;
            flex-wrap: wrap;
            margin: 8px 0 14px 0;
            padding-bottom: 20px;
            border-bottom: 1px solid $border-light;

            .el-input {
                width: auto;
                margin-top: 10px;

                &:not(:last-child) {
                    margin-right: 20px;
                }
            }

            .el-button-group {
                margin-left: auto;
                margin-top: 10px;
            }
        }

        .el-table {
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
        }

        .el-pagination {
            padding-top: 20px;
            flex-shrink: 0;
            text-align: center;
        }

        &-form {
            height: 60vh;
            display: flex;
            flex-direction: column;

            .el-dialog__header {
                flex-shrink: 0;
            }

            .el-dialog__body {
                flex: 1;
                overflow-x: hidden;
                overflow-y: auto;
            }

            .el-dialog__footer {
                flex-shrink: 0;
            }
        }
    }
</style>
