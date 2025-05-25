<template>
    <div class="flow-instance-query">
        <!-- 功能按键 -->
        <div class="flow-instance-query-search">
            <el-input v-model="definitionKey" placeholder="请输入名称" clearable>
                <template #prepend>流程键值</template>
            </el-input>
            <el-input v-model="definitionName" placeholder="请输入名称" clearable>
                <template #prepend>流程名称</template>
            </el-input>
            <el-select v-model="state" placeholder="请选择状态" clearable>
                <el-option
                    v-for="(value, key) in $consts.HISTORIC_PROCESS_INSTANCE"
                    :key="key"
                    :label="value"
                    :value="key"
                />
            </el-select>
            <el-button :loading="loading" @click="search" v-authority.flow-instance-query>查询</el-button>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="90" />
            <el-table-column prop="processDefinitionName" label="流程名称" />
            <el-table-column prop="processDefinitionVersion" label="流程版本" width="80" />
            <el-table-column label="状态" width="90">
                <template #default="{row}">{{ $consts.HISTORIC_PROCESS_INSTANCE[row.state] }}</template>
            </el-table-column>
            <el-table-column label="耗时">
                <template #default="{row}">{{ duration(row.durationInMillis) }}</template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160" />
            <el-table-column prop="deleteReason" label="撤消说明" />
        </el-table>

        <!-- 分页插件 -->
        <div class="flow-instance-query-footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button type="primary" @click="viewer" v-authority.flow-instance-query>查看</el-button>
            <el-button type="danger" @click="revoke" v-authority.flow-instance-cancel>撤消</el-button>
            <el-button type="warning" @click="suspend" v-authority.flow-instance-suspend>挂起</el-button>
            <el-button type="success" @click="activate" v-authority.flow-instance-activate>激活</el-button>
        </div>

        <!-- 查看组件 -->
        <FlowInstanceViewer v-model="visible" :process-instance-id="processInstanceId" />
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, Input, Select, Option} from "element-ui";
    import QueryExtend from "@/extends/query-extend.js";
    import {duration} from "@/utils";
    import FlowInstanceViewer from "@/views/flow/instance/FlowInstanceViewer.vue";

    export default {
        name: "FlowInstanceQuery",
        extends: QueryExtend,
        data() {
            return {
                url: "/flows/instances",
                definitionKey: "",
                definitionName: "",
                state: "",

                processInstanceId: undefined
            };
        },
        computed: {
            observes() {
                let {definitionKey, definitionName, state} = this;
                return {definitionKey, definitionName, state};
            }
        },
        methods: {
            success({data}) {
                let {records = [], total = 0, size, current} = data ?? {};
                this.total = total;
                this.pageSize = size ?? this.pageSize;
                this.pageNo = current ?? this.pageNo;
                this.records = records;
            },
            viewer() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要查看的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时查看一条喔！"});
                }
                this.processInstanceId = this.selections[0].id;
                this.visible = true;
            },
            revoke() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要撤消的流程喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时撤消一条喔！"});
                }
                let {id} = this.selections[0];
                this.$prompt("流程实例撤消后无法恢复，您确定吗？", "提示", {
                    inputPattern: /.{4,}/,
                    inputErrorMessage: "撤消原因不能少于4个字符",
                    inputPlaceholder: "请输入撤消原因",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === "close" || action === "cancel") {
                            done();
                            return;
                        }
                        instance.cancelButtonLoading = instance.confirmButtonLoading = true;
                        this.$http
                            .delete("/flows/instances/" + id + "?notify=", {data: {reason: instance.inputValue}})
                            .then(() => {
                                this.$notify.success({title: "成功", message: "您的流程实例已撤消"});
                                this.onload();
                            })
                            .catch(() => {})
                            .finally(() => {
                                instance.cancelButtonLoading = instance.confirmButtonLoading = false;
                                done();
                            });
                    }
                }).catch(() => {});
            },
            suspend() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要挂起流程实例~"});
                    return;
                }
                this.$confirm("你确定要挂起流程实例吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.loading = true;
                        let requests = this.selections.map(form => {
                            return this.$http.post("/flows/instances/" + form.id + "/suspend");
                        });
                        Promise.allSettled(requests)
                            .then(this.$grouper)
                            .then(results => {
                                if (results.fulfilled.length) {
                                    results.notify.success("挂起成功~");
                                    return this.search();
                                }
                                results.notify.error("<br/>");
                            })
                            .finally(() => (this.loading = false));
                    })
                    .catch(() => {});
            },
            activate() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要激活流程实例~"});
                    return;
                }
                this.$confirm("你确定要激活流程实例吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.loading = true;
                        let requests = this.selections.map(form => {
                            return this.$http.post("/flows/instances/" + form.id + "/activate");
                        });
                        Promise.allSettled(requests)
                            .then(this.$grouper)
                            .then(results => {
                                if (results.fulfilled.length) {
                                    results.notify.success("激活成功~");
                                    return this.search();
                                }
                                results.notify.error("<br/>");
                            })
                            .finally(() => (this.loading = false));
                    })
                    .catch(() => {});
            },
            duration
        },
        components: {
            FlowInstanceViewer,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-input": Input,
            "el-select": Select,
            "el-option": Option
        }
    };
</script>

<style lang="scss">
    .flow-instance-query {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 0 20px 20px 20px;
        overflow: hidden;
        background-color: #fff;

        &-search {
            flex-shrink: 0;
            display: flex;
            flex-wrap: wrap;
            margin: 8px 0 14px 0;
            padding-bottom: 20px;
            border-bottom: 1px solid $border-light;

            > div {
                width: auto;
                margin-top: 10px;
                margin-right: 10px;
            }

            .el-button {
                margin-top: 10px;
                margin-left: auto;
            }
        }

        .el-table {
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
        }

        &-footer {
            padding-top: 20px;
            flex-shrink: 0;
            display: flex;
            align-items: center;

            .el-pagination {
                flex-shrink: 0;
            }

            .el-pagination + .el-button {
                margin-left: auto;
            }
        }
    }
</style>
