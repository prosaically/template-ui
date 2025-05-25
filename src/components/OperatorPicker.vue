<template>
    <div class="operator-picker">
        <div v-if="prepend" class="operator-picker-prepend">{{ prepend }}</div>
        <el-select v-model="valued" :disabled="disabled" filterable clearable :placeholder="placeholder">
            <el-option v-for="v in options" :key="v.value" :label="v.label" :value="v.value" />
        </el-select>
    </div>
</template>

<script>
    import {Select, Option} from "element-ui";

    export default {
        name: "OperatorPicker",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: [String, Number],
                default: ""
            },
            prepend: String,
            disabled: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String,
                default: "请选择"
            }
        },
        data() {
            return {
                options: []
            };
        },
        computed: {
            valued: {
                set(v) {
                    this.$emit("input", v);
                },
                get() {
                    return String(this.value);
                }
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/principal/options")
                    .then(response => {
                        this.options = (response.data || []).map(v => ({
                            value: String(v.id),
                            label: v.nickname ?? v.username
                        }));
                    })
                    .catch(() => (this.options = []));
            }
        },
        created() {
            this.onload();
        },
        components: {
            "el-select": Select,
            "el-option": Option
        }
    };
</script>

<style lang="scss">
    .operator-picker {
        line-height: normal;
        display: inline-table;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;

        &-prepend {
            background-color: #f5f7fa;
            color: $text-secondary;
            vertical-align: middle;
            display: table-cell;
            position: relative;
            border: 1px solid $border-base;
            border-right-width: 0;
            border-radius: 4px 0 0 4px;
            padding: 0 20px;
            width: 1px;
            white-space: nowrap;
            font-size: 14px;
        }

        &-prepend + .el-select .el-input__inner {
            border-radius: 0 4px 4px 0;
        }
    }
</style>
