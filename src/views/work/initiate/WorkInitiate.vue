<template>
    <component :is="componentName" :definition-key="definitionKey" @prev="prev" @next="next" />
</template>

<script>
    import WorkInitiateBpmn from "@/views/work/initiate/WorkInitiateBpmn.vue";
    import WorkInitiateForm from "@/views/work/initiate/WorkInitiateForm.vue";

    export default {
        name: "WorkInitiate",
        data() {
            return {
                componentName: "WorkInitiateBpmn",
                definitionKey: undefined
            };
        },
        computed: {
            observes() {
                let {definitionName} = this;
                return {definitionName};
            }
        },
        methods: {
            prev() {
                this.componentName = "WorkInitiateBpmn";
            },
            next({key: definitionKey}) {
                this.definitionKey = definitionKey;
                this.componentName = "WorkInitiateForm";
            }
        },
        components: {
            WorkInitiateBpmn,
            WorkInitiateForm
        }
    };
</script>

<style lang="scss">
    .work-initiate {
        position: relative;
    }
</style>
