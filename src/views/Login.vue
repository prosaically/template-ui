<template>
    <div class="login">
        <div class="login-advert"></div>

        <el-form ref="form" class="login-form" :model="form" :rules="rules" label-width="0" label-position="left">
            <el-alert
                title="推荐使用 Chrome、Edge、Firefox、Safari 浏览器"
                type="info"
                center
                show-icon
                :closable="false"
            />

            <div class="login-form-title">欢迎登录</div>

            <el-form-item prop="username">
                <el-input
                    v-model="form.username"
                    autofocus
                    prefix-icon="el-icon-user"
                    placeholder="请输入用户名"
                    tabindex="1"
                />
            </el-form-item>

            <el-form-item prop="password">
                <el-input
                    ref="password"
                    v-model="form.password"
                    prefix-icon="el-icon-lock"
                    type="password"
                    placeholder="请输入密码"
                    tabindex="2"
                    show-password
                />
            </el-form-item>

            <el-form-item prop="code">
                <el-input
                    v-model="form.code"
                    placeholder="请输入验证码"
                    tabindex="3"
                    maxlength="6"
                    @keyup.enter.native="login"
                    class="login-form-code"
                >
                    <img
                        slot="suffix"
                        class="login-form-code-img"
                        :src="captcha"
                        alt="验证码"
                        title="点击刷新"
                        @error="error"
                        @click="refresh"
                    />
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button :loading="loading" type="primary" @click="login">登 录</el-button>
            </el-form-item>

            <el-form-item>
                <img src="../assets/img/wechat-logo.png" alt="微信登录" title="微信登录" @click="wechat" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import {Button, Form, FormItem, Input} from "element-ui";

    export default {
        name: "Login",
        data() {
            return {
                form: {
                    username: "",
                    password: "",
                    openid: ""
                },
                rules: {
                    username: [{required: true, message: "请输入用户名", trigger: "blur"}],
                    password: [{required: true, message: "请输入密码", trigger: "blur"}],
                    code: [{required: true, message: "请输入验证码", trigger: "blur"}]
                },
                random: Math.random(),
                loading: false,
                redirect: undefined
            };
        },
        computed: {
            captcha() {
                return this.$consts.BASE_URL + "/system/captcha?r=" + this.random;
            }
        },
        watch: {
            $route: {
                handler: function (route) {
                    const query = route.query;
                    if (query) {
                        this.redirect = query.redirect;
                    }
                },
                immediate: true
            }
        },
        methods: {
            error(e) {
                e.target.src =
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAkCAIAAAD0LdhSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC9ElEQVRoge2awWvaUBjAv46RXPIu6qHGg7YgCoIi2A7GcggZlPVQtssug/1Xg8Ggh7HdxYPdoCJMV9AGgi1SRUjMQOsh5tCXS14vOzwQa7Ush+5LIb9TyHuPfPz43suXj2zd3t5CRBCeYQfw9IiUBSZSFphIWWAiZYGJlAUmUhaY51gPdubuuW74PntgDiGSpir/LaR/BE1Z76J/Q+luJr1pwtVwdEMppV6j2VoZEkVhr1JOxGOPHON60JRR6u1m0nuV8qbRrm5oqtLVDZ/5K2bNsd276GMlIJqyZc51YzKdLedOVzcIkVJystFsvTs6lOXtlSWT6QwjUoAwHP/nutG77KfkbQCo1uqMMUq9wXC0Xyl3dSMlJ+/7wgVf2WQ6y+eye5Wypiq+zxzHXaQYF4cd4Cr4ygiRJtNrxphp2QDgM8ZNDYajEKYYhOEsKxUL9R+nX46/AcB+pWxaNiFSPpel1CsVC9jRrQFfWSIe+/jh/XQ6I0QiRPr0+ZhvRkIk7NDWg78xObK8zR2VioWr4YixOyVu+6xTrZ04cxcpujuERdmC/UqZMda76C/uNJqtwXAkikK1Vg+DtVAoc+ZutXbSPusAgCAIr16+6OoGpR4ANJota2y/PTp8c6DtZNJhsIavzJm71VpdFIXBcMS/jXiZ6jPWPutwX7y+1VQlDNaQj3/uayeT1lSFX3/9fk2pp6lKIh6j1EvJyeVvSU1VGk3g9QdWzJjKnLnbu+xzXwCQiMdSctK0bE1V8rksnzOZXq+s0lSFMfZwC+RRwdyYpmUvfAFAo9la9tW77JuWfXjw+v5CrB4GB1PZ7s4dX4PhaOHLGv9p/+5oqhLC6h9T2SJZVnw5c7fR/JXPZRfbM1SgnWWESObYBgBn7pqWnUjEKPUo9URRqP84TcTjIezHcrawfjBY28jWVKX+89Rx3FKxIArCprXm2EZ0iqZsE7zd+PAcQqRSsYD1EgidsvCDX/0/OSJlgYmUBSZSFphIWWAiZYH5C3hRZAv9D5aYAAAAAElFTkSuQmCChwAAAABJRU5ErkJggg==";
            },
            refresh() {
                this.random = Math.random();
            },
            login() {
                this.$refs.form.validate(valid => valid && this.request());
            },
            request() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                this.$http
                    .post("/login/form?notify=", this.form)
                    .then(this.success)
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            success() {
                this.$notify.success({title: "登录成功", message: "欢迎使用"});
                this.$router.replace(this.redirect ?? "/");
            },
            fail({openid, message}) {
                this.form.openid = openid;
                this.$notify.error({title: "登录错误", message});
            },
            wechat() {
                let {width, height} = window.screen;
                window.open(
                    "/api/oauth2/authorization/wechat",
                    undefined,
                    `width=${width >> 1},height=${height >> 1},left=${width >> 2},top=${height >> 2}`
                );
            }
        },
        mounted() {
            window.success = this.success;
            window.fail = this.fail;
        },
        beforeDestroy() {
            delete window.success;
            delete window.fail;
        },
        components: {
            "el-button": Button,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input
        }
    };
</script>

<style lang="scss">
    .login {
        height: 100%;
        width: 100%;
        background-color: #1e4cda;
        background-image: url("../assets/img/login-background.png");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        display: flex;
        justify-content: space-around;
        align-items: center;
        position: relative;

        &-advert {
            width: 660px;
            height: 660px;
            background-image: url("../assets/img/login-advert.png");
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            flex-shrink: 0;
        }

        &-form {
            width: 360px;
            height: 420px;
            background-color: #fff;
            flex-shrink: 0;
            border-radius: 9px;
            overflow: hidden;

            > .el-alert {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }

            &-title {
                font-size: 22px;
                color: $color-primary;
                margin: 26px 0;
                font-weight: bold;
                padding: 0 20px;
            }

            &-code {
                .el-input__suffix {
                    right: 0;
                    height: 100%;
                    font-size: 0;

                    &-inner {
                        height: 100%;
                        display: block;
                    }
                }

                &-img {
                    height: 100%;
                    box-sizing: border-box;
                    border-radius: 0 $border-radius-base $border-radius-base 0;
                    border: 1px solid $border-base;
                }
            }

            .el-form-item {
                padding: 0 20px;

                button {
                    width: 100%;
                }

                &:nth-last-of-type(2) {
                    margin-bottom: 38px;
                }

                &:last-of-type {
                    background-color: $background-color;
                    margin-bottom: 0;
                    display: flex;
                    padding: 8px 18px;
                    align-items: center;
                    justify-content: center;

                    img {
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        overflow: hidden;
                        cursor: pointer;
                    }
                }

                &__content {
                    font-size: 12px;
                }
            }
        }
    }
</style>
