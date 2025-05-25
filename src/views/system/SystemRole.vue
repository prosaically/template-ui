<template>
    <div class="system-role">
        <!-- 说明新增 -->
        <div class="system-role-head">
            <i class="system-role-head-icon el-icon-info"></i>
            <div class="system-role-head-info">
                根据职能创建角色，选择角色需要的权限项。然后新增账号，进行角色配置。
            </div>
            <el-button type="success" :loading="loading" @click="add" v-authority.system-role-add>新增角色</el-button>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="isEmpty" :image="require('../../assets/img/role.png')" description="没有角色喔~" />

        <!-- 角色列表 -->
        <div v-else class="system-role-items" v-loading="loading">
            <div class="system-role-items-item" v-for="(v, i) in records" :key="v.id">
                <div
                    class="system-role-items-item-status"
                    :class="'el-icon-' + (v.status ? 'circle-check' : 'remove-outline')"
                    :title="v.status ? '正常' : '禁用'"
                ></div>
                <div :class="[v.icon, 'system-role-items-item-icon']"></div>
                <div class="system-role-items-item-name line-1" v-text="v.name"></div>
                <div class="system-role-items-item-remark line-4" v-text="v.remark"></div>
                <div class="system-role-items-item-bts">
                    <el-button :loading="loading" @click="remove(i)" v-authority.system-role-delete>删掉角色</el-button>
                    <el-button :loading="loading" @click="edit(v)" v-authority.system-role-update>配置权限</el-button>
                </div>
            </div>
        </div>

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
            class="system-role-form"
            :title="title"
            :visible.sync="dialog"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            top="24vh"
            width="44vw"
        >
            <el-form ref="form" :model="form" :rules="rules" label-width="88px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色图标" prop="icon">
                    <InputIconFontPicker v-model="form.icon" placeholder="请选择角色图标" />
                </el-form-item>
                <el-form-item label="角色状态" prop="status">
                    <el-switch v-model="form.status" />
                </el-form-item>
                <el-form-item label="角色说明" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入角色说明" />
                </el-form-item>
                <el-form-item label="角色权限" prop="authorities">
                    <el-tree
                        :data="trees"
                        node-key="id"
                        ref="tree"
                        show-checkbox
                        :expand-on-click-node="false"
                        @check-change="checkChange"
                    />
                </el-form-item>
                <el-form-item label="新增时间" v-if="mode === 0">
                    <el-input v-model="form.inTime" disabled />
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
    import {Empty, Pagination, Button, Dialog, Form, FormItem, Input, Switch, Tree} from "element-ui";
    import InputIconFontPicker from "../../components/InputIconFontPicker";
    import {diff, isEmptyObject} from "@/utils/index.js";
    import QueryExtend from "@/extends/query-extend";

    export default {
        name: "SystemRole",
        extends: QueryExtend,
        data() {
            return {
                url: "/system/roles",

                trees: [],
                mode: 1,
                source: undefined,
                form: this.defaultForm(),
                dialog: false,
                rules: {
                    name: [
                        {required: true, message: "请您输入角色名称", trigger: "blur"},
                        {min: 2, max: 10, message: "长度在2到8个字符", trigger: "blur"}
                    ],
                    icon: [{required: true, message: "请选择角色图标", trigger: "blur"}],
                    remark: [{required: true, message: "请您输入角色说明", trigger: "blur"}],
                    authorities: [
                        {
                            type: "array",
                            required: true,
                            validator: (rule, value, callback) => {
                                let values = this.form[rule.field] || [];
                                if (values.length < 1) {
                                    return callback(new Error("请勾选对应的权限"));
                                }
                                callback();
                            },
                            trigger: "change"
                        }
                    ]
                }
            };
        },
        computed: {
            title() {
                return {
                    0: "编辑角色",
                    1: "新增角色"
                }[this.mode];
            },
            isEmpty() {
                if (this.loading) {
                    return false;
                }
                return this.records.length < 1;
            }
        },
        methods: {
            async authorities() {
                let response = await this.$http.get("/system/authorities");
                let {data: authorities = []} = response;
                let authoritiesMapper = {};
                let treeMapper = {};
                let trees = [];

                // 数组转MAP
                authorities.forEach(v => {
                    let {id, name: label} = v;
                    authoritiesMapper[id] = v;
                    treeMapper[id] = {id, label};
                });

                // 关联父类
                authorities.forEach(i => {
                    let current = treeMapper[i.id];
                    const parent = treeMapper[i.parent];
                    if (parent) {
                        parent.children = (parent.children || []).concat(current);
                    } else {
                        trees.push(current);
                    }
                });

                // 返回树
                return {authoritiesMapper, trees};
            },
            async roleAuthorities(id) {
                let {authoritiesMapper, trees} = await this.authorities();

                let response = await this.$http.get(`/system/roles/${id}/authorities`);
                let {data: authorities = []} = response;

                let nodeMapper = {};
                let nodeTrees = [];
                authorities
                    .map(i => authoritiesMapper[i.authorityId])
                    .filter(f => f)
                    .forEach(v => (nodeMapper[v.id] = v));
                authorities
                    .filter(f => authoritiesMapper[f.authorityId])
                    .forEach(i => {
                        let current = nodeMapper[i.authorityId];
                        const parent = nodeMapper[current.parent];
                        if (parent) {
                            parent.children = (parent.children || []).concat(current);
                        } else {
                            nodeTrees.push(current);
                        }
                    });
                let checkedKeys = this.leafNodes(nodeTrees);

                return {trees, authorities, checkedKeys};
            },
            leafNodes(nodes) {
                let leaves = [];
                for (let i = 0; i < nodes.length; i++) {
                    let {children = []} = nodes[i];
                    if (children.length > 0) {
                        leaves.push(...this.leafNodes(children));
                        continue;
                    }
                    leaves.push(nodes[i].id);
                }
                return leaves;
            },
            async add() {
                this.loading = true;
                try {
                    let {trees} = await this.authorities();
                    this.trees = trees;
                } catch (e) {
                    this.$notify.error({title: "错误", message: "网络繁忙，您稍候再试~"});
                    return (this.loading = false);
                }
                this.mode = 1;
                this.dialog = true;
                this.source = undefined;
                this.form = this.defaultForm();

                // 清空选项
                this.$nextTick(() => {
                    this.$refs.tree.setCheckedKeys([]);
                });
                this.loading = false;
            },
            remove(index) {
                let role = this.records[index];
                if (role === undefined || role === null) {
                    this.$notify.error({title: "错误", message: "操作异常~"});
                    return;
                }
                this.$confirm("你确定要删除该角色吗？", "重要提示", {type: "warning"})
                    .then(() => {
                        this.$http
                            .delete("/system/roles/" + role.id + "?notify=")
                            .then(() => {
                                this.$notify.success({title: "提示", message: "删除成功~"});
                                this.records.splice(index, 1);
                            })
                            .catch(() => {});
                    })
                    .catch(() => {});
            },
            async edit(e) {
                this.loading = true;
                this.mode = 0;
                this.dialog = true;
                // 拉取权限
                let formAuthorities = [];
                let formCheckedKeys = [];
                try {
                    let {trees, authorities, checkedKeys} = await this.roleAuthorities(e.id);
                    this.trees = trees;
                    formAuthorities = authorities;
                    formCheckedKeys = checkedKeys;
                } catch (e) {
                    this.$notify.error({title: "错误", message: "网络繁忙，您稍候再试~"});
                    return (this.loading = false);
                }
                // 深度复制
                e.authorities = formAuthorities;
                this.source = e;
                this.form = this.$clone(e);
                // 默认勾选
                this.$nextTick(() => {
                    this.$refs.tree.setCheckedKeys(formCheckedKeys);
                });
                this.loading = false;
            },
            cancel() {
                this.source = undefined;
                this.form = this.defaultForm();
                this.mode = 1;
                this.dialog = false;
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
                    0: () => this.$http.put("/system/roles/" + this.source.id + "?notify=", diffForm, config),
                    1: () => this.$http.post("/system/roles?notify=", diffForm, config)
                }[this.mode];
                let finish = {
                    0: () => this.onload(),
                    1: () => this.search()
                }[this.mode];
                http()
                    .then(() => {
                        this.$notify.success({title: "提示", message: "保存成功~"});
                        this.loading = false;
                        this.dialog = false;
                        finish();
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            defaultForm() {
                return {
                    name: "",
                    icon: "",
                    status: true,
                    remark: "",
                    authorities: []
                };
            },
            checkChange() {
                this.form.authorities = this.$refs.tree.getCheckedNodes(false, true).map(n => ({authorityId: n.id}));
            }
        },
        components: {
            "el-pagination": Pagination,
            "el-button": Button,
            "el-dialog": Dialog,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-switch": Switch,
            "el-tree": Tree,
            "el-empty": Empty,
            InputIconFontPicker
        }
    };
</script>

<style lang="scss">
    .system-role {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #fff;
        display: flex;
        flex-direction: column;

        &-head {
            display: flex;
            align-items: center;
            padding: 20px;
            flex-shrink: 0;

            &-icon {
                color: $color-primary;
                font-size: 20px;
                margin-right: 8px;
            }

            &-info {
                flex: 1;
                font-size: 14px;
                color: $text-primary;
            }
        }

        &-items {
            overflow-x: hidden;
            overflow-y: auto;
            flex: 1;
            display: grid;
            grid-gap: 20px;
            grid-template-columns: repeat(auto-fill, 280px);
            grid-auto-rows: 310px;
            justify-content: space-evenly;

            &-item {
                overflow: hidden;
                border: 1px solid $border-base;
                padding-top: 10px;
                position: relative;

                &-status {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    font-size: 18px;
                }

                .el-icon-circle-check {
                    color: $color-success;
                }

                .el-icon-remove-outline {
                    color: $color-danger;
                }

                &-icon {
                    width: 74px;
                    height: 74px;
                    display: block;
                    margin: 12px auto;
                    text-align: center;
                    line-height: 74px;
                    background-color: #eaeaea;
                    border-radius: 50%;
                    color: #a5a5a5;
                    font-size: 38px;
                }

                &-name {
                    text-align: center;
                    font-size: 16px;
                    color: $text-primary;
                    padding: 0 20px;
                }

                &-remark {
                    margin-top: 8px;
                    font-size: 14px;
                    line-height: 20px;
                    height: 80px;
                    color: #8d8d8d;
                    padding: 0 20px;
                }

                &-bts {
                    margin-top: 24px;
                    text-align: center;
                }
            }
        }

        &-form {
            .el-dialog {
                height: 52vh;
                display: flex;
                flex-direction: column;

                &__header {
                    flex-shrink: 0;
                }

                &__body {
                    flex: 1;
                    overflow: hidden;
                    padding-right: 10px;
                }

                &__footer {
                    flex-shrink: 0;
                }
            }

            .el-form {
                width: 100%;
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
                padding-right: 10px;

                &-item.is-error .el-tree {
                    border-color: $color-danger;
                }
            }

            .el-tree {
                border-radius: 6px;
                border: 1px solid $border-base;
                padding: 8px 0;
            }
        }

        .el-empty {
            flex: 1;
        }

        .el-pagination {
            flex-shrink: 0;
            text-align: center;
            padding: 20px 0;
        }
    }
</style>
