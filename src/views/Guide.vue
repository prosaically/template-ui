<script>
    import {Tree} from "element-ui";

    export default {
        name: "Guide",
        data() {
            return {
                trees: []
            };
        },
        methods: {
            onload() {
                this.$http
                    .get("/system/helps/options")
                    .then(this.convert)
                    .then(() => {});
            },
            convert(response) {
                let {data: helps = [], trees = [], mappers = {}} = response;
                helps.forEach(v => (mappers[v.id] = v));
                helps.forEach(i => {
                    let current = mappers[i.id];
                    const parent = mappers[i.parent];
                    current.parent = parent;
                    if (parent) {
                        parent.children = (parent.children ?? []).concat(current);
                    } else {
                        trees.push(current);
                    }
                });
                this.trees = trees;
            },
            nodeClick(e) {
                let element = this.$refs.page.querySelector("#guide-" + e.id);
                if (element) {
                    element.scrollIntoView(true);
                }
            },
            leveler(levelNode) {
                let counter = 1;
                let current = levelNode;
                while (current.parent) {
                    current = current.parent;
                    ++counter;
                }
                return counter;
            }
        },
        created() {
            this.onload();
        },
        components: {
            "el-tree": Tree
        },
        render(createElement) {
            let {trees, nodeClick} = this;
            const builder = buildNode => {
                let {id, name, remark, children = []} = buildNode;
                let tag = "h" + this.leveler(buildNode);
                return [
                    createElement(tag, {attrs: {id: "guide-" + id}}, name),
                    createElement("div", {domProps: {innerHTML: remark}}),
                    ...children.map(builder)
                ];
            };

            return createElement("div", {class: "guide"}, [
                createElement("div", {class: "guide-page", ref: "page"}, [
                    createElement("div", {class: "guide-page-title"}, "帮助手册"),
                    ...trees.flatMap(builder)
                ]),
                createElement("el-tree", {
                    class: "guide-tree",
                    props: {
                        data: trees,
                        props: {label: "name"},
                        nodeKey: "id",
                        highlightCurrent: true,
                        expandOnClickNode: false
                    },
                    on: {"node-click": nodeClick}
                })
            ]);
        }
    };
</script>

<style lang="scss">
    .guide {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        overflow: hidden;
        background-color: #fff;

        // 隐藏滚动条
        @mixin scrollbar-hidden {
            scrollbar-width: none;
            -ms-overflow-style: none;
            &::-webkit-scrollbar {
                display: none;
            }
        }

        &-page {
            @include scrollbar-hidden;
            height: 100%;
            flex-basis: 210mm;
            flex-shrink: 0;
            flex-grow: 0;
            margin: 0 auto;
            position: relative;
            padding: 0 12mm;
            overflow-x: hidden;
            overflow-y: auto;
            font-size: 14px;
            color: $text-primary;

            &-title {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                padding: 10px 0;
            }

            img {
                max-width: 100%;
            }

            h1[id^="guide-"] {
                font-size: 32px;
                padding: 32px 0;
            }

            h2[id^="guide-"] {
                font-size: 18px;
                padding: 16px 0;
                margin-bottom: 20px;
                border-bottom: 1px solid $border-base;
            }

            h3[id^="guide-"] {
                font-size: 16px;
                padding: 22px 0;
            }

            h4[id^="guide-"] {
                font-size: 14px;
                padding: 18px 0;
            }
        }

        &-tree {
            max-height: 100%;
            padding: 0 10px 10px 10px;
            flex-basis: 390px;
            flex-grow: 0;
            flex-shrink: 0;
            overflow-y: auto;
            @include scrollbar-hidden;

            @media print {
                display: none;
            }

            .el-tree-node {
                &__content {
                    height: 30px;
                    font-size: 14px;
                }

                &__expand-icon {
                    font-size: 14px;
                    padding: 8px;
                }
            }
        }
    }
</style>
