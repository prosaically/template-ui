<template>
    <el-dropdown class="navbar-avatar" trigger="click" :title="title" @command="commander">
        <el-avatar size="small" :src="avatar" icon="el-icon-user" alt="用户头像" />
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="v in dropdownMenus" :key="v.key" :command="v.key" :divided="v.divided">{{
                v.name
            }}</el-dropdown-item>
        </el-dropdown-menu>

        <!-- 修改弹窗 -->
        <el-dialog
            v-if="dropdownMenu"
            custom-class="navbar-avatar-form"
            :title="dropdownMenu.name"
            :visible.sync="visible"
            :close-on-click-modal="false"
            top="0"
            width="40vw"
        >
            <el-form ref="principal" :model="form" label-width="88px">
                <el-form-item
                    v-if="command === 'password'"
                    label="原密码"
                    prop="oldPassword"
                    :rules="[{required: true, message: '请您输入原密码', trigger: 'blur'}]"
                >
                    <el-input v-model="form.oldPassword" placeholder="请输入" show-password />
                </el-form-item>
                <el-form-item
                    v-if="command === 'password'"
                    label="新密码"
                    prop="newPassword"
                    :rules="[
                        {required: true, message: '请您输入新密码', trigger: 'blur'},
                        {pattern: /^[0-9a-zA-Z]{6,20}$/, message: '密码由6到20位半角字母数字组成', trigger: 'blur'}
                    ]"
                >
                    <el-input v-model="form.newPassword" placeholder="请输入" show-password />
                </el-form-item>

                <el-form-item
                    v-if="command === 'nickname'"
                    label="昵称"
                    prop="nickname"
                    :rules="[
                        {required: true, message: '请输入昵称', trigger: 'blur'},
                        {validator: alike('nickname', '昵称没有变化'), trigger: 'blur'}
                    ]"
                >
                    <el-input v-model="form.nickname" placeholder="请输入" />
                </el-form-item>

                <el-form-item
                    v-if="command === 'avatar'"
                    prop="avatar"
                    :rules="[
                        {required: true, message: '请选择图片上传', trigger: 'change'},
                        {validator: alike('avatar', '头像图片没有变化'), trigger: 'change'}
                    ]"
                >
                    <AvatarUpload v-model="form.avatar" />
                </el-form-item>

                <el-form-item
                    v-if="command === 'mobile'"
                    label="手机号"
                    prop="mobile"
                    :rules="[
                        {required: true, message: '请您输入手机号', trigger: 'blur'},
                        {pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur'}
                    ]"
                >
                    <el-input v-model="form.mobile" placeholder="请输入" />
                </el-form-item>
                <el-form-item
                    v-if="command === 'mobile'"
                    label="验证码"
                    prop="code"
                    :rules="[
                        {required: true, message: '请您输入验证码', trigger: 'blur'},
                        {pattern: /^[a-zA-Z0-9]{6}$/, message: '验证码格式错误', trigger: 'blur'}
                    ]"
                >
                    <el-input v-model="form.code" placeholder="请输入">
                        <template #append>
                            <CorrectCaptcha @confirm="sendSmsCode">
                                <el-button type="primary" :disabled="sms.maimed">{{ sms.txt }}</el-button>
                            </CorrectCaptcha>
                        </template>
                    </el-input>
                </el-form-item>

                <template v-if="command === 'logout'"><i class="el-icon-warning"></i> 您确认要退出登录吗？</template>
            </el-form>

            <template #footer>
                <el-button type="primary" @click="confirm">确认</el-button>
            </template>
        </el-dialog>
    </el-dropdown>
</template>

<script>
    import {Dropdown, DropdownMenu, DropdownItem, Avatar, Dialog, Button, Form, FormItem, Input} from "element-ui";
    import AvatarUpload from "@/components/AvatarUpload.vue";
    import CorrectCaptcha from "@/components/CorrectCaptcha.vue";
    import dayjs from "dayjs";
    import Duration from "dayjs/plugin/duration";
    dayjs.extend(Duration);

    export default {
        name: "NavbarAvatar",
        data() {
            return {
                dropdownMenus: [
                    {key: "password", name: "修改密码", divided: false},
                    {key: "nickname", name: "修改昵称", divided: false},
                    {key: "avatar", name: "修改头像", divided: false},
                    {key: "mobile", name: "修改手机", divided: false},
                    {key: "logout", name: "退出登录", divided: true}
                ],

                principal: undefined,
                visible: false,
                command: "",
                form: this.defaults(),
                sms: {maimed: false, txt: "发送验证码"}
            };
        },
        computed: {
            dropdownMenu() {
                return this.dropdownMenus.find(menu => menu.key === this.command);
            },
            avatar() {
                return this.principal?.avatar;
            },
            title() {
                return this.principal?.nickname ?? this.principal?.username ?? "用户信息";
            }
        },
        created() {
            this.onload();
        },
        methods: {
            commander(command) {
                this.form = this.defaults();
                this.command = command;
                this.visible = true;
            },
            alike(key, message) {
                return (rule, value, callback) =>
                    value === this.principal[key] ? callback(new Error(message)) : callback();
            },
            defaults() {
                let {avatar, nickname} = this.principal ?? {};
                return {avatar, nickname, oldPassword: "", newPassword: "", mobile: "", code: ""};
            },
            onload() {
                this.$http
                    .get("/principal")
                    .then(response => (this.principal = response.data))
                    .catch(() => (this.principal = undefined));
            },
            sendSmsCode(code) {
                if (this.form.mobile.length < 11) {
                    this.$notify.error({title: "错误", message: "手机号格式错误"});
                    return;
                }
                this.$http
                    .get("/system/sms-code?notify=", {params: {mobile: this.form.mobile, code}})
                    .then(response => {
                        let duration = dayjs.duration(response.data);
                        this.$captchaCountdown(this.sms, duration);
                    })
                    .catch(() => {});
            },
            confirm() {
                this.$refs.principal.validate(valid => valid && this.update());
            },
            update() {
                switch (this.command) {
                    case "avatar":
                    case "password":
                    case "nickname":
                    case "mobile":
                        window.loading = this.$loading({fullscreen: true, text: "正在处理中..."});
                        this.$http
                            .patch("/principal/" + this.command + "?notify=", this.form)
                            .then(() => {
                                this.$notify.success({title: "提示", message: "修改成功~"});
                                this.visible = false;
                                this.onload();
                            })
                            .catch(() => {})
                            .finally(() => {
                                window.loading.close();
                                delete window.loading;
                            });
                        break;
                    case "logout":
                        this.$logout();
                }
            }
        },
        components: {
            CorrectCaptcha,
            AvatarUpload,
            "el-dropdown": Dropdown,
            "el-dropdown-menu": DropdownMenu,
            "el-dropdown-item": DropdownItem,
            "el-avatar": Avatar,
            "el-dialog": Dialog,
            "el-button": Button,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .navbar-avatar {
        flex-shrink: 0;
        padding-left: 10px;
        padding-right: 20px;
        font-size: 0;

        &-form {
            margin-left: 0;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            .el-icon-warning {
                color: $color-warning;
                font-size: 22px;
                vertical-align: middle;
            }
        }
    }
</style>
