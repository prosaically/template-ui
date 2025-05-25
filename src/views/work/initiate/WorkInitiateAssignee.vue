<template>
    <el-dialog
        custom-class="work-initiate-assignee"
        title="选择审批人"
        :visible.sync="visible"
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        destroy-on-close
        top="16vh"
        width="54vw"
    >
        <div class="work-initiate-assignee-search">
            <el-input v-model="username" placeholder="请输入" clearable>
                <template #prepend>账户</template>
            </el-input>
            <el-input v-model="nickname" placeholder="请输入" clearable>
                <template #prepend>姓名</template>
            </el-input>
            <el-input v-model="mobile" placeholder="请输入" clearable>
                <template #prepend>手机</template>
            </el-input>
            <el-button :loading="loading" @click="search">查询</el-button>
        </div>
        <el-table :data="records" ref="table" height="100%" stripe @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column fixed prop="username" label="用户账户" />
            <el-table-column fixed prop="nickname" label="用户姓名" />
            <el-table-column prop="mobile" label="用户手机" width="120" />
        </el-table>
        <template #footer>
            <span class="work-initiate-assignee-echo line-1" :class="{'work-initiate-assignee-success': isHighlight}">{{
                echo
            }}</span>
            <el-button type="primary" @click="puts">加入</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import {Dialog, Table, TableColumn, Input, Button} from "element-ui";

    export default {
        name: "WorkInitiateAssignee",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: Boolean,
            parameters: Object
        },
        data() {
            return {
                username: "",
                nickname: "",
                mobile: "",
                records: [],
                selections: [],

                loading: false
            };
        },
        computed: {
            visible: {
                set(value) {
                    this.$emit("input", value);
                },
                get() {
                    return this.value;
                }
            },
            isHighlight() {
                return this.parameters?.value?.length > 0;
            },
            echo() {
                if (this.parameters?.value.length) {
                    return this.parameters.value.map(m => m.name).join(", ");
                }
                return "请点击选择审批人";
            }
        },
        watch: {
            visible(value) {
                value && this.onload();
            }
        },
        methods: {
            selectionChange(e) {
                this.selections = e;
                this.error = false;
            },
            search() {
                this.pageNo = 1;
                this.total = 0;
                this.records = [];
                this.onload();
            },
            onload() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                let {username, nickname, mobile, parameters} = this;
                let search = (parameters?.condition ?? "").replace(/ *- */g, "=").replace(/ *, */g, "&");
                this.$http
                    .get("/flows/assignees/options?" + search, {params: {username, nickname, mobile}})
                    .then(({data}) => {
                        this.records = data;
                        let chosen = data.filter(f => this.assignees.find(a => a.id === f.id));
                        this.$refs.table &&
                            this.$nextTick(() => {
                                this.$refs.table.clearSelection();
                                chosen.forEach(row => this.$refs.table.toggleRowSelection(row));
                            });
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            puts() {
                let values = this.selections.map(m => ({id: m.id, type: "user", name: m.nickname}));
                this.$emit("join", values);
            }
        },
        components: {
            "el-dialog": Dialog,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-input": Input,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .work-initiate-assignee {
        display: flex;
        flex-direction: column;
        height: 68vh;

        .el-dialog__header {
            flex-shrink: 0;
        }

        .el-dialog__body {
            flex: 1;
            overflow: hidden;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
        }

        .el-dialog__footer {
            flex-shrink: 0;
            display: flex;
            align-items: center;
        }

        &-success {
            color: $color-primary;
        }

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

            .el-button {
                margin-top: 10px;
                margin-left: auto;
            }
        }

        .el-table {
            flex: 1;
            overflow: hidden;
        }

        &-echo {
            flex: 1;
            padding-right: 10px;
            text-align: left;
            font-size: 14px;
        }
    }
</style>
