<script>
    import FormExtend from "@/extends/form-extend";
    import FlowFormEditor from "@/views/flow/form/editor/FlowFormEditor.vue";

    export default {
        name: "FlowFormUpdate",
        extends: FormExtend,
        data() {
            return {deploymentId: ""};
        },
        render() {
            return <FlowFormEditor deployment-id={this.deploymentId} />;
        },
        components: {FlowFormEditor}
    };
</script>
