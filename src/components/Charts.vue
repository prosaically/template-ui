<template>
    <div class="charts"></div>
</template>

<script>
    import {init, dispose} from "echarts";

    export default {
        name: "Charts",
        props: {
            theme: {
                type: [Object, String],
                default: undefined
            },
            option: {
                type: Object,
                required: true
            }
        },
        data() {
            return {chart: undefined};
        },
        watch: {
            $props: {
                handler: function () {
                    this.$debounce(this.initialize, 500);
                },
                deep: true
            }
        },
        mounted() {
            this.$debounce(this.initialize, 500);
        },
        beforeDestroy() {
            dispose(this.chart);
        },
        methods: {
            initialize() {
                if (this.chart === undefined) {
                    this.chart = init(this.$el, this.theme, {locale: "ZH"});
                    Object.keys(this.$listeners).forEach(name => {
                        this.chart.on(name, params => this.$emit(name, params));
                    });
                }
                this.chart.setOption(this.option);
            }
        }
    };
</script>

<style lang="scss">
    .charts {
        position: relative;
        flex-shrink: 0;
        flex-grow: 0;
        overflow: hidden;
    }
</style>
