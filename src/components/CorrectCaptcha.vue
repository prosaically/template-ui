<template>
    <el-popover v-model="visible" class="correct-captcha" title="人机验证" placement="top" width="300" trigger="click">
        <el-input v-model="code" placeholder="请输入验证码" maxlength="6" class="correct-captcha-code">
            <img
                slot="suffix"
                class="correct-captcha-code-img"
                :src="captcha"
                alt="验证码"
                title="点击刷新"
                @error="error"
                @click="refresh"
            />
        </el-input>
        <div class="correct-captcha-wrong">{{ wrong }}</div>
        <div class="correct-captcha-footer">
            <el-button size="mini" :loading="loading" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="confirm">确定</el-button>
        </div>
        <template #reference>
            <slot></slot>
        </template>
    </el-popover>
</template>

<script>
    export default {
        name: "CorrectCaptcha",
        data() {
            return {visible: false, code: "", wrong: "", random: Math.random(), loading: false};
        },
        computed: {
            captcha() {
                return this.$consts.BASE_URL + "/system/captcha?r=" + this.random;
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
            confirm() {
                this.wrong = "";
                if (this.code.length < 1) {
                    this.wrong = "请输入验证码";
                    return;
                }

                this.loading = true;
                this.$http
                    .post("/system/captcha?code=" + this.code)
                    .then(() => {
                        this.cancel();
                        this.$emit("confirm", this.code);
                    })
                    .catch(error => (this.wrong = error.facade ?? "验证失败！"))
                    .finally(() => (this.loading = false));
            },
            cancel() {
                this.visible = false;
            }
        }
    };
</script>

<style lang="scss">
    .correct-captcha {
        position: relative;

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

        &-wrong {
            height: 24px;
            line-height: 24px;
            color: $color-danger;
            font-size: 12px;
        }

        &-footer {
            display: flex;
            justify-content: flex-end;
        }
    }
</style>
