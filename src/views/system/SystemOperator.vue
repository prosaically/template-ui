<template>
    <div class="system-operator">
        <!-- 功能按键 -->
        <div class="system-operator-group">
            <el-input v-model="username" placeholder="请输入账户" clearable>
                <template #prepend>会员账户</template>
            </el-input>
            <el-input v-model="nickname" placeholder="请输入用户姓名" clearable>
                <template #prepend>会员姓名</template>
            </el-input>
            <el-input v-model="mobile" placeholder="请输入手机号码" clearable>
                <template #prepend>手机号码</template>
            </el-input>
            <el-select v-model="status" placeholder="请选择状态" clearable>
                <template #prefix>用户状态</template>
                <el-option :value="true" label="正常" />
                <el-option :value="false" label="禁用" />
            </el-select>
            <el-button-group>
                <el-button :loading="loading" v-authority.system-operator-query @click="search">查询</el-button>
                <el-button :loading="loading" v-authority.system-operator-add @click="insert">新增</el-button>
                <el-button :loading="loading" v-authority.system-operator-update @click="update">修改</el-button>
                <el-button :loading="loading" v-authority.system-operator-delete @click="remove">删除</el-button>
            </el-button-group>
        </div>

        <!-- 表格数据 -->
        <el-table :data="records" stripe height="100%" @selection-change="selectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column fixed prop="username" label="登录账户" />
            <el-table-column fixed prop="nickname" label="用户姓名" />
            <el-table-column prop="mobile" label="手机号" width="120" />
            <el-table-column label="状态" width="100">
                <template #default="{row}">{{ row.status ? "正常" : "禁用" }}</template>
            </el-table-column>
            <el-table-column prop="startTime" label="登录开始时间" width="120" />
            <el-table-column prop="endTime" label="登录结束时间" width="120" />
            <el-table-column prop="latest" label="最后修改时间" width="180" />
            <el-table-column prop="inTime" label="用户创建时间" width="180" />
        </el-table>

        <!-- 分页插件 -->
        <el-pagination
            background
            layout="total, prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="pageNo"
            @current-change="pageChange"
        />

        <!-- 编辑窗口 -->
        <el-dialog
            custom-class="system-operator-form"
            :title="title"
            :visible.sync="visible"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            top="24vh"
            width="44vw"
        >
            <el-form ref="form" :model="form" :rules="rules" label-width="88px">
                <el-form-item label="人员名称" prop="username">
                    <el-input v-model="form.username" placeholder="请输入人员名称" />
                </el-form-item>
                <el-form-item label="登录密码" prop="password" v-if="mode === 1">
                    <el-input v-model="form.password" placeholder="请输入登录密码" />
                </el-form-item>
                <el-form-item label="人员昵称" prop="nickname">
                    <el-input v-model="form.nickname" placeholder="请输入人员昵称" />
                </el-form-item>
                <el-form-item label="人员分组" prop="groupId">
                    <GroupCascader v-model="form.groupId" leaf />
                </el-form-item>
                <el-form-item label="手机号码" prop="mobile">
                    <el-input v-model="form.mobile" placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="用户角色" prop="roles">
                    <el-select v-model="role" multiple placeholder="请选择用户角色">
                        <el-option v-for="v in roles" :key="v.id" :label="v.name" :value="v.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-switch v-model="form.status" />
                </el-form-item>
                <el-form-item label="供 应 商" prop="suppliers">
                    <SupplierSelect v-model="suppliers" multiple />
                </el-form-item>
                <el-form-item label="人员头像" prop="avatar">
                    <FileUpload v-model="form.avatar" accept="image/*" />
                </el-form-item>
                <el-form-item label="登录时间" prop="startTime">
                    <el-time-picker
                        v-model="form.startTime"
                        :clearable="false"
                        value-format="HH:mm:ss"
                        placeholder="请选择登录开始时间"
                    />
                </el-form-item>
                <el-form-item label="退出时间" prop="endTime">
                    <el-time-picker
                        v-model="form.endTime"
                        :clearable="false"
                        value-format="HH:mm:ss"
                        placeholder="请选择登录退出时间"
                    />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button :loading="loading" @click="cancel">取 消</el-button>
                <el-button :loading="loading" type="primary" @click="confirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import {
        Pagination,
        Table,
        TableColumn,
        Button,
        ButtonGroup,
        Dialog,
        Form,
        FormItem,
        Input,
        Switch,
        TimePicker,
        Select,
        Option
    } from "element-ui";
    import FileUpload from "@/components/FileUpload.vue";
    import GroupCascader from "@/components/GroupCascader.vue";
    import {diff, isEmptyObject} from "@/utils/index.js";
    import SupplierSelect from "@/components/SupplierSelect.vue";
    import QueryExtend from "@/extends/query-extend";

    export default {
        name: "SystemOperator",
        extends: QueryExtend,
        data() {
            return {
                url: "/system/operators",
                username: "",
                nickname: "",
                mobile: "",
                status: true,

                roles: [],
                mode: 1,
                source: undefined,
                form: this.defaultForm(),
                rules: {
                    username: [
                        {required: true, message: "请您输入人员名称", trigger: "blur"},
                        {min: 2, max: 8, message: "长度在2到8个字符", trigger: "blur"}
                    ],
                    password: [
                        {
                            required: true,
                            validator: (rule, value, callback) => {
                                if (this.mode === 0) {
                                    return callback();
                                }
                                let {status, msg} = this.$verifyPassword(value);
                                if (status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    nickname: [
                        {required: true, message: "请您输入人员昵称", trigger: "blur"},
                        {min: 2, max: 16, message: "长度在2到16个字符", trigger: "blur"}
                    ],
                    groupId: [{required: true, message: "请选择用户分组", trigger: "change"}],
                    mobile: [
                        {required: true, message: "请您输入手机号码", trigger: "blur"},
                        {
                            required: true,
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyMobile(value);
                                if (status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    startTime: [{required: true, message: "请选择登录开始时间", trigger: "blur"}],
                    endTime: [{required: true, message: "请选择登录结束时间", trigger: "blur"}],
                    roles: [{required: true, type: "array", message: "请选择用户角色", trigger: "change"}]
                }
            };
        },
        computed: {
            title() {
                return {
                    0: "编辑人员",
                    1: "新增人员"
                }[this.mode];
            },
            role: {
                set(values) {
                    this.form.roles = values.map(v => ({roleId: v}));
                },
                get() {
                    return this.form.roles.map(v => v.roleId);
                }
            },
            suppliers: {
                set(values) {
                    this.form.suppliers = values.map(v => ({supplierId: v}));
                },
                get() {
                    return this.form.suppliers.map(v => v.supplierId);
                }
            },
            observes() {
                let {username, nickname, mobile, status} = this;
                return {username, nickname, mobile, status};
            }
        },
        watch: {},
        methods: {
            async loadRoles() {
                let response = await this.$http.get("/system/roles?pageNo=1&pageSize=999999");
                let {records: roles = []} = response.data ?? {};
                this.roles = roles;
            },
            defaultForm() {
                return {
                    username: "",
                    password: "",
                    nickname: "",
                    groupId: undefined,
                    mobile: "",
                    status: true,
                    avatar: "",
                    startTime: "00:00:00",
                    endTime: "23:59:59",
                    roles: [],
                    suppliers: []
                };
            },
            async insert() {
                if (this.loading) {
                    return;
                }
                await this.loadRoles();
                this.source = undefined;
                this.form = this.defaultForm();
                this.mode = 1;
                this.visible = true;
            },
            async update() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要修改记录~"});
                    return;
                }
                if (this.selections.length > 1) {
                    this.$notify.error({title: "错误", message: "只能选择一条记录喔~"});
                    return;
                }
                await this.loadRoles();
                let [current] = this.selections;
                this.source = current;
                this.form = this.$clone(current);
                this.mode = 0;
                this.visible = true;
            },
            remove() {
                if (this.loading) {
                    return;
                }
                if (this.selections.length < 1) {
                    this.$notify.error({title: "错误", message: "请选择要修改记录~"});
                    return;
                }
                this.$confirm("你确定要删除该角色吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.loading = true;
                        let requests = this.selections.map(v => this.$http.delete("/system/operators/" + v.id));
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
            },
            splice(ids) {
                this.records
                    .map((m, index) => ({id: m.id, index}))
                    .filter(f => ids.includes(f.id))
                    .sort((o1, o2) => o2.index - o1.index)
                    .forEach(d => this.records.splice(d.index, 1));
            },
            cancel() {
                this.visible = false;
                this.mode = 1;
                this.form = this.defaultForm();
            },
            confirm() {
                this.$refs.form.validate(valid => valid && this.submit());
            },
            submit() {
                if (this.loading) {
                    return;
                }
                let diffForm = diff(this.source, this.form);
                if (isEmptyObject(diffForm)) {
                    return this.$notify.error("没有可提交的内容~");
                }
                this.loading = true;
                let config = {headers: {"Content-Type": this.$consts.MEDIA_TYPE.APPLICATION_JSON}};
                let http = {
                    0: () => this.$http.put("/system/operators/" + this.source.id + "?notify=", diffForm, config),
                    1: () => this.$http.post("/system/operators?notify=", diffForm, config)
                }[this.mode];
                let finish = {
                    0: () => this.onload(),
                    1: () => this.search()
                }[this.mode];
                http()
                    .then(() => {
                        this.$notify.success({title: "提示", message: "保存成功~"});
                        this.visible = false;
                        finish();
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            }
        },
        components: {
            SupplierSelect,
            GroupCascader,
            FileUpload,
            "el-pagination": Pagination,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-button": Button,
            "el-button-group": ButtonGroup,
            "el-dialog": Dialog,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-switch": Switch,
            "el-time-picker": TimePicker,
            "el-select": Select,
            "el-option": Option
        }
    };
</script>
<style lang="scss">
    .system-operator {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 20px;
        overflow: hidden;
        background-color: #fff;

        &-group {
            flex-shrink: 0;
            display: flex;
            flex-wrap: wrap;
            margin: 8px 0 14px 0;
            padding-bottom: 20px;
            border-bottom: 1px solid $border-light;

            & > div {
                width: auto;
                margin-top: 10px;

                &:not(:last-child) {
                    margin-right: 20px;
                }
            }

            .el-select--medium .el-input--medium {
                padding-left: 98px;

                .el-input__inner {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                }

                .el-input__prefix {
                    left: 0;
                    line-height: 36px;
                    color: $text-secondary;
                    background-color: #f5f7fa;
                    border-top-left-radius: $border-radius-base;
                    border-bottom-left-radius: $border-radius-base;
                    border-top: 1px solid $border-base;
                    border-bottom: 1px solid $border-base;
                    border-left: 1px solid $border-base;
                    padding: 0 20px;
                }
            }

            .el-button-group {
                margin-left: auto;
            }
        }

        .el-table {
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
        }

        .el-pagination {
            padding-top: 20px;
            flex-shrink: 0;
            text-align: center;
        }

        &-form {
            height: 52vh;
            display: flex;
            flex-direction: column;

            .el-dialog__header {
                flex-shrink: 0;
            }

            .el-dialog__body {
                flex: 1;
                overflow: hidden;
                padding-right: 10px;
            }

            .el-dialog__footer {
                flex-shrink: 0;
            }

            .el-form {
                width: 100%;
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
                padding-right: 10px;
            }
        }
    }
</style>
