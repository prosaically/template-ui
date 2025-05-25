<template>
    <div class="authority-select">
        <div v-if="prepend" class="authority-select-prepend">{{ prepend }}</div>
        <div class="authority-select-items" v-if="items.length" @click="open">
            <el-tag v-for="v in names" :key="v.name" closable size="small" type="info" @close.stop="remove(v.id)">
                {{ v.name }}
            </el-tag>
        </div>
        <div class="authority-select-placeholder" v-else v-text="placeholder" @click="open"></div>

        <!-- 选择器组件 -->
        <AuthorityPicker v-model="picker" :radio="radio" :defaults="items" @confirm="callback" />
    </div>
</template>

<script>
    import {Tag} from "element-ui";
    import AuthorityPicker from "@/components/AuthorityPicker";

    export default {
        name: "AuthoritySelect",
        props: {
            defaultIds: Array,
            defaultAuthorities: Array,
            prepend: String,
            placeholder: {
                type: String,
                default: "请选择"
            },
            radio: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                names: [],
                items: [],
                picker: false
            };
        },
        watch: {
            defaultIds: {
                handler: function () {
                    this.$debounce(this.echo, 300);
                },
                immediate: true
            },
            defaultAuthorities: {
                handler: function () {
                    this.$debounce(this.echo, 300);
                },
                immediate: true
            }
        },
        methods: {
            echo() {
                let ids = this.defaultIds ?? [];
                let authorities = this.defaultAuthorities ?? [];

                // 为空重置
                if (ids.length < 1 && authorities.length < 1) {
                    return (this.names = this.items = []);
                }

                // 生成请求
                let gets = ids.map(id => this.$http.get("/system/authorities/options?id=" + id));
                if (gets.length < 1) {
                    gets = authorities.map(a => this.$http.get("/system/authorities/options?code=" + a));
                }

                // 发起请求
                Promise.all(gets)
                    .then(responses => {
                        let data = responses.map(v => (v.data ?? [])[0]);
                        this.names = data;
                        this.items = data.map(i => i.id);
                    })
                    .catch(() => (this.names = this.items = []));
            },
            open() {
                this.picker = true;
            },
            remove(id) {
                let items = this.names.filter(v => v.id !== id);
                this.callback(items);
            },
            callback(e) {
                let ids = e.map(v => v.id);
                this.$emit("update:defaultIds", ids);
                let authorities = e.map(v => v.code);
                this.$emit("update:defaultAuthorities", authorities);
            }
        },
        components: {AuthorityPicker, "el-tag": Tag}
    };
</script>

<style lang="scss">
    .authority-select {
        line-height: normal;
        display: inline-table;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;

        position: relative;
        background-color: #fff;
        box-sizing: border-box;
        color: $text-regular;
        font-size: inherit;
        cursor: pointer;

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

        &-placeholder {
            color: #c0c4cc;
            padding: 0 15px;
            user-select: none;
            border-radius: 0 $border-radius-base $border-radius-base 0;
            border: 1px solid $border-base;
            height: 36px;
            width: 100%;
            vertical-align: middle;
            display: table-cell;
            box-sizing: border-box;
        }

        &-items {
            overflow: hidden;
            vertical-align: middle;
            display: table-cell;
            box-sizing: border-box;
            border-radius: 0 $border-radius-base $border-radius-base 0;
            border: 1px solid $border-base;
            padding: 0 15px 2px 15px;
        }

        .el-tag {
            margin-top: 4px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            position: relative;
            padding-right: 20px;

            &__close {
                position: absolute;
                top: 50%;
                right: 4px;
                transform: translateY(-50%);
            }

            &:not(:last-child) {
                margin-right: 10px;
            }
        }
    }
</style>
