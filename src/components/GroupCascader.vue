<template>
    <el-cascader
        v-model="values"
        :options="groups"
        :props="{value: 'id', label: 'name'}"
        clearable
        placeholder="请选择分组"
    />
</template>

<script>
    import {Cascader} from "element-ui";

    export default {
        name: "GroupCascader",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: [Number, String, Array],
            leaf: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                groups: [],
                groupsMapper: {}
            };
        },
        computed: {
            values: {
                set(values = []) {
                    let value = values;
                    if (this.leaf) {
                        value = values[values.length - 1];
                    }
                    this.$emit("input", value);
                },
                get() {
                    if (this.leaf) {
                        let ids = [];
                        let group = this.groupsMapper[this.value];
                        while (group) {
                            ids.unshift(group.id);
                            group = group.parent;
                        }
                        return ids;
                    }
                    return Array.isArray(this.value) ? this.value.map(v => this.groupsMapper[v]?.id) : [];
                }
            }
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/groups/options?pageNo=1&pageSize=9999&notify=")
                    .then(this.convert)
                    .catch(() => {});
            },
            convert(response) {
                let {records = [], groups = [], groupsMapper = {}} = response.data;

                // 数组转MAP
                records.forEach(v => (groupsMapper[v.id] = v));

                // 关联父类
                records.forEach(i => {
                    let current = groupsMapper[i.id];
                    let parent = groupsMapper[i.parent];
                    current.parent = parent;
                    if (parent) {
                        parent.children = (parent.children || []).concat(current);
                    } else {
                        groups.push(current);
                    }
                });

                this.groups = groups;
                this.groupsMapper = groupsMapper;
            }
        },
        created() {
            this.onload();
        },
        components: {
            "el-cascader": Cascader
        }
    };
</script>

<style lang="scss"></style>
