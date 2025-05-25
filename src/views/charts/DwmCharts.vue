<template>
    <Charts class="system-charts-full" :option="option" @click="toList" />
</template>

<script>
    import Charts from "@/components/Charts";

    export default {
        name: "DwmCharts",
        data() {
            return {
                option: {}
            };
        },
        components: {Charts},
        created() {
            this.option = {
                title: {
                    text: "月度报表",
                    x: "center",
                    top: "5%"
                },
                series: [
                    {
                        name: "数据分析",
                        type: "pie",
                        radius: [20, 120],
                        center: ["50%", "50%"],
                        roseType: "area",
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: [
                            {value: 40, name: "扶贫销售前50", role: "dash-poverty-fifty"},
                            {value: 38, name: "自有品牌前50", role: "dash-brand-fifty"},
                            {value: 36, name: "综合销售前100", role: "dash-sales-hundred"},
                            {value: 32, name: "供应商代发前30", role: "dash-df-thirty"},
                            {value: 30, name: "销售数据分析", role: "dash-sales-analysis"},
                            {value: 28, name: "商品结构分析", role: "dash-goods-structure"},
                            {value: 26, name: "扶贫数据报表", role: "dash-poverty-analysis"},
                            {value: 24, name: "全品类数据对比", role: "dash-goods-compare"},
                            {value: 22, name: "自由品牌数据对比", role: "dash-brand-compare"},
                            {value: 20, name: "代发数据对比", role: "dash-df-compare"}
                        ]
                    }
                ]
            };
        },
        methods: {
            toList({data}) {
                this.$store
                    .dispatch("getAuthority", data.role)
                    .then(ret => this.$router.replace(ret.uri))
                    .catch(() => this.$notify.error("没有相应权限！"));
            }
        }
    };
</script>
