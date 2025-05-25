<template>
    <div class="work-initiate-bpmn">
        <!-- 功能按键 -->
        <div class="work-initiate-bpmn-search">
            <el-input v-model="definitionName" placeholder="请输入名称" clearable>
                <template #prepend>流程名称</template>
            </el-input>
            <el-button :loading="loading" @click="search">查询</el-button>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" />
            <el-table-column prop="deploymentId" label="部署ID" width="120" />
            <el-table-column prop="key" label="标识键" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="version" label="版本号" width="120" />
        </el-table>

        <!-- 分页插件 -->
        <div class="work-initiate-bpmn-bottom">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button type="primary" @click="next">下一步</el-button>
        </div>
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, Input} from "element-ui";
    import QueryExtend from "@/extends/query-extend";

    export default {
        name: "WorkInitiateBpmn",
        extends: QueryExtend,
        data() {
            return {
                url: "/works/initiates",
                definitionName: ""
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
            next() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要发起的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时发起一条喔！"});
                }
                this.$emit("next", this.selections[0]);
            }
        },
        components: {
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .work-initiate-bpmn {
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

        &-bottom {
            padding-top: 20px;
            flex-shrink: 0;
            display: flex;
            align-items: center;

            .el-pagination {
                flex-shrink: 0;
            }

            .el-button {
                margin-left: auto;
            }
        }
    }
</style>
