<template>
    <div class="system-notice-query">
        <!-- 功能按键 -->
        <div class="system-notice-query-search">
            <div class="system-notice-query-search-item">
                <span>标题：</span>
                <el-input v-model="title" placeholder="请输入" clearable />
            </div>
            <div class="system-notice-query-search-item">
                <span>内容：</span>
                <el-input v-model="content" placeholder="请输入" clearable />
            </div>
            <div class="system-notice-query-search-item">
                <span>类型：</span>
                <NoticeTopicType v-model="type" />
            </div>
            <el-button :loading="loading" v-authority.system-notice-query @click="search">查询</el-button>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe height="100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="typeEnum.desc" label="类型" width="140" />
            <el-table-column prop="senderName" label="发送人" width="140" />
            <el-table-column label="状态" width="80">
                <template #default="{row}">{{ row.status ? "正常" : "无效" }}</template>
            </el-table-column>
            <el-table-column prop="takerTotal" label="通知人数" width="100" />
            <el-table-column prop="takerReads" label="已读人数" width="100" />
            <el-table-column prop="latest" label="修改时间" width="180" />
            <el-table-column prop="inTime" label="创建时间" width="180" />
        </el-table>

        <!-- 分页插件 -->
        <div class="system-notice-query-footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button-group>
                <el-button :loading="loading" @click="viewer" v-authority.system-notice-query>查看</el-button>
                <el-button :loading="loading" @click="insert" v-authority.system-notice-add>新增</el-button>
                <el-button :loading="loading" @click="update" v-authority.system-notice-update>编辑</el-button>
                <el-button :loading="loading" @click="remove" v-authority.system-notice-delete>删除</el-button>
            </el-button-group>
        </div>

        <!-- 查看窗口 -->
        <el-dialog
            title="详细信息"
            custom-class="system-notice-query-viewer"
            :visible.sync="visible"
            top="15vh"
            width="60%"
        >
            <SystemNoticeForm :id="id" readonly />
        </el-dialog>
    </div>
</template>
<script>
    import {Pagination, Table, TableColumn, Button, Input} from "element-ui";
    import QueryExtend from "@/extends/query-extend";
    import SystemNoticeForm from "@/views/system/notice/SystemNoticeForm.vue";
    import NoticeTopicType from "@/views/system/notice/NoticeTopicType.vue";

    export default {
        name: "SystemNoticeQuery",
        extends: QueryExtend,
        data() {
            return {
                url: "/system/notices",
                title: "",
                content: "",
                type: undefined,

                id: undefined
            };
        },
        computed: {
            observes() {
                let {title, content, type} = this;
                return {title, content, type};
            }
        },
        methods: {
            viewer() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要查看的条目！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时查看一条喔！"});
                }
                this.id = undefined;
                this.$nextTick(() => {
                    this.id = this.selections[0].id;
                    this.visible = true;
                });
            },
            insert() {
                if (this.loading) {
                    return;
                }
                this.visible = false;
                this.$store
                    .dispatch("getAuthority", "system-notice-add")
                    .then(ret => this.$router.replace(ret.uri))
                    .catch(() => this.$notify.error("没有相应权限！"));
            },
            update() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要修改的条数！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时修改一条喔！"});
                }
                this.visible = false;
                this.$store
                    .dispatch("getAuthority", "system-notice-update")
                    .then(ret => this.$router.replace(ret.uri + "?id=" + this.selections[0].id))
                    .catch(() => this.$notify.error("没有相应权限！"));
            },
            remove() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要删除记录~"});
                    return;
                }
                this.$confirm("你确定要删除吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.loading = true;
                        let requests = this.selections.map(item => {
                            return this.$http.delete("/system/notices/" + item.id);
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
            }
        },
        components: {
            NoticeTopicType,
            SystemNoticeForm,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .system-notice-query {
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
            align-items: flex-start;
            padding-top: 20px;

            > * {
                margin-bottom: 20px;

                &:not(:last-child) {
                    width: auto;
                    display: flex;
                    align-items: flex-start;
                    font-size: 14px;
                    margin-right: 20px;

                    > *:first-child {
                        flex-shrink: 0;
                        line-height: 36px;
                    }
                }

                &:last-child {
                    margin-left: auto;
                }
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
            }

            .el-dialog__footer {
                flex-shrink: 0;
            }
        }
    }
</style>
