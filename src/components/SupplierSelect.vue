<template>
    <el-select
        v-model="values"
        filterable
        remote
        reserve-keyword
        clearable
        placeholder="请选择供应商"
        :multiple="multiple"
        :remote-method="remoter"
        :loading="loading"
    >
        <el-option v-for="v in options" :key="v.memberaccount" :label="v.membername" :value="v.memberaccount" />
    </el-select>
</template>

<script>
    import {Select, Option} from "element-ui";
    import {isArray} from "@/utils/index.js";

    export default {
        name: "SupplierSelect",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: [String, Array],
                default: ""
            },
            multiple: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                loading: false,
                options: []
            };
        },
        computed: {
            isArray() {
                return isArray(this.value);
            },
            values: {
                set(value) {
                    if (value === "") {
                        value = this.isArray ? [] : value;
                    }
                    this.$emit("input", value);
                },
                get() {
                    return this.value;
                }
            },

            ids() {
                return isArray(this.value) ? this.value : [this.value];
            },
            mapper() {
                const obj = {};
                for (let v of this.options) {
                    obj[v.memberaccount] = v;
                }
                return obj;
            }
        },
        watch: {
            ids() {
                this.defaults();
            }
        },
        methods: {
            async remoter(query) {
                this.loading = true;
                let records = [];
                if (query) {
                    let params = {membername: query, disable: 0};
                    try {
                        let response = await this.$http.get("/suppliers/options", {params});
                        records = this.$success(response).data ?? [];
                        // eslint-disable-next-line no-empty
                    } catch (e) {}
                }

                let currents = this.ids
                    .filter(f1 => f1)
                    .map(id => this.mapper[id])
                    .filter(f2 => f2);
                this.options = records.concat(currents);
                this.loading = false;
            },
            defaults() {
                let memberAccount = this.ids.filter(f => f).filter(v => this.mapper[v] === undefined);
                if (memberAccount.length < 1) {
                    return;
                }
                let gets = memberAccount.map(id => this.$http.get("/suppliers/options?memberaccount=" + id));
                Promise.all(gets)
                    .then(results => {
                        this.options = results.flatMap(ret => this.$success(ret).data ?? []);
                    })
                    .catch(() => {});
            }
        },
        created() {
            this.defaults();
        },
        components: {
            "el-select": Select,
            "el-option": Option
        }
    };
</script>

<style lang="scss">
    .supplier-select {
        position: relative;
    }
</style>
