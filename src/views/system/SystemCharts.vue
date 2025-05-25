<template>
    <div class="system-charts">
        <component v-for="(component, index) in components" :is="component" :key="index" />
    </div>
</template>

<script>
    const mappers = {
        "system-charts-dwm": () => import("@/views/charts/DwmCharts.vue")
    };

    export default {
        name: "SystemCharts",
        data() {
            return {
                components: []
            };
        },
        created() {
            let components = [];
            for (const [name, method] of Object.entries(mappers)) {
                if (this.$hasAuthority(name)) {
                    components.push(method);
                }
            }
            this.components = components;
        }
    };
</script>

<style lang="scss">
    .system-charts {
        width: 100%;
        display: grid;
        grid-template-columns: auto auto;
        grid-auto-rows: auto;
        grid-auto-flow: row dense;
        grid-gap: 20px;
        padding: 20px;

        &-half {
            background-color: #fff;
            aspect-ratio: 2 /1;
            overflow: hidden;
        }

        &-full {
            background-color: #fff;
            grid-column: span 2;
            aspect-ratio: 2 /1;
            overflow: hidden;
        }
    }
</style>
