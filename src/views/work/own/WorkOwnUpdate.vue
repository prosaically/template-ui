<script>
    import FormExtend from "@/extends/form-extend";
    import ProcessInstance from "@/flow/ProcessInstance.js";

    export default {
        name: "WorkOwnUpdate",
        extends: FormExtend,
        mixins: [ProcessInstance],
        data() {
            return {processInstanceId: undefined};
        },
        computed: {
            uri() {
                return this.processInstanceId ? "/works/owns/" + this.processInstanceId + "?notify=" : undefined;
            }
        },
        methods: {
            cancelable() {
                return this.processInstance?.state === "ACTIVE";
            },
            updatable() {
                if (this.routes[1]) {
                    return !this.routes[1].endTime;
                }
                return false;
            }
        }
    };
</script>

<style src="bpmn-js/dist/assets/diagram-js.css" />
<style src="bpmn-js/dist/assets/bpmn-js.css" />
<style src="bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css" />
<style lang="scss" src="../../../flow/ProcessInstance.scss" />
