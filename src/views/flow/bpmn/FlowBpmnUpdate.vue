<script>
    import FormExtend from "@/extends/form-extend";
    import FlowBpmnModeler from "@/views/flow/bpmn/FlowBpmnModeler.vue";

    export default {
        name: "FlowBpmnUpdate",
        extends: FormExtend,
        data() {
            return {definitionKey: ""};
        },
        render() {
            return <FlowBpmnModeler definition-key={this.definitionKey} />;
        },
        components: {FlowBpmnModeler}
    };
</script>
