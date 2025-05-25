<template>
    <el-dialog
        custom-class="flow-bpmn-assignee"
        title="审批人选择器"
        :visible.sync="visible"
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        top="18vh"
        width="54vw"
    >
        <el-tabs :value="action" tab-position="left" @input="tabChange">
            <el-tab-pane label="用户选择" name="user">
                <div class="flow-bpmn-assignee-search">
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
            <el-tab-pane label="直系领导" name="leader" :disabled="isOptional">
                <el-table :data="records" @selection-change="selectionChange">
                    <el-table-column type="selection" width="55" :selectable="selectable" />
                    <el-table-column prop="id" label="领导编码" />
                    <el-table-column prop="name" label="领导名称" />
                    <el-table-column prop="remark" label="领导说明" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="角色选择" name="role" :disabled="!isOptional">
                <div class="flow-bpmn-assignee-search">
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
            <el-tab-pane label="分组选择" name="group" :disabled="!isOptional">
                <div class="flow-bpmn-assignee-search">
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
        </el-tabs>
        <div class="flow-bpmn-assignee-chosen">
            <div class="flow-bpmn-assignee-chosen-item" v-for="(v, k) in temporary" :key="k" :data-type="v.type">
                <div>{{ v.name }}</div>
                <span class="el-icon-close" @click="detach(k)"></span>
            </div>
            <el-empty v-if="isEmpty" description="暂无数据" :image-size="60" />
        </div>
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
            <el-button @click="usher">加入</el-button>
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="confirm">确定</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import {Dialog, Tabs, TabPane, Button, Pagination, Input, Empty, Table, TableColumn} from "element-ui";

    export default {
        name: "FlowBpmnAssignee",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                required: true,
                type: Boolean
            },
            optional: [Boolean, String],
            multiple: [Boolean, String],
            content: String
        },
        data() {
            return {
                pageNo: 1,
                pageSize: 10,
                total: 0,
                records: [],
                selections: [],

                username: "",
                nickname: "",
                mobile: "",
                name: "",

                action: "user",
                temporary: [],

                loading: false
            };
        },
        watch: {
            content(value) {
                if (value === this.encoding) {
                    return;
                }
                this.initialize();
            }
        },
        computed: {
            visible: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit("input", value);
                }
            },
            encoding() {
                return this.temporary.map(t => t.type + "-" + t.id).join(",");
            },
            isOptional() {
                return this.optional === true || this.optional === "true";
            },
            isMultiple() {
                return this.multiple === true || this.multiple === "true";
            },
            isEmpty() {
                return this.temporary.length < 1;
            }
        },
        methods: {
            initialize() {
                if (this.content === undefined || this.content === null || this.content === "") {
                    return (this.temporary = []);
                }

                let query = this.content.replace(/-/g, "=").replace(/ *, */g, "&");
                this.$http
                    .get("/flows/assignees/design?" + query)
                    .then(response => (this.temporary = response.data ?? []))
                    .catch(() => {});
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
            user() {
                let {username, nickname, mobile, pageNo, pageSize} = this;
                return this.$http.get("/system/operators/options", {
                    params: {username, nickname, mobile, pageNo, pageSize}
                });
            },
            leader() {
                return Promise.resolve({
                    data: {
                        data: {
                            total: 5,
                            size: this.pageSize,
                            current: 1,
                            records: [
                                {id: 1, name: "一级领导"},
                                {id: 2, name: "二级领导"},
                                {id: 3, name: "三级领导"},
                                {id: 4, name: "四级领导"},
                                {id: 5, name: "五级领导"}
                            ]
                        },
                        status: 200
                    }
                });
            },
            role() {
                let {name, pageNo, pageSize} = this;
                return this.$http.get("/system/roles/options", {
                    params: {name, pageNo, pageSize}
                });
            },
            group() {
                let {name, pageNo, pageSize} = this;
                return this.$http.get("/system/groups/options", {
                    params: {name, pageNo, pageSize}
                });
            },
            usher() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要加入的条数喔！"});
                }
                this.selections
                    .filter(f => {
                        return this.temporary.find(t => t.type === this.action && t.id === f.id) === undefined;
                    })
                    .forEach(v => {
                        let key = {user: "nickname", leader: "name", role: "name", group: "name"}[this.action];
                        this.temporary.push({type: this.action, id: v.id, name: v[key]});
                    });
            },
            detach(index) {
                this.temporary.splice(index, 1);
            },
            tabChange(e) {
                this.action = e;
                this.search();
            },
            selectable(row, index) {
                if (index > 0) {
                    return this.isMultiple;
                }
                return true;
            },
            selectionChange(e) {
                this.selections = e;
            },
            pageChange(e) {
                this.pageNo = e;
                this.onload();
            },
            cancel() {
                this.$emit("cancel");
                this.visible = false;
            },
            confirm() {
                if (!this.isOptional && !this.isMultiple && this.temporary.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能单选喔~"});
                }
                this.$emit("confirm", this.encoding);
                this.visible = false;
            }
        },
        created() {
            this.initialize();
            this.onload();
        },
        components: {
            "el-dialog": Dialog,
            "el-button": Button,
            "el-tabs": Tabs,
            "el-tab-pane": TabPane,
            "el-pagination": Pagination,
            "el-input": Input,
            "el-empty": Empty,
            "el-table": Table,
            "el-table-column": TableColumn
        }
    };
</script>

<style lang="scss">
    .flow-bpmn-assignee {
        height: 64vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        $types: (
            user: $color-primary,
            leader: $color-success,
            role: $color-warning,
            group: $color-danger
        );

        .el-tabs {
            flex: 1;
            overflow: hidden;

            &__header.is-left {
                margin: 0;
            }

            &__content {
                height: 100%;
                padding: 0 10px 10px 10px;
                overflow-x: hidden;
                overflow-y: auto;
            }

            &__active-bar.is-left {
                width: 1px;
            }

            &__nav-wrap.is-left:after {
                width: 1px;
            }

            .is-active {
                background-color: $color-primary-light-9;
            }

            .el-radio {
                margin-top: 20px;
            }

            @each $id, $color in $types {
                #tab-#{$id}:before {
                    content: "";
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    margin-right: 5px;
                    border-radius: 50%;
                    background-color: $color;
                }
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

        &-chosen {
            flex-shrink: 0;
            flex-basis: 20%;
            overflow-x: hidden;
            overflow-y: auto;
            border-left: 1px solid $border-base;
            padding: 10px;

            &-item {
                display: flex;
                border-radius: $border-radius-base;
                background-color: #00cc66;
                padding: 4px 8px;
                align-items: flex-start;

                &:not(:first-child) {
                    margin-top: 10px;
                }

                div:first-child {
                    flex: 1;
                }

                span:last-child {
                    flex-shrink: 0;
                    cursor: pointer;
                }
            }

            @each $id, $color in $types {
                &-item[data-type="#{$id}"] {
                    color: $color;
                    background-color: mix(#fff, $color, 90%);
                }
            }

            .el-empty {
                padding: 16vh 0;
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
