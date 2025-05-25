<template>
    <div class="system-trace">
        <!-- 条件搜索 -->
        <div class="system-trace-search">
            <OperatorPicker v-model="userId" prepend="操作员" />
            <AuthoritySelect :default-authorities.sync="authorities" prepend="权限" />
            <el-input clearable placeholder="业务状态码" v-model="status">
                <template #prepend>状态码</template>
            </el-input>
            <el-input clearable placeholder="IP 地址" v-model="ip">
                <template #prepend>IP</template>
            </el-input>
            <el-date-picker
                v-model="dates"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            />

            <div class="system-trace-search-gap"></div>

            <el-button-group>
                <el-button :loading="loading" @click="search" v-authority.system-trace>查询</el-button>
                <el-button :loading="loading" @click="detail" v-authority.system-trace>详情</el-button>
            </el-button-group>
        </div>

        <!-- 数据列表 -->
        <el-table
            :data="records"
            stripe
            style="height: auto; width: 100%"
            ref="table"
            @selection-change="selectionChange"
        >
            <el-table-column type="selection" width="60" />
            <el-table-column prop="operator.nickname" label="操作人" width="180" />
            <el-table-column prop="signature" label="方法签名" />
            <el-table-column prop="permission.name" label="权限名称" width="180" />
            <el-table-column prop="status" label="业务状态" width="100" />
            <el-table-column prop="ip" label="IP" width="120" />
            <el-table-column prop="createTime" label="操作时间" width="180" />
        </el-table>

        <!-- 表单弹窗 -->
        <el-dialog title="表单信息" :visible.sync="visible" :close-on-click-modal="false" width="46%">
            <el-form label-width="120px" v-if="form">
                <el-form-item label="ID">{{ form.id }}</el-form-item>
                <el-form-item label="操作员">{{ (form.operator || {}).nickname }}</el-form-item>
                <el-form-item label="方法签名">{{ form.signature }}</el-form-item>
                <el-form-item label="参数值">{{ form.parameter }}</el-form-item>
                <el-form-item label="权限名">{{ (form.authority || {}).name }}</el-form-item>
                <el-form-item label="状态码">{{ form.status }}</el-form-item>
                <el-form-item label="IP地址">{{ form.ip }}</el-form-item>
                <el-form-item label="操作时间">{{ form.createTime }}</el-form-item>
            </el-form>
        </el-dialog>

        <!-- 分页栏 -->
        <el-pagination
            background
            layout="total, prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="pageNo"
            @current-change="pageChange"
        />
    </div>
</template>

<script>
    import QueryExtend from "@/extends/query-extend.js";
    import {
        Input,
        ButtonGroup,
        Button,
        Table,
        TableColumn,
        Dialog,
        Form,
        FormItem,
        Pagination,
        DatePicker
    } from "element-ui";
    import OperatorPicker from "@/components/OperatorPicker";
    import AuthoritySelect from "@/components/AuthoritySelect";

    export default {
        name: "SystemTrace",
        extends: QueryExtend,
        data() {
            return {
                url: "/system/traces",

                userId: "",
                authorityCode: "",
                status: "",
                ip: "",
                createTimeStart: "",
                createTimeEnd: "",

                form: undefined
            };
        },
        computed: {
            authorities: {
                get() {
                    return this.authorityCode ? [this.authorityCode] : [];
                },
                set(v) {
                    this.authorityCode = (v ?? [])[0] ?? "";
                }
            },
            dates: {
                set(values) {
                    let [start, end] = values ?? [];
                    this.createTimeStart = start;
                    this.createTimeEnd = end;
                },
                get() {
                    let {createTimeStart: start, createTimeEnd: end} = this;
                    return start && end ? [start, end] : [];
                }
            },
            observes() {
                let {userId, authorityCode, status, ip, createTimeStart, createTimeEnd} = this;
                return {userId, authorityCode, status, ip, createTimeStart, createTimeEnd};
            }
        },
        methods: {
            detail() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要修改的条数喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时修改一条喔！"});
                }
                this.form = this.selections[0];
                this.visible = true;
            }
        },
        components: {
            AuthoritySelect,
            OperatorPicker,
            "el-input": Input,
            "el-button-group": ButtonGroup,
            "el-button": Button,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-dialog": Dialog,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-pagination": Pagination,
            "el-date-picker": DatePicker
        }
    };
</script>

<style lang="scss">
    .system-trace {
        position: relative;
        min-height: 100%;
        background-color: #fff;
        padding: 10px;

        &-search {
            padding-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            align-items: center;

            & > div {
                width: auto;
                margin-top: 10px;
                margin-right: 20px;
            }

            &-gap {
                flex: 1;
            }
        }

        .el-pagination {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 10px;
        }
    }
</style>
