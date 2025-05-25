<template>
    <el-select v-model="valued" clearable :placeholder="placeholder">
        <el-option v-for="v in options" :key="v.code" :label="v.desc" :value="v.code" />
    </el-select>
</template>

<script>
    import {Select, Option} from "element-ui";

    export default {
        name: "NoticeTopicType",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: [Number, String],
            prepend: String,
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
                    if (typeof v === "string") {
                        return this.$emit("input", undefined);
                    }
                    this.$emit("input", v);
                },
                get() {
                    if (typeof this.value === "string") {
                        return this.value ? parseInt(this.value) : undefined;
                    }
                    return this.value;
                }
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/notices/topic/types")
                    .then(response => (this.options = response.data))
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
