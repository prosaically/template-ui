<template>
    <el-dialog custom-class="store-picker" title="商家选择器" :visible.sync="visible" width="50vw">
        <div class="store-picker-search">
            <el-input size="small" clearable placeholder="请输入商家名称" v-model="membername">
                <template #prepend>商家名称</template>
            </el-input>
            <el-input size="small" clearable placeholder="请输入公司名称" v-model="companyname">
                <template #prepend>公司名称</template>
            </el-input>
            <el-button size="small" type="primary" plain @click="search">搜索</el-button>
        </div>

        <el-table
            :data="records"
            stripe
            height="auto"
            style="width: 100%"
            ref="table"
            @selection-change="selectionChange"
            @hook:mounted="initialize"
        >
            <el-table-column type="selection" width="60" />
            <el-table-column prop="membername" label="会员名称" width="120" />
            <el-table-column prop="companyname" label="公司名称" />
            <el-table-column prop="membercontact" label="联系人" width="100" />
            <el-table-column prop="mobile" label="手机号" width="140" />
        </el-table>

        <template slot="footer">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :page-size="pageSize"
                :total="total"
                :current-page="pageNo"
                @current-change="pageChange"
            />
            <el-button size="small" @click="cancel">取消</el-button>
            <el-button size="small" type="primary" @click="confirm">确定</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import {Dialog, Input, Button, Table, TableColumn, Pagination} from "element-ui";

    export default {
        name: "StorePicker",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: Boolean,
                default: false
            },
            defaults: {
                type: Array,
                default: () => []
            },
            radio: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                membername: "",
                companyname: "",
                pageNo: 1,
                pageSize: 10,
                total: 0,
                records: [],
                selections: []
            };
        },
        computed: {
            visible: {
                set(v) {
                    this.$emit("input", v);
                },
                get() {
                    return this.value;
                }
            }
        },
        watch: {
            defaults: {
                handler: function () {
                    this.initialize();
                },
                deep: true
            }
        },
        methods: {
            search() {
                this.pageNo = 1;
                this.onload();
            },
            onload() {
                let {membername, companyname, disable = "0", pageNo, pageSize} = this;
                if (membername === "" && companyname === "") {
                    return;
                }
                this.$http
                    .get("/suppliers", {params: {membername, companyname, disable, pageNo, pageSize}})
                    .then(ret => {
                        let {records, current, size, total} = this.$success(ret).data || {};
                        this.pageNo = current;
                        this.pageSize = size;
                        this.total = total;
                        this.records = records;
                        this.initialize();
                    })
                    .catch(() => (this.goods = []));
            },
            pageChange(e) {
                this.pageNo = e;
                this.onload();
            },
            selectionChange(e) {
                this.selections = e;
            },
            initialize() {
                let chosen = this.records.filter(f => this.defaults.includes(f.memberaccount));
                this.$refs.table &&
                    this.$nextTick(() => {
                        this.$refs.table.clearSelection();
                        chosen.forEach(row => {
                            this.$refs.table.toggleRowSelection(row);
                        });
                    });
            },
            cancel() {
                this.$emit("cancel", []);
                this.visible = false;
            },
            confirm() {
                let chosen = this.selections.map(v => ({
                    memberAccount: v.memberaccount,
                    memberName: v.membername,
                    companyName: v.companyname
                }));

                // 单选判断
                if (this.radio && chosen.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能单选一个喔~"});
                }

                // 抛出事件
                this.$emit("confirm", chosen);
                this.visible = false;
            }
        },
        created() {
            this.onload();
        },
        components: {
            "el-dialog": Dialog,
            "el-input": Input,
            "el-button": Button,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-pagination": Pagination
        }
    };
</script>

<style lang="scss">
    .store-picker {
        height: 68vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &-search {
            flex-shrink: 0;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;

            .el-input {
                width: auto;
                margin-bottom: 20px;
                margin-right: 20px;
            }
        }

        .el-dialog__body {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }

        .el-table {
            flex: 1;
            overflow: hidden;

            &__body-wrapper {
                -webkit-overflow-scrolling: touch;
            }
        }

        .el-dialog__header {
            flex-shrink: 0;
        }

        .el-dialog__footer {
            flex-shrink: 0;
            display: flex;
            align-items: center;

            .el-pagination {
                flex-shrink: 0;
                margin-right: auto;
            }
        }
    }
</style>
