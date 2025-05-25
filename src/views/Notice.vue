<template>
    <div class="notice">
        <!-- 表格数据 -->
        <el-table :data="records" stripe height="100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="typeEnum.desc" label="类型" width="140" />
            <el-table-column prop="senderName" label="发送人" width="140" />
            <el-table-column label="状态" width="80">
                <template #default="{row}">{{ row.read ? "已读" : "未读" }}</template>
            </el-table-column>
            <el-table-column prop="inTime" label="发布时间" width="180" />
        </el-table>

        <!-- 分页插件 -->
        <div class="notice-footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button-group>
                <el-button :loading="loading" @click="search">查询</el-button>
                <el-button :loading="loading" type="primary" @click="viewer">查看</el-button>
            </el-button-group>
        </div>

        <!-- 查看窗口 -->
        <el-dialog title="通知内容" custom-class="notice-viewer" :visible.sync="visible" top="15vh" width="60%">
            <div v-html="content"></div>
        </el-dialog>
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button} from "element-ui";
    import QueryExtend from "@/extends/query-extend";

    export default {
        name: "Notice",
        extends: QueryExtend,
        data() {
            return {url: "/principal/notices", content: ""};
        },
        methods: {
            viewer() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要查看的条目！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时查看一条喔！"});
                }
                this.content = this.selections[0].content;
                this.visible = true;
                this.read(this.selections[0]);
            },
            read(row) {
                if (row.read) {
                    return;
                }

                this.$http
                    .post(`/principal/notices/${row.id}/read`)
                    .then(() => {
                        let find = this.records.find(value => value.id === row.id);
                        if (find) {
                            find.read = true;
                        }
                    })
                    .catch(() => {});
            }
        },
        components: {
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .notice {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 0 20px 20px 20px;
        overflow: hidden;
        background-color: #fff;

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

            @media print {
                display: none;
            }

            .el-pagination {
                flex-shrink: 0;
            }

            .el-button-group {
                margin-left: auto;
            }
        }

        &-viewer {
            height: 70vh;
            display: flex;
            flex-direction: column;

            .el-dialog__header {
                flex-shrink: 0;
            }

            .el-dialog__body {
                flex: 1;
                overflow: auto;
                padding-right: 10px;
                color: $text-primary;
            }

            .el-dialog__footer {
                flex-shrink: 0;
            }

            a {
                color: $color-primary;
            }
        }
    }
</style>
