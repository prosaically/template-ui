<template>
    <el-dialog
        custom-class="system-notice-picker"
        title="通知范围选择器"
        :visible.sync="visible"
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        top="18vh"
        width="54vw"
    >
        <el-tabs :value="action" tab-position="left" @input="tabChange">
            <el-tab-pane label="每人" name="0">
                <el-table :data="records" @selection-change="selectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="id" label="编码" />
                    <el-table-column prop="name" label="名称" />
                    <el-table-column prop="remark" label="说明" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="部门" name="1">
                <div class="system-notice-picker-search">
                    <el-input size="small" v-model="name" placeholder="请输入" clearable>
                        <template #prepend>分组名称</template>
                    </el-input>
                    <el-button size="small" :loading="loading" @click="search">查询</el-button>
                </div>
                <el-table :data="records" @selection-change="selectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="id" label="分组编码" />
                    <el-table-column prop="name" label="分组名称" />
                    <el-table-column prop="remark" label="分组说明" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="角色" name="2">
                <div class="system-notice-picker-search">
                    <el-input size="small" v-model="name" placeholder="请输入" clearable>
                        <template #prepend>角色名称</template>
                    </el-input>
                    <el-button size="small" :loading="loading" @click="search">查询</el-button>
                </div>
                <el-table :data="records" @selection-change="selectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="id" label="角色编码" />
                    <el-table-column prop="name" label="角色名称" />
                    <el-table-column prop="remark" label="角色说明" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="用户" name="3">
                <div class="system-notice-picker-search">
                    <el-input size="small" v-model="username" placeholder="请输入" clearable>
                        <template #prepend>用户账户</template>
                    </el-input>
                    <el-input size="small" v-model="nickname" placeholder="请输入" clearable>
                        <template #prepend>用户姓名</template>
                    </el-input>
                    <el-input size="small" v-model="mobile" placeholder="请输入" clearable>
                        <template #prepend>用户手机</template>
                    </el-input>
                    <el-button size="small" :loading="loading" @click="search">查询</el-button>
                </div>
                <el-table :data="records" @selection-change="selectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column fixed prop="username" label="用户账户" />
                    <el-table-column fixed prop="nickname" label="用户姓名" />
                    <el-table-column prop="mobile" label="用户手机" width="120" />
                </el-table>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :pager-count="5"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button type="primary" @click="confirm">确定</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import {Dialog, Tabs, TabPane, Button, Pagination, Input, Table, TableColumn} from "element-ui";
    import PagingExtend from "@/extends/paging-extend";

    export default {
        name: "SystemNoticePicker",
        extends: PagingExtend,
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                required: true,
                type: Boolean
            }
        },
        data() {
            return {
                username: "",
                nickname: "",
                mobile: "",
                name: "",

                action: "0",
                enums: [],
                loading: false
            };
        },
        computed: {
            visible: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit("input", value);
                }
            }
        },
        methods: {
            types() {
                this.$http
                    .get("/system/notices/taker/types")
                    .then(response => {
                        let enums = {};
                        response.data.forEach(value => (enums[value.code] = value));
                        this.enums = enums;
                    })
                    .catch(() => (this.enums = {}));
            },
            search() {
                this.pageNo = 1;
                this.total = 0;
                this.records = [];
                this.selections = [];
                this.onload();
            },
            onload() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                this[this.action]()
                    .then(response => {
                        let {records = [], total = 0, size, current} = response.data ?? {};
                        this.total = total;
                        this.pageSize = size;
                        this.pageNo = current;
                        this.records = records;
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            0() {
                return Promise.resolve({
                    data: {
                        total: 5,
                        size: this.pageSize,
                        current: 1,
                        records: [{id: 0, name: "所有人员", remark: "所有状态正常的用户均能收到通知。"}]
                    }
                });
            },
            1() {
                let {name, pageNo, pageSize} = this;
                return this.$http.get("/system/groups/options", {
                    params: {name, pageNo, pageSize}
                });
            },
            2() {
                let {name, pageNo, pageSize} = this;
                return this.$http.get("/system/roles/options", {
                    params: {name, pageNo, pageSize}
                });
            },
            3() {
                let {username, nickname, mobile, pageNo, pageSize} = this;
                return this.$http.get("/system/operators/options", {
                    params: {username, nickname, mobile, pageNo, pageSize}
                });
            },
            tabChange(e) {
                this.action = e;
                this.search();
            },
            pageChange(e) {
                this.pageNo = e;
                this.onload();
            },
            confirm() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请先勾选条目~"});
                }
                let takers = this.selections.map(value => ({
                    type: this.action,
                    typeEnum: this.enums[this.action],
                    takerId: value.id,
                    takerName: value.name || value.nickname
                }));
                this.$emit("confirm", takers);
                this.visible = false;
            }
        },
        created() {
            this.types();
            this.onload();
        },
        components: {
            "el-dialog": Dialog,
            "el-button": Button,
            "el-tabs": Tabs,
            "el-tab-pane": TabPane,
            "el-pagination": Pagination,
            "el-input": Input,
            "el-table": Table,
            "el-table-column": TableColumn
        }
    };
</script>

<style lang="scss">
    .system-notice-picker {
        height: 64vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .el-tabs {
            flex: 1;
            overflow: hidden;

            &__content {
                height: 100%;
                padding: 0 10px 10px 10px;
                overflow-x: hidden;
                overflow-y: auto;
            }

            &__nav-wrap.is-left:after {
                width: 1px;
            }

            .is-active {
                background-color: $color-primary-light-9;
            }
        }

        &-search {
            flex-shrink: 0;
            display: flex;
            flex-wrap: wrap;
            margin: 8px 0 14px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid $border-light;

            .el-input {
                width: auto;
                margin-top: 10px;

                &-group__prepend {
                    padding: 0 8px;
                }

                &:not(:last-child) {
                    margin-right: 10px;
                }
            }

            .el-button {
                margin-top: 10px;
                margin-left: auto;
            }
        }

        .el-dialog__header {
            flex-shrink: 0;
        }

        .el-dialog__body {
            flex: 1;
            overflow: hidden;
            padding: 0;
            position: relative;
            border-top: 1px solid $border-base;
            border-bottom: 1px solid $border-base;
            display: flex;
        }

        .el-dialog__footer {
            flex-shrink: 0;
            padding: 10px 20px;
            display: flex;
            align-items: center;
        }

        .el-pagination {
            padding: 0;
            margin-right: auto;
        }
    }
</style>
