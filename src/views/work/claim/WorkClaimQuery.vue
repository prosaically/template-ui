<template>
    <div class="work-claim-query">
        <!-- 功能按键 -->
        <div class="work-claim-query-search">
            <el-input v-model="taskName" placeholder="请输入名称" clearable>
                <template #prepend>任务名称</template>
            </el-input>
            <el-input v-model="definitionName" placeholder="请输入名称" clearable>
                <template #prepend>定义名称</template>
            </el-input>
            <el-button :loading="loading" v-authority.work-claim @click="search">查询</el-button>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe height="100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" />
            <el-table-column prop="name" label="任务名称" />
            <el-table-column prop="description" label="描述说明" />
            <el-table-column label="挂起">
                <template #default="{row}">{{ row.suspended ? "是" : "否" }}</template>
            </el-table-column>
        </el-table>

        <!-- 分页插件 -->
        <div class="work-claim-query-footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button type="primary" :loading="loading" @click="viewer">查看</el-button>
        </div>

        <!-- 查看组件 -->
        <WorkClaimViewer v-model="visible" :task-id="taskId" />
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, Input} from "element-ui";
    import QueryExtend from "@/extends/query-extend";
    import WorkClaimViewer from "@/views/work/claim/WorkClaimViewer.vue";

    export default {
        name: "WorkClaimQuery",
        extends: QueryExtend,
        data() {
            return {
                url: "/works/claims",
                taskName: "",
                definitionName: "",

                taskId: undefined
            };
        },
        computed: {
            observes() {
                let {taskName, definitionName} = this;
                return {taskName, definitionName};
            }
        },
        methods: {
            viewer() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要认领的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时认领一条喔！"});
                }
                this.taskId = this.selections[0].id;
                this.visible = true;
            }
        },
        components: {
            WorkClaimViewer,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .work-claim-query {
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

                &:not(:first-child) {
                    margin-left: 10px;
                }
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
