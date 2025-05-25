<template>
    <div class="work-own-query">
        <!-- 功能按键 -->
        <div class="work-own-query-search">
            <el-input v-model="definitionName" placeholder="请输入名称" clearable>
                <template #prepend>流程名称</template>
            </el-input>
            <el-button :loading="loading" @click="search" v-authority.work-own-query>查询</el-button>
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
        <div class="work-own-query-footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button type="primary" @click="viewer" v-authority.work-own-query>查看</el-button>
            <el-button type="primary" @click="update" v-authority.work-own-update>修改</el-button>
        </div>

        <!-- 查看组件 -->
        <WorkOwnViewer v-model="visible" :process-instance-id="processInstanceId" />
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, Input} from "element-ui";
    import QueryExtend from "@/extends/query-extend.js";
    import {duration} from "@/utils";
    import WorkOwnViewer from "@/views/work/own/WorkOwnViewer.vue";

    export default {
        name: "WorkOwnQuery",
        extends: QueryExtend,
        data() {
            return {
                url: "/works/owns",
                definitionName: "",

                processInstanceId: undefined
            };
        },
        computed: {
            observes() {
                let {definitionName} = this;
                return {definitionName};
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
            update() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要修改的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时修改一条喔！"});
                }
                let {id: processInstanceId, state} = this.selections[0];
                if (state === "ACTIVE") {
                    return this.$router.push({name: "work-own-update", query: {processInstanceId}});
                }
                this.$notify.error({title: "错误", message: "当前流程不能被修改！"});
            },
            duration
        },
        components: {
            WorkOwnViewer,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .work-own-query {
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

            .el-input {
                width: auto;
                margin-top: 10px;
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
