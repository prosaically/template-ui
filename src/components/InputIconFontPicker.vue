<template>
    <div class="input-icon-font-picker">
        <!-- 输入框 -->
        <el-input v-model="model" @focus="focus" :placeholder="placeholder" :disabled="disabled">
            <el-button #prepend :icon="model" v-if="model" />
            <i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clean"></i>
        </el-input>

        <!-- 选择器 -->
        <IconFontPicker v-model="picker" @choose="model = $event" />
    </div>
</template>

<script>
    import {Input, Button} from "element-ui";
    import IconFontPicker from "./IconFontPicker";

    export default {
        name: "InputIconFontPicker",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: String,
                default: ""
            },
            placeholder: String,
            disabled: Boolean
        },
        data() {
            return {
                picker: false
            };
        },
        computed: {
            model: {
                set(val) {
                    this.$emit("input", val);
                },
                get() {
                    return this.value;
                }
            }
        },
        methods: {
            focus() {
                if (this.disabled) {
                    return;
                }
                this.picker = true;
            },
            clean() {
                if (this.disabled) {
                    return;
                }
                this.model = "";
            }
        },
        components: {"el-input": Input, "el-button": Button, IconFontPicker}
    };
</script>

<style lang="scss">
    .input-icon-font-picker {
        position: relative;

        .el-icon-circle-close:hover {
            cursor: pointer;
            color: $color-primary;
        }
    }
</style>
