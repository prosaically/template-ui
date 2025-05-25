<script>
    import FlowDmnModeler from "@/views/flow/dmn/FlowDmnModeler.vue";
    import FormExtend from "@/extends/form-extend";

    export default {
        name: "FlowDmnUpdate",
        extends: FormExtend,
        data() {
            return {definitionKey: ""};
        },
        render() {
            return <FlowDmnModeler definition-key={this.definitionKey} />;
        },
        components: {FlowDmnModeler}
    };
</script>
